
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import CyberpunkNavbar from "../components/CyberpunkNavbar";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type MoodPoint = {
  timestamp: string;
  speaker: string;
  mood: number;
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
    fetch({BASE_URL} + "/stats", {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{background: "linear-gradient(135deg, #0a001a 60%, #1a0033 100%)", color: "#e0e0ff", fontFamily: "'Share Tech Mono', 'VT323', 'Fira Mono', monospace"}}>
      <CyberpunkNavbar />
      <div className="max-w-2xl mx-auto p-8 neon-border holo shadow-lg relative z-10 rounded-2xl text-center" style={{marginTop: '6rem'}}>
        <h1 className="text-4xl font-bold glitch mb-4 tracking-widest">Today's Stats</h1>
        {loading && <div>Loading stats...</div>}
        {stats ? (
          <>
            <div className="cyberpunk-section-text mb-2">
              <strong>Daily Summary:</strong> {stats.summary || "No summary yet."}
            </div>
            <div className="cyberpunk-section-text mb-2">
              <strong>Average Mood:</strong> {typeof stats.avg_mood === 'number' ? (stats.avg_mood > 0.1 ? "😊" : stats.avg_mood < -0.1 ? "😞" : "😐") : "-"} ({typeof stats.avg_mood === 'number' ? stats.avg_mood.toFixed(2) : "-"})
            </div>
            <div className="cyberpunk-section-text mb-2">
              <strong>Messages Today:</strong> {typeof stats.count === 'number' ? stats.count : "-"}
            </div>
            <div className="cyberpunk-section-text">
              <strong>Mood Timeline:</strong>
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
          </>
        ) : null}
        <Link href="/" className="glitch-btn text-lg px-6 py-2 mt-8 inline-block">Back to Home</Link>
      </div>
    </div>
  );
}
