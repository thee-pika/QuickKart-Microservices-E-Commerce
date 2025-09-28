"use client";
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const fetchUser = async (token: string) => {
  if (!token) throw new Error('No token found');

  const response = await axiosInstance.get('/api/logged-in-user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.user;
};

const useUser = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
  }, []);

  const {
    data: user,
    isError,
    status,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['user', token],
    queryFn: () => fetchUser(token as string),
    staleTime: 5 * 60 * 1000,
    enabled: !!token,
    retry: 1,
  });

  const loading = isLoading || status === "pending" || isFetching;

  return { user, isLoading: loading, isError, refetch };
};

export default useUser;
