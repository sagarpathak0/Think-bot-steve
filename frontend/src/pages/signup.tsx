
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import CyberpunkNavbar from "../components/CyberpunkNavbar";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SignupPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        router.replace('/chat');
      }
    }
  }, []);
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: username/pass
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  // (router already declared above)

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/send_otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep(2);
        setInfo("OTP sent to your email.");
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/verify_otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep(3);
        setInfo("OTP verified. Set your username and password.");
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  // Step 3: Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 1200);
      } else {
        setError(data.error || "Signup failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden cyberpunk-bg text-foreground" style={{fontFamily: "\'Share Tech Mono\', \'VT323\', \'Fira Mono\', monospace"}}>
      <CyberpunkNavbar />
      <div className="hud-lines" />
      <div className="max-w-md mx-auto p-8 neon-border holo shadow-lg relative z-10 rounded-2xl text-center" style={{marginTop: '6rem'}}>
        <h1 className="text-4xl font-bold glitch mb-6 tracking-widest">Sign Up</h1>
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <input
              className="cyberpunk-input px-4 py-2 rounded"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" className="glitch-btn text-lg px-6 py-2" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <input
              className="cyberpunk-input px-4 py-2 rounded"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" className="glitch-btn text-lg px-6 py-2" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</button>
            <button type="button" className="text-neon-blue underline mt-2" onClick={handleSendOtp} disabled={loading}>Resend OTP</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
            <button type="submit" className="glitch-btn text-lg px-6 py-2" disabled={loading}>{loading ? "Registering..." : "Sign Up"}</button>
          </form>
        )}
        {info && <div className="text-cyan-400 mt-4">{info}</div>}
        {success && <div className="text-green-400 mt-4">Signup successful! Redirecting...</div>}
        {error && <div className="text-red-500 mt-4">{error}</div>}
        <div className="mt-4">
          Already have an account? <Link href="/login" className="text-neon-blue underline">Login</Link>
        </div>
      </div>
    </div>
  );
}
