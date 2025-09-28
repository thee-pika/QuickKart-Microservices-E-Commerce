"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "apps/user-ui/src/context/web-socket-context";
import useRequireAuth from "apps/user-ui/src/hooks/useRequireAuth";
import ChatInput from "apps/user-ui/src/shared/components/chats/chatInput";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Page = () => {
    const searchParams = useSearchParams();
    const { user } = useRequireAuth();
    const [message, setMessage] = useState("");
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();
    const messageContainerRef = useRef<HTMLDivElement | null>(null);
    const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const { ws } = useWebSocket();

    const conversationId = searchParams.get("conversationId");

    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        setToken(storedToken);
    }, []);

    const { data: conversations, isLoading: isConversationsLoading } = useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            const res = await axiosInstance.get("/chatting/api/get-user-conversations", {
                headers: { Authorization: `Bearer ${token}` },
            });
     
            return res.data.conversations;
        },
        enabled: !!token,
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (conversations) setChats(conversations);
    }, [conversations]);

    useEffect(() => {
        if (conversationId && chats.length > 0) {
            const chat = chats.find((c: any) => c.conversationId === conversationId);
            setSelectedChat(chat || null);
        }
    }, [conversationId, chats]);

    const getLastMessage = (chat: any) => chat?.lastMessage || "No messages yet";

    const { data: messages = [], isLoading: isMessagesLoading } = useQuery({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
            if (!conversationId || hasFetchedOnce) return [];
            const res = await axiosInstance.get(`/chatting/api/get-messages/${conversationId}?page=1`, {
                headers: { Authorization: `Bearer ${token}` },
            });
       
            setPage(1);
            setHasMore(res.data.hasMore);
            setHasFetchedOnce(true);
            return res.data.messages.reverse();
        },
        enabled: !!token && !!conversationId,
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (messages?.length > 0) scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
        });
    };

    const handleSend = (e: any) => {
        e.preventDefault();
        if (!message.trim() || !selectedChat) return;

        const payload = {
            fromUserId: user?.id,
            toUserId: selectedChat?.seller?.id,
            conversationId: selectedChat?.conversationId,
            messageBody: message,
            senderType: "user",
        };

        ws?.send(JSON.stringify(payload));

        queryClient.setQueryData(["messages", selectedChat.conversationId], (old: any = []) => [
            ...old,
            {
                content: payload.messageBody,
                senderType: "user",
                seen: false,
                createdAt: new Date().toISOString(),
            },
        ]);

        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat.conversationId
                    ? {
                        ...chat,
                        lastMessage: payload.messageBody,
                    }
                    : chat
            )
        );

        setMessage("");
        scrollToBottom();
    };

    const handleChatSelect = (chat: any) => {
        setHasFetchedOnce(false);
        setChats((prev) =>
            prev.map((c) =>
                c.conversationId === chat.conversationId ? { ...c, unreadCount: 0 } : c
            )
        );
        router.push(`?conversationId=${chat.conversationId}`);
    };

    return (
        <div className="flex h-screen bg-gray-50">

            <div className="w-80 border-r bg-white shadow-md flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isConversationsLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <Loader2 className="animate-spin mr-2" /> Loading...
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            No Conversations
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <button
                                key={chat.conversationId}
                                onClick={() => handleChatSelect(chat)}
                                className={`flex items-center p-3 w-full text-left hover:bg-gray-100 transition ${conversationId === chat.conversationId ? "bg-gray-100" : ""
                                    }`}
                            >
                                <Image
                                    src={chat.seller?.avatar || "https://ik.imagekit.io/m3hqvlyteo/products/shop2.jpg?updatedAt=1756897632350"}
                                    alt={chat.seller?.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full border h-10 w-10 object-cover"
                                />
                                <div className="ml-3 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-800">{chat?.seller?.name}</span>
                                        {chat.seller?.isOnline && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{getLastMessage(chat)}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        <div className="flex items-center gap-3 p-4 border-b bg-white">
                            <Image
                                src={selectedChat.seller?.avatar || "/default-avatar.png"}
                                alt={selectedChat?.seller?.name}
                                width={40}
                                height={40}
                                className="rounded-full border w-10 h-10 object-cover"
                            />
                            <h2 className="font-semibold text-gray-800">{selectedChat.seller?.name}</h2>
                        </div>

                        <div
                            ref={messageContainerRef}
                            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50"
                        >
                            {hasMore && (
                                <div className="text-center">
                                    <button
                                        onClick={() => { }}
                                        className="text-sm text-indigo-600 hover:underline"
                                    >
                                        Load previous messages
                                    </button>
                                </div>
                            )}
                            {messages?.map((msg: any, index: number) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`px-4 py-2 rounded-lg max-w-xs text-sm ${msg.senderType === "user"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-gray-200 text-gray-800"
                                            }`}
                                    >
                                        <p>{msg.text || msg.content}</p>
                                        <span className="block text-xs mt-1 opacity-70">
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollAnchorRef} />
                        </div>
                        <ChatInput message={message} setMessage={setMessage} onSendMessage={handleSend} />
                    </>
                ) : (
                    <div className="flex items-center justify-center flex-1 text-gray-400">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;
