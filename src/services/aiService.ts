import { ai } from '../lib/gemini';
import { UserProfile, Workout } from '../types';

export const aiService = {
  async generateTrainingPlan(profile: UserProfile, history: Workout[]): Promise<string> {
    try {
      const workoutHistoryStr = history.slice(0, 10).map(w => 
        `- ${w.type}: ${w.duration} mins, Intensity: ${w.intensity}, Date: ${w.timestamp}`
      ).join('\n');

      const prompt = `
        You are an expert fitness coach. Create a personalized weekly training plan for a user with the following profile:
        - Goal: ${profile.fitnessGoal || 'General Fitness'}
        - Target Weight: ${profile.targetWeight || 'N/A'} kg
        - Current Status: ${profile.currentWeight || 'N/A'} kg, ${profile.height || 'N/A'} cm
        
        Recent Activity:
        ${workoutHistoryStr || 'No recent activity recorded.'}

        Provide a structured weekly plan in Markdown format. Include:
        1. A daily schedule.
        2. Specific exercises or activities.
        3. Tips for nutrition and recovery.
        4. Encouragement.

        Keep it concise but detailed enough to follow. Use Markdown headers and bullet points.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      return response.text || "Failed to generate plan. Please try again.";
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  }
};
