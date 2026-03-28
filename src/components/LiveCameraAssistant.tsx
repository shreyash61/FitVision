import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Loader2, Sparkles } from 'lucide-react';
import { analyzePosture } from '../services/gemini';
import { motion } from 'motion/react';

export function LiveCameraAssistant({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feedback, setFeedback] = useState<string>("Initializing AI Trainer...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setFeedback("Camera access denied. Please enable camera permissions.");
      }
    }
    setupCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current && !isAnalyzing) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const imageData = canvas.toDataURL('image/jpeg', 0.5);
          
          setIsAnalyzing(true);
          try {
            const aiFeedback = await analyzePosture(imageData);
            setFeedback(aiFeedback);
          } catch (error) {
            console.error("Posture analysis failed:", error);
          } finally {
            setIsAnalyzing(false);
          }
        }
      }
    }, 4000); // Analyze every 4 seconds

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <div className="relative w-full max-w-4xl bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <div className="absolute top-6 right-6 z-10">
          <button 
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative aspect-video bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
            <div className="glass-card p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isAnalyzing ? 'bg-purple-500/20' : 'bg-green-500/20'}`}>
                {isAnalyzing ? (
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6 text-green-400" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">AI Trainer Feedback</p>
                <p className="text-xl font-medium text-white">{feedback}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-zinc-400">Live AI Monitoring Active</span>
          </div>
          <p className="text-xs text-zinc-500">Post your camera so your full body is visible for best results.</p>
        </div>
      </div>
    </motion.div>
  );
}
