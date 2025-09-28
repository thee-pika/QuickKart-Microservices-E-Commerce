"use client";

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from "lucide-react";
import Image from 'next/image';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';

type OrderItem = {
    id: string;
    price: number;
    quantity: number;
    product: {
        id: string;
        name: string;
        images: { file_url: string }[];
    };
    selectedOptions: {
        color: string | null;
        size: string | null;
    };
};

type OrderDetails = {
    id: string;
    status: "PLACED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED";
    total: number;
    createdAt: string;
    shippingAddress: {
        name: string;
        street: string;
        city: string;
        zip: string;
        country: string;
    };
    items: OrderItem[];
};

const Page = () => {
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken && id) {
            fetchOrderDetails(storedToken, id as string);
        }
    }, [id]);

    const fetchOrderDetails = async (token: string, orderId: string) => {
        const res = await axiosInstance.get(`/order/api/get-order-details/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setOrderDetails(res.data.order);
    };

    if (!orderDetails) {
        return <div className="p-6 text-lg font-medium">Loading order details...</div>;
    }

    const statusSteps = ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
    const currentIndex = statusSteps.indexOf(orderDetails.status);

    return (
        <div className="min-h-screen bg-[#E3EFD3] p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">

                <h1 className="text-2xl font-bold text-[#345635] mb-2">
                    Order #{orderDetails.id}
                </h1>
                <p className="text-gray-600">
                    Date: {new Date(orderDetails.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-600 mb-6">
                    Amount: <span className="font-semibold text-[#345635]">₹{orderDetails.total}</span>
                </p>

                <div className="flex justify-between mb-10">
                    {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentIndex;
                        return (
                            <div key={step} className="flex flex-col items-center w-full">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted
                                        ? "bg-[#345635] border-[#345635] text-white"
                                        : "bg-gray-200 border-gray-300 text-gray-500"
                                        }`}
                                >
                                    {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                                </div>
                                <p
                                    className={`text-xs mt-2 font-medium ${isCompleted ? "text-[#345635]" : "text-gray-400"
                                        }`}
                                >
                                    {step.replaceAll("_", " ")}
                                </p>
                                {index < statusSteps.length - 1 && (
                                    <div
                                        className={`h-0.5 w-full mt-2 ${index < currentIndex ? "bg-[#345635]" : "bg-gray-300"
                                            }`}
                                    ></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mb-6">
                    <h2 className="font-semibold text-lg text-[#345635] mb-2">
                        Shipping Address
                    </h2>
                    <div className="bg-[#E3EFD3] rounded-lg p-4 text-sm text-gray-700">
                        <p>{orderDetails.shippingAddress.name}</p>
                        <p>{orderDetails.shippingAddress.street}</p>
                        <p>
                            {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.zip}
                        </p>
                        <p>{orderDetails.shippingAddress.country}</p>
                    </div>
                </div>

                <div>
                    <h2 className="font-semibold text-lg text-[#345635] mb-3">Items</h2>
                    <div className="divide-y border rounded-lg">
                        {orderDetails.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center space-x-3">
                                    {item.product?.images?.[0]?.file_url && (
                                        <Image
                                            src={item.product.images[0].file_url}
                                            alt={item.product.name}
                                            width={50}
                                            height={60}
                                            className="rounded-md object-cover border border-gray-200"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-800">{item.product?.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        {item.selectedOptions?.color && (
                                            <p className="text-sm text-gray-500">
                                                Color: <span className="font-medium">{item.selectedOptions.color}</span>
                                            </p>
                                        )}
                                        {item.selectedOptions?.size && (
                                            <p className="text-sm text-gray-500">
                                                Size: <span className="font-medium">{item.selectedOptions.size}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="font-semibold text-[#345635]">₹{item.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
