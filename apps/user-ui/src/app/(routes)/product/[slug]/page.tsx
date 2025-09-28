
import ProductDetails from 'apps/user-ui/src/shared/modules/product/product-details';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';

const fetchProductDetails = async (slug: string) => {
    const res = await axiosInstance.get(`/product/api/get-product/${slug}`);
    return res.data.product;
}

export async function generateMetadata({ params }: {
    params: { slug: string }
}) {
    const product = await fetchProductDetails(params.slug);

    return {
        title: `${product.title} | Quickkart MarketPlace`,
        description: product?.shortDescription || "Discover high-quality products on Quickkart MarketPlace",
        openGraph: {
            title: product?.title,
            description: product?.shortDescription || "",
            images: [product?.images[0]?.file_url || "/default-image.jpg"],
            type: "website"
        },
        twitter: {
            card: "summary_large_image",
            title: product?.title,
            description: product?.shortDescription || "",
            images: [product?.images[0]?.file_url || "/default-image.jpg"],
        },
    }
}

const ProductSlugPage = async ({ params }: {
    params: { slug: string }
}) => {
    const productDetails = await fetchProductDetails(params.slug);

    return <ProductDetails productDetails={productDetails} />
}

export default ProductSlugPage;

