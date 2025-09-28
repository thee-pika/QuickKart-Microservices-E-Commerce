"use client";
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import ChartAreaDefault from "apps/seller-ui/src/shared/components/chart/graph";
import WorldMap from "apps/seller-ui/src/shared/components/chart/map";
import Loader from 'apps/seller-ui/src/shared/components/loader';
import OrdersList from "apps/seller-ui/src/shared/components/ordes/ordersList";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const DashboardPage = () => {
  const router = useRouter();
  const { seller, isLoading } = useSeller();

  useEffect(() => {
    if (!isLoading && !seller) {
      router.push("/login");
    }
  }, [isLoading, seller, router]);

  if (isLoading) {
    return (
      <Loader isLoading={isLoading} />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-gray-200 p-6 space-y-6">

      <div className="bg-[#1E1E2E] rounded-2xl shadow-lg p-6 border border-[#2D2D3A]">
        <ChartAreaDefault />
      </div>

      <div className="flex gap-6 w-full">

        <div className="w-2/3 bg-[#1E1E2E] rounded-2xl shadow-lg p-6 border border-[#2D2D3A]">
          <WorldMap />
        </div>

        <div className="w-1/3 bg-[#1E1E2E] rounded-2xl shadow-lg p-6 border border-[#2D2D3A]">
          <OrdersList />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
