"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useUser from "apps/user-ui/src/hooks/useUser";
import QuickActionCard from "apps/user-ui/src/shared/components/cards/quick-action-card";
import StatCard from "apps/user-ui/src/shared/components/cards/stat-card";
import ChangePasswordForm from "apps/user-ui/src/shared/components/ChangePassword";
import InboxPage from "apps/user-ui/src/shared/components/Inbox/InboxPage";
import Notifications from "apps/user-ui/src/shared/components/notifications/NotificationPage";
import OrdersTable from "apps/user-ui/src/shared/components/orders/OrdersTable";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { AxiosResponse } from "axios";
import {
    BadgeCheck,
    Bell,
    CheckCircle,
    Clock,
    Gift,
    Inbox,
    Loader2,
    Lock,
    LogOut,
    MapPin,
    Pencil,
    PhoneCall,
    Receipt,
    Settings,
    ShoppingBag,
    Truck,
    User,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

const fetchOrders = async (token: string) => {
    const res = await axiosInstance.get("/order/api/get-my-orders", {
        headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.orders;
};

const ProfilePage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isLoading } = useUser();
    const queryTab = searchParams.get("active") || "Profile";
    const [activeTab, setActiveTab] = useState(queryTab);

    const [token, setToken] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
     
        setToken(storedToken);
    }, []);

    const logoutHandler = async () => {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        queryClient.invalidateQueries();
        toast.success("LogOut Successfull!!")
        setTimeout(() => {
            router.push("/login");
        }, 1000);
    };

    useEffect(() => {
        if (activeTab !== queryTab) {

            const newParams = new URLSearchParams(searchParams);
            newParams.set("active", activeTab as string);
            router.replace(`profile?${newParams.toString()}`);
        }
    }, [activeTab]);

    const onSubmit = (data: any) => {
        addressMutation.mutate(data);
    }

    const addressMutation = useMutation<AxiosResponse<any>, Error, any>({
        mutationFn: async (data: FormData) => {
            const response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/add-address`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
        },
    });

    const fetchAddress = async () => {
        const res = await axiosInstance.get(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/shipping-address`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data.address;
    }

    const { data: addresses = [], isLoading: isAddressLoading } = useQuery({
        queryKey: ["addresses"],
        queryFn: fetchAddress,
        staleTime: 1000 * 60 * 5,
    })

    const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
        queryKey: ["user-orders", token],
        queryFn: () => fetchOrders(token as string),
        staleTime: 1000 * 60 * 2,
        enabled: !!token,
    });

    const { data: userNotifications, isLoading: isUserNotificationsLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await axiosInstance.get("/admin/api/get-user-notifications", { headers: { Authorization: `Bearer ${token}` } });
            return res.data.notifications;
        },
    });

    const totalOrders = orders.length;
    const processingOrders = orders.filter((order: any) => order?.deliverystatus !== "Delivered" && order?.deliverystatus !== "Cancelled").length;

    const compltedOrders = orders.filter((order: any) => order?.deliverystatus === "Delivered").length;

    return (
        <div className="p-6 space-y-6 w-[90%] mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-md">
                <h1 className="text-2xl font-semibold">
                    Welcome back,&nbsp;
                    <span className="font-bold">
                        {isLoading ? (
                            <Loader2 className="inline animate-spin w-5 h-5" />
                        ) : (
                            user?.name || "User"
                        )}
                    </span>
                </h1>
                <p className="text-sm opacity-80 mt-1">Here’s your activity overview</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <StatCard title="Total Orders" count={totalOrders} Icon={Clock} />
                <StatCard title="Processing Orders" count={processingOrders} Icon={Truck} />
                <StatCard title="Completed Orders" count={compltedOrders} Icon={CheckCircle} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <aside className="md:col-span-2 bg-white rounded-xl shadow-md p-4 space-y-1">
                    <NavItem
                        label="Profile"
                        Icon={User}
                        active={activeTab === "Profile"}
                        onClick={() => setActiveTab("Profile")}
                    />
                    <NavItem
                        label="My Orders"
                        Icon={ShoppingBag}
                        active={activeTab === "My Orders"}
                        onClick={() => setActiveTab("My Orders")}
                    />
                    <NavItem
                        label="Inbox"
                        Icon={Inbox}
                        active={activeTab === "Inbox"}
                        onClick={() => setActiveTab("Inbox")}
                    />
                    <NavItem
                        label="Notifications"
                        Icon={Bell}
                        active={activeTab === "Notifications"}
                        onClick={() => setActiveTab("Notifications")}
                    />
                    <NavItem
                        label="Shipping Address"
                        Icon={MapPin}
                        active={activeTab === "Shipping Address"}
                        onClick={() => setActiveTab("Shipping Address")}
                    />
                    <NavItem
                        label="Change Password"
                        Icon={Lock}
                        active={activeTab === "Change Password"}
                        onClick={() => setActiveTab("Change Password")}
                    />
                    <NavItem
                        label="Logout"
                        Icon={LogOut}
                        danger
                        onClick={() => logoutHandler()}
                    />
                </aside>

                <main className="md:col-span-7 bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4">{activeTab}</h2>

                    {activeTab === "Profile" && !isLoading && user && (
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">

                            <div className="flex flex-col items-center gap-2">
                                <Image
                                    src={
                                        user?.avatar ||
                                        "https://ik.imagekit.io/m3hqvlyteo/products/product-1755863607990_ZCixthiz2g.jpg"
                                    }
                                    alt="User Avatar"
                                    width={80}
                                    height={80}
                                    className="rounded-full border shadow-sm"
                                />
                                <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                                    <Pencil className="w-4 h-4" /> Change Photo
                                </button>
                            </div>

                            <div className="space-y-2">
                                <p>
                                    <span className="font-semibold">Name:</span> {user.name}
                                </p>
                                <p>
                                    <span className="font-semibold">Email:</span> {user.email}
                                </p>
                                <p>
                                    <span className="font-semibold">Joined:</span>{" "}
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                                <p>
                                    <span className="font-semibold">Earned Points:</span>{" "}
                                    {user.points || 0}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "Shipping Address" && (
                        <div>
                            {
                                isAddressLoading ? (
                                    <p>Loading addresses...</p>
                                ) : addresses.length === 0 ? (
                                    <form
                                        onSubmit={handleSubmit(onSubmit)}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                {...register('name', { required: 'name is required' })}
                                                placeholder="John Doe"
                                                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Street Address</label>
                                            <input
                                                type="text"
                                                {...register('street', { required: 'street is required' })}
                                                placeholder="123 Main St"
                                                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">City</label>
                                                <input
                                                    type="text"
                                                    {...register('city', { required: 'city is required' })}
                                                    placeholder="New York"
                                                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"

                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">ZIP Code</label>
                                                <input
                                                    type="text"
                                                    {...register('zip', { required: 'zip is required' })}
                                                    placeholder="10001"
                                                    className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Country</label>
                                            <input
                                                type="text"
                                                {...register('country', { required: 'country is required' })}
                                                placeholder="USA"
                                                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4"
                                                {...register('isDefault', { required: 'isDefault is required' })}
                                            />
                                            <label className="text-sm">Set as default address</label>
                                        </div>

                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                                        >
                                            Save Address
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        {addresses.map((addr: any) => (
                                            <div
                                                key={addr._id}
                                                className="border rounded-lg p-4 shadow-sm bg-gray-50"
                                            >
                                                <p className="font-semibold">{addr.name}</p>
                                                <p>{addr.street}</p>
                                                <p>
                                                    {addr.city}, {addr.zip}
                                                </p>
                                                <p>{addr.country}</p>
                                                {addr.isDefault && (
                                                    <span className="text-xs text-green-600 font-medium">
                                                        Default Address
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                        </div>
                    )}

                    {activeTab === "My Orders" && (
                        <OrdersTable orders={orders} isLoading={isOrdersLoading} />
                    )}

                    {activeTab === "Change Password" && (
                        <ChangePasswordForm />
                    )}

                    {activeTab === "Notifications" && (
                        <Notifications notifications={userNotifications} isLoading={isUserNotificationsLoading} token={token} />
                    )}

                    {activeTab === "Inbox" && (
                        <InboxPage />
                    )}
                </main>

                <div className="md:col-span-3 space-y-4">
                    <QuickActionCard
                        Icon={Gift}
                        title="Referral Program"
                        description="Invite friends and earn rewards."
                    />
                    <QuickActionCard
                        Icon={BadgeCheck}
                        title="Your Badges"
                        description="View your earned achievemnets."
                    />
                    <QuickActionCard
                        Icon={Settings}
                        title="Account Settings"
                        description="Manage preferences and security."
                    />
                    <QuickActionCard
                        Icon={Receipt}
                        title="Billing History"
                        description="check your recent payments."
                    />
                    <QuickActionCard
                        Icon={Gift}
                        title="Account Settings"
                        description="Manage preferences and security."
                    />
                    <QuickActionCard
                        Icon={PhoneCall}
                        title="Support Center"
                        description="Need help? Contact support."
                    />
                </div>
            </div>
            <Toaster />
        </div>
    );
};

export default ProfilePage;


const NavItem = ({ label, Icon, active, danger, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500" : ""}
        ${danger ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-50"}
    `}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);
