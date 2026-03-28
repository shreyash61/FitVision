import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { getVoiceResponse } from '../services/gemini';

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
}

export function VoiceAssistant({ onCommand }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [showGuide, setShowGuide] = useState(false);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleGeminiVoice = async (text: string) => {
    try {
      const aiResponse = await getVoiceResponse(text);
      speak(aiResponse);
    } catch (error) {
      console.error('Voice AI error:', error);
      speak("I'm sorry, I couldn't process that request.");
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setTranscript(command);
      setIsListening(false);
      
      if (onCommand) onCommand(command);
      handleGeminiVoice(command);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => recognition.stop();
  }, [isListening, onCommand]);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {showGuide && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-400" />
            Voice Commands
          </h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-mono">•</span>
              <span>"Start analysis" or "Analyze" to begin</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-mono">•</span>
              <span>"Live workout" or "Live trainer"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-mono">•</span>
              <span>"Reset" or "Back" to start over</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-mono">•</span>
              <span>Ask questions like "How can I lose weight?"</span>
            </li>
          </ul>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onMouseEnter={() => setShowGuide(true)}
          onMouseLeave={() => setShowGuide(false)}
          onClick={() => setShowGuide(!showGuide)}
          className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          ?
        </button>
        <button
          onClick={() => setIsListening(!isListening)}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            isListening 
              ? 'bg-red-500 animate-pulse' 
              : isSpeaking 
                ? 'bg-purple-600' 
                : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : isSpeaking ? (
            <Volume2 className="w-6 h-6 text-white animate-bounce" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
      
      {transcript && isListening && (
        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm max-w-xs shadow-xl">
          <p className="text-zinc-400 italic">"{transcript}"</p>
        </div>
      )}
    </div>
  );
}
