import { useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function UserProfileCard() {
  const [user, setUser] = useState<{username: string, email: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) return;
    fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.username) setUser(data);
        else setError("Could not load user info");
        setLoading(false);
      })
      .catch(() => { setError("Could not load user info"); setLoading(false); });
  }, []);
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 mb-2 animate-glow-card">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-pink-500 flex items-center justify-center border-2 border-neon-blue">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#0a001a"/><path d="M10 22v-1a4 4 0 014-4h4a4 4 0 014 4v1" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="16" cy="14" r="3" fill="#ff00de"/></svg>
      </div>
      <div>
        <div className="font-bold text-neon-blue text-lg">
          {loading ? 'Loading...' : error ? 'User' : user?.username}
        </div>
        <div className="text-xs text-neon-pink">
          {error ? error : user?.email || 'Cyberpunk Operator'}
        </div>
      </div>
    </div>
  );
}
