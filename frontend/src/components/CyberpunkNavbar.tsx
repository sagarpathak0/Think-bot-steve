
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CyberpunkNavbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem("jwt_token"));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-3 neon-border-b holo shadow-2xl"
      style={{
        background: "linear-gradient(90deg, #0a001a 60%, #1a0033 100%)",
        zIndex: 30,
        position: 'fixed',
        top: 0,
        left: 0,
        boxShadow: '0 0 24px #00f0ff, 0 0 48px #ff00de44',
        borderBottom: '2.5px solid #00f0ff',
        minHeight: 64,
      }}>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-2xl font-extrabold glitch text-neon-blue tracking-widest flex items-center gap-2">
          <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-pink-500 flex items-center justify-center border-2 border-neon-blue shadow-lg mr-2">
            <span className="bg-black rounded-full p-1.5 border-4 border-neon-blue flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" fill="#0a001a"/>
                <path d="M10 22v-1a4 4 0 014-4h4a4 4 0 014 4v1" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="16" cy="14" r="3" fill="#ff00de"/>
              </svg>
            </span>
          </span>
          STEVE <span className="text-neon-pink flicker">Think-Bot</span>
        </Link>
        <div className="hidden md:flex items-center gap-4 text-base font-mono">
          {isLoggedIn && <Link href="/dashboard" className="nav-link text-neon-blue hover:text-neon-pink transition">Dashboard</Link>}
          <Link href="/chat" className="nav-link text-neon-blue hover:text-neon-pink transition">Chat</Link>
          <Link href="/stats" className="nav-link text-neon-blue hover:text-neon-pink transition">Stats</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <button onClick={handleLogout} className="glitch-btn px-4 py-2 text-base animate-glow-btn">Logout</button>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="glitch-btn px-4 py-2 text-base animate-glow-btn">Login</Link>
            <Link href="/signup" className="glitch-btn px-4 py-2 text-base animate-glow-btn">Sign Up</Link>
          </div>
        )}
      </div>
      <style jsx>{`
        .neon-border-b {
          border-bottom: 2.5px solid #00f0ff;
        }
        .nav-link {
          position: relative;
          padding: 0 0.5rem;
          text-decoration: none;
          transition: color 0.18s;
        }
        .nav-link:after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -2px;
          height: 2px;
          background: linear-gradient(90deg, #00f0ff 0%, #ff00de 100%);
          opacity: 0;
          transition: opacity 0.18s;
        }
        .nav-link:hover:after {
          opacity: 1;
        }
      `}</style>
    </nav>
  );
}
