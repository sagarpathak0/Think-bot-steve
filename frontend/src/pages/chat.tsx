

import { useEffect, useState, useRef } from "react";
import CyberpunkNavbar from "../components/CyberpunkNavbar";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type MoodPoint = {
  timestamp: string;
  speaker: string;
  mood: number;
};

type Message = {
  timestamp: string;
  speaker: string;
  message: string;
};

type BotData = {
  conversation: Message[];
  summary: string;
  objects: Record<string, { timestamp: string; description: string | null }[]>;
};

const ChatPage = () => {
  const [data, setData] = useState<BotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<{
    summary: string;
    mood_timeline: MoodPoint[];
    avg_mood: number;
    count: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch memory/chat log (with JWT and 401 handling)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      window.location.href = "/login";
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/memory`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        localStorage.removeItem("jwt_token");
        window.location.href = "/login";
        return;
      }
      const d = await res.json();
      setData(d);
    } catch (e) {
      setError("Could not load bot data.");
    }
    setLoading(false);
  };

  // Fetch daily stats (summary, mood) with JWT and 401 handling
  const fetchStats = async () => {
    setStatsLoading(true);
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      setStatsLoading(false);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/stats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setStatsLoading(false);
        localStorage.removeItem("jwt_token");
        window.location.href = "/login";
        return;
      }
      const s = await res.json();
      setStats(s);
    } catch (e) {
      // Optionally set error for stats
    }
    setStatsLoading(false);
  };

  // Check for JWT on mount, redirect to login if not present
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchData();
    fetchStats();
    // Poll every 2 minutes (120000 ms)
    const interval = setInterval(() => {
      fetchData();
      fetchStats();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  // Only scroll to bottom when a new message is sent (not on every refresh)
  const prevConversationLength = useRef<number>(0);
  useEffect(() => {
    if (!data) return;
    const len = data.conversation.length;
    // Only scroll if a new message was added
    if (len > prevConversationLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevConversationLength.current = len;
  }, [data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  // Handle chat submit (with JWT and 401 handling)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        setError("You are not logged in.");
        setSending(false);
        window.location.href = "/login";
        return;
      }
      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: input }),
      });
      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setSending(false);
        localStorage.removeItem("jwt_token");
        window.location.href = "/login";
        return;
      }
      const result = await res.json();
      if (result.reply) {
        setInput("");
        fetchData();
      } else if (result.error) {
        setError(result.error);
      }
    } catch (e) {
      setError("Could not send message.");
    }
    setSending(false);
  };

  return (
    <div className="cyberpunk-main min-h-screen bg-background text-foreground relative overflow-hidden">
      <CyberpunkNavbar />
      {/* Cyberpunk city skyline and circuit overlays */}
      <div className="hud-lines" />
      <h1 className="text-4xl font-bold mb-4 glitch neon-border px-6 py-2 text-center tracking-widest" style={{letterSpacing:'0.08em', marginTop:'6rem'}}>STEVE <span className="flicker" style={{color:'var(--neon-pink)'}}>Think-Bot</span> <span className="flicker" style={{color:'var(--neon-blue)'}}>AI</span></h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {data ? (
        <>
          <div className="cyberpunk-chatlog neon-border holo shadow-lg relative" style={{zIndex:2}}>
            {Array.isArray(data.conversation) && data.conversation.length > 0 ? (
              data.conversation.map((msg, i) => (
                <div key={i} className="mb-2">
                  <span className={msg.speaker === "bot" ? "text-blue-600 font-semibold" : "text-green-700 font-semibold"}>
                    {msg.speaker === "bot" ? "Steve" : "You"}
                  </span>
                  {": "}
                  <span className="whitespace-pre-line">{msg.message.replace(/!!$/, "")}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-400">No conversation yet.</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input and refresh button */}
          <form onSubmit={handleSubmit} className="cyberpunk-input-form neon-border holo" style={{zIndex:2}}>
            <input
              className="cyberpunk-input flex-1"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              autoFocus
            />
            <button
              type="submit"
              className="glitch-btn"
              disabled={sending || !input.trim()}
            >
              {sending ? <span className="flicker">Sending...</span> : <span className="flicker">Send</span>}
            </button>
            <button
              type="button"
              className="glitch-btn"
              onClick={() => { fetchData(); fetchStats(); }}
              disabled={loading || sending}
            >
              Refresh
            </button>
          </form>

          <div className="cyberpunk-section neon-border holo shadow" style={{zIndex:2}}>
            <h2 className="cyberpunk-section-title">Summary</h2>
            <div className="cyberpunk-section-text">{data.summary || "No summary yet."}</div>
          </div>
          <div className="cyberpunk-section neon-border holo shadow" style={{zIndex:2}}>
            <h2 className="cyberpunk-section-title">Objects Detected</h2>
            <ul className="cyberpunk-section-text">
              {data.objects && Object.entries(data.objects).length === 0 && <li>No objects detected yet.</li>}
              {data.objects && Object.entries(data.objects).map(([obj, arr]) => (
                <li key={obj}>
                  <span className="font-semibold text-blue-700 dark:text-blue-300">{obj}</span>
                  {": "}
                  <span className="text-gray-700 dark:text-gray-300">{arr.length} time(s)</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ChatPage;
