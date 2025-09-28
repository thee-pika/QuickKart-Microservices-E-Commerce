import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Rating from "../ratings";
import toast, { Toaster } from 'react-hot-toast';
import {
    Heart,
    MapPin,
    MessageCircleMore,
    ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import { useLocationTracking } from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";

const ProductDetailsCard = ({
    data,
    setOpen,
}: {
    data: any;
    setOpen: (open: boolean) => void;
}) => {
    const [activeImage, setActiveImage] = useState(0);
    const [isSelected, setIsSelected] = useState<string | null>(null);
    const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || "");
    const [quantity, setQuantity] = useState(1);
    const { user } = useUser();
    const addToCart = useStore((state: any) => state.addToCart);
    const wishList = useStore((state) => state.wishList);
    const addToWishList = useStore((state: any) => state.addToWishList);
    const isWishListed = wishList.some((item) => item.id === data.id);
    const cart = useStore((state) => state.cart);
    const isInCart = cart.some((item) => item.id === data.id);
    const removeFromWishList = useStore((state: any) => state.removeFromWishList);
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    const router = useRouter();

    const handleQuantityDecrease = () => {
        if (quantity > 1) setQuantity((prev) => prev - 1);
    };

    const handleQuantityIncrease = () => {
        setQuantity((prev) => prev + 1);
    };

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    return (
        <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-xl shadow-lg">

            <div className="w-full md:w-1/2">
                <Image
                    src={data.images[activeImage]?.file_url || "https://ik.imagekit.io/m3hqvlyteo/products/product-1755878070303_IskcCflfn.jpg?updatedAt=1755878073820"}
                    alt={data.images[activeImage]?.file_url}
                    width={500}
                    height={500}
                    className="w-full h-[450px] rounded-lg object-contain border"
                />

                <div className="flex gap-3 mt-4 flex-wrap">
                    {data?.images?.map((img: any, index: number) => (
                        <button
                            key={index}
                            className={`border rounded-md p-1 transition ${activeImage === index
                                ? "border-blue-500 shadow-md"
                                : "border-gray-200 hover:border-gray-400"
                                }`}
                            onClick={() => setActiveImage(index)}
                        >
                            <Image
                                src={img?.file_url}
                                alt={`Thumbnail ${index}`}
                                width={80}
                                height={80}
                                className="rounded-md object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full md:w-1/2 space-y-5">
                <div className="flex items-center gap-4 border-b pb-4">
                    <Image
                        src={
                            data?.shop?.avatar ||
                            "https://i.pinimg.com/564x/91/9a/23/919a23a3ca777fb0eecc679b71fe8387.jpg"
                        }
                        alt="Shop Logo"
                        width={60}
                        height={60}
                        className="rounded-full border"
                    />
                    <div>
                        <Link
                            href={`/shop/${data?.shop?.id}`}
                            className="text-lg font-semibold hover:text-blue-600 transition"
                        >
                            {data?.shop?.name}
                        </Link>
                        <div className="mt-1">
                            <Rating rating={data?.shop?.ratings} />
                        </div>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                            <MapPin size={16} />
                            {data?.shop?.address || "Location not available"}
                        </p>
                    </div>
                    <button
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                        onClick={() => router.push(`/inbox?shopId=${data.shop.id}`)}
                    >
                        <MessageCircleMore size={18} /> Chat with Seller
                    </button>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{data?.title}</h1>
                    <p className="text-gray-600 mt-2 leading-relaxed">{data?.description}</p>
                    {data?.brand && (
                        <p className="mt-2 text-sm text-gray-700">
                            <span className="font-semibold">Brand:</span> {data.brand}
                        </p>
                    )}
                </div>

                {data?.sizes?.length > 0 && (
                    <div>
                        <p className="font-semibold">Size</p>
                        <div className="flex gap-2 mt-2">
                            {data.sizes.map((size: string, index: number) => (
                                <button
                                    key={index}
                                    className={`px-4 py-2 rounded-md border text-sm transition ${isSizeSelected === size
                                        ? "border-blue-600 bg-blue-50 text-blue-600"
                                        : "border-gray-300 hover:border-gray-400"
                                        }`}
                                    onClick={() => setIsSizeSelected(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {data?.colors?.length > 0 && (
                    <div>
                        <p className="font-semibold">Color</p>
                        <div className="flex gap-2 mt-2">
                            {data.colors.map((color: string, index: number) => (
                                <button
                                    key={index}
                                    className={`w-8 h-8 rounded-full border-2 transition ${isSelected === color
                                        ? "border-blue-600"
                                        : "border-gray-300 hover:border-gray-400"
                                        }`}
                                    onClick={() => setIsSelected(color)}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-red-600">${data?.salePrice}</h3>
                    {data?.regularPrice && (
                        <h3 className="text-lg text-gray-500 line-through">
                            ${data?.regularPrice}
                        </h3>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                        <button
                            onClick={handleQuantityDecrease}
                            className="px-4 py-2 text-lg hover:bg-gray-100"
                        >
                            -
                        </button>
                        <span className="px-4">{quantity}</span>
                        <button
                            onClick={handleQuantityIncrease}
                            className="px-4 py-2 text-lg hover:bg-gray-100"
                        >
                            +
                        </button>
                    </div>

                    <button
                        className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                        disabled={isInCart}
                        onClick={() => !isInCart && addToCart({
                            ...data,
                            quantity,
                            selectedOptions: {
                                color: isSelected,
                                size: isSizeSelected
                            }
                        }, user, location, deviceInfo)}
                    >
                        <ShoppingCart size={18} /> Add to Cart
                    </button>

                    <button className="p-3 rounded-full border hover:bg-gray-100 transition">
                        <Heart
                            size={30}
                            fill={isWishListed ? "red" : "transparent"}
                            color={isWishListed ? "transparent" : "red"}
                            onClick={() => isWishListed ? removeFromWishList(data.id, user, location, deviceInfo) : addToWishList({ ...data, quantity }, user, location, deviceInfo)}
                        />
                    </button>
                </div>

                <p className="text-sm text-gray-500">
                    Estimated Delivery:{" "}
                    <span className="font-semibold text-gray-700">
                        {estimatedDelivery.toDateString()}
                    </span>
                </p>
            </div>
            <Toaster />
        </div>
    );
};

export default ProductDetailsCard;
