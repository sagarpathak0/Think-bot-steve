import React from "react";

interface ChatInputFormProps {
  input: string;
  setInput: (val: string) => void;
  sending: boolean;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onRefresh: () => void;
}

export default function ChatInputForm({ input, setInput, sending, loading, onSubmit, onRefresh }: ChatInputFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 items-center neon-border holo p-2 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card" style={{zIndex:2}}>
      <input
        className="cyberpunk-input flex-1 bg-transparent border-none outline-none text-lg px-3 py-2 rounded-xl"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={sending}
        autoFocus
      />
      <button
        type="submit"
        className="glitch-btn px-4 py-2"
        disabled={sending || !input.trim()}
      >
        {sending ? <span className="flicker">Sending...</span> : <span className="flicker">Send</span>}
      </button>
      <button
        type="button"
        className="glitch-btn px-4 py-2"
        onClick={onRefresh}
        disabled={loading || sending}
      >
        Refresh
      </button>
    </form>
  );
}
