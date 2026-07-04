"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import io from "socket.io-client";

const MessagingContext = createContext();

export const useMessaging = () => useContext(MessagingContext);

export const MessagingProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]); // Currently active chat messages
  const [activeChatUser, setActiveChatUser] = useState(null); // The user being chatted with
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Fetch initial notifications
  useEffect(() => {
    if (user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${user.uid}`)
        .then(res => res.json())
        .then(data => {
          setNotifications(data);
          setUnreadNotificationCount(data.filter(n => !n.isRead).length);
        })
        .catch(err => console.error("Error fetching notifications:", err));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Connect to Socket.io server
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
      
      newSocket.on("connect", () => {
        newSocket.emit("join", user.uid);
      });

      newSocket.on("receiveMessage", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      newSocket.on("messageSent", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      newSocket.on("newNotification", (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadNotificationCount((prev) => prev + 1);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    } else {
      if (socket) socket.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const openChatWith = async (targetUser) => {
    setActiveChatUser(targetUser);
    setIsChatOpen(true);
    
    // Fetch chat history
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${user.uid}/${targetUser.firebaseUid}`);
      if (res.ok) {
        const history = await res.json();
        setMessages(history);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setActiveChatUser(null);
    setMessages([]);
  };

  const sendMessage = (content) => {
    if (socket && user && activeChatUser) {
      socket.emit("sendMessage", {
        sender: user.uid,
        receiver: activeChatUser.firebaseUid,
        content
      });
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${user.uid}/read`, { method: "POST" });
      setUnreadNotificationCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking notifications read:", error);
    }
  };

  return (
    <MessagingContext.Provider value={{
      socket,
      messages,
      activeChatUser,
      isChatOpen,
      notifications,
      unreadNotificationCount,
      openChatWith,
      closeChat,
      sendMessage,
      markNotificationsAsRead
    }}>
      {children}
    </MessagingContext.Provider>
  );
};
