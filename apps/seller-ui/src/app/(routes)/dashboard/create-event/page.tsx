"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import React, { useState, useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Input from "packages/components/input";
import { Plus } from "lucide-react";
import { AxiosError } from "axios";

type DiscountFormValues = {
    public_name: string;
    discountType: string;
    discountValue: string;
    discountCode: string;
};

const Page = () => {
    const queryClient = useQueryClient();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        setToken(storedToken);
    }, []);

    const { register, handleSubmit, control, reset } = useForm<DiscountFormValues>({
        defaultValues: {
            public_name: "juio",
            discountType: "percentage",
            discountValue: "",
            discountCode: "",
        },
    });

    const createDiscountCodeMutation = useMutation({
        mutationFn: async (data: DiscountFormValues) => {
            await axiosInstance.post("/product/api/create-discount-code", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
            reset();
        },
    });

    const onSubmit: SubmitHandler<DiscountFormValues> = (data) => {
        createDiscountCodeMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-lg bg-[#401465] rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-200 mb-6">
                    Create Discount Code
                </h2>

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">
                            Discount Type
                        </label>
                        <Controller
                            control={control}
                            name="discountType"
                            render={({ field }) => (
                                <select
                                    {...field}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-purple-500"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="flat">Flat Amount ($)</option>
                                </select>
                            )}
                        />
                    </div>


                    <Input
                        type="number"
                        label="Discount Value"
                        min={1}
                        placeholder="text-black"
                        {...register("discountValue", {
                            required: "Discount Value is required",
                        })}
                    />

                    <Input
                        label="Discount Code"
                        {...register("discountCode", {
                            required: "Discount Code is required",
                        })}
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition text-gray-200 hover:text-black"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={createDiscountCodeMutation.isPending}
                            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-2"
                        >
                            {createDiscountCodeMutation.isPending ? "Creating..." : "Create"}
                            <Plus size={20} />
                        </button>
                    </div>

                    {createDiscountCodeMutation.isError && (
                        <p className="text-red-500 text-sm mt-2">
                            {(createDiscountCodeMutation.error as AxiosError<{ message: string }>)
                                ?.response?.data?.message || "Something went wrong"}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Page;
