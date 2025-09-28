"use client";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { Delete } from "lucide-react";
import React, { useState, useEffect } from "react";

const deleteProduct = async (token: string) => {
  const res = await axiosInstance.get("/seller/api/delete-shop", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
const Page = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(token as string),
    onSuccess: () => {
      console.log("success fully deleted the shop")
    },
  });

  return (
    <div className="p-8 space-y-8 max-w-3xl mx-auto min-h-screen flex flex-col justify-evenly">
      <div className="border rounded-2xl shadow ">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Low Stock Alert Threshold</h2>
        <div className="space-y-3">
          <label htmlFor="threshold" className="block text-sm font-medium text-gray-100">
            Threshold Value
          </label>
          <input
            id="threshold"
            type="number"
            placeholder="Enter stock threshold (e.g., 5)"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>

      <div className="border rounded-2xl shadow p-6 text-gray-100">
        <h2 className="text-xl font-semibold mb-4">
          Order Notification Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Email Notifications</span>
            <input type="checkbox" className="h-5 w-5" />
          </div>
          <div className="flex items-center justify-between">
            <span>SMS Notifications</span>
            <input type="checkbox" className="h-5 w-5" />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Preferences
          </button>
        </div>
      </div>

      <div className="border border-red-500 rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <Delete className="w-5 h-5" />
          <p>
            Deleting your shop is an <span className="font-semibold">irreversible</span> process.
          </p>
        </div>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" onClick={() => deleteMutation.mutate()}>
          Delete Shop
        </button>
      </div>
    </div>
  );
};

export default Page;
