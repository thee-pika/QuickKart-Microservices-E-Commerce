import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import Rating from '../ratings';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import ProductDetailsCard from './product-details-card';
import { X } from 'lucide-react';
import { useStore } from 'apps/user-ui/src/store';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useLocationTracking } from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import toast, { Toaster } from 'react-hot-toast';

const ProductCard = ({ product, isEvent }: { product: any, isEvent?: boolean }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useUser();
    const addToCart = useStore((state: any) => state.addToCart);
    const addToWishList = useStore((state: any) => state.addToWishList);
    const removeFromWishList = useStore((state: any) => state.removeFromWishList);
    const wishList = useStore((state) => state.wishList);
    const isWishListed = wishList.some((item) => item.id === product.id);
    const cart = useStore((state) => state.cart);
    const isInCart = cart.some((item) => item.id === product.id);
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();

    useEffect(() => {
        if (isEvent && product?.endingDate) {
            const interval = setInterval(() => {
                const endTime = new Date(product.endingDate).getTime();
                const now = Date.now();
                const diff = endTime - now;

                if (diff <= 0) {
                    setTimeLeft("Expired");
                    clearInterval(interval);
                    return;
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);

                setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price`)
            }, 60000);

            return () => clearInterval(interval);
        }
        return;
    }, [isEvent, product?.endingDate]);

    const handleAddToCart = () => {
        if (!isInCart) {
            addToCart({ ...product, quantity: product.quantity }, user, location, deviceInfo)
            toast.success("Added to cart!");
        } else {
            toast.error("Item already in cart!");
        }
    };

    const handleWishListToggle = () => {

        if (isWishListed) {

            removeFromWishList(product.id, user, location, deviceInfo)
            toast.success("Removed from wishlist");
        } else {

            addToWishList({ ...product, quantity: 1 }, user, location, deviceInfo)
            toast.success("Added to wishlist");
        }
    };

    return (
        <>
            <div className='relative w-full min-h-[350px] h-max bg-white rounded-lg shadow-md '>
                {isEvent && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow">
                        OFFER
                    </span>
                )}

                {product?.stock <= 5 && (
                    <span className="absolute top-3 right-3 bg-yellow-400 text-black text-xs px-2 py-1 rounded-md font-medium shadow">
                        Limited Stock
                    </span>
                )}

                <Link href={`/product/${product?.slug}`} className='flex justify-center items-center'>
                    <img
                        src={product?.images?.length
                            ? product.images[0].file_url
                            : "https://ik.imagekit.io/m3hqvlyteo/products/product-1755878070303_IskcCflfn.jpg?updatedAt=1755878073820"}
                        alt={product?.title || "product image"}
                        width={160}
                        height={300}
                        className="w-[280px] h-[480px] object-cover cursor-pointer"
                    />
                </Link>

                <Link href={`/product/${product?.shop?.id}`}>
                    <p className="text-sm text-gray-500 mt-2 hover:underline ml-4">
                        {product?.shop?.name}
                    </p>
                </Link>

                <Link href={`/product/${product?.slug}`}>
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 line-clamp-2 ml-4">
                        {product?.title}
                    </h3>
                </Link>

                <div className='mt-2 px-2 ml-2'>
                    <Rating rating={product?.ratings} />
                </div>

                <div className='mt-3 flex justify-between items-center px-2 ml-2'>
                    <div className='flex items-center gap-2'>
                        <span className='text-red-900 font-bold text-lg'>${product?.salePrice}</span>
                        <span className='text-gray-400 font-bold text-sm line-through '>${product?.regularPrice}</span>
                    </div>
                </div>

                {
                    isEvent && timeLeft && (
                        <div className='mt-2'>
                            <span className='inline-block text-xs bg-orange-100 text-orange-800'>{timeLeft}</span>
                        </div>
                    )
                }

                <div className='absolute bottom-4 right-4 z-10 flex flex-col gap-3'>
                    <div className='bg-white rounded-full p-[6px] shadow-md'>
                        <Heart
                            className='cursor-pointer hover:scale-110 transition'
                            onClick={handleWishListToggle}
                            size={22}
                            fill={"red"}
                            stroke='red'
                        />
                    </div>
                    <div className='bg-white rounded-full p-[6px] shadow-md'>
                        <Eye className='cursor-pointer hover:scale-110 transition' size={22} onClick={() => setOpen(!open)} />
                    </div>
                    <div className='bg-white rounded-full p-[6px] shadow-md'>
                        <ShoppingBag
                            className='cursor-pointer hover:scale-110 transition'
                            onClick={handleAddToCart}
                            size={22}
                        />
                    </div>
                </div>

                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg shadow-lg w-[90%] md:w-[70%] lg:w-[50%] p-4 relative">
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-black"
                                onClick={() => setOpen(false)}
                            >
                                <X />
                            </button>
                            <ProductDetailsCard data={product} setOpen={setOpen} />
                        </div>
                    </div>
                )}
            </div>
            <Toaster />
        </>
    )
}

export default ProductCard;
