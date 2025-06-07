

import { useEffect, useState, useRef } from "react";
import CyberpunkNavbar from "../components/CyberpunkNavbar";
// --- Sidebar Widgets (copied from dashboard/stats) ---
const aiTips = [
  "Tip: You can refresh to see new objects detected!",
  "News: Chat now supports cyberpunk mood bubbles!",
  "Tip: Use the summary to reflect on your conversation.",
  "News: Objects detected are now shown in real time.",
  "Tip: Stay positive and chat with Steve!",
];
function UserProfileCard() {
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
function LiveClock() {
  const [now, setNow] = useState<Date|null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!now) return null;
  return (
    <div className="font-mono text-neon-blue text-lg tracking-widest text-center mb-2 animate-glow">
      {now.toLocaleTimeString()}<span className="text-neon-pink text-base ml-2">{now.toLocaleDateString()}</span>
    </div>
  );
}
function SystemResourceMonitor() {
  const [resources, setResources] = useState<{cpu:number,ram:number,net?:{sent:number,recv:number}}|null>(null);
  const [error, setError] = useState<string|null>(null);
  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const res = await fetch(`${BASE_URL}/system_stats`);
        if (!res.ok) throw new Error('Failed to fetch system stats');
        const data = await res.json();
        if (mounted) setResources({ cpu: data.cpu, ram: data.ram, net: data.net });
      } catch (e: any) {
        if (mounted) setError('System stats unavailable');
      }
    }
    fetchStats();
    const timer = setInterval(fetchStats, 2000);
    return () => { mounted = false; clearInterval(timer); };
  }, []);
  if (error) return <div className="mb-2 text-neon-pink text-xs">{error}</div>;
  if (!resources) return null;
  const {cpu, ram, net} = resources;
  return (
    <div className="mb-2">
      <div className="font-bold text-neon-blue mb-1">System Resources</div>
      <div className="flex items-center gap-2 text-xs mb-1">
        CPU
        <div className="flex-1 min-w-[60px] h-2 bg-gray-800 rounded overflow-hidden">
          <div className="h-2 rounded bg-neon-pink" style={{width: `${Math.max(2, Math.round(cpu))}%`, minWidth: 2}}></div>
        </div>
        <span className="text-neon-pink">{Math.round(cpu)}%</span>
      </div>
      <div className="flex items-center gap-2 text-xs mb-1">
        RAM
        <div className="flex-1 min-w-[60px] h-2 bg-gray-800 rounded overflow-hidden">
          <div className="h-2 rounded bg-neon-blue" style={{width: `${Math.max(2, Math.round(ram))}%`, minWidth: 2}}></div>
        </div>
        <span className="text-neon-blue">{Math.round(ram)}%</span>
      </div>
      {net && (
        <div className="flex items-center gap-2 text-xs mb-1">
          NET <span className="text-neon-blue">{(net.recv/1024).toFixed(1)} KB/s ↓</span> <span className="text-neon-pink">{(net.sent/1024).toFixed(1)} KB/s ↑</span>
        </div>
      )}
    </div>
  );
}
function AITipsWidget() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i+1)%aiTips.length), 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="w-full mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card text-neon-blue text-center text-base font-mono">
      <span className="text-neon-pink mr-2">&#9889;</span>{aiTips[idx]}
    </div>
  );
}

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
  // Removed stats state and loading for chat page
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

  // Removed fetchStats for chat page

  // Check for JWT on mount, redirect to login if not present
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchData();
    // Poll every 2 minutes (120000 ms)
    const interval = setInterval(() => {
      fetchData();
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
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500" style={{background: "linear-gradient(135deg, #0a001a 60%, #1a0033 100%)", color: "#e0e0ff", fontFamily: "'Share Tech Mono', 'VT323', 'Fira Mono', monospace"}}>
      <CyberpunkNavbar />
      <div className="w-full mx-auto flex flex-col md:flex-row gap-8 px-0 md:px-4 mt-32 z-10" style={{maxWidth: '100vw'}}>
        {/* Info/Sidebar (30%) */}
        <aside className="w-full md:w-[30%] max-w-none mx-0 bg-opacity-80 rounded-2xl p-6 shadow-xl backdrop-blur-md border border-blue-900 flex flex-col gap-4 animate-glow-card" style={{background: "rgba(24,32,60,0.92)"}}>
          <UserProfileCard />
          <LiveClock />
          <AITipsWidget />
          {/* Summary and Objects Cards */}
          {data && (
            <>
              <div className="flex flex-col p-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card">
                <div className="font-bold text-neon-blue mb-1">Summary</div>
                <div className="text-base text-gray-100">{data.summary || "No summary yet."}</div>
              </div>
              <div className="flex flex-col p-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card">
                <div className="font-bold text-neon-pink mb-1">Objects Detected</div>
                <ul className="text-base text-gray-100">
                  {data.objects && Object.entries(data.objects).length === 0 && <li>No objects detected yet.</li>}
                  {data.objects && Object.entries(data.objects).map(([obj, arr]) => (
                    <li key={obj}>
                      <span className="font-semibold text-neon-blue">{obj}</span>
                      {": "}
                      <span className="text-neon-pink">{arr.length} time(s)</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </aside>
        {/* Main Chat Area (70%) */}
        <main className="w-full md:w-[70%] mx-0 bg-opacity-80 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md border border-blue-900 flex flex-col gap-6 animate-glow-card" style={{background: "rgba(24,28,48,0.92)"}}>
          <h1 className="text-4xl font-bold glitch tracking-widest text-center mb-2">STEVE <span className="flicker text-neon-pink">Think-Bot</span> <span className="flicker text-neon-blue">AI</span></h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {data ? (
            <>
              <div className="cyberpunk-chatlog neon-border holo shadow-lg relative mb-4 max-h-[340px] overflow-y-auto p-4 rounded-xl bg-gradient-to-br from-blue-900/40 to-pink-900/20 border border-blue-700 animate-glow-card custom-scrollbar" style={{zIndex:2}}>
                {Array.isArray(data.conversation) && data.conversation.length > 0 ? (
                  data.conversation.map((msg, i) => {
                    return (
                      <div key={i} className={"mb-3 flex " + (msg.speaker === "bot" ? "justify-start" : "justify-end")}> 
                        <div className={"max-w-[80%] px-4 py-2 rounded-2xl shadow-md " +
                          (msg.speaker === "bot" ? "bg-gradient-to-r from-blue-900/80 to-pink-900/40 border border-blue-700 text-neon-blue animate-glow-card" : "bg-gradient-to-r from-pink-900/80 to-blue-900/40 border border-pink-700 text-neon-pink animate-glow-card")
                        }>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={msg.speaker === "bot" ? "font-bold text-neon-blue" : "font-bold text-neon-pink"}>
                              {msg.speaker === "bot" ? "Steve" : "You"}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="whitespace-pre-line text-base">{msg.message.replace(/!!$/, "")}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-400">No conversation yet.</div>
                )}
                <div ref={messagesEndRef} />
              </div>
              {/* Chat input and refresh button */}
              <form onSubmit={handleSubmit} className="flex gap-2 items-center neon-border holo p-2 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card" style={{zIndex:2}}>
                <input
                  className="cyberpunk-input flex-1 bg-transparent border-none outline-none text-lg px-3 py-2 rounded-xl"
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                  autoFocus
                />
                <button
                  type="submit"
                  className="glitch-btn px-4 py-2"
                  disabled={sending || !input.trim()}
                >
                  {sending ? <span className="flicker">Sending...</span> : <span className="flicker">Send</span>}
                </button>
                <button
                  type="button"
                  className="glitch-btn px-4 py-2"
                  onClick={() => { fetchData(); }}
                  disabled={loading || sending}
                >
                  Refresh
                </button>
              </form>
            </>
          ) : null}
        </main>
      </div>
      <style jsx global>{`
        /* Custom thin/fancy scrollbar for chatbox */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #00f0ff 0%, #ff00de 100%);
          border-radius: 6px;
          min-height: 24px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #00f0ff #0000;
        }
        .animate-glow {
          box-shadow: 0 0 8px #00f0ff, 0 0 16px #ff00de44;
          animation: glowPulse 2.5s infinite alternate;
        }
        .animate-glow-card {
          box-shadow: 0 0 16px #00f0ff44, 0 0 32px #ff00de22;
          transition: box-shadow 0.3s;
        }
        .glitch-btn {
          background: linear-gradient(90deg, #00f0ff 0%, #ff00de 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-weight: bold;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .glitch-btn:after {
          content: '';
          position: absolute;
          left: 0; top: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, #ff00de44 0%, #00f0ff44 100%);
          opacity: 0.3;
          pointer-events: none;
        }
        .glitch-btn:hover {
          background: linear-gradient(90deg, #ff00de 0%, #00f0ff 100%);
          color: #0a001a;
        }
        .text-neon-blue { color: #00f0ff; }
        .text-neon-pink { color: #ff00de; }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 8px #00f0ff, 0 0 16px #ff00de44; }
          100% { box-shadow: 0 0 24px #ff00de, 0 0 48px #00f0ff44; }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
