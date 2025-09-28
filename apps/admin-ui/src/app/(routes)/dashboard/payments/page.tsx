"use client";
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Eye } from "lucide-react";

const fetchOrders = async (token: string) => {
  const res = await axiosInstance.get("/admin/api/get-all-orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.orders;
};

const PaymentsTable = () => {
  const [token, setToken] = useState<string | null>(null);
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["all-orders", token],
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
      { key: "id", label: "Payment ID" },
      { key: "user?.name", label: "Buyer" },
      { key: "status", label: "Status" },
      { key: "actions", label: "Actions" },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin mr-2" /> Loading orders...
      </div>
    );
  }

  return (
    <div className="p-6 bg-black border border-gray-300 shadow-sm min-h-screen">
      <h2 className="text-xl font-semibold mb-6 text-gray-100">Seller Payments</h2>
      <div className="overflow-x-auto w-[85%] mx-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 border-b bg-[#401465] text-white border-gray-200 font-medium"
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
                  className="p-6 text-center text-gray-500"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order: any, idx: number) => (
                <tr
                  key={order.id}
                  className={`transition ${idx % 2 === 0 ? "bg-purple-100" : "bg-purple-300"
                    } hover:bg-purple-200`}
                >
                  <td className="p-3 border-b border-gray-200">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {order.user?.name || "N/A"}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {order?.total}
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

export default PaymentsTable;
