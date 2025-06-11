import SummaryCard from "../components/SummaryCard";
// User Profile Card
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

// Live Digital Clock (client-only to avoid hydration mismatch)
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

// System Resource Monitor (fetches real data from backend)
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
      } catch {
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

// AI Tips/News Widget
const aiTips = [
  "Tip: Use the Quick Actions to clear memory or export your chat!",
  "News: New cyberpunk skin available soon!",
  "Tip: Try manual robot control for direct movement.",
  "News: System resource monitor now live!",
  "Tip: Toggle theme for a new look!",
];
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

// Quick Command Bar
function QuickCommandBar() {
  const [cmd, setCmd] = useState("");
  const [resp, setResp] = useState<string|null>(null);
  const sendCmd = () => {
    if (!cmd.trim()) return;
    setResp("Sending...");
    setTimeout(() => setResp("Command sent: " + cmd), 800); // Demo only
    setCmd("");
  };
  return (
    <div className="w-full mt-4 flex flex-col gap-2">
      <div className="flex gap-2">
        <input value={cmd} onChange={e=>setCmd(e.target.value)} placeholder="Type command..." className="flex-1 px-3 py-2 rounded bg-gray-900 text-neon-blue border border-neon-blue focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono" />
        <button className="glitch-btn px-4 py-2 animate-glow-btn" onClick={sendCmd}>Send</button>
      </div>
      {resp && <div className="text-xs text-neon-pink font-mono">{resp}</div>}
    </div>
  );
}

import { useEffect, useState } from "react";
import CyberpunkNavbar from "../components/CyberpunkNavbar";
import Link from "next/link";


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Live System Status Widget
function LiveStatusWidget({ status }: { status: string }) {
  // Color: green for online, yellow for warning, red for offline
  let color = "bg-neon-green";
  let text = "Online";
  if (status === "warning") { color = "bg-yellow-400 animate-pulse"; text = "Warning"; }
  if (status === "offline") { color = "bg-neon-pink animate-pulse"; text = "Offline"; }
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className={`inline-block w-3 h-3 rounded-full shadow-lg ${color}`}></span>
      <span className="font-mono text-base tracking-wide text-neon-blue">System Status: <span className="font-bold">{text}</span></span>
    </div>
  );
}

// Quick Actions Widget
interface QuickActionsProps {
  onClearMemory: () => void;
  onExportChat: () => void;
  onToggleTheme: () => void;
}
function QuickActions({ onClearMemory, onExportChat, onToggleTheme }: QuickActionsProps) {
  return (
    <div className="flex flex-col gap-2 mt-4">
      <button className="glitch-btn px-4 py-2 text-sm" onClick={onClearMemory}>Clear Memory</button>
      <button className="glitch-btn px-4 py-2 text-sm" onClick={onExportChat}>Export Chat</button>
      <button className="glitch-btn px-4 py-2 text-sm" onClick={onToggleTheme}>Toggle Theme</button>
    </div>
  );
}

// ManualControlPanel component for robot control
function ManualControlPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const sendControl = async (direction: string) => {
    setStatus("Sending...");
    const token = localStorage.getItem("jwt_token");
    try {
      const res = await fetch(`${BASE_URL}/control`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action: "move", direction })
      });
      const data = await res.json();
      setStatus(data.success ? `Moved: ${direction}` : data.error || "Failed");
    } catch {
      setStatus("Failed to send command");
    }
  };
  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <div className="flex justify-center">
        <button className="glitch-btn px-6 py-2 mx-1 text-xl" onClick={() => sendControl("forward")}>↑</button>
      </div>
      <div className="flex justify-center mt-1">
        <button className="glitch-btn px-6 py-2 mx-1 text-xl" onClick={() => sendControl("left")}>←</button>
        <button className="glitch-btn px-6 py-2 mx-1 text-xl" onClick={() => sendControl("stop")}>■</button>
        <button className="glitch-btn px-6 py-2 mx-1 text-xl" onClick={() => sendControl("right")}>→</button>
      </div>
      <div className="flex justify-center mt-1">
        <button className="glitch-btn px-6 py-2 mx-1 text-xl" onClick={() => sendControl("backward")}>↓</button>
      </div>
      {status && <div className="mt-3 text-blue-400 font-semibold text-lg">{status}</div>}
    </div>
  );
}


export default function Dashboard() {
  // --- Types for dashboard state ---
  interface Stats {
    avg_mood?: number;
    count?: number;
    summary?: string;
  }
  interface ConversationMessage {
    speaker: 'user' | 'bot';
    message: string;
  }
  interface Memory {
    conversation: ConversationMessage[];
    objects: Record<string, unknown[]>;
  }
  const [stats, setStats] = useState<Stats | null>(null);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'cyberpunk' | 'dark'>("cyberpunk");
  const [systemStatus, setSystemStatus] = useState<'online' | 'warning' | 'offline'>("online");
  const [username, setUsername] = useState<string>("");

  // Fetch username for personalized welcome and summary context
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) return;
    fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.username) setUsername(data.username);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    Promise.all([
      fetch(`${BASE_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${BASE_URL}/memory`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([statsData, memoryData]) => {
      setStats(statsData);
      setMemory(memoryData);
      setLoading(false);
      // Simulate system status for demo: warning if no objects, offline if error
      if (memoryData && memoryData.objects && Object.keys(memoryData.objects).length === 0) setSystemStatus("warning");
      else setSystemStatus("online");
    }).catch(() => {
      setError("Could not load dashboard data.");
      setLoading(false);
      setSystemStatus("offline");
    });
  }, []);

  // Quick Actions handlers
  const handleClearMemory = () => {
    // You can implement API call here
    alert("Memory cleared! (Demo)");
  };
  const handleExportChat = () => {
    if (!memory || !memory.conversation) return;
    const text = memory.conversation.map((msg: ConversationMessage) => `${msg.speaker === 'bot' ? 'Steve' : 'You'}: ${msg.message}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_export_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleToggleTheme = () => {
    setTheme(theme === "cyberpunk" ? "dark" : "cyberpunk");
    document.body.classList.toggle("dark", theme === "cyberpunk");
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-black text-gray-200' : ''}`}
      style={{
        background: theme === 'cyberpunk'
          ? "linear-gradient(135deg, #0a001a 60%, #1a0033 100%)"
          : "linear-gradient(135deg, #000 60%, #222 100%)",
        color: theme === 'cyberpunk' ? "#e0e0ff" : undefined,
        fontFamily: "\'Share Tech Mono\', \'VT323\', \'Fira Mono\', monospace"
      }}>
      {/* Animated SVG background for cyberpunk effect */}
      {theme === 'cyberpunk' && (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{opacity:0.13}} viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="1440" height="900" fill="url(#bg-circuit)" />
          <defs>
            <linearGradient id="bg-circuit" x1="0" y1="0" x2="1440" y2="900" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00f0ff" />
              <stop offset="1" stopColor="#ff00de" />
            </linearGradient>
          </defs>
          <g>
            <rect x="100" y="100" width="1240" height="700" rx="40" stroke="#00f0ff" strokeWidth="2" opacity="0.2" />
            <rect x="200" y="200" width="1040" height="500" rx="30" stroke="#ff00de" strokeWidth="2" opacity="0.15" />
            <line x1="0" y1="450" x2="1440" y2="450" stroke="#00f0ff" strokeWidth="1" opacity="0.08" />
            <line x1="720" y1="0" x2="720" y2="900" stroke="#ff00de" strokeWidth="1" opacity="0.08" />
          </g>
        </svg>
      )}
      <CyberpunkNavbar />
      {/* Header Section */}
      <div className="w-full max-w-7xl mx-auto mt-30 px-6 flex flex-row items-center gap-6 z-10 ">
        <div className="flex items-center gap-4 flex-1">
          <div className="rounded-full bg-gradient-to-br from-blue-700 to-pink-600 p-1 shadow-lg animate-glow">
            <div className="bg-black rounded-full p-2 border-4 border-neon-blue animate-glow">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#0a001a"/><path d="M16 32v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="20" cy="20" r="2.5" fill="#ff00de"/><circle cx="24" cy="20" r="2.5" fill="#00f0ff"/><circle cx="28" cy="20" r="2.5" fill="#ff00de"/></svg>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-widest glitch mb-1 ">STEVE <span className="flicker" style={{color:'var(--neon-pink)'}}>Think-Bot</span></h1>
            <div className="text-neon-blue text-lg ">Cyberpunk AI Assistant Dashboard</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-neon-pink font-mono text-lg ">{new Date().toLocaleDateString()}</div>
          <div className="text-neon-blue font-mono text-base">{stats ? `Mood: ${typeof stats.avg_mood === 'number' ? stats.avg_mood.toFixed(2) : '-'}` : ''}</div>
        </div>
      </div>

      {/* Main Content + Sidebar Layout */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-4 md:px-6 mt-8 z-10">
        {/* Main Content: Chat & Stats */}
        <main className="flex-1 min-w-[320px] max-w-3xl mx-auto md:mx-0 bg-opacity-80 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md border border-blue-900 flex flex-col gap-6 animate-glow-card" style={{background: theme === 'cyberpunk' ? "rgba(24,28,48,0.92)" : "rgba(20,20,20,0.92)"}}>
          <AITipsWidget />
          <section>
            <h2 className="text-2xl font-bold mb-2">{username ? `Welcome, ${username}!` : "Welcome!"}</h2>
            <SummaryCard summary={stats?.summary ? `${username ? `[User: ${username}]\n` : ''}${stats.summary}` : "No summary yet."} className="mb-2" />
            <div className="mb-2"><strong>Mood:</strong> {typeof stats?.avg_mood === 'number' ? (stats.avg_mood > 0.1 ? "😊" : stats.avg_mood < -0.1 ? "😞" : "😐") : "-"} ({typeof stats?.avg_mood === 'number' ? stats.avg_mood.toFixed(2) : "-"})</div>
            <div className="mb-2"><strong>Messages Today:</strong> {typeof stats?.count === 'number' ? stats.count : "-"}</div>
            <div className="flex flex-col gap-2 mt-4">
              <Link href="/chat" className="glitch-btn text-xl px-8 py-4 animate-glow-btn">Start Chat</Link>
              <Link href="/stats" className="glitch-btn text-lg px-6 py-2 animate-glow-btn">Today&apos;s Stats</Link>
              <Link href="/" className="glitch-btn text-lg px-6 py-2 animate-glow-btn">Home</Link>
            </div>
            <QuickCommandBar />
          </section>
          <section className="mt-8">
            <h2 className="text-xl font-bold mb-2">Recent Conversation</h2>
            <div className="cyberpunk-chatlog neon-border holo shadow-lg relative animate-glow-card" style={{zIndex:2, maxHeight:260, overflowY:'auto', background: theme === 'cyberpunk' ? 'rgba(20,24,40,0.7)' : 'rgba(30,30,30,0.7)', borderRadius: 12}}>
              {memory && memory.conversation && memory.conversation.length > 0 ? (
                memory.conversation.slice(-7).map((msg: ConversationMessage, i: number) => (
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
            </div>
          </section>
        </main>
        {/* Sidebar: System Status, Objects, Quick Actions, Robot Control */}
        <aside className="flex-1 min-w-[260px] max-w-sm mx-auto md:mx-0 bg-opacity-80 rounded-2xl p-6 shadow-xl backdrop-blur-md border border-blue-900 flex flex-col gap-4 animate-glow-card" style={{background: theme === 'cyberpunk' ? "rgba(24,32,60,0.92)" : "rgba(30,30,40,0.92)"}}>
          <UserProfileCard />
          <LiveClock />
          <SystemResourceMonitor />
          <LiveStatusWidget status={systemStatus} />
          <section>
            <h2 className="text-xl font-bold mb-2">Objects Detected</h2>
            <ul className="cyberpunk-section-text mb-4">
              {memory && memory.objects && Object.entries(memory.objects).length > 0 ? (
                Object.entries(memory.objects).map(([obj, arr]: [string, unknown[]]) => (
                  <li key={obj} className="flex items-center gap-2">
                    <span className="font-semibold text-blue-700 dark:text-blue-300">{obj}</span>
                    <svg width="16" height="16" className="inline-block" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#00f0ff" strokeWidth="2" fill="none"/></svg>
                    <span className="text-gray-700 dark:text-gray-300">{arr.length}x</span>
                  </li>
                ))
              ) : (
                <li>No objects detected yet.</li>
              )}
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
            <QuickActions onClearMemory={handleClearMemory} onExportChat={handleExportChat} onToggleTheme={handleToggleTheme} />
          </section>
          <section>
            <h2 className="text-xl font-bold mb-2">Manual Robot Control</h2>
            <ManualControlPanel />
          </section>
        </aside>
      </div>
      {loading && <div className="absolute top-24 left-1/2 -translate-x-1/2 text-lg text-blue-300 z-50">Loading dashboard...</div>}
      {error && <div className="absolute top-28 left-1/2 -translate-x-1/2 text-lg text-red-400 z-50">{error}</div>}
      {/* Extra: Add some global styles for neon glows and glitch */}
      <style jsx global>{`
        .animate-glow {
          box-shadow: 0 0 8px #00f0ff, 0 0 16px #ff00de44;
          animation: glowPulse 2.5s infinite alternate;
        }
        .animate-glow-card {
          box-shadow: 0 0 16px #00f0ff44, 0 0 32px #ff00de22;
          transition: box-shadow 0.3s;
        }
        .animate-glow-btn {
          box-shadow: 0 0 8px #00f0ff, 0 0 16px #ff00de44;
          transition: box-shadow 0.2s;
        }
        .animate-glow-btn:hover {
          box-shadow: 0 0 16px #ff00de, 0 0 32px #00f0ff;
        }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 8px #00f0ff, 0 0 16px #ff00de44; }
          100% { box-shadow: 0 0 24px #ff00de, 0 0 48px #00f0ff44; }
        }
        .bg-neon-green { background: #00ffb3; }
        .bg-neon-pink { background: #ff00de; }
        .border-neon-blue { border-color: #00f0ff; }
        .text-neon-blue { color: #00f0ff; }
        .text-neon-pink { color: #ff00de; }
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
          /* Add neon blue background utility for RAM bar */
        .bg-neon-blue { background: #00f0ff; }
        .glitch-btn:hover {
          background: linear-gradient(90deg, #ff00de 0%, #00f0ff 100%);
          color: #0a001a;
        }
        .glitch {
          text-shadow: 0 0 2px #00f0ff, 0 0 8px #ff00de, 0 0 16px #00f0ff;
          position: relative;
        }
        .flicker {
          animation: flicker 2.5s infinite alternate;
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          45% { opacity: 0.7; }
          50% { opacity: 0.3; }
          55% { opacity: 0.7; }
        }
        .cyberpunk-chatlog {
          font-family: 'Fira Mono', 'Share Tech Mono', monospace;
          font-size: 1rem;
        }
        .neon-border {
          border: 2px solid #00f0ff;
          box-shadow: 0 0 8px #00f0ff, 0 0 16px #ff00de44;
        }
        .holo {
          background: linear-gradient(120deg, #00f0ff11 0%, #ff00de11 100%);
        }
        @media (max-width: 900px) {
          .flex-row { flex-direction: column !important; }
          .max-w-7xl { max-width: 100vw !important; }
        }
      `}</style>
    </div>
  );
}
