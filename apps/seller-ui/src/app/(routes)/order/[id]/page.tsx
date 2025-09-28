"use client";

import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

type OrderItem = {
    id: string;
    price: number;
    quantity: number;
    product: {
        id: string;
        name: string;
        images: { file_url: string }[];
    };
    selectedOptions: { color: string | null; size: string | null };
};

type OrderDetails = {
    id: string;
    deliverystatus: "PLACED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED";
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
    const [newStatus, setNewStatus] = useState<OrderDetails["deliverystatus"] | "PLACED">("PLACED");
    const [token, setToken] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const params = useParams();
    const { id } = params;

    const statusSteps: OrderDetails["deliverystatus"][] = [
        "PLACED",
        "PACKED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
    ];

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken && id) {
            setToken(storedToken);
            fetchOrderDetails(storedToken, id as string);
        }
    }, [id]);

    const fetchOrderDetails = async (token: string, orderId: string) => {
        const res = await axiosInstance.get(`/order/api/get-order-details/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const order = res.data.order as OrderDetails;


        setOrderDetails(order);
        setNewStatus(order.deliverystatus);

        const currentIndex = statusSteps.indexOf(order?.deliverystatus as OrderDetails["deliverystatus"]);
        const percent = (currentIndex / (statusSteps.length - 1)) * 100;
        setProgressPercent(percent);
    };

    const updateOrderStatus = async () => {
        if (!orderDetails || !newStatus) return;
        try {
            setUpdating(true);

            if (!token) {
                return
            }

            const res = await axiosInstance.put(`/order/api/update-delivery-status/${orderDetails.id}`, { deliveryStatus: newStatus }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const updated = { ...orderDetails, status: res.data?.deliverystatus as OrderDetails["deliverystatus"] };
            setOrderDetails(updated);

            const currentIndex = statusSteps.indexOf(newStatus as OrderDetails["deliverystatus"]);
            const percent = (currentIndex / (statusSteps.length - 1)) * 100;
            setProgressPercent(percent);

            setUpdating(false);

        } catch (err) {
            console.error("Failed to update status", err);

            setUpdating(false);
        }
    };

    if (!orderDetails) {
        return <div className="p-6 text-lg font-medium text-purple-300">Loading order details...</div>;
    }

    const currentIndex = statusSteps.indexOf(orderDetails.deliverystatus);

    return (
        <div className="min-h-screen bg-black p-8 text-purple-200">
            <div className="max-w-3xl mx-auto bg-[#1a1a1a] rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-purple-400 mb-2">
                    Order #{orderDetails.id}
                </h1>
                <p className="text-gray-400">
                    Date: {new Date(orderDetails.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-400 mb-6">
                    Amount: <span className="font-semibold text-purple-300">₹{orderDetails.total}</span>
                </p>

                <div className="relative mb-16">

                    <div className="absolute top-4 left-0 h-1 w-full bg-gray-700 rounded"></div>

                    <div
                        className="absolute top-4 left-0 h-1 bg-purple-500 rounded transition-all duration-700 ease-in-out"
                        style={{ width: `${progressPercent}%` }}
                    ></div>

                    <div className="flex justify-between relative z-10">
                        {statusSteps.map((step, index) => {
                            const isCompleted = progressPercent > 0 && index <= currentIndex;
                       
                            return (
                                <div key={step} className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${isCompleted
                                            ? "bg-purple-600 border-purple-500 text-white"
                                            : "bg-black border-gray-600 text-gray-600"
                                            }`}
                                    >
                                        {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                                    </div>
                                    <p
                                        className={`text-xs mt-2 font-medium transition-colors duration-500 ${isCompleted ? "text-purple-400" : "text-gray-500"
                                            }`}
                                    >
                                        {step.replaceAll("_", " ")}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="font-semibold text-lg text-purple-400 mb-2">Update Status</h2>
                    <div className="flex items-center gap-3">
                        <select
                            value={newStatus}
                            defaultValue={"PLACED"}
                            onChange={(e) => setNewStatus(e.target.value as OrderDetails["deliverystatus"])}
                            className="border border-purple-500 bg-black text-purple-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        >
                            {statusSteps.map((step) => (
                                <option key={step} value={step} className="bg-black text-purple-200">
                                    {step.replaceAll("_", " ")}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={updateOrderStatus}
                            disabled={updating}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                            {updating ? "Updating..." : "Update"}
                        </button>
                    </div>
                </div>


                <div className="mb-6">
                    <h2 className="font-semibold text-lg text-purple-400 mb-2">Shipping Address</h2>
                    <div className="bg-[#2a2a2a] rounded-lg p-4 text-sm text-gray-300">
                        <p>{orderDetails.shippingAddress.name}</p>
                        <p>{orderDetails.shippingAddress.street}</p>
                        <p>
                            {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.zip}
                        </p>
                        <p>{orderDetails.shippingAddress.country}</p>
                    </div>
                </div>

                <div>
                    <h2 className="font-semibold text-lg text-purple-400 mb-3">Items</h2>
                    <div className="divide-y divide-gray-700 border border-gray-700 rounded-lg">
                        {orderDetails.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center space-x-3">
                                    {item.product?.images?.[0]?.file_url && (
                                        <Image
                                            src={item.product.images[0].file_url}
                                            alt={item.product.name}
                                            width={50}
                                            height={60}
                                            className="rounded-md object-cover border border-gray-600"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium text-purple-300">{item.product?.name}</p>
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
                                <p className="font-semibold text-purple-400">₹{item.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
