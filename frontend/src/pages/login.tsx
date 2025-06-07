
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import CyberpunkNavbar from "../components/CyberpunkNavbar";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("jwt_token", data.token);
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{background: "linear-gradient(135deg, #0a001a 60%, #1a0033 100%)", color: "#e0e0ff", fontFamily: "\'Share Tech Mono\', \'VT323\', \'Fira Mono\', monospace"}}>
      <CyberpunkNavbar />
      <div className="max-w-md mx-auto p-8 neon-border holo shadow-lg relative z-10 rounded-2xl text-center" style={{marginTop: '6rem'}}>
        <h1 className="text-4xl font-bold glitch mb-6 tracking-widest">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="cyberpunk-input px-4 py-2 rounded"
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            required
          />
          <input
            className="cyberpunk-input px-4 py-2 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="glitch-btn text-lg px-6 py-2">Login</button>
        </form>
        {error && <div className="text-red-500 mt-4">{error}</div>}
        <div className="mt-4">
          Don&apos;t have an account? <Link href="/signup" className="text-neon-blue underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
