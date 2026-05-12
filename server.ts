import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini on the server side
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });

  // API Route: Generate Training Plan (Securely)
  app.post("/api/generate-plan", async (req, res) => {
    try {
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key not configured on server" });
      }

      const { profile, history } = req.body;
      const workoutHistoryStr = history.slice(0, 10).map((w: any) => 
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
        contents: prompt
      });

      res.json({ content: response.text });
    } catch (error) {
      console.error("Server AI Error:", error);
      res.status(500).json({ error: "Failed to generate training plan" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
