import { RefObject } from "react";

export interface Message {
  timestamp: string;
  speaker: string;
  message: string;
}

interface ChatLogProps {
  conversation: Message[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function ChatLog({ conversation, messagesEndRef }: ChatLogProps) {
  return (
    <div className="cyberpunk-chatlog neon-border holo shadow-lg relative mb-4 max-h-[340px] overflow-y-auto p-4 rounded-xl bg-gradient-to-br from-blue-900/40 to-pink-900/20 border border-blue-700 animate-glow-card custom-scrollbar" style={{zIndex:2}}>
      {Array.isArray(conversation) && conversation.length > 0 ? (
        conversation.slice(-25).map((msg, i) => (
          <div key={i} className={"mb-3 flex " + (msg.speaker === "bot" ? "justify-start" : "justify-end")}> 
            <div className={"max-w-[80%] px-4 py-2 rounded-2xl shadow-md " +
              (msg.speaker === "bot"
                ? "bg-gradient-to-r from-blue-900/80 to-pink-900/40 border border-blue-700 text-neon-blue animate-glow-card"
                : "bg-gradient-to-r from-pink-900/80 to-blue-900/40 border border-pink-700 text-neon-pink animate-glow-card")
            }>
              <div className="flex items-center gap-2 mb-1">
                <span className={msg.speaker === "bot" ? "font-bold text-neon-blue" : "font-bold text-neon-pink"}>
                  {msg.speaker === "bot" ? "Steve" : "You"}
                </span>
                <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="whitespace-pre-line text-base">{msg.message.replace(/!!$/, "")}</div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-400">No conversation yet.</div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
