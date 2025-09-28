"use client";
import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const webSocketContext = createContext<any>(null);

export const WebSocketProvider = ({
    children,
    user
}: {
    children: React.ReactNode;
    user: any
}) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [wsReady, setWsReady] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user?.id) return;

        const ws = new WebSocket(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI!);

        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(`user_${user.id}`);
            setWsReady(true);
        };

        ws.onmessage = (event) => {
       

            const data = JSON.parse(event.data);
            if (data.type === "UNSEEN_COUNT_UPDATE") {
                const { conversationId, count } = data.payload;
                setUnreadCounts((prev) => ({ ...prev, [conversationId]: count }));
            }
            if (data.type === "NEW_MESSAGE") {
        
                const { conversationId, content, createdAt, senderType } = data.payload;

                queryClient.setQueryData(["messages", conversationId], (old: any = []) => [
                    ...old,
                    { content, createdAt, senderType },
                ]);

                queryClient.setQueryData(["conversations"], (old: any = []) =>
                    old.map((c: any) =>
                        c.conversationId === conversationId
                            ? { ...c, lastMessage: content }
                            : c
                    )
                );
            }
        };

        return () => {
            ws.close();
        };
    }, [user?.id]);

    return (
        <webSocketContext.Provider value={{ ws: wsRef.current, wsReady, unreadCounts }}>
            {children}
        </webSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(webSocketContext);
