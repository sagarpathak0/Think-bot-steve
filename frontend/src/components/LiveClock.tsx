import { useEffect, useState } from "react";

export default function LiveClock() {
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
