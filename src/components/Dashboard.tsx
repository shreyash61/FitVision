import React from 'react';
import { AnalysisResult, UserProfile } from '../types';
import ReactMarkdown from 'react-markdown';
import { Activity, Heart, Shield, Dumbbell, Utensils, Info, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  result: AnalysisResult;
  profile: UserProfile;
}

export function Dashboard({ result, profile }: DashboardProps) {
  const getPreferenceTips = () => {
    const tips = [];
    
    // Workout Preference Tips
    if (profile.workoutPreference === 'gym') {
      tips.push({
        title: "Gym Optimization",
        content: "Focus on compound movements (squats, deadlifts, bench) to maximize efficiency. Use the gym's diverse equipment for progressive overload.",
        icon: <Dumbbell className="w-5 h-5 text-purple-400" />
      });
    } else if (profile.workoutPreference === 'home') {
      tips.push({
        title: "Home Workout Success",
        content: "Consistency is key. Use bodyweight exercises and resistance bands. Focus on high-intensity interval training (HIIT) to keep your heart rate up.",
        icon: <Activity className="w-5 h-5 text-blue-400" />
      });
    } else {
      tips.push({
        title: "Calisthenics Mastery",
        content: "Focus on mastering your own body weight. Progress through variations of push-ups, pull-ups, and dips to build functional strength.",
        icon: <Zap className="w-5 h-5 text-green-400" />
      });
    }

    // Goal Tips
    if (profile.goal === 'bodybuilder') {
      tips.push({
        title: "Hypertrophy Guide",
        content: "Prioritize protein intake (1.6g-2.2g per kg of body weight). Ensure you're in a slight caloric surplus and focus on 8-12 rep ranges.",
        icon: <Target className="w-5 h-5 text-red-400" />
      });
    } else if (profile.goal === 'athletic') {
      tips.push({
        title: "Performance Strategy",
        content: "Focus on explosive movements and functional strength. Maintain a balanced macro profile to support both endurance and power.",
        icon: <Heart className="w-5 h-5 text-pink-400" />
      });
    } else {
      tips.push({
        title: "General Wellness",
        content: "Maintain a consistent routine and a balanced diet. Focus on overall mobility and cardiovascular health for long-term longevity.",
        icon: <Shield className="w-5 h-5 text-blue-400" />
      });
    }

    // Level Tips
    if (profile.level === 'beginner') {
      tips.push({
        title: "Beginner's Mindset",
        content: "Focus on form over weight. Start with 2-3 full-body sessions per week. Don't compare your chapter 1 to someone else's chapter 20.",
        icon: <Info className="w-5 h-5 text-yellow-400" />
      });
    }

    return tips;
  };

  const preferenceTips = getPreferenceTips();

  return (
    <div className="space-y-8">
      {/* Preference-Based Guide */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {preferenceTips.map((tip, index) => (
          <div key={index} className="glass-card p-6 border-l-4 border-l-purple-500/50">
            <div className="flex items-center gap-3 mb-3">
              {tip.icon}
              <h3 className="font-bold text-white">{tip.title}</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">{tip.content}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-purple-500/50 transition-colors group"
        >
          <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">Estimated BMI</p>
            <p className="text-3xl font-bold mt-1">{result.bmi}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-pink-500/50 transition-colors group"
        >
          <div className="p-3 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-colors">
            <Shield className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">Skin Health</p>
            <p className="text-3xl font-bold mt-1">{result.skinHealth}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-blue-500/50 transition-colors group"
        >
          <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
            <Heart className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">Health Level</p>
            <p className="text-3xl font-bold mt-1">{result.healthLevel}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Dumbbell className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">Your Workout Plan</h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{result.workoutPlan}</ReactMarkdown>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Utensils className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold">Your Meal Plan</h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{result.mealPlan}</ReactMarkdown>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h2 className="text-xl font-bold mb-4">AI Vision Insights</h2>
        <p className="text-zinc-400 leading-relaxed">{result.imageAnalysis}</p>
      </motion.div>
    </div>
  );
}
