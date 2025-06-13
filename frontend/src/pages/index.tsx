import Link from "next/link";
import { DemoHeroGeometric } from "@/components/DemoHeroGeometric";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a001a 60%, #1a0033 100%)",
        color: "#e0e0ff",
        fontFamily: "'Share Tech Mono', 'VT323', 'Fira Mono', monospace",
      }}
    >
      {/* <CyberpunkNavbar /> */}
      {/* New Hero Section */}
      <DemoHeroGeometric />
      {/* Existing homepage content below */}
      <div className="hud-lines" />
      {/* <div className="max-w-2xl mx-auto p-8 neon-border holo shadow-lg relative z-10 rounded-2xl text-center" style={{marginTop: '6rem'}}>
        <h1 className="text-5xl font-bold glitch mb-4 tracking-widest">STEVE <span className="flicker" style={{color:'var(--neon-pink)'}}>Think-Bot</span> <span className="flicker" style={{color:'var(--neon-blue)'}}>AI</span></h1>
        <p className="text-xl mb-6 text-neon-blue">Your modular cyberpunk AI assistant</p>
        <ul className="text-lg mb-8 text-left mx-auto max-w-xl cyberpunk-section-text" style={{color:'#b0eaff'}}>
          <li>🤖 Modular AI core with persistent memory</li>
          <li>🧠 Real-time chat, summary, and object detection</li>
          <li>🌆 Futuristic cyberpunk UI with neon, glitch, and HUD effects</li>
          <li>🔒 Privacy-first: No data leaves your device</li>
        </ul>
        <p className="mb-8 text-base text-neon-pink">Steve (aka Gemini) is always curious, friendly, and ready to help you explore, create, and discover.</p>
        <div className="flex flex-col gap-4 items-center justify-center mt-6">
          <Link href="/chat" className="glitch-btn text-xl px-8 py-4">
            Start Chat
          </Link>
          <Link href="/stats" className="glitch-btn text-lg px-6 py-2">
            Today&apos;s Stats
          </Link>
        </div>
      </div> */}
      {/* Floating chat icon */}
      <Link
        href="/chat"
        className="fixed bottom-8 right-8 z-50 flex items-center justify-center bg-[var(--neon-blue)] rounded-full p-4 shadow-lg hover:bg-[var(--neon-pink)] transition-all duration-200"
        style={{boxShadow:'0 0 24px var(--neon-blue), 0 0 48px var(--neon-pink)'}}
        aria-label="Open Chat"
      >
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="19" cy="19" r="19" fill="#0a001a"/>
          <path d="M12 25v-2a2 2 0 012-2h10a2 2 0 012 2v2" stroke="#00f0ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="15" cy="16" r="1.5" fill="#ff00de"/>
          <circle cx="19" cy="16" r="1.5" fill="#00f0ff"/>
          <circle cx="23" cy="16" r="1.5" fill="#ff00de"/>
        </svg>
      </Link>
    </div>
  );
}
