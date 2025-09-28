"use client";
import { useStore } from 'apps/user-ui/src/store';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Trash2 } from "lucide-react";
import { useLocationTracking } from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import useUser from 'apps/user-ui/src/hooks/useUser';

const WishListPage = () => {
    const wishList = useStore((state: any) => state.wishList);
    const removeFromWishList = useStore((state: any) => state.removeFromWishList);
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();

    const {user} = useUser();

    const decreaseQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            wishList: state.wishList.map((item: any) =>
                item.id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            ),
        }));
    };

    const increaseQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            wishList: state.wishList.map((item: any) =>
                item.id === id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ),
        }));
    };

    return (
        <div className="w-full bg-gray-50 min-h-screen py-10">
            <div className="md:w-[80%] w-[95%] mx-auto">
                <div className="pb-10">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Wishlist</h1>
                    <div className="text-sm text-gray-600 mb-6">
                        <Link href="/" className="hover:underline text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800">Wishlist</span>
                    </div>

                    <div className="w-[100%] mx-auto flex gap-2 border ">
                        <div className='w-[70%]'>
                            {wishList.length === 0 ? (
                                <div className="text-center text-gray-600 text-lg bg-white py-10 rounded-lg shadow">
                                    Your wishlist is empty! Start adding products.
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="py-4 px-6 font-semibold text-gray-700">Product</th>
                                                <th className="py-4 px-6 font-semibold text-gray-700">Price</th>
                                                <th className="py-4 px-6 font-semibold text-gray-700">Quantity</th>
                                                <th className="py-4 px-6 font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {wishList.map((item: any) => (
                                                <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                                                    <td className="py-4 px-6 flex items-center gap-4">
                                                        <Image
                                                            src={item.images[0].file_url}
                                                            alt={item.title}
                                                            width={80}
                                                            height={80}
                                                            className="rounded-md object-cover"
                                                        />
                                                        <span className="font-medium text-gray-800">{item.title}</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-700 font-semibold">
                                                        ${item?.salePrice.toFixed(2)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center border rounded-lg w-max">
                                                            <button
                                                                onClick={() => decreaseQuantity(item.id)}
                                                                className="px-3 py-1 text-lg font-bold text-gray-600 hover:bg-gray-200 rounded-l"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="px-4 py-1 text-gray-800 font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => increaseQuantity(item.id)}
                                                                className="px-3 py-1 text-lg font-bold text-gray-600 hover:bg-gray-200 rounded-r"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 flex gap-3 ">
                                                        <button
                                                            onClick={() => removeFromWishList(item.id, user, location, deviceInfo)}
                                                            className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition"
                                                        >
                                                            <Trash2 size={18} />
                                                            <span>Remove</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="w-[30%] bg-white shadow-md rounded-lg p-6 flex-shrink-0 space-y-6">

                            <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                                <span>Subtotal</span>
                                <span>$89.00</span>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">Have a Coupon?</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter a coupon code"
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition">
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">Select Shipping Address</label>
                                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>Home Address</option>
                                    <option>Work Address</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">Select Payment Method</label>
                                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>Online Payment</option>
                                    <option>Cash on Delivery</option>
                                </select>
                            </div>

                            <div className="flex justify-between items-center text-xl font-bold text-gray-900 border-t pt-4">
                                <span>Total</span>
                                <span>$89.00</span>
                            </div>

                            <button className="bg-black hover:bg-gray-800 text-white rounded-lg px-6 py-3 w-full font-medium transition">
                                Proceed to Checkout
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default WishListPage;
