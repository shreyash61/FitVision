import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzeFitness(image: string, profile: UserProfile) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this full-body picture and the provided user profile to generate a comprehensive fitness report.
    
    User Profile:
    - Height: ${profile.height} cm
    - Weight: ${profile.weight} kg
    - Workout Preference: ${profile.workoutPreference}
    - Meal Type: ${profile.mealType}
    - Current Level: ${profile.level}
    - Goal: ${profile.goal}
    
    Tasks:
    1. Estimate BMI based on the image and profile.
    2. Analyze skin health (visual assessment).
    3. Determine overall health level.
    4. Provide a detailed weekly workout plan (Markdown).
    5. Provide a detailed weekly meal plan (Markdown).
    6. General image analysis observations.
    
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: image.split(',')[1]
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bmi: { type: Type.STRING },
          skinHealth: { type: Type.STRING },
          healthLevel: { type: Type.STRING },
          workoutPlan: { type: Type.STRING },
          mealPlan: { type: Type.STRING },
          imageAnalysis: { type: Type.STRING }
        },
        required: ["bmi", "skinHealth", "healthLevel", "workoutPlan", "mealPlan", "imageAnalysis"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzePosture(image: string) {
  const model = "gemini-3-flash-preview";
  const prompt = "You are a personal AI trainer. Analyze this live camera frame and suggest improvements to the user's posture or exercise form. Keep it very short and actionable (max 15 words). If the posture is good, say 'Great form!'.";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: image.split(',')[1]
            }
          }
        ]
      }
    ]
  });

  return response.text;
}

export async function getVoiceResponse(text: string) {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: text,
    config: {
      systemInstruction: "You are FitVision AI, a professional fitness assistant. Keep responses concise, motivating, and helpful. Use voice-friendly language."
    }
  });
  return response.text;
}
