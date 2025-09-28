"use client";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import { useLocationTracking } from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { ChevronLeft, ChevronRight, Heart, MapPin, MessageSquareText, Package, ShoppingCart, WalletMinimal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactImageMagnify from "react-image-magnify";
import ProductCard from "../../components/cards/product-card";
import MainLoader from "../../components/MainLoader";
import Rating from "../../components/ratings";
import SectionTitle from "../../components/section/section-title";

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSelected, setIsSelected] = useState(productDetails?.colors?.[0] || "");
    const [quantity, setQuantity] = useState(1);
    const [priceRange, setPriceRange] = useState([
        productDetails?.salePrice, 200000
    ])
    const [isSizeSelected, setIsSizeSelected] = useState(productDetails?.sizes?.[0] || "");
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const addToCart = useStore((state: any) => state.addToCart);
    const addToWishList = useStore((state: any) => state.addToWishList);
    const removeFromWishList = useStore((state: any) => state.removeFromWishList);
    const wishList = useStore((state) => state.wishList);
    const isWishListed = wishList.some((item) => item.id === productDetails?.id);
    const cart = useStore((state) => state.cart);
    const isInCart = cart.some((item) => item.id === productDetails?.id);
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();
    const { user, isLoading } = useUser();

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        setToken(storedToken);
    }, []);

    useEffect(() => {
        if (productDetails?.images?.length > 0) {
            setCurrentImage(productDetails.images[0].file_url);
            setCurrentIndex(0);
        }
        if (productDetails?.sizes?.length > 0) {
            setIsSizeSelected(productDetails.sizes[0]);
        }
    }, [productDetails]);

    const prevImage = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setCurrentImage(productDetails.images[currentIndex - 1].file_url);
        }
    };

    const nextImage = () => {
        if (currentIndex < productDetails?.images.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentImage(productDetails.images[currentIndex + 1].file_url);
        }
    };

    const discountPercentage = Math.round(
        ((productDetails?.regularPrice - productDetails?.salePrice) / productDetails?.regularPrice) * 100
    )

    const fetchFilteredProducts = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams();

            query.set("priceRange", priceRange.join(","));
            query.set("page", "1");
            query.set("limit", "5");

            const res = await axiosInstance.get(`/product/api/get-filtered-products?${query.toString()}`);

            setRecommendedProducts(res.data.products);

        } catch (error) {
            console.log("Failed to fetch filtered products", error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchFilteredProducts();
    }, [priceRange]);

    const handleChat = async () => {

        if (!user && !isLoading) {
            router.push("/login");
            return;
        }

        setLoading(true);
        try {
            const res = await axiosInstance.post("/chatting/api/create-user-conversationGroup", {
                sellerId: productDetails?.shop?.sellerId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            router.push(`/inbox?conversationId=${res.data.conversation.id}`)
        } catch (error) {
            console.log("error", error);
        } finally {
            setLoading(false);
        }
    }

    const handleClick = () => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (!isInCart) {
            addToCart(
                {
                    ...productDetails,
                    quantity,
                    selectedOptions: {
                        color: isSelected,
                        size: isSizeSelected,
                    },
                },
                user,
                location,
                deviceInfo
            );
        }
    };

    if (loading) {
        return <MainLoader isLoading={loading} />
    }

    return (
        <>
            <div className="bg-[#E7E7E7] py-8">
                <div className="w-[80%] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-white rounded-md shadow-md">
                    <div className="flex flex-col items-center">
                        <div className="p-4">
                            <div className="relative w-full">
                                <ReactImageMagnify
                                    {...{
                                        smallImage: {
                                            alt: productDetails?.title || "",
                                            isFluidWidth: true,
                                            src: currentImage || "https://ik.imagekit.io/m3hqvlyteo/products/product-1755878070303_IskcCflfn.jpg?updatedAt=1755878073820",
                                        },
                                        largeImage: {
                                            src: currentImage || "https://ik.imagekit.io/m3hqvlyteo/products/product-1755878070303_IskcCflfn.jpg?updatedAt=1755878073820",
                                            width: 1200,
                                            height: 1200,
                                        },
                                        enlargedImageContainerDimensions: {
                                            width: "150%",
                                            height: "100%",
                                        },
                                        enlargedImagePosition: "beside",
                                        shouldUsePositiveSpaceLens: true,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="relative mt-4 flex items-center w-full justify-center">
                            {productDetails?.images?.length > 4 && (
                                <button
                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full shadow-md absolute left-0"
                                    onClick={prevImage}
                                    disabled={currentIndex === 0}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}

                            <div className="flex gap-3 px-10">
                                {productDetails?.images?.map((img: any, index: number) => (
                                    <Image
                                        key={index}
                                        src={img.file_url || "https://ik.imagekit.io/m3hqvlyteo/products/product-1755878070303_IskcCflfn.jpg?updatedAt=1755878073820"}
                                        alt="Thumbnail"
                                        width={70}
                                        height={70}
                                        className={`cursor-pointer rounded-lg border-2 transition-all ${currentIndex === index
                                            ? "border-blue-500 scale-105"
                                            : "border-gray-300 hover:border-gray-400"
                                            }`}
                                        onClick={() => {
                                            setCurrentIndex(index);
                                            setCurrentImage(img.file_url);
                                        }}
                                    />
                                ))}
                            </div>

                            {productDetails?.images?.length > 4 && (
                                <button
                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full shadow-md absolute right-0"
                                    onClick={nextImage}
                                    disabled={currentIndex === productDetails?.images.length - 1}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold border-b border-gray-200 pb-4">{productDetails?.title}</h1>
                        <p className="text-gray-600 border-b border-gray-200 pb-4">{productDetails?.shortDescription}</p>
                        <div className='mt-3 flex justify-between items-center px-2 border-b border-gray-200 pb-4'>
                            <div className='flex items-center gap-2'>
                                <span className='text-red-900 font-bold text-lg'>${productDetails?.salePrice}</span>
                                <div>
                                    <span className='text-gray-400 font-bold text-sm line-through '>${productDetails?.regularPrice}</span>
                                    <span className="ml-4">-{discountPercentage}%</span>
                                </div>
                            </div>
                        </div>
                        <p className={`text-md font-bold ${productDetails?.stock > 0 ? "text-green-700" : "text-red-700"} border-b border-gray-200 pb-4`}>
                            {productDetails?.stock > 0 ? "In Stock" : "Out of Stock"} <span className="text-gray-600"> ( stock {productDetails?.stock})</span>
                        </p>
                        <div className="flex gap-2 border-b border-gray-200 pb-4">
                            <Rating rating={productDetails?.ratings} />
                            <Link href={"#reviews"}>
                                (0 Reviews)
                            </Link>
                        </div>
                        <div className="border-b border-gray-200 pb-4">
                            <Heart
                                size={25}
                                fill={isWishListed ? "red" : "transparent"}
                                color={isWishListed ? "transparent" : "#777"}
                                className="cursor-pointer"
                                onClick={() =>
                                    isWishListed ?
                                        removeFromWishList(
                                            productDetails.id,
                                            user,
                                            location,
                                            deviceInfo
                                        ) : addToWishList({ ...productDetails, quantity }, user, location, deviceInfo)}
                            />
                        </div>
                        <div className="border-b border-gray-200 pb-4">
                            <span className="text-gray-900">Brand:
                                <span className="ml-4">
                                    {productDetails?.brand || "No Brand"}
                                </span>
                            </span>
                        </div>
                        <div className="border-b border-gray-200 pb-4">
                            <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                                {productDetails?.colors?.length > 0 && (
                                    <div>
                                        <strong>Color:</strong>
                                        <div>
                                            {
                                                productDetails?.colors?.map((color: string, index: number) => (
                                                    <button
                                                        key={index}
                                                        className={` h-8 cursor-pointer text-gray-200 rounded-md border-2 transition ${isSelected === color ? "border-gray-400 scale-110 shadiw-md" : "border-transparent"}`}
                                                        onClick={() => setIsSelected(color)}
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        {color}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-2  shadow-b ">
                            <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                                {productDetails?.sizes?.length > 0 && (
                                    <div>
                                        <strong>Size:</strong>
                                        <div>
                                            {
                                                productDetails?.sizes?.map((size: string, index: number) => (
                                                    <button
                                                        key={index}
                                                        className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${isSizeSelected === size ? "border-gray-400 scale-110 shadiw-md" : "border-transparent"}`}
                                                        onClick={() => setIsSelected(size)}
                                                        style={{ backgroundColor: size }}
                                                    >
                                                        {size}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-md">
                            <strong>Quantity:</strong>
                            <div className="flex items-center border rounded-lg">
                                <button
                                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                    className="px-4 py-2 text-lg hover:bg-gray-100"
                                >
                                    -
                                </button>
                                <span className="px-4">{quantity}</span>
                                <button
                                    onClick={() => setQuantity((prev) => prev + 1)}
                                    className="px-4 py-2 text-lg hover:bg-gray-100"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="w-md">
                            <button
                                onClick={handleClick}
                                className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                            >
                                <ShoppingCart size={18} />
                                Add to Cart
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 p-4 border-l border-gray-200">
                        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin size={18} className="text-green-600" />
                                Delivery Options
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {location?.city}, {location?.country}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl shadow-sm space-y-3">
                            <h3 className="text-sm font-semibold text-gray-700">Return & Warranty</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Package size={18} className="text-blue-600" />
                                <span>7 Days Returns</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <WalletMinimal size={18} className="text-yellow-600" />
                                <span>Warranty not available</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Sold By</h3>
                                <p className="text-gray-800 font-medium">{productDetails?.shop?.name}</p>
                            </div>

                            <button
                                className="text-blue-500 text-sm flex items-center gap-1 hover:text-blue-900"
                                onClick={handleChat}
                            >
                                <MessageSquareText />
                                Chat With Seller
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-t-gray-200 mt-3 ">
                            <div className="flex flex-col">
                                <p className="text-gray-400">Positive Seller Ratings </p>
                                <p>88%</p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-gray-400"> Ship on Time  </p>
                                <p>100%</p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-gray-400"> Chat Response Rate  </p>
                                <p>100%</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-t-gray-200 mt-3 ">
                            <div className="flex flex-col">
                                <p className="text-gray-400">Positive Seller Ratings </p>
                                <p>88%</p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-gray-400"> Ship on Time  </p>
                                <p>100%</p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-gray-400"> Chat Response Rate  </p>
                                <p>100%</p>
                            </div>
                        </div>
                        <div>
                            <Link
                                href={`/shop/${productDetails?.shop?.id}`}
                                className="text-blue-600 font-medium text-sm hover:underline"
                            >
                                GO TO STORE
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="w-[80%] mx-auto my-8">
                 
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Product Details of {productDetails?.title}
                        </h3>
                        <div
                            className="prose prose-sm text-gray-700 max-w-none leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: productDetails?.detailedDescription,
                            }}
                        />
                    </div>

               
                    <div className="bg-white rounded-2xl shadow-md p-6 mt-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Ratings & Reviews of {productDetails?.title}
                        </h3>
                        <div className="flex items-center justify-center h-24 border border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">No reviews available yet!</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>

                <div>
                    {
                        <>
                            <div>
                                <SectionTitle title={"Similar Products"} />
                            </div>
                            {
                                loading && <MainLoader isLoading={loading} />
                            }

                            {
                                !loading && (
                                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 md:grid-cols-5'>
                                        {
                                            recommendedProducts?.map((product: any) => (
                                                <ProductCard key={product.id} product={product} />
                                            ))
                                        }
                                    </div>
                                )
                            }
                        </>
                    }
                </div>
            </div>
        </>
    );
};

export default ProductDetails;
