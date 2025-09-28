import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';

const fetchAdmin = async (token: string | null) => {
  if (!token) throw new Error('No token found');
  const response = await axiosInstance.get('/admin/api/logged-in-admin', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.admin;
};

const useAdmin = () => {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
  }, []);

  const {
    data: admin,
    isLoading,
    isError,
    isFetching,
    status,
    refetch,
  } = useQuery({
    queryKey: ['admin', token],
    queryFn: () => fetchAdmin(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const loading = isLoading || status === "pending" || isFetching;
  return { admin, isLoading:loading, isError, refetch };
};

export default useAdmin;
