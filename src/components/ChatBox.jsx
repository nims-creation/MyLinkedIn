"use client";

import { useState, useRef, useEffect } from "react";
import { useMessaging } from "@/context/MessagingContext";
import { useAuth } from "@/context/AuthContext";
import { X, Send, User } from "lucide-react";
import Image from "next/image";

export function ChatBox() {
  const { activeChatUser, isChatOpen, closeChat, messages, sendMessage } = useMessaging();
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  if (!isChatOpen || !activeChatUser) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-t-xl rounded-bl-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 flex items-center justify-between cursor-pointer" onClick={closeChat}>
        <div className="flex items-center space-x-2">
          {activeChatUser.profilePicture ? (
            <Image src={activeChatUser.profilePicture} alt={activeChatUser.name} width={32} height={32} className="rounded-full" />
          ) : (
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center font-bold">
              {activeChatUser.name.charAt(0)}
            </div>
          )}
          <span className="font-semibold text-sm truncate">{activeChatUser.name}</span>
        </div>
        <button onClick={closeChat} className="hover:bg-blue-700 p-1 rounded-full">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 flex flex-col space-y-3">
        {messages.map((msg, idx) => {
          const isMe = msg.sender === user.uid;
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-none shadow-sm'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 bg-gray-100 dark:bg-gray-900 border-transparent rounded-full px-4 py-2 text-sm focus:ring-blue-600 focus:border-transparent dark:text-white"
        />
        <button type="submit" disabled={!inputText.trim()} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
