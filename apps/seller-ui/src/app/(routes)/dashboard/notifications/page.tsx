"use client";
import { useQuery } from '@tanstack/react-query';
import Loader from 'apps/seller-ui/src/shared/components/loader';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Page = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/api/seller-notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.notifications;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) {
    return (
      <Loader isLoading={isLoading} />
    );
  }

  const markAsRead = async (notificationId: string) => {
    await axiosInstance.post(
      "/seller/api/mark-notification-as-read",
      { notificationId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  return (
    <div className='p-4'>
      <h2 className="text-2xl font-semibold mb-2 text-gray-100 ml-4 mt-4">Notifications</h2>
      <nav className="flex items-center text-sm text-gray-600 mb-6 ml-4">
        <Link href="/" className="hover:underline text-purple-600">
          Home
        </Link>
        <span className="mx-2 text-gray-400"><ChevronRight /></span>
        <span className="text-gray-400 font-medium">Notifications</span>
      </nav>

      {(!data || data?.length === 0) && (
        <div className="text-center text-gray-500 bg-purple-100 p-6 rounded-xl shadow-sm">
          NO Notifications available yet!!
        </div>
      )}

      <div className="space-y-4 flex flex-col items-center">
        {data?.map((d: any) => (
          <Link
            key={d.id}
            href={d.redirect_link}
            onClick={() => markAsRead(d.id)}
            className="block rounded-xl border border-gray-200 bg-purple-100 p-5 shadow-sm hover:shadow-md transition w-2/3"
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

export default Page;

