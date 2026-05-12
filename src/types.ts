export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  targetWeight?: number;
  currentWeight?: number;
  height?: number;
  fitnessGoal?: string;
  createdAt: string;
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
  notes?: string;
  timestamp: string;
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
