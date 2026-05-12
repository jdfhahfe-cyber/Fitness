export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  targetWeight?: number;
  currentWeight?: number;
  height?: number;
  fitnessGoal?: string;
  createdAt: string;
  
  // Game systems
  coins: number;
  streakCount: number;
  lastWorkoutDate?: string; // YYYY-MM-DD
  streakFreezes: number;
  coinMultiplier: number;
  league: 'Beginner' | 'Dirt' | 'Rock' | 'Legend' | 'Gold' | 'Diamond' | 'Super';
  
  // Admin & Security
  role: 'user' | 'admin';
  isBanned?: boolean;
}

export enum WorkoutType {
  RUNNING = 'Running',
  CYCLING = 'Cycling',
  WEIGHTLIFTING = 'Weightlifting',
  YOGA = 'Yoga',
  SWIMMING = 'Swimming',
  WALKING = 'Walking',
  OTHER = 'Other'
}

export interface Workout {
  id?: string;
  userId: string;
  type: WorkoutType;
  duration: number; // minutes
  intensity: 'low' | 'medium' | 'high';
  calories: number;
  distance?: number; // km
  coinsEarned: number;
  notes?: string;
  timestamp: string;
}

export interface Announcement {
  id?: string;
  title: string;
  message: string;
  type: 'ping' | 'broadcast';
  targetUserId?: string; // If ping, specific user. If broadcast, null/empty.
  createdAt: string;
}

export interface Milestone {
  id?: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  achievedAt: string;
}

export interface TrainingPlan {
  id?: string;
  userId: string;
  content: string;
  startDate: string;
  status: 'active' | 'completed' | 'archived';
}
