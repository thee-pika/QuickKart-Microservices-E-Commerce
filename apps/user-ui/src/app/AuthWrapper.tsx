'use client';

import React from 'react';
import { WebSocketProvider } from '../context/web-socket-context';
import useUser from '../hooks/useUser';
import Header from '../shared/widgets/header/header';
import Footer from '../shared/widgets/footer';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { user } = useUser();

    return (
        <>
            <WebSocketProvider user={user}>
                <Header />
                {children}
                <Footer />
            </WebSocketProvider>
        </>
    );
}

