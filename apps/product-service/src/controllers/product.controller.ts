import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../../../packages/libs/prisma/index';
import {
  NotFoundError,
  ValidationError,
} from '../../../../packages/error-handler';
import { imageKit } from '../../../../packages/libs/imagekit';
import { Prisma } from '@prisma/client';

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_Config.findFirst();

    if (!config) {
      return res.status(404).json({ message: 'Categories not found!!' });
    }

    return res.status(200).json({
      success: true,
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    const isDiscountCodeExist = await prisma.discount_Codes.findUnique({
      where: {
        discountCode,
      },
    });

    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          'Discount Code already available please use a different code!'
        )
      );
    }

    const discount_Code = await prisma.discount_Codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.id,
      },
    });

    return res.status(200).json({
      success: true,
      discount_Code,
    });
  } catch (error) {
    return next(error);
  }
};

export const getDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_Codes = await prisma.discount_Codes.findMany({
      where: {
        sellerId: req.id,
      },
    });

    return res.status(200).json({
      success: true,
      discount_Codes,
    });
  } catch (error) {
    return next(error);
  }
};

export const applyDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, productId } = req.body;

    if (!code || !productId) {
      return next(new ValidationError('Code and ProductId required'));
    }

    const discount_Code = await prisma.discount_Codes.findFirst({
      where: {
        discountCode: code,
      },
    });

    if (!discount_Code) {
      return next(new ValidationError('Invalid discount code'));
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return next(new ValidationError('Product not found'));
    }

    const isValid = product.discountCodes?.includes(discount_Code.id);

    if (!isValid) {
      return next(
        new ValidationError('Discount not applicable to this product')
      );
    }

    return res
      .status(200)
      .json({ message: 'Discount applied', discount: discount_Code });
  } catch (error) {
    return next(error);
  }
};

export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    const response = await imageKit.deleteFile(fileId);

    res.status(201).json({
      response,
    });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      shortDescription,
      detailedDescription,
      warranty,
      customSpecifications,
      slug,
      tags,
      cashOnDelivery,
      brand,
      videoUrl,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      salePrice,
      regularPrice,
      subCategory,
      customProperties = {},
      images = [],
    } = req.body;

    if (
      !title ||
      !shortDescription ||
      !detailedDescription ||
      !slug ||
      !category ||
      !warranty ||
      !regularPrice ||
      !cashOnDelivery ||
      !salePrice ||
      !brand ||
      stock === undefined ||
      images.length === 0 ||
      !subCategory ||
      !tags
    ) {
      return next(new ValidationError('Missing required fields'));
    }

    if (!req.seller.id) {
      return next(new ValidationError('Missing required fields'));
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        shortDescription,
        detailedDescription,
        warranty,
        cashOnDelivery,
        slug,
        shopId: req.seller.shop.id,
        tags: Array.isArray(tags) ? tags : tags.split(','),
        brand,
        videoUrl,
        regularPrice,
        category,
        subCategory,
        colors: colors || [],
        discountCodes,
        sizes: sizes || [],
        stock: parseInt(stock),
        salePrice: parseFloat(salePrice),
        customProperties: customProperties,
        customSpecifications: customSpecifications,
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((image: any) => ({
              fileId: image.fileId,
              file_url: image.file_url,
            })),
        },
      },
      include: { images: true },
    });

    res.status(200).json({
      success: true,
      newProduct,
    });
  } catch (error) {
    return next(error);
  }
};

export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const raw = typeof req.body === 'string' ? req.body : req.body?.fileName;
    if (!raw) {
      return res
        .status(400)
        .json({ success: false, message: 'fileName is required' });
    }

    const base64 = raw.includes('base64,') ? raw.split('base64,')[1] : raw;

    const response = await imageKit.upload({
      file: base64,
      fileName: `product-${Date.now()}.jpg`,
      folder: '/products',
    });
    res
      .status(201)
      .json({ success: true, file_url: response.url, fileId: response.fileId });
  } catch (error) {
    return next(error);
  }
};

export const getAllProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = req.query.type;

    const baseFilter: Prisma.ProductWhereInput = {
      OR: [
        { startingDate: { equals: null } },
        { endingDate: { equals: null } },
      ],
    };

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      type === 'latest' ? { createdAt: 'desc' } : { totalSales: 'desc' };

    const [products, total, total10Products] = await Promise.all([
      prisma.product.findMany({
        where: baseFilter,
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
        orderBy,
      }),
      prisma.product.count(),
      prisma.product.findMany({
        take: 10,
        orderBy,
      }),
    ]);

    return res.status(200).json({
      success: true,
      products,
      top10By: type === 'latest' ? 'latest' : 'topSales',
      total10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerShopId = req?.seller?.shop?.id;

    if (!sellerShopId) {
      return res.status(404).json({ message: 'sellerShopId not found!!' });
    }

    const products = await prisma.product.findMany({
      where: {
        shopId: sellerShopId,
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller.id;

    const discount_Code = await prisma.discount_Codes.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!discount_Code) {
      return next(new NotFoundError('Discount code not found!'));
    }

    if (discount_Code.sellerId !== sellerId) {
      return next(new ValidationError('Unauthorized access!'));
    }
    await prisma.discount_Codes.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: 'Discount code successfully deleted!!',
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerShopId = req.seller.shop.id;

    const product = await prisma.product.findFirst({
      where: {
        shopId: sellerShopId,
      },
      select: {
        id: true,
        shopId: true,
        isDeleted: true,
      },
    });

    if (!product) {
      return next(new ValidationError('Product not found!'));
    }

    if (product.shopId !== sellerShopId) {
      return next(new ValidationError('Unauthorized action!'));
    }

    if (product.isDeleted) {
      return next(new ValidationError('Product is already deleted!'));
    }

    const deleteProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message:
        'Product is scheduled for deletion in 24 hrs . you can restore with in 24hrs',
      deletedAt: deleteProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerShopId = req.seller.shop.id;

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
      },
      select: {
        id: true,
        shopId: true,
        isDeleted: true,
      },
    });

    if (!product) {
      return next(new ValidationError('Product not found!'));
    }

    if (product.shopId !== sellerShopId) {
      return next(new ValidationError('Unauthorized action!'));
    }

    if (!product.isDeleted) {
      return res.status(400).json({
        message: 'Product is not in deleted state!',
      });
    }

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      message: 'Product successfully restored!!',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error restoring the product',
      error,
    });
  }
};

export const getProductDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const slug = req.params.slug;

    const product = await prisma.product.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
        title: true,
        detailedDescription: true,
        shortDescription: true,
        salePrice: true,
        regularPrice: true,
        stock: true,
        slug: true,
        shop: true,
        images: true,
        brand: true,
        ratings: true,
        colors: true,
        sizes: true,
      },
    });

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};

export const getFilteredProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 200000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === 'string'
        ? priceRange.split(',').map(Number)
        : [0, 200000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      salePrice: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(','),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
        },
      }),

      prisma.product.count({ where: filters }),
    ]);

    const totalPages = total / limit;

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getFilteredEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 200000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === 'string'
        ? priceRange.split(',').map(Number)
        : [0, 200000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;
    const filters: Record<string, any> = {
      salePrice: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      NOT: {
        startingDate: null,
      },
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(','),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
      }),

      prisma.product.count({ where: filters }),
    ]);

    const totalPages = total / limit;

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const baseFilter = {
      AND: [
        {
          startingDate: {
            not: null,
          },
        },
        {
          endingDate: {
            not: null,
          },
        },
      ],
    };

    const [events, total, top10BySales] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        where: baseFilter,
      }),
      prisma.product.count({ where: baseFilter }),
      prisma.product.findMany({
        take: limit,
        where: baseFilter,
      }),
    ]);

    return res.status(200).json({
      success: true,
      events,
      pagination: {
        total,
        page: page,
        top10BySales,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getFilteredShops = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && String(categories).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(','),
      };
    }

    if (countries && String(categories).length > 0) {
      filters.country = {
        in: Array.isArray(countries) ? countries : String(countries),
      };
    }

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          sellers: true,
          followers: true,
          products: true,
        },
      }),

      prisma.shops.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return res.status(200).json({
      success: true,
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const searchProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        message: 'Search query is required.',
      });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            shortDescription: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

export const topShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topShopData = await prisma.orders.groupBy({
      by: ['shopId'],
      _sum: {
        total: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 10,
    });

    const shopIds = topShopData.map((item: any) => item.shopId);

    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: shopIds,
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        followers: true,
        coverBanner: true,
        address: true,
        ratings: true,
        category: true,
      },
    });

    const enrichedShops = shops.map((shop) => {
      const salesData = topShopData.find((s: any) => s.shopId === shop.id);
      return {
        ...shop,
        totalSales: salesData?._sum.total ?? 0,
      };
    });

    const top10Shops = enrichedShops
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      shops: top10Shops,
    });
  } catch (error) {
    return next(error);
  }
};
