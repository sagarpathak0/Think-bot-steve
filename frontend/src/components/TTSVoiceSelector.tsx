import React from "react";

interface TTSVoiceSelectorProps {
  selectedVoiceName: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  voicesLoaded: boolean;
  availableVoices: SpeechSynthesisVoice[];
}

export default function TTSVoiceSelector({ selectedVoiceName, onChange, voicesLoaded, availableVoices }: TTSVoiceSelectorProps) {
  return (
    <div className="flex justify-center mt-2 items-center w-full">
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-900/60 to-pink-900/40 border border-blue-700 rounded-xl px-4 py-2 animate-glow-card">
        <label htmlFor="voice-select" className="text-neon-blue font-mono text-base">TTS Voice:</label>
        <select
          id="voice-select"
          className="bg-transparent text-neon-pink border border-blue-700 rounded px-2 py-1 font-mono"
          value={selectedVoiceName}
          onChange={onChange}
          disabled={!voicesLoaded || availableVoices.length === 0}
        >
          <option value="">(Default - Auto Select)</option>
          {availableVoices.map((voice, idx) => (
            <option key={voice.name + voice.lang + idx} value={voice.name}>
              {voice.name} {voice.lang ? `(${voice.lang})` : ''} {voice.localService ? '[Local]' : '[Remote]'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
