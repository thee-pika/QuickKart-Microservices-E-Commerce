import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import Link from 'next/link';
import React from 'react'

const Notifications = ({ notifications, isLoading, token }: any) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40 text-gray-500">
                Loading notifications...
            </div>
        );
    }

    const markAsRead = async (notificationId: string) => {
        await axiosInstance.post(
            "/admin/api/mark-notification-as-read",
            { notificationId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    };

    return (
        <div className="max-w-3xl mx-auto p-6">

            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
                <p className="text-gray-500 text-sm">Stay updated with the latest alerts</p>
            </div>

            {(!notifications || notifications.length === 0) && (
                <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-xl shadow-sm">
                    No notifications found!
                </div>
            )}

            <div className="space-y-4">
                {notifications?.map((d: any) => (
                    <Link
                        key={d.id}
                        href={d.redirect_link}
                        onClick={() => markAsRead(d.id)}
                        className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{d.title}</h3>
                                <p className="text-gray-600 text-sm mt-1">{d.message}</p>
                            </div>
                            <span className="mt-2 sm:mt-0 text-xs text-gray-400">
                                {new Date(d.createdAt).toLocaleString("en-UK", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Notifications;
