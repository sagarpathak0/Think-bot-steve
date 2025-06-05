import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
    <nav className="w-full flex items-center justify-between px-6 py-3 neon-border-b holo shadow-lg" style={{background: "rgba(10,0,26,0.92)", zIndex: 20, position: 'fixed', top: 0, left: 0}}>
      <div className="flex items-center gap-4">
        <a href="/" className="text-xl font-bold glitch text-neon-pink">STEVE</a>
        <a href="/chat" className="nav-link">Chat</a>
        <a href="/stats" className="nav-link">Stats</a>
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <button onClick={handleLogout} className="glitch-btn px-3 py-1">Logout</button>
        ) : (
          <>
            <a href="/login" className="nav-link">Login</a>
            <a href="/signup" className="nav-link">Sign Up</a>
          </>
        )}
      </div>
    </nav>
  );
}
