import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';

const fetchSeller = async (token: string) => {
  const response = await axiosInstance.get('/api/logged-in-seller', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.seller;
};

const useSeller = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isTokenReady, setIsTokenReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
    setIsTokenReady(true);
  }, []);

  const {
    data: seller,
    isLoading: queryLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['seller', token],
    queryFn: () => fetchSeller(token as string),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const isLoading = !isTokenReady || queryLoading;

  return { seller, isLoading, isError, refetch, token };
};

export default useSeller;
