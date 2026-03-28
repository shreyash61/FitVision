export type WorkoutPreference = 'gym' | 'calisthenics' | 'home';
export type MealType = 'veg' | 'non-veg' | 'hybrid';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type GoalBodyType = 'athletic' | 'normal' | 'bodybuilder';

export interface UserProfile {
  height: number;
  weight: number;
  workoutPreference: WorkoutPreference;
  mealType: MealType;
  level: FitnessLevel;
  goal: GoalBodyType;
}

export interface AnalysisResult {
  bmi: string;
  skinHealth: string;
  healthLevel: string;
  workoutPlan: string;
  mealPlan: string;
  imageAnalysis: string;
}
