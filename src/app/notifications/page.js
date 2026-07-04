"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMessaging } from "@/context/MessagingContext";
import { Bell, UserPlus, CheckCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, markNotificationsAsRead } = useMessaging();

  useEffect(() => {
    if (user && notifications.some(n => !n.isRead)) {
      // Mark as read after 2 seconds of viewing the page
      const timer = setTimeout(() => {
        markNotificationsAsRead();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, notifications]);

  if (!user) return null;

  const getIcon = (type) => {
    switch (type) {
      case "connection_request":
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case "connection_accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>You have no new notifications.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`p-4 flex gap-4 transition-colors ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
              >
                <Link href={notif.sender ? `/profile/${notif.sender}` : "#"} className="flex-shrink-0">
                  {notif.senderDetails?.profilePicture ? (
                    <img src={notif.senderDetails.profilePicture} alt="Sender" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {getInitials(notif.senderDetails?.name || "System")}
                    </div>
                  )}
                </Link>
                
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getIcon(notif.type)}
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {notif.senderDetails?.name || "Notification"}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full inline-block ml-1"></span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {notif.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
