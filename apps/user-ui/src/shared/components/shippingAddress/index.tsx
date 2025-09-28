import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { countries } from "apps/user-ui/src/configs/countries";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const ShippingAddressSection = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            label: "Home",
            name: "",
            street: "",
            city: "",
            zip: "",
            country: "Bangladesh",
            isDefault: "false",
        },
    });

    const { mutate: addAddress } = useMutation({
        mutationFn: async (payload: any) => {
            const res = await axiosInstance.post("/api/add-address", payload);
            return res.data.address;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["shipping-address"]
            })
            reset();
            setShowModal(false);
        }
    })

    const { mutate: deleteAddress } = useMutation({
        mutationFn: async (id: string) => {
            await axiosInstance.delete(`/user/api/delete-address/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["shipping-address"]
            })
        }
    })

    const { data: addresses = [], isLoading } = useQuery({
        queryKey: ["shipping-addresses"],
        queryFn: async () => {
            const res = await axiosInstance.post("/api/shipping-address");
            return res.data.address;
        }
    })

    const onSubmit = (data: any) => {
        addAddress({
            ...data,
            isDefault: data?.isDefault === "true"
        })
    };

    return (
        <div className="space-y-4">

            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Saved Addresses</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
                >
                    <Plus className="w-4 h-4" /> Add New Address
                </button>
            </div>

            <div>
                {
                    isLoading ? (
                        <p>
                            Loading Address ...
                        </p>
                    ) : !addresses || addresses.length === 0 ? (
                        <p>No saved address found.</p>
                    ) : (
                        <div>
                            {addresses.map((address: any) => (
                                <div
                                    key={address.id}
                                    className="border border-gray-200"
                                >
                                    <p>
                                        {address.street}, {address.city},  {address.zip},  {address.country}
                                    </p>
                                    <div>
                                        <button
                                            className="flex items-center gap-1 cursor-pointer"
                                            onClick={() => deleteAddress(address.id)}
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold">Home</h4>
                    <p className="text-sm text-gray-600">John Doe</p>
                    <p className="text-sm text-gray-600">Dhaka, Bangladesh</p>
                    <p className="text-xs mt-2 text-blue-600">Default</p>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-semibold mb-4">Add New Address</h3>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

                            <select {...register("label")} className="w-full border rounded-md px-3 py-2 text-sm">
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                                <option value="Other">Other</option>
                            </select>

                            <div>
                                <input
                                    placeholder="Full Name"
                                    {...register("name", { required: "Name is required" })}
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <input
                                placeholder="Street Address"
                                {...register("street")}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                            />

                            <div>
                                <input
                                    placeholder="City"
                                    {...register("city", { required: "City is required" })}
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                            </div>

                            <div>
                                <input
                                    placeholder="ZIP Code"
                                    {...register("zip", { required: "ZIP Code is required" })}
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                />
                                {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip.message}</p>}
                            </div>

                            <select {...register("country")} className="w-full border rounded-md px-3 py-2 text-sm">
                                {countries.map((country) => (
                                    <option key={country.code} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>


                            <select {...register("isDefault")} className="w-full border rounded-md px-3 py-2 text-sm">
                                <option value="true">Set as Default</option>
                                <option value="false">Not Default</option>
                            </select>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                            >
                                Save Address
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShippingAddressSection;
