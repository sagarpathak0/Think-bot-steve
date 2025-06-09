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
  const WORD_LIMIT = 25;
  const words = input.trim().split(/\s+/).filter(Boolean);
  const isTruncated = words.length > WORD_LIMIT;
  const displayInput = isTruncated ? words.slice(0, WORD_LIMIT).join(" ") : input;

  // Custom submit handler to send truncated message if needed
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayInput.trim()) return;
    // Replace input with truncated version if needed
    if (isTruncated) {
      setInput(words.slice(0, WORD_LIMIT).join(" "));
    }
    // Call parent onSubmit with truncated message
    const fakeEvent = {
      ...e,
      target: {
        ...e.target,
        value: words.slice(0, WORD_LIMIT).join(" ")
      }
    };
    onSubmit(fakeEvent as any);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center neon-border holo p-2 rounded-xl bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 animate-glow-card" style={{zIndex:2}}>
      <input
        className="cyberpunk-input flex-1 bg-transparent border-none outline-none text-lg px-3 py-2 rounded-xl"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={`Type your message... (max ${WORD_LIMIT} words)`}
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
      {isTruncated && (
        <span className="text-red-400 text-xs ml-2">Message truncated to {WORD_LIMIT} words.</span>
      )}
    </form>
  );
}
