"use client";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from 'apps/seller-ui/src/context/web-socket-context';
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import ChatInput from 'apps/seller-ui/src/shared/components/chat/ChatInput';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { Loader2 } from "lucide-react";
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const Page = () => {
  const searchParams = useSearchParams();
  const { seller } = useSeller();
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
    const storedToken = localStorage.getItem('accessToken');
    setToken(storedToken);
  }, []);

  const { data: conversations, isLoading: isConversationsLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get("/chatting/api/get-seller-conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.conversations;
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000
  });

  useEffect(() => {
    if (conversations) setChats(conversations);
  }, [conversations]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {

      const chat = chats.find((c: any) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [searchParams, chats]);

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

  const loadMoreMessages = async () => {
    const nextPage = page + 1;

    const res = await axiosInstance.get(`/chatting/api/get-messages/${conversationId}?page=${nextPage}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    queryClient.setQueryData(["messages", conversationId], (old: any = []) => [
      ...res.data.messages.reverse(),
      ...old
    ]);

    setPage(nextPage);
    setHasMore(res.data.hasMore);
  }

  const handleSend = (e: any) => {
    e.preventDefault();

    if (!message.trim() || !selectedChat) return;

    const payload = {
      fromUserId: seller?.id,
      toUserId: selectedChat?.user?.id,
      conversationId: selectedChat?.conversationId,
      messageBody: message,
      senderType: "seller"
    }

    ws?.send(JSON.stringify(payload));

    queryClient.setQueryData(
      ["messages", selectedChat.conversationId],
      (old: any = []) => [
        ...old,
        {
          content: payload.messageBody,
          senderType: "seller",
          seen: false,
          createdAt: new Date().toISOString()
        }
      ]
    );

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.conversationId ? {
          ...chat, lastMessage: payload.messageBody
        } : chat
      )
    );

    setMessage("");
    scrollToBottom();
  }

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;
    const timeout = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeout);
  }, [conversationId, messages.length]);

  const handleChatSelect = (chat: any) => {
    setHasFetchedOnce(false);
    setChats((prev) =>
      prev.map((c) =>
        c.conversationId === chat.conversationId ? {
          ...c, unreadCount: 0
        } : c
      )
    );
    router.push(`?conversationId=${chat.conversationId}`);
  }

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const container = messageContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 50);
    })
  }

  return (
    <div className="flex h-screen bg-[#230B35]">
      <div className="w-80 border-r bg-[#020003] shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-200">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isConversationsLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <Loader2 className="animate-spin mr-2" />
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
                className={`flex items-center p-3 cursor-pointer transition w-full
                                    ${conversationId === chat.conversationId ? "bg-[#401465]" : "hover:bg-[#230B35]"}`}
              >
                <Image
                  src={Array.isArray(chat.user?.avatar) && chat.user?.avatar.length > 0 ? chat.user?.avatar : "https://ik.imagekit.io/m3hqvlyteo/products/shop2.jpg?updatedAt=1756897632350"}
                  alt={chat.user?.name || "User avatar"}
                  width={40}
                  height={40}
                  className="rounded-full border h-10 w-10 object-cover"
                />

                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-200">{chat?.user?.name}</span>
                    {chat.user?.isOnline && (
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-gray-200 truncate">{getLastMessage(chat)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="flex items-center gap-3 border-b bg-[#401465] px-4 py-3 shadow-sm ">
              <Image
                src={
                  Array.isArray(selectedChat.user?.avatar) && selectedChat.user?.avatar.length > 0
                    ? selectedChat.user.avatar[0]
                    : "https://ik.imagekit.io/m3hqvlyteo/products/shop2.jpg"
                }
                alt={selectedChat?.user?.name || "User avatar"}
                width={40}
                height={40}
                className="rounded-full border w-[40px] h-[40px] object-cover"
              />
              <div>
                <h2 className="font-medium text-gray-200">{selectedChat.user?.name}</h2>
                <p className="text-xs text-gray-400">{selectedChat.user?.isOnline ? "Online" : "Offline"}</p>
              </div>
            </div>

            <div
              ref={messageContainerRef}
              className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-[#1E0A2E]"
            >
              {hasMore && (
                <div className="flex justify-center">
                  <button
                    onClick={loadMoreMessages}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Load previous messages
                  </button>
                </div>
              )}
              {
                isMessagesLoading && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <Loader2 className="animate-spin mr-2" />
                  </div>
                )
              }
              {messages?.map((msg: any, index: number) => (
                <div
                  key={index}
                  className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] shadow 
                ${msg.senderType === "user"
                        ? "bg-[#822fc6] text-white"
                        : "bg-gray-200 text-gray-800"}`}
                  >
                    <p>{msg.text || msg.content}</p>
                    <span className="text-[10px] opacity-70 block mt-1 text-right">
                      {msg.time ||
                        new Date(msg.createdAt).toLocaleTimeString([], {
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
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
