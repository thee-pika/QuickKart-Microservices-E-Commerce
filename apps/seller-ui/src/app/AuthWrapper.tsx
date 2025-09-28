"use client";
import React from 'react';
import { WebSocketProvider } from '../context/web-socket-context';
import useSeller from '../hooks/useSeller';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { seller } = useSeller();

    return (
        <>
            <WebSocketProvider seller={seller}>
                {children}
            </WebSocketProvider>
        </>
    );
}
