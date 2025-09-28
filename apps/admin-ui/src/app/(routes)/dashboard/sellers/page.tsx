"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Eye } from "lucide-react";
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';

const fetchAllSellers = async (token: string) => {
    const res = await axiosInstance.get("/admin/api/get-all-sellers", {
        headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.sellers;
};

const Page = () => {
    const [token, setToken] = useState<string | null>(null);
    const { data: sellers = [], isLoading } = useQuery({
        queryKey: ["all-sellers", token],
        queryFn: () => fetchAllSellers(token as string),
        staleTime: 1000 * 60 * 2,
        enabled: !!token,
    });

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        setToken(storedToken);
    }, []);

    const columns = useMemo(
        () => [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "phone_number", label: "Phone Number" },
            { key: "country", label: "Country" },
            { key: "createdAt", label: "Joined At" },
        ],
        []
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="animate-spin mr-2" /> Loading sellers...
            </div>
        );
    }

    return (
        <div className="p-6 bg-black border border-gray-200 shadow-sm min-h-screen">
            <h2 className="text-xl font-semibold mb-6 text-gray-200">All Sellers</h2>
            <div className="overflow-x-auto w-[85%] mx-auto">
                <table className="w-full border-collapse rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-[#b972ff] text-left text-sm text-gray-200">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="p-3 border-b bg-[#ad5cff] text-white border-gray-200 font-medium"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sellers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="p-6 text-center text-gray-500"
                                >
                                    No sellers found
                                </td>
                            </tr>
                        ) : (
                            sellers.map((seller: any, idx: number) => (
                                <tr
                                    key={idx}
                                    className={`transition ${idx % 2 === 0 ? "bg-[#e6cdff]" : "bg-gray-50"
                                        } hover:bg-gray-100`}
                                >
                                    <td className="p-3 border-b border-gray-200">

                                        {seller?.name || "N/A"}
                                    </td>
                                    <td className="p-3 border-b border-gray-200">
                                        {seller?.email}
                                    </td>
                                    <td className="p-3 border-b border-gray-200">
                                        {seller?.phone_number}
                                    </td>
                                    <td className="p-3 border-b border-gray-200">
                                        {seller?.country}
                                    </td>
                                    <td className="p-3 border-b border-gray-200">
                                        {new Date(seller?.createdAt).toLocaleDateString()}
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

export default Page;
