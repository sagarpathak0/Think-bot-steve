

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import CyberpunkNavbar from "../components/CyberpunkNavbar";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- Sidebar Widgets (copied from dashboard) ---
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

const aiTips = [
  "Tip: Use the Download button to save your stats!",
  "News: Mood timeline now visualizes your day!",
  "Tip: Check your average mood for self-awareness.",
  "News: Stats page now cyberpunk themed!",
  "Tip: Stay positive and chat with Steve!",
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

type MoodPoint = {
  timestamp: string;
  speaker: string;
  mood: number;
  message?: string;
};

type Stats = {
  summary: string;
  mood_timeline: MoodPoint[];
  avg_mood: number;
  count: number;
};


export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    fetch(`${BASE_URL}/stats`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("jwt_token");
          router.replace("/login");
          return null;
        }
        return res.json();
      })
      .then((s) => {
        if (s) setStats(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  // Download stats as JSON
  const handleDownload = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stats_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Extra Stats Features ---
  let bestMsg: MoodPoint | null = null, worstMsg: MoodPoint | null = null, lastMsg: MoodPoint | null = null, moodBreakdown: {pos:number,neg:number,neu:number}|null = null;
  if (stats && Array.isArray(stats.mood_timeline) && stats.mood_timeline.length > 0) {
    let max = -2, min = 2, best: MoodPoint | null = null, worst: MoodPoint | null = null;
    let pos = 0, neg = 0, neu = 0;
    stats.mood_timeline.forEach((pt: MoodPoint) => {
      if (pt.mood > max) { max = pt.mood; best = pt; }
      if (pt.mood < min) { min = pt.mood; worst = pt; }
      if (pt.mood > 0.1) pos++; else if (pt.mood < -0.1) neg++; else neu++;
    });
    bestMsg = best;
    worstMsg = worst;
    lastMsg = stats.mood_timeline[stats.mood_timeline.length-1];
    moodBreakdown = { pos, neg, neu };
  }

  const handleRefresh = () => window.location.reload();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500" style={{background: "linear-gradient(135deg, #0a001a 60%, #1a0033 100%)", color: "#e0e0ff", fontFamily: "'Share Tech Mono', 'VT323', 'Fira Mono', monospace"}}>
      <CyberpunkNavbar />
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-4 md:px-6 mt-32 z-10">
        {/* Sidebar */}
        <aside className="flex-1 min-w-[260px] max-w-sm mx-auto md:mx-0 bg-opacity-80 rounded-2xl p-6 shadow-xl backdrop-blur-md border border-blue-900 flex flex-col gap-4 animate-glow-card" style={{background: "rgba(24,32,60,0.92)"}}>
          <UserProfileCard />
          <LiveClock />
          <SystemResourceMonitor />
          <AITipsWidget />
        </aside>
        {/* Main Content */}
        <main className="flex-1 min-w-[320px] max-w-2xl mx-auto md:mx-0 bg-opacity-80 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md border border-blue-900 flex flex-col gap-6 animate-glow-card" style={{background: "rgba(24,28,48,0.92)"}}>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-2">
            <h1 className="text-4xl font-bold glitch tracking-widest">Today&apos;s Stats</h1>
            <div className="flex gap-2">
              <button className="glitch-btn px-4 py-2 animate-glow-btn" onClick={handleRefresh}>Refresh</button>
              <button className="glitch-btn px-4 py-2 animate-glow-btn" onClick={handleDownload}>Download Stats</button>
            </div>
          </div>
          {loading && <div>Loading stats...</div>}
          {stats && (
            <>
              <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="text-left flex-1">
                  <div className="text-neon-blue text-lg font-mono mb-2"><strong>Summary:</strong> {stats.summary || "No summary yet."}</div>
                  <div className="mb-1"><strong>Mood:</strong> {typeof stats.avg_mood === 'number' ? (stats.avg_mood > 0.1 ? "😊" : stats.avg_mood < -0.1 ? "😞" : "😐") : "-"} ({typeof stats.avg_mood === 'number' ? stats.avg_mood.toFixed(2) : "-"})</div>
                  <div className="mb-1"><strong>Messages Today:</strong> {typeof stats.count === 'number' ? stats.count : "-"}</div>
                  {moodBreakdown && (
                    <div className="mb-1 text-sm">
                      <span className="text-neon-blue">Positive: {moodBreakdown.pos}</span>{' | '}
                      <span className="text-neon-pink">Negative: {moodBreakdown.neg}</span>{' | '}
                      <span className="text-gray-300">Neutral: {moodBreakdown.neu}</span>
                    </div>
                  )}
                  {lastMsg && (
                    <div className="mb-1 text-xs text-gray-400">Last message: <span className="text-neon-blue">{lastMsg.speaker}</span> at {new Date(lastMsg.timestamp).toLocaleTimeString()}</div>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <div className="font-bold text-neon-pink mb-2">Mood Timeline</div>
                <div style={{display:'flex',gap:4,alignItems:'center',flexWrap:'wrap',marginTop:4}}>
                  {Array.isArray(stats.mood_timeline) && stats.mood_timeline.length === 0 && <span>No messages today.</span>}
                  {Array.isArray(stats.mood_timeline) && stats.mood_timeline.map((pt, i) => (
                    <span key={i} title={pt.speaker+': '+pt.timestamp}
                      style={{
                        display:'inline-block',
                        width:18,
                        height:18,
                        borderRadius:9,
                        background: pt.mood > 0.1 ? '#00ff99' : pt.mood < -0.1 ? '#ff0066' : '#8888ff',
                        opacity:0.85,
                        border:'1.5px solid #222',
                        marginRight:2
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Best Message Card */}
                <div className="flex flex-col p-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card">
                  <div className="font-bold text-neon-blue mb-1">Best Message</div>
                  {bestMsg && typeof bestMsg === 'object' ? (
                    <>
                      <div className="text-sm text-gray-200 mb-1">{(bestMsg as MoodPoint).speaker} ({new Date((bestMsg as MoodPoint).timestamp).toLocaleTimeString()}): <span className="text-neon-blue">{(bestMsg as MoodPoint).mood > 0.1 ? 'Positive' : 'Neutral'}</span></div>
                      {(bestMsg as MoodPoint).message && (
                        <div className="text-base text-gray-100 italic border-l-4 border-neon-blue pl-3 mt-1">&quot;{(bestMsg as MoodPoint).message}&quot;</div>
                      )}
                    </>
                  ) : <div className="text-xs text-gray-400">No data</div>}
                </div>
                {/* Worst Message Card */}
                <div className="flex flex-col p-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card">
                  <div className="font-bold text-neon-pink mb-1">Worst Message</div>
                  {worstMsg && typeof worstMsg === 'object' ? (
                    <>
                      <div className="text-sm text-gray-200 mb-1">{(worstMsg as MoodPoint).speaker} ({new Date((worstMsg as MoodPoint).timestamp).toLocaleTimeString()}): <span className="text-neon-pink">{(worstMsg as MoodPoint).mood < -0.1 ? 'Negative' : 'Neutral'}</span></div>
                      {(worstMsg as MoodPoint).message && (
                        <div className="text-base text-gray-100 italic border-l-4 border-neon-pink pl-3 mt-1">&quot;{(worstMsg as MoodPoint).message}&quot;</div>
                      )}
                    </>
                  ) : <div className="text-xs text-gray-400">No data</div>}
                </div>
                {/* Last Message Card */}
                <div className="flex flex-col p-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card col-span-1 md:col-span-2">
                  <div className="font-bold text-neon-blue mb-1">Last Message</div>
                  {lastMsg && typeof lastMsg === 'object' ? (
                    <>
                      <div className="text-sm text-gray-200 mb-1">{(lastMsg as MoodPoint).speaker} ({new Date((lastMsg as MoodPoint).timestamp).toLocaleTimeString()}): <span className="text-neon-blue">{(lastMsg as MoodPoint).mood > 0.1 ? 'Positive' : (lastMsg as MoodPoint).mood < -0.1 ? 'Negative' : 'Neutral'}</span></div>
                      {(lastMsg as MoodPoint).message && (
                        <div className="text-base text-gray-100 italic border-l-4 border-neon-blue pl-3 mt-1">&quot;{(lastMsg as MoodPoint).message}&quot;</div>
                      )}
                    </>
                  ) : <div className="text-xs text-gray-400">No data</div>}
                </div>
                {/* Mood Breakdown Card */}
                <div className="flex flex-col p-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card col-span-1 md:col-span-2">
                  <div className="font-bold text-neon-pink mb-1">Mood Breakdown</div>
                  {moodBreakdown ? (
                    <div className="flex gap-6 text-lg">
                      <span className="text-neon-blue">😊 Positive: {moodBreakdown.pos}</span>
                      <span className="text-neon-pink">😞 Negative: {moodBreakdown.neg}</span>
                      <span className="text-gray-300">😐 Neutral: {moodBreakdown.neu}</span>
                    </div>
                  ) : <div className="text-xs text-gray-400">No data</div>}
                </div>
              </div>
            </>
          )}
          <Link href="/" className="glitch-btn text-lg px-6 py-2 mt-8 inline-block">Back to Home</Link>
        </main>
      </div>
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
        .bg-neon-blue { background: #00f0ff; }
        .text-neon-blue { color: #00f0ff; }
        .bg-neon-pink { background: #ff00de; }
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
        .glitch-btn:hover {
          background: linear-gradient(90deg, #ff00de 0%, #00f0ff 100%);
          color: #0a001a;
        }
        .glitch {
          text-shadow: 0 0 2px #00f0ff, 0 0 8px #ff00de, 0 0 16px #00f0ff;
          position: relative;
        }
      `}</style>
    </div>
  );
}
