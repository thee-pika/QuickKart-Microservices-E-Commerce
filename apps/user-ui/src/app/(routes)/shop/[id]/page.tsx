"use client";

import SellerProfile from 'apps/user-ui/src/shared/components/shops/SellerProfile';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

async function fetchShopDetails(id: string, token: string) {
    const response = await axiosInstance.get(`/seller/api/get-shop/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.shop;
}

export default function Page() {
    const params = useParams();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
            fetchShopDetails(params.id as string, storedToken).then(setData);
        }
    }, [params.id]);

    if (!data) return <div>Loading...</div>;

    return (
        <SellerProfile shop={data} followersCount={data.followersCount} />
    );
}
