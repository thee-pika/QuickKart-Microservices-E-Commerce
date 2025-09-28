"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sendKafkaEvent } from "apps/user-ui/src/actions/track-user";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import { useLocationTracking } from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Twitter, Youtube, Globe } from "lucide-react";
import React, { useEffect, useState } from "react";

const TABS = ["Products", "Offers", "Reviews"];

const SellerProfile = ({ shop, followersCount }: { shop: any; followersCount: number }) => {
    const [activeTab, setActiveTab] = useState("Products");
    const [followers, setFollowers] = useState(followersCount);
    const [isFollowing, setIsFollowing] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const { user } = useUser();
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    const queryClient = useQueryClient();

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        setToken(storedToken);
        fetchFollowStatus(storedToken as string);
    }, []);

    const { data: products, isLoading } = useQuery({
        queryKey: ["seller-products", token],
        queryFn: async () => {
            const res = await axiosInstance.get(
                `seller/api/get-seller-products/${shop?.id}?page=1&limit=10`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data.products;
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!token,
    });

    const fetchFollowStatus = async (token: string) => {

        if (!shop?.id) {

            return
        };
        try {
            const res = await axiosInstance.get(`seller/api/is-following/${shop?.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsFollowing(res.data.isFollowing !== null);
        } catch (error) {
            console.log("failed to fetch follow status", error);
        }
    };

    const toggleFollowMutation = useMutation({
        mutationFn: async () => {
            if (isFollowing) {
                await axiosInstance.post("/seller/api/unfollow-shop", { shopId: shop?.id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

            } else {
                await axiosInstance.post("/seller/api/follow-shop", { shopId: shop?.id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

            }
        },
        onSuccess: () => {
            setFollowers((prev) => (isFollowing ? prev - 1 : prev + 1));
            setIsFollowing((prev) => !prev);
            queryClient.invalidateQueries({ queryKey: ["is-following", shop?.id] });
        },
    });

    useEffect(() => {
        if (isLoading) {
            if (!location || !deviceInfo || !user?.id) return;
            sendKafkaEvent({
                userId: user?.id,
                shopId: shop?.id,
                action: "shop_visit",
                country: location?.country || "Unknown",
                city: location?.city || "Unknown",
                device: deviceInfo || "Unknown Device",
            });
        }
    }, [location, deviceInfo, isLoading]);

    return (
        <div className="w-full min-h-screen text-white flex flex-col items-center">

            <div className="w-full bg-black relative pb-12">
                <div className="p-6 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <img
                        src={shop?.coverBanner || "/default-banner.jpg"}
                        alt="Shop Banner"
                        className="w-full md:w-1/2 h-64 object-cover rounded-lg shadow-lg"
                    />
                    <div className="md:w-1/2 text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-3">Support {shop?.name}</h2>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                            Discover amazing deals and contribute to support this shop. You’ll find unique products
                            and collections tailored just for you.
                        </p>
                        <button
                            onClick={() => toggleFollowMutation.mutate()}
                            className={`px-6 py-2 rounded-lg font-semibold transition ${isFollowing
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl w-full px-6 flex flex-col md:flex-row gap-6 -mt-10 relative z-10">

                <div className="flex-1 bg-gray-100 text-gray-900 rounded-lg shadow-xl p-6 flex gap-6 items-center">
                    <img
                        src={shop?.coverBanner || "/default-banner.jpg"}
                        alt={shop?.name}
                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{shop?.name}</h1>
                        <p className="text-gray-600 mt-1">{shop?.bio}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-700">
                            <p>📍 {shop?.address}</p>
                            <p>🕒 {shop?.opening_hours}</p>
                            <p>⭐ {shop?.ratings} / 5</p>
                            <p>👥 {followers} Followers</p>
                        </div>
                        <a
                            href={shop?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:underline"
                        >
                            <Globe size={16} /> Visit Website
                        </a>
                    </div>
                </div>

                <div className="w-full md:w-1/3 bg-gray-100 text-gray-900 rounded-lg shadow-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Shop Details</h2>
                    <p className="text-sm text-gray-700">
                        📅 Joined: {new Date(shop?.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-4">
                        <p className="font-medium">Follow Us:</p>
                        <div className="flex gap-4 mt-2 text-gray-600">
                            <a href="#" className="hover:text-red-600">
                                <Youtube />
                            </a>
                            <a href="#" className="hover:text-blue-500">
                                <Twitter />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl w-full mt-10 bg-gray-900 rounded-xl shadow">
                <div className="flex justify-center space-x-8 border-b border-gray-700">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-6 text-sm font-medium transition ${activeTab === tab
                                ? "border-b-2 border-blue-500 text-blue-400"
                                : "text-gray-400 hover:text-blue-400"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === "Products" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {products?.map((product: any) => (
                                <div
                                    key={product.id}
                                    className="bg-gray-800 rounded-lg shadow p-4 hover:scale-105 transition"
                                >
                                    <img
                                        src={product?.images?.[0]?.file_url || "/default-placeholder.png"}
                                        alt={product.title}
                                        className="w-full h-32 object-cover rounded-md"
                                    />
                                    <h3 className="mt-2 font-medium">{product.title}</h3>
                                    <p className="text-sm text-gray-400">₹{product.salePrice}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "Offers" && (
                        <div className="text-center text-gray-400">
                            🎉 Special offers from this shop will appear here.
                        </div>
                    )}

                    {activeTab === "Reviews" && (
                        <div className="text-center text-gray-400">
                            📝 Customer reviews will be displayed here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerProfile;
