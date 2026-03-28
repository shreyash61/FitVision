import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ArrowRight, Loader2, Sparkles, Dumbbell, LogIn, LogOut, User as UserIcon, Camera } from 'lucide-react';
import { OnboardingForm } from './components/OnboardingForm';
import { ImageUpload } from './components/ImageUpload';
import { Dashboard } from './components/Dashboard';
import { VoiceAssistant } from './components/VoiceAssistant';
import { LiveCameraAssistant } from './components/LiveCameraAssistant';
import { UserProfile, AnalysisResult } from './types';
import { analyzeFitness } from './services/gemini';
import { auth, signIn, logOut, db, doc, getDoc, setDoc, onAuthStateChanged, User, getDocFromServer } from './firebase';
import { serverTimestamp } from 'firebase/firestore';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
          <div className="glass-card p-12 max-w-md space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <Activity className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-zinc-400">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState<'onboarding' | 'analysis' | 'results'>('onboarding');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    height: 0,
    weight: 0,
    workoutPreference: 'gym',
    mealType: 'hybrid',
    level: 'beginner',
    goal: 'normal',
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load profile from Firestore
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data as UserProfile);
          if (data.lastAnalysis) {
            setResult(data.lastAnalysis);
            setStep('results');
          }
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setResult(null);
      setStep('onboarding');
      setImage(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleStartAnalysis = async () => {
    if (!image || !profile.height || !profile.weight) {
      alert("Please fill in all details and upload a photo.");
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeFitness(image, profile);
      setResult(analysis);
      setStep('results');

      if (user) {
        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          ...profile,
          uid: user.uid,
          lastAnalysis: analysis,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceCommand = (command: string) => {
    console.log("Voice command received:", command);
    if (command.includes("start") || command.includes("analyze")) {
      handleStartAnalysis();
    } else if (command.includes("reset") || command.includes("back")) {
      setStep('onboarding');
      setResult(null);
      setImage(null);
    } else if (command.includes("live") || command.includes("workout")) {
      setShowLiveCamera(true);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-950 selection:bg-purple-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight font-display">FitVision AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Workout</a>
            <a href="#" className="hover:text-white transition-colors">Nutrition</a>
            <button 
              onClick={() => setShowLiveCamera(true)}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Live AI Trainer
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
                  <img src={user.photoURL || ''} alt="User" className="w-6 h-6 rounded-full" />
                  <span className="text-xs text-zinc-300">{user.displayName}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-all shadow-lg shadow-purple-500/20"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto text-center space-y-8 py-20"
            >
              <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-purple-500/20">
                <UserIcon className="w-10 h-10 text-purple-400" />
              </div>
              <h1 className="text-4xl font-bold font-display">Welcome to <span className="gradient-text">FitVision AI</span></h1>
              <p className="text-zinc-400 text-lg">Login to save your progress, track your fitness journey, and unlock personalized AI coaching.</p>
              <button 
                onClick={handleLogin}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
            </motion.div>
          ) : step === 'onboarding' ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-12"
            >
                <div className="text-center space-y-4 relative">
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 -z-10 opacity-20 blur-3xl bg-purple-500 rounded-full" />
                  
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4"
                  >
                    <Sparkles className="w-3 h-3" />
                    Next-Gen Fitness AI
                  </motion.div>
                  <h1 className="text-5xl md:text-8xl font-bold font-display tracking-tight leading-tight">
                    Your Body, <br /><span className="gradient-text">Decoded.</span>
                  </h1>
                  <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    Upload a photo and let our AI analyze your physique to create the perfect workout and meal plan tailored just for you.
                  </p>
                </div>

                <div className="relative rounded-3xl overflow-hidden h-[400px] border border-zinc-800 group">
                  <img 
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1920" 
                    alt="Fitness" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="glass-card px-4 py-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium">Real-time Analysis</span>
                      </div>
                      <div className="glass-card px-4 py-2 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-pink-400" />
                        <span className="text-sm font-medium">Custom Plans</span>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-7 space-y-8">
                  <div className="glass-card p-8 space-y-6">
                    <h2 className="text-2xl font-bold">1. Your Profile</h2>
                    <OnboardingForm profile={profile} setProfile={setProfile} />
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-8">
                  <div className="glass-card p-8 space-y-6">
                    <h2 className="text-2xl font-bold">2. Visual Analysis</h2>
                    <ImageUpload onImageSelect={setImage} selectedImage={image} />
                    
                    <button
                      onClick={handleStartAnalysis}
                      disabled={loading || !image || !profile.height || !profile.weight}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2 group"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing Physique...
                        </>
                      ) : (
                        <>
                          Generate My Plan
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : step === 'results' && result ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold font-display">Your Personalized <span className="gradient-text">Report</span></h1>
                  <p className="text-zinc-400 mt-2">Based on your visual analysis and fitness profile.</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowLiveCamera(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20"
                  >
                    <Camera className="w-5 h-5" />
                    Live AI Trainer
                  </button>
                  <button 
                    onClick={() => setStep('onboarding')}
                    className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all"
                  >
                    Update Profile
                  </button>
                </div>
              </div>

              <Dashboard result={result} profile={profile} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Voice Assistant */}
      <VoiceAssistant onCommand={handleVoiceCommand} />

      {/* Live Camera Assistant */}
      <AnimatePresence>
        {showLiveCamera && (
          <LiveCameraAssistant onClose={() => setShowLiveCamera(false)} />
        )}
      </AnimatePresence>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 blur-[120px] rounded-full" />
      </div>

      <footer className="border-t border-zinc-900 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-500 text-sm">
          <p>© 2026 FitVision AI. Professional Fitness Analysis Powered by Gemini.</p>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
}
