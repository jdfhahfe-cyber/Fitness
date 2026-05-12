import { UserProfile, Workout } from '../types';

export const aiService = {
  async generateTrainingPlan(profile: UserProfile, history: Workout[]): Promise<string> {
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile, history }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan via server');
      }

      const data = await response.json();
      return data.content || "Failed to generate plan. Please try again.";
    } catch (error) {
      console.error("Client AI Error:", error);
      throw error;
    }
  }
};
