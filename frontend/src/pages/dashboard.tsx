import { useEffect, useState } from "react";
import CyberpunkNavbar from "../components/CyberpunkNavbar";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


// ManualControlPanel component for robot control
function ManualControlPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
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
    } catch (e) {
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
  const [stats, setStats] = useState<any>(null);
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    }).catch(() => {
      setError("Could not load dashboard data.");
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{background: "linear-gradient(135deg, #0a001a 60%, #1a0033 100%)", color: "#e0e0ff", fontFamily: "'Share Tech Mono', 'VT323', 'Fira Mono', monospace"}}>
      <CyberpunkNavbar />
      <div className="flex flex-1 flex-row w-full max-w-7xl mx-auto mt-32 gap-6 px-6">
        {/* Left Section: Welcome & Stats */}
        <div className="flex-1 bg-opacity-80 rounded-2xl p-6 shadow-xl backdrop-blur-md border border-blue-900" style={{minWidth: 280, background: "rgba(20,30,60,0.85)"}}>
          <h2 className="text-2xl font-bold mb-4">Welcome{memory && memory.conversation && memory.conversation.length > 0 ? `, ${memory.conversation[memory.conversation.length-1].speaker === 'user' ? 'User' : 'Steve'}` : ''}!</h2>
          <div className="mb-3">
            <strong>Today's Summary:</strong> {stats?.summary || "No summary yet."}
          </div>
          <div className="mb-3">
            <strong>Mood:</strong> {typeof stats?.avg_mood === 'number' ? (stats.avg_mood > 0.1 ? "😊" : stats.avg_mood < -0.1 ? "😞" : "😐") : "-"} ({typeof stats?.avg_mood === 'number' ? stats.avg_mood.toFixed(2) : "-"})
          </div>
          <div className="mb-3">
            <strong>Messages Today:</strong> {typeof stats?.count === 'number' ? stats.count : "-"}
          </div>
          <div className="flex flex-col gap-2 mt-8">
            <Link href="/chat" className="glitch-btn text-xl px-8 py-4">Start Chat</Link>
            <Link href="/stats" className="glitch-btn text-lg px-6 py-2">Today's Stats</Link>
            <Link href="/" className="glitch-btn text-lg px-6 py-2">Home</Link>
          </div>
        </div>
        {/* Center Section: Recent Conversation */}
        <div className="flex-1 bg-opacity-80 rounded-2xl p-6 shadow-xl backdrop-blur-md border border-blue-900" style={{minWidth: 320, background: "rgba(24,28,48,0.85)"}}>
          <h2 className="text-xl font-bold mb-4">Recent Conversation</h2>
          <div className="cyberpunk-chatlog neon-border holo shadow-lg relative" style={{zIndex:2, maxHeight:220, overflowY:'auto', background: 'rgba(20,24,40,0.7)', borderRadius: 12}}>
            {memory && memory.conversation && memory.conversation.length > 0 ? (
              memory.conversation.slice(-5).map((msg: any, i: number) => (
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
        </div>
        {/* Right Section: Objects & Robot Control */}
        <div className="flex-1 bg-opacity-80 rounded-2xl p-6 shadow-xl backdrop-blur-md border border-blue-900" style={{minWidth: 320, background: "rgba(24,32,60,0.85)"}}>
          <h2 className="text-xl font-bold mb-4">Objects Detected</h2>
          <ul className="cyberpunk-section-text mb-6">
            {memory && memory.objects && Object.entries(memory.objects).length > 0 ? (
              Object.entries(memory.objects).map(([obj, arr]: any) => (
                <li key={obj}>
                  <span className="font-semibold text-blue-700 dark:text-blue-300">{obj}</span>
                  {": "}
                  <span className="text-gray-700 dark:text-gray-300">{arr.length} time(s)</span>
                </li>
              ))
            ) : (
              <li>No objects detected yet.</li>
            )}
          </ul>
          <h2 className="text-xl font-bold mb-2">Manual Robot Control</h2>
          <ManualControlPanel />
        </div>
      </div>
      {loading && <div className="absolute top-24 left-1/2 -translate-x-1/2 text-lg text-blue-300">Loading dashboard...</div>}
      {error && <div className="absolute top-28 left-1/2 -translate-x-1/2 text-lg text-red-400">{error}</div>}
    </div>
  );
}
