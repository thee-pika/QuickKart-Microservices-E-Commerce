"use client";
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from "lucide-react";

const fetchOrders = async (token: string) => {
    const res = await axiosInstance.get("/order/api/get-seller-orders", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.orders;
};

const OrdersList = () => {
    const [token, setToken] = useState<string | null>(null);
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["seller-orders", token],
        queryFn: () => fetchOrders(token as string),
        staleTime: 1000 * 60 * 2,
        enabled: !!token,
    });

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        setToken(storedToken);
    }, []);

    const columns = useMemo(
        () => [
            { key: "id", label: "Order ID" },
            { key: "user?.name", label: "Customer" },
            { key: "total", label: "Amount" },
            { key: "status", label: "Status" },
        ],
        []
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40 text-purple-400">
                <Loader2 className="animate-spin mr-2" /> Loading orders...
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-black via-purple-950 to-black rounded-2xl shadow-lg border border-purple-800/40">
            <h2 className="text-xl font-semibold mb-6 text-purple-300">📦 Seller Orders</h2>
            <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse rounded-lg overflow-hidden text-sm">
                    <thead>
                        <tr className="bg-purple-900/40 text-purple-300">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="p-3 border-b border-purple-800 font-medium text-left"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="p-6 text-center text-purple-400"
                                >
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any, idx: number) => (
                                <tr
                                    key={order.id}
                                    className={`transition ${idx % 2 === 0 ? "bg-black/40" : "bg-purple-950/40"
                                        } hover:bg-purple-800/30`}
                                >
                                    <td className="p-3 border-b border-purple-800 text-purple-100">
                                        #{order.id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="p-3 border-b border-purple-800 text-purple-100">
                                        {order.user?.name || "N/A"}
                                    </td>
                                    <td className="p-3 border-b border-purple-800 text-purple-100">
                                        {order?.total || "N/A"}
                                    </td>
                                    <td className="p-3 border-b border-purple-800">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "completed"
                                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                    : order.status === "pending"
                                                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersList;
