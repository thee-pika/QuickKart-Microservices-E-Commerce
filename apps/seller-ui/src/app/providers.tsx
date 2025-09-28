"use client";
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useSeller from '../hooks/useSeller';
import { WebSocketProvider } from '../context/web-socket-context';
import { useRouter } from 'next/navigation';
import Loader from '../shared/components/loader';

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersWithWebSocket>{children}</ProvidersWithWebSocket>
    </QueryClientProvider>
  );
};

const ProvidersWithWebSocket = ({
  children
}: {
  children: React.ReactNode
}) => {
  const { seller, isLoading } = useSeller();
  const router = useRouter();

  if (!isLoading || !seller) {
    router.push("/login");
  }

  return (
    <>
      {seller && <WebSocketProvider seller={seller}>{children}</WebSocketProvider>}
      {!seller && children}
    </>
  )
}

export default Provider;
