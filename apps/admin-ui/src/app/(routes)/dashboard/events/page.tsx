"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "apps/admin-ui/src/shared/components/Loader";
import DeleteDiscountCodeModal from "apps/admin-ui/src/shared/components/modals/delete-discountCodes";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";

import { ChevronRight, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type DiscountFormValues = {
    public_name: string;
    discountType: string;
    discountValue: string;
    discountCode: string;
};

const AllEvents = () => {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState<any>();

    const queryClient = useQueryClient();

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
       
        setToken(storedToken);
    }, []);

    const { data: discountCodes = [], isLoading } = useQuery({
        queryKey: ["shop-discounts", token],
        queryFn: async () => {
            const res = await axiosInstance.get("/admin/api/get-all-discountcodes", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("res from  discount codes", res);
            return res?.data?.discount_Codes || [];
        },
        enabled: !!token,
    });

    const { register, handleSubmit, control, reset, formState: { } } = useForm({
        defaultValues: {
            public_name: "juio",
            discountType: "percentage",
            discountValue: "",
            discountCode: ""
        }
    })

    const handleDeleteClick = (discount: any) => {
        setShowDeleteModal(true);
        setSelectedDiscount(discount);
    }


    const onSubmit: SubmitHandler<DiscountFormValues> = (data) => {
        console.log("data to create discount", data);
        if (discountCodes.length >= 8) {
            console.log("You can only create up to 8 discount codes.");
            return;
        }

        createDiscountCodeMutation.mutate(data);
    };

    const createDiscountCodeMutation = useMutation({
        mutationFn: async (data: any) => {
            await axiosInstance.post("/product/api/create-discount-code", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
            reset();
            setShowModal(false);
        }
    })

    const deleteDiscountCodeMutation = useMutation({
        mutationFn: async (discountId) => {
            await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
            setShowDeleteModal(false);
        }
    })

    return (
        <div className="p-6 space-y-6 bg-black min-h-screen ">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-200">
                    Discount Codes
                </h2>
            </div>

            <div className="flex items-center text-sm text-gray-500">
                <span className="text-blue-600 cursor-pointer hover:underline">
                    Dashboard
                </span>
                <ChevronRight size={16} className="mx-1" />
                <span>Create Product</span>
            </div>

            <div className="bg-purple-100 shadow-md rounded-xl p-4 max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Your Discount Codes
                </h3>

                {isLoading ? (
                    <p>
                        <Loader isLoading={isLoading} />
                    </p>
                ) : discountCodes.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        No discount codes found. Create one to get started.
                    </div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-purple-400 text-gray-700">
                                <th className="p-3 text-left font-medium">Title</th>
                                <th className="p-3 text-left font-medium">Type</th>
                                <th className="p-3 text-left font-medium">Value</th>
                                <th className="p-3 text-left font-medium">Code</th>
                                <th className="p-3 text-left font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discountCodes?.map((code: any, idx: number) => (
                                <tr
                                    key={idx}
                                    className="border-b last:border-none hover:bg-gray-50 transition"
                                >
                                    <td className="p-3">{code?.public_name}</td>
                                    <td>{code.discountType === "percentage" ? "Percentage(%)" : "Flat($)"}</td>
                                    <td>{code.discountType === "percentage" ? `${code.discountValue}%` : `${code.discountValue}`}</td>
                                    <td className="p-3">{code.discountCode}</td>
                                    <td className="p-3">
                                        <button
                                            className="text-red-600 hover:underline text-sm"
                                            onClick={() => handleDeleteClick(code)}
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                )}
            </div>

            {
                showDeleteModal && selectedDiscount && (
                    <DeleteDiscountCodeModal
                        discount={selectedDiscount}
                        onClose={(value) => setShowDeleteModal(value)}
                        onConfirm={() => deleteDiscountCodeMutation.mutate(selectedDiscount)}
                    />
                )
            }

        </div>
    );
};

export default AllEvents;
