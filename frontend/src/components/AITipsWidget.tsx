import { useEffect, useState } from "react";

const aiTips = [
  "Tip: You can refresh to see new objects detected!",
  "News: Chat now supports cyberpunk mood bubbles!",
  "Tip: Use the summary to reflect on your conversation.",
  "News: Objects detected are now shown in real time.",
  "Tip: Stay positive and chat with Steve!",
];

export default function AITipsWidget() {
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
