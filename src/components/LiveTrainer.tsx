import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Camera, StopCircle, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface LiveTrainerProps {
  onClose: () => void;
}

export function LiveTrainer({ onClose }: LiveTrainerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [feedback, setFeedback] = useState<string>('Ready to start?');
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
      initLiveSession();
    } catch (err) {
      console.error("Error accessing camera:", err);
      setFeedback("Camera access denied.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsStreaming(false);
    sessionRef.current?.close();
  };

  const initLiveSession = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    
    const sessionPromise = ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      callbacks: {
        onopen: () => {
          console.log("Live session opened");
          setFeedback("AI Trainer is watching. Start your workout!");
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.modelTurn?.parts) {
            const part = message.serverContent.modelTurn.parts[0];
            if (part.text) {
              setFeedback(part.text);
            }
            if (part.inlineData?.data && !isMuted) {
              playAudio(part.inlineData.data);
            }
          }
        },
        onerror: (err) => console.error("Live error:", err),
        onclose: () => console.log("Live session closed"),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "You are a professional AI Fitness Trainer. Watch the user's live video and provide real-time feedback on their posture, form, and motivation. Be encouraging but firm about safety. Keep responses short and punchy.",
      },
    });

    sessionRef.current = await sessionPromise;
    startStreamingFrames();
  };

  const playAudio = async (base64Data: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    // Live API returns raw PCM 16kHz
    const audioBuffer = audioContextRef.current.createBuffer(1, bytes.length / 2, 16000);
    const channelData = audioBuffer.getChannelData(0);
    const view = new DataView(bytes.buffer);
    for (let i = 0; i < channelData.length; i++) {
      channelData[i] = view.getInt16(i * 2, true) / 32768;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  const startStreamingFrames = () => {
    const interval = setInterval(() => {
      if (!isStreaming || !videoRef.current || !canvasRef.current || !sessionRef.current) {
        clearInterval(interval);
        return;
      }

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
        const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
        sessionRef.current.sendRealtimeInput({
          video: { data: base64Data, mimeType: 'image/jpeg' }
        });
      }
    }, 1000); // Send frame every second
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center animate-pulse">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold font-display">Live AI Trainer</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <StopCircle className="w-8 h-8 text-zinc-400 hover:text-white" />
          </button>
        </div>

        <div className="relative aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} width="640" height="480" className="hidden" />
          
          <div className="absolute bottom-8 left-8 right-8">
            <div className="glass-card p-6 border-l-4 border-purple-500 animate-in slide-in-from-bottom-4">
              <p className="text-lg font-medium text-white">{feedback}</p>
            </div>
          </div>

          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
              <button 
                onClick={startCamera}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center gap-3"
              >
                <Camera className="w-6 h-6" />
                Start Training Session
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition-all"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Ensure you have enough space and good lighting.
          </div>
        </div>
      </div>
    </div>
  );
}
