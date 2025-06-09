import { useEffect, useState, useRef } from "react";
import CyberpunkNavbar from "../components/CyberpunkNavbar";
import Sidebar from "../components/Sidebar";
import ChatLog from "../components/ChatLog";
import ChatInputForm from "../components/ChatInputForm";
import TTSVoiceSelector from "../components/TTSVoiceSelector";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;



type Message = {
  timestamp: string;
  speaker: string;
  message: string;
};

type BotData = {
  conversation: Message[];
  summary: string;
  objects: Record<string, { timestamp: string; description: string | null }[]>;
};

const ChatPage = () => {
  const [data, setData] = useState<BotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedVoiceName') || "";
    }
    return "";
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for TTS voices
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Effect to load voices on component mount
  useEffect(() => {
    let mounted = true; // To prevent state updates on unmounted component

    const loadVoicesHandler = () => {
      if (!mounted || !('speechSynthesis' in window)) return;
      const synthVoices = window.speechSynthesis.getVoices();
      if (synthVoices.length > 0) {
        console.log("Available TTS voices (loaded):", synthVoices);
        setAvailableVoices(synthVoices);
        setVoicesLoaded(true);
        window.speechSynthesis.onvoiceschanged = null; // Remove listener once voices are loaded
      }
    };

    if ('speechSynthesis' in window) {
      const initialVoices = window.speechSynthesis.getVoices();
      if (initialVoices.length > 0) {
        loadVoicesHandler(); // Voices might be available immediately
      } else {
        window.speechSynthesis.onvoiceschanged = loadVoicesHandler;
        // Fallback timeout in case onvoiceschanged doesn't fire or is too slow
        const timerId = setTimeout(() => {
          if (mounted && !voicesLoaded) {
            console.log("Voice loading timeout, attempting to load manually...");
            loadVoicesHandler();
          }
        }, 750); // 750ms timeout
        return () => { clearTimeout(timerId); }; // Clear timeout on component unmount
      }
    }

    return () => {
      mounted = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null; // Clean up listener
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  // Function to speak text using browser's SpeechSynthesis API
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn("SpeechSynthesis not supported in this browser.");
      return;
    }

    const cleanedText = text.replace(/!!$/, '').replace(/[*_`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'en-US'; // Set desired language

    if (voicesLoaded && availableVoices.length > 0) {
      let selectedVoice: SpeechSynthesisVoice | undefined = undefined;

      // 1. Use the user-selected voice from dropdown
      if (selectedVoiceName && selectedVoiceName.trim() !== "") {
        selectedVoice = availableVoices.find(voice => voice.name === selectedVoiceName);
        if (selectedVoice) {
          console.log(`Using user-selected voice: ${selectedVoice.name}`);
        } else {
          console.warn(`Selected voice '${selectedVoiceName}' not found. Falling back to other options.`);
        }
      }

      // 2. If no user-selected voice or not found, try Google US English
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(voice => voice.name === 'Google US English' && voice.lang.startsWith('en-US'));
      }

      // 3. Fallback to other English voices if still not found
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(voice => voice.name.toLowerCase().includes('english') && voice.lang.startsWith('en-US') && voice.localService);
      }
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(voice => voice.lang.startsWith('en-US') && voice.localService); 
      }
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(voice => voice.lang.startsWith('en-US')); 
      }
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(voice => voice.lang.startsWith('en-') && voice.localService);
      }
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(voice => voice.lang.startsWith('en-')); 
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        if (!(selectedVoiceName && utterance.voice.name === selectedVoiceName)) {
            console.log(`Using fallback voice: ${selectedVoice.name} (Lang: ${selectedVoice.lang}, Local: ${selectedVoice.localService})`);
        }
      } else {
        console.warn("No suitable English voice found in pre-loaded list. Using browser default for en-US.");
      }
    } else {
      console.warn("Voices not yet loaded or no voices available. Attempting to speak with browser default for en-US.");
    }
    
    window.speechSynthesis.cancel(); // Cancel any previous speech to avoid overlap
    window.speechSynthesis.speak(utterance);
  };

  // Fetch memory/chat log (with JWT and 401 handling)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      window.location.href = "/login";
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/memory`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        localStorage.removeItem("jwt_token");
        window.location.href = "/login";
        return;
      }
      const d = await res.json();
      setData(d);
    } catch {
      setError("Could not load bot data.");
    }
    setLoading(false);
  };

  // Removed fetchStats for chat page

  // Check for JWT on mount, redirect to login if not present
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchData();
    // Poll every 2 minutes (120000 ms)
    const interval = setInterval(() => {
      fetchData();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  // Only scroll to bottom when a new message is sent (not on every refresh)
  const prevConversationLength = useRef<number>(0);
  useEffect(() => {
    if (!data || !data.conversation || data.conversation.length === 0) return;
    const currentConversation = data.conversation;
    const len = currentConversation.length;

    // Only scroll and speak if a new message was added
    if (len > prevConversationLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      const lastMessage = currentConversation[len - 1];
      // Speak the last message if it's from the bot and it's a new message
      if (lastMessage.speaker === "bot") {
        speakText(lastMessage.message);
      }
    }
    prevConversationLength.current = len;
  }, [data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  // Handle chat submit (with JWT and 401 handling)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        setError("You are not logged in.");
        setSending(false);
        window.location.href = "/login";
        return;
      }
      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: input }),
      });
      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        setSending(false);
        localStorage.removeItem("jwt_token");
        window.location.href = "/login";
        return;
      }
      const result = await res.json();
      if (result.reply) {
        setInput("");
        fetchData(); // This will trigger the useEffect above to speak the new bot message
      } else if (result.error) {
        setError(result.error);
      }
    } catch {
      setError("Could not send message.");
    }
    setSending(false);
  };

  // Handle voice selection change
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = e.target.value;
    setSelectedVoiceName(voiceName);
    localStorage.setItem('selectedVoiceName', voiceName);

    // Optionally, you can also speak a test message with the selected voice
    if (voiceName) {
      const testUtterance = new SpeechSynthesisUtterance("Voice changed to " + voiceName);
      testUtterance.voice = availableVoices.find(voice => voice.name === voiceName) || null;
      window.speechSynthesis.speak(testUtterance);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500" style={{background: "linear-gradient(135deg, #0a001a 60%, #1a0033 100%)", color: "#e0e0ff", fontFamily: "\'Share Tech Mono\', \'VT323\', \'Fira Mono\', monospace"}}>
      <CyberpunkNavbar />
      <div className="w-full mx-auto flex flex-col md:flex-row gap-8 px-0 md:px-4 mt-32 z-10" style={{maxWidth: '100vw'}}>
        {/* Info/Sidebar (30%) */}
        <Sidebar data={data} />
        {/* Main Chat Area (70%) */}
        <main className="w-full md:w-[70%] mx-0 bg-opacity-80 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md border border-blue-900 flex flex-col gap-6 animate-glow-card" style={{background: "rgba(24,28,48,0.92)"}}>
          <h1 className="text-4xl font-bold glitch tracking-widest text-center mb-2">STEVE <span className="flicker text-neon-pink">Think-Bot</span> <span className="flicker text-neon-blue">AI</span></h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {data ? (
            <>
              <ChatLog conversation={data.conversation} messagesEndRef={messagesEndRef} />
              <ChatInputForm
                input={input}
                setInput={setInput}
                sending={sending}
                loading={loading}
                onSubmit={handleSubmit}
                onRefresh={fetchData}
              />
              <TTSVoiceSelector
                selectedVoiceName={selectedVoiceName}
                onChange={handleVoiceChange}
                voicesLoaded={voicesLoaded}
                availableVoices={availableVoices}
              />
            </>
          ) : null}
        </main>
      </div>
      <style jsx global>{`
        /* Custom thin/fancy scrollbar for chatbox */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #00f0ff 0%, #ff00de 100%);
          border-radius: 6px;
          min-height: 24px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #00f0ff #0000;
        }
        .animate-glow {
          box-shadow: 0 0 8px #00f0ff, 0 0 16px #ff00de44;
          animation: glowPulse 2.5s infinite alternate;
        }
        .animate-glow-card {
          box-shadow: 0 0 16px #00f0ff44, 0 0 32px #ff00de22;
          transition: box-shadow 0.3s;
        }
        .glitch-btn {
          background: linear-gradient(90deg, #00f0ff 0%, #ff00de 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-weight: bold;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .glitch-btn:after {
          content: '';
          position: absolute;
          left: 0; top: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, #ff00de44 0%, #00f0ff44 100%);
          opacity: 0.3;
          pointer-events: none;
        }
        .glitch-btn:hover {
          background: linear-gradient(90deg, #ff00de 0%, #00f0ff 100%);
          color: #0a001a;
        }
        .text-neon-blue { color: #00f0ff; }
        .text-neon-pink { color: #ff00de; }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 8px #00f0ff, 0 0 16px #ff00de44; }
          100% { box-shadow: 0 0 24px #ff00de, 0 0 48px #00f0ff44; }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
