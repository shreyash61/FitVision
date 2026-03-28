import React from 'react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface OnboardingFormProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

export function OnboardingForm({ profile, setProfile }: OnboardingFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: name === 'height' || name === 'weight' ? Number(value) : value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Height (cm)</label>
        <input
          type="number"
          name="height"
          value={profile.height || ''}
          onChange={handleChange}
          placeholder="e.g. 175"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Weight (kg)</label>
        <input
          type="number"
          name="weight"
          value={profile.weight || ''}
          onChange={handleChange}
          placeholder="e.g. 70"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Workout Preference</label>
        <select
          name="workoutPreference"
          value={profile.workoutPreference}
          onChange={handleChange}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        >
          <option value="gym">Gym Workout</option>
          <option value="calisthenics">Calisthenics</option>
          <option value="home">Home Workout</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Meal Type</label>
        <select
          name="mealType"
          value={profile.mealType}
          onChange={handleChange}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        >
          <option value="veg">Vegetarian</option>
          <option value="non-veg">Non-Vegetarian</option>
          <option value="hybrid">Hybrid (Both)</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Current Level</label>
        <select
          name="level"
          value={profile.level}
          onChange={handleChange}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Goal Body Type</label>
        <select
          name="goal"
          value={profile.goal}
          onChange={handleChange}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        >
          <option value="athletic">Athletic</option>
          <option value="normal">Normal Fitness</option>
          <option value="bodybuilder">Bodybuilder</option>
        </select>
      </div>
    </div>
  );
}
