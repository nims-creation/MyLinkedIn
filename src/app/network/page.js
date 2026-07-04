"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function NetworkPage() {
  const { user } = useAuth();
  const [network, setNetwork] = useState({ connections: [], receivedRequests: [], sentRequests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNetwork();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchNetwork = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.uid}/network`);
      const data = await res.json();
      setNetwork(data);
    } catch (error) {
      console.error("Error fetching network:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (targetUid) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.uid}/accept/${targetUid}`, { method: "POST" });
      fetchNetwork();
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDecline = async (targetUid) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.uid}/decline/${targetUid}`, { method: "POST" });
      fetchNetwork();
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading network...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">My Network</h1>

      {/* Connection Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Invitations</h2>
        {network.receivedRequests.length === 0 ? (
          <p className="text-gray-500">No pending invitations.</p>
        ) : (
          <div className="space-y-4">
            {network.receivedRequests.map((req) => (
              <div key={req.firebaseUid} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {req.name.charAt(0)}
                  </div>
                  <div>
                    <Link href={`/profile/${req.firebaseUid}`} className="font-semibold hover:underline">
                      {req.name}
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-1">{req.headline}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleDecline(req.firebaseUid)}>Ignore</Button>
                  <Button size="sm" onClick={() => handleAccept(req.firebaseUid)}>Accept</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connections */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Connections ({network.connections.length})</h2>
        {network.connections.length === 0 ? (
          <p className="text-gray-500">You don&apos;t have any connections yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {network.connections.map((conn) => (
              <div key={conn.firebaseUid} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold">
                  {conn.name.charAt(0)}
                </div>
                <div>
                  <Link href={`/profile/${conn.firebaseUid}`} className="font-semibold hover:underline">
                    {conn.name}
                  </Link>
                  <p className="text-sm text-gray-500 line-clamp-1">{conn.headline}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
