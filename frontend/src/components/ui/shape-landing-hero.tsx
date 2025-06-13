"use client";

import React from "react";
import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { NavbarDemo } from "../NavbarDemo";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

interface HeroGeometricProps {
  badge?: string;
  title1?: string;
  title2?: string;
}

function HeroGeometric({
  badge = "Design Collective",
  title1 = "Elevate Your Digital Vision",
  title2 = "Crafting Exceptional Websites",
}: HeroGeometricProps) {
  // --- User Auth State for GIF/Dropdown ---

  // --- User Auth State for GIF/Dropdown ---
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem("jwt_token"));
    }
  }, []);

  // Example GIFs (replace with your own or randomize as needed)
  const gifList = [
    "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
    "https://media.giphy.com/media/26ufnwz3wDUli7GU0/giphy.gif"
  ];
  const [gifUrl] = React.useState(() => gifList[Math.floor(Math.random() * gifList.length)]);

  // Handle login/logout
  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    setIsLoggedIn(false);
    setDropdownOpen(false);
    window.location.reload();
  };
  const handleLogin = () => {
    window.location.href = "/login";
  };
  // Framer Motion's Variants type does not accept a function for a variant value.
  // Use a static variants object and pass custom delays via the transition prop on each motion.div.
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (

    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
      {/* Top-left Home Link (restored) */}
      <div className="absolute top-6 left-6 z-30">
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
      </div>

      {/* Aceternity-style Centered Navbar */}
      <nav className="absolute top-7 left-1/2 z-30 -translate-x-1/2 flex items-center justify-center w-full pointer-events-none select-none">
        <div className="backdrop-blur-md bg-gradient-to-r from-indigo-900/60 via-black/60 to-rose-900/60 border border-white/10 rounded-2xl shadow-xl px-8 py-2 flex items-center gap-8 pointer-events-auto animate-glow-card">
          <Link href="/dashboard" className="relative group text-lg md:text-xl font-bold tracking-wide px-4 py-1 text-white transition-all duration-200 hover:text-blue-500 focus:text-blue-400">
            <span className="bg-gradient-to-r from-neon-blue/30 to-transparent absolute left-0 top-1/2 -translate-y-1/2 w-full h-2 rounded-full opacity-0 group-hover:opacity-80 blur-md transition-all duration-200 -z-10" />
            Dashboard
          </Link>
          <Link href="/chat" className="relative group text-lg md:text-xl font-bold tracking-wide px-4 py-1 text-white transition-all duration-200 hover:text-pink-500 focus:text-pink-400">
            <span className="bg-gradient-to-r from-neon-pink/30 to-transparent absolute left-0 top-1/2 -translate-y-1/2 w-full h-2 rounded-full opacity-0 group-hover:opacity-80 blur-md transition-all duration-200 -z-10" />
            Chat
          </Link>
          <Link href="/stats" className="relative group text-lg md:text-xl font-bold tracking-wide px-4 py-1 text-white transition-all duration-200 hover:text-red-800 focus:text-red-800">
            <span className="bg-gradient-to-r from-amber-400/30 to-transparent absolute left-0 top-1/2 -translate-y-1/2 w-full h-2 rounded-full opacity-0 group-hover:opacity-80 blur-md transition-all duration-200 -z-10" />
            Stats
          </Link>
        </div>
      </nav>

      {/* Top-right GIF/User Dropdown */}
      <div className="absolute top-6 right-6 z-20 flex flex-col items-end">
        {isLoggedIn ? (
          <div className="relative">
            <button
              className="focus:outline-none"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-label="User menu"
            >
              <img
                src={gifUrl}
                alt="User GIF"
                className="w-14 h-14 rounded-full border-4 border-neon-blue shadow-lg object-cover cursor-pointer hover:scale-105 transition-transform duration-150"
              />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-black/90 border border-neon-blue rounded-xl shadow-xl animate-glow-card">
                <button
                  className="w-full text-left px-4 py-3 text-neon-pink hover:bg-neon-blue/10 rounded-xl font-mono text-base transition cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-14 h-14 rounded-full border-4 border-neon-blue shadow-lg bg-black flex items-center justify-center hover:scale-105 transition-transform duration-150"
            aria-label="Login"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#0a001a" stroke="#00f0ff" strokeWidth="2"/>
              <path d="M10 22v-1a4 4 0 014-4h4a4 4 0 014 4v1" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="14" r="3" fill="#ff00de"/>
            </svg>
          </button>
        )}
      </div>

      {/* Top-right GIF/User Dropdown */}
      <div className="absolute top-6 right-6 z-20 flex flex-col items-end">
        {isLoggedIn ? (
          <div className="relative">
            <button
              className="focus:outline-none"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-label="User menu"
            >
              <img
                src={gifUrl}
                alt="User GIF"
                className="w-14 h-14 rounded-full border-4 border-neon-blue shadow-lg object-cover cursor-pointer hover:scale-105 transition-transform duration-150"
              />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-black/90 border border-neon-blue rounded-xl shadow-xl animate-glow-card">
                <button
                  className="w-full text-left px-4 py-3 text-neon-pink hover:bg-neon-blue/10 rounded-xl font-mono text-base transition"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-14 h-14 rounded-full border-4 border-neon-blue shadow-lg bg-black flex items-center justify-center hover:scale-105 transition-transform duration-150"
            aria-label="Login"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#0a001a" stroke="#00f0ff" strokeWidth="2"/>
              <path d="M10 22v-1a4 4 0 014-4h4a4 4 0 014 4v1" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="14" r="3" fill="#ff00de"/>
            </svg>
          </button>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, delay: 0.5, ease: [0.42, 0, 0.58, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
          >
            <Circle className="h-2 w-2 fill-rose-500/80" />
            <span className="text-sm text-white/60 tracking-wide">{badge}</span>
          </motion.div>

          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, delay: 0.7, ease: [0.42, 0, 0.58, 1] }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                {title1}
              </span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 "
                )}
              >
                {title2}
              </span>
            </h1>
          </motion.div>

          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, delay: 0.9, ease: [0.42, 0, 0.58, 1] }}
          >
            <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
              A modular AI core with persistent memory powers the system,
              enabling real-time chat, summary capabilities, and object
              detection. Designed with a privacy-first approach, no data leaves
              your device.
            </p>
          </motion.div>

          <div className="flex flex-row gap-4 items-center justify-center mt-6">
            <Link href="/chat" className="glitch-btn text-xl px-8 py-4">
              Start Chat
            </Link>
            <Link href="/stats" className="glitch-btn text-xl px-6 py-2">
              Today&apos;s Stats
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}

export { HeroGeometric };
