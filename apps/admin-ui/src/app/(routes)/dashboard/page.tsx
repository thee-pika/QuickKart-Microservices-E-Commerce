"use client";
import React, { useEffect, useState } from "react";
import { Users, ShoppingBag, Tag, Store, ListOrdered } from "lucide-react";
import {
    BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import Loader from "apps/admin-ui/src/shared/components/Loader";

const fetchStats = async (token: string) => {
    const res = await axiosInstance.get("/admin/api/get-all-stats", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; 
};

const DashboardPage = () => {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(localStorage.getItem("accessToken"));
    }, []);

    const { data: statsData, isLoading } = useQuery({
        queryKey: ["all-stats", token],
        queryFn: () => fetchStats(token as string),
        enabled: !!token,
        staleTime: 1000 * 60 * 5,
    });

    if (isLoading || !statsData) return <Loader isLoading={isLoading} />;

    const { orders } = statsData;

    const ordersByDate = orders.reduce((acc: Record<string, number>, order: any) => {
        const date = new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(ordersByDate).map(([date, count]) => ({
        name: date,
        orders: count,
    }));

    const stats = [
        { title: "Users", value: statsData.users, icon: Users },
        { title: "Sellers", value: statsData.sellers, icon: Store },
        { title: "Products", value: statsData.products, icon: ShoppingBag },
        { title: "Offers", value: statsData.offers, icon: Tag },
        { title: "Orders", value: orders.length, icon: ListOrdered },
    ];

    return (
        <div className="min-h-screen bg-black text-purple-200 p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-purple-400">Dashboard</h1>
                <p className="text-purple-300">Overview of platform statistics and orders</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map(({ title, value, icon: Icon }) => (
                    <div
                        key={title}
                        className="bg-purple-900 p-4 rounded-lg flex flex-col items-center shadow"
                    >
                        <Icon size={28} className="text-purple-300" />
                        <p className="mt-1">{title}</p>
                        <h2 className="text-xl font-semibold">{value}</h2>
                    </div>
                ))}
            </div>

            <div className="bg-purple-900 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-purple-300">
                    Orders Per Day
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid stroke="#4c1d95" strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#c4b5fd" />
                        <YAxis stroke="#c4b5fd" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e1b4b",
                                borderColor: "#7c3aed",
                                color: "#e9d5ff",
                            }}
                        />
                        <Bar dataKey="orders" fill="#a855f7" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardPage;
