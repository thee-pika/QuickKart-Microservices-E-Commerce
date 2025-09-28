import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react'
import axiosInstance from '../utils/axiosInstance';

const fetchLayout = async (token: string) => {
    const response = await axiosInstance.get(
        `/api/user/api/get-layouts`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data.layout;
}

const useLayout = () => {
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
       
        setToken(storedToken);
    }, []);

    const { data: layout, isPending: isLoading, isError, refetch } = useQuery({
        queryKey: ["layout", token],
        queryFn: () => fetchLayout(token as string),
        staleTime: 5 * 60 * 1000,
        retry: 1,
        enabled: !!token
    });

    return {
        layout,
        isLoading,
        isError,
        refetch,
    }
}

export default useLayout;

