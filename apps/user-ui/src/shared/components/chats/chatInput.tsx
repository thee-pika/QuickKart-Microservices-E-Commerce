import dynamic from 'next/dynamic';
import { PickerProps } from 'emoji-picker-react';
import React, { useState } from 'react';
import { ImageIcon, Send, Smile } from 'lucide-react';

const EmojiPicker = dynamic(
    () => import('emoji-picker-react').then((mod) => mod.default as React.FC<PickerProps>),
    { ssr: false }
);

const ChatInput = ({
    message,
    setMessage,
    onSendMessage,
}: {
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    onSendMessage: (e: any) => void;
}) => {
    const [showEmoji, setShowEmoji] = useState(false);

    const handleEmojiClick = (emojiData: any) => {
        setMessage((prev) => prev + emojiData.emoji);
        setShowEmoji(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) console.log('Uploading image:', file.name);
    };

    return (
        <form
            onSubmit={onSendMessage}
            className="flex items-center gap-3 border-t bg-white p-3"
        >
  
            <label className="cursor-pointer text-gray-500 hover:text-gray-700">
                <ImageIcon className="w-6 h-6" />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                />
            </label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowEmoji((prev) => !prev)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <Smile className="w-6 h-6" />
                </button>
                {showEmoji && (
                    <div className="absolute bottom-12 left-0 z-50 shadow-lg">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                )}
            </div>

            <input
                type="text"
                value={message}
                onChange={(e: any) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
                type="submit"
                className="bg-indigo-600 p-2 rounded-full text-white hover:bg-indigo-700 transition"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
    );
};

export default ChatInput;
