import UserProfileCard from "./UserProfileCard";
import LiveClock from "./LiveClock";
import AITipsWidget from "./AITipsWidget";
import SummaryCard from "./SummaryCard";

interface SidebarProps {
  data: {
    summary: string;
    objects: Record<string, { timestamp: string; description: string | null }[]>;
  } | null;
}

export default function Sidebar({ data }: SidebarProps) {
  return (
    <aside className="w-full md:w-[30%] max-w-none mx-0 bg-opacity-80 rounded-2xl p-6 shadow-xl backdrop-blur-md border border-blue-900 flex flex-col gap-4 animate-glow-card" style={{background: "rgba(24,32,60,0.92)"}}>
      <UserProfileCard />
      <LiveClock />
      <AITipsWidget />
      {/* Summary and Objects Cards */}
      {data && (
        <>
          <SummaryCard summary={data.summary} />
          <div className="flex flex-col p-3 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card">
            <div className="font-bold text-neon-pink mb-1">Objects Detected</div>
            <ul className="text-base text-gray-100">
              {data.objects && Object.entries(data.objects).length === 0 && <li>No objects detected yet.</li>}
              {data.objects && Object.entries(data.objects).map(([obj, arr]) => (
                <li key={obj}>
                  <span className="font-semibold text-neon-blue">{obj}</span>
                  {": "}
                  <span className="text-neon-pink">{arr.length} time(s)</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </aside>
  );
}
