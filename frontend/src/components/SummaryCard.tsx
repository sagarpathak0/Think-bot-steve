import React from "react";

interface SummaryCardProps {
  summary: string;
  className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary, className = "" }) => (
  <div className={`flex flex-col p-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card ${className}`}>
    <div className="font-bold text-neon-blue mb-1">Summary</div>
    <div className="text-base text-gray-100 whitespace-pre-line break-words">{summary || "No summary yet."}</div>
  </div>
);

export default SummaryCard;
