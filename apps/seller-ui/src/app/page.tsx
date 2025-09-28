"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Globe, Twitter, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { sendKafkaEvent } from "../actions/track-user";
import useDeviceTracking from "../hooks/useDeviceTracking";
import { useLocationTracking } from "../hooks/useLocationTracking";
import useSeller from "../hooks/useSeller";
import axiosInstance from "../utils/axiosInstance";
import Link from "next/link";
import Loader from "../shared/components/loader";
import { useRouter } from 'next/navigation';
const TABS = ["Products", "Offers", "Reviews"];

async function fetchShopDetails(token: string) {
    const response = await axiosInstance.get(`/seller/api/get-shop-details/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.shop;
}

const Page = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("Products");
    const [followers, setFollowers] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [shop, setShop] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const { seller, isLoading } = useSeller();
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isLoading && !seller) {
            router.push("/login");
        }
    }, [isLoading, seller, router]);

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        setToken(storedToken);
        if (storedToken) {
            getShopDetails(storedToken as string);
        }
        fetchFollowStatus(storedToken as string);
    }, []);

    useEffect(() => {
        if (token && shop?.id) {
            fetchFollowStatus(token);
        }
    }, [token, shop?.id])

    const getShopDetails = async (token: string) => {
        const fetchedshop = await fetchShopDetails(token);
        setShop(fetchedshop);
        setFollowers(fetchedshop.followersCount);
    }

    const { data: products, isLoading: isProductsLoading } = useQuery({
        queryKey: ["seller-products", token, shop?.id],
        queryFn: async () => {

            const res = await axiosInstance.get(
                `seller/api/get-seller-products/${shop!.id}?page=1&limit=10`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data.products;
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!token && !!shop?.id,
    });

    const fetchFollowStatus = async (token: string) => {
        if (!shop?.id) {
            console.warn("fetchFollowStatus skipped: shop.id missing");
            return;
        }

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
                const res = await axiosInstance.post("/seller/api/unfollow-shop", { shopId: shop?.id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

            } else {
                const res = await axiosInstance.post("/seller/api/follow-shop", { shopId: shop?.id }, {
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
        if (isProductsLoading) {
            if (!location || !deviceInfo || !seller?.id) return;
            sendKafkaEvent({
                userId: seller?.id,
                shopId: shop?.id,
                action: "shop_visit",
                country: location?.country || "Unknown",
                city: location?.city || "Unknown",
                device: deviceInfo || "Unknown Device",
            });
        }
    }, [location, deviceInfo, isProductsLoading]);

    if (isLoading) {
        return (
            <Loader isLoading={isLoading} />
        );
    }

    return (
        <div className="w-full min-h-screen text-white flex flex-col items-center">
            <div className="w-full bg-black">
                <Link href="/dashboard">
                    <h1 className="text-blue relative text-blue-600 hover:underline p-4 ">Back to Dashboard</h1>
                </Link>
            </div>
            <div className="w-full bg-black relative pb-12">
                <div className="p-6 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <img
                        src={shop?.coverBanner || "https://ik.imagekit.io/m3hqvlyteo/products/shop3.png?updatedAt=1757233466553"}
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
                        src={Array.isArray(shop?.avatar) && shop?.avatar.length > 0 ? shop?.avatar[0] : "https://ik.imagekit.io/m3hqvlyteo/products/sellerprofile.webp?updatedAt=1757233831849"}
                        alt={shop?.name}
                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="flex-1 ">
                        <h1 className="text-3xl font-bold">{shop?.name}</h1>
                        <p className="text-gray-600 mt-1">{shop?.bio}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-700 ">
                            <p>⭐ {shop?.ratings} / 5</p>
                            <p>👥 {followers} Followers</p>
                        </div>

                        <p className="mt-2">📍 {shop?.address}</p>
                        <p className="mt-2">🕒 {shop?.opening_hours}</p>
                    </div>
                </div>

                <div className="w-full md:w-1/3 bg-gray-100 text-gray-900 rounded-lg shadow-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Shop Details</h2>
                    <p className="text-sm text-gray-700 flex gap-2">
                        <Calendar /> Joined At: {new Date(shop?.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                        <a
                            href={shop?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 "
                        >
                            <Globe size={24} /> <span className="text-blue-700 hover:underline">Visit Website</span>
                        </a>
                        <p className="font-medium mt-2">Follow Us:</p>
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
                                    className="bg-gray-800 rounded-lg shadow p-4 hover:scale-105 transition cursor-pointer"
                                >
                                    <img
                                        src={product?.images?.[0]?.file_url || "https://ik.imagekit.io/m3hqvlyteo/products/product-1755878070303_IskcCflfn.jpg?updatedAt=1755878073820"}
                                        alt={product.title}
                                        className="w-full h-52 rounded-md"
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

export default Page;
