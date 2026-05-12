import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function calculateCalories(type: string, duration: number, intensity: string): number {
  // Rough ESTIMATES for proof of concept
  const baseBurn: Record<string, number> = {
    "Running": 10,
    "Cycling": 8,
    "Weightlifting": 5,
    "Yoga": 3,
    "Swimming": 12,
    "Walking": 4,
    "Other": 6
  };
  
  const intensityMultiplier: Record<string, number> = {
    "low": 0.8,
    "medium": 1,
    "high": 1.3
  };

  const burn = baseBurn[type] || 6;
  const mult = intensityMultiplier[intensity as keyof typeof intensityMultiplier] || 1;
  
  return Math.round(burn * duration * mult);
}
