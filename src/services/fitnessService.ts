import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  deleteDoc,
  limit
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserProfile, Workout, Milestone, TrainingPlan, Announcement } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const fitnessService = {
  // User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        // Check for streak reset
        return await this.checkAndResetStreak(data);
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async createUserProfile(user: any): Promise<UserProfile> {
    const profile: UserProfile = {
      uid: user.uid,
      name: user.displayName || 'Athlete',
      email: user.email || '',
      coins: 0,
      streakCount: 0,
      streakFreezes: 1,
      coinMultiplier: 1,
      league: 'Beginner',
      role: user.email === 'jdfhahfe@aura.fit' || user.email === 'jdfhahfe@gmail.com' ? 'admin' : 'user', // Initial admin
      createdAt: new Date().toISOString()
    };
    await this.saveUserProfile(profile);
    return profile;
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    const path = `users/${profile.uid}`;
    try {
      await setDoc(doc(db, 'users', profile.uid), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async checkAndResetStreak(profile: UserProfile): Promise<UserProfile> {
    if (!profile.lastWorkoutDate) return profile;
    
    const today = new Date().toISOString().split('T')[0];
    const lastDate = new Date(profile.lastWorkoutDate);
    const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      if (profile.streakFreezes > 0) {
        // Use freeze
        const updated = { ...profile, streakFreezes: profile.streakFreezes - 1, lastWorkoutDate: today };
        await this.saveUserProfile(updated);
        return updated;
      } else {
        // Reset streak
        const updated = { ...profile, streakCount: 0 };
        await this.saveUserProfile(updated);
        return updated;
      }
    }
    return profile;
  },

  // Workouts
  async logWorkout(workout: Workout): Promise<string> {
    const path = 'workouts';
    try {
      const docRef = await addDoc(collection(db, 'workouts'), workout);
      
      // Update User streak and coins
      const profile = await this.getUserProfile(workout.userId);
      if (profile) {
        const today = new Date().toISOString().split('T')[0];
        let newStreak = profile.streakCount;
        if (profile.lastWorkoutDate !== today) {
          newStreak += 1;
        }

        const updatedProfile: UserProfile = {
          ...profile,
          coins: profile.coins + (workout.coinsEarned * (profile.coinMultiplier || 1)),
          streakCount: newStreak,
          lastWorkoutDate: today
        };

        // Milestone Check: League Upgrade
        if (newStreak >= 50 && profile.league === 'Gold') updatedProfile.league = 'Diamond';
        else if (newStreak >= 30 && profile.league === 'Legend') updatedProfile.league = 'Gold';
        else if (newStreak >= 20 && profile.league === 'Rock') updatedProfile.league = 'Legend';
        else if (newStreak >= 10 && profile.league === 'Dirt') updatedProfile.league = 'Rock';
        else if (newStreak >= 5 && profile.league === 'Beginner') updatedProfile.league = 'Dirt';
        
        await this.saveUserProfile(updatedProfile);
      }

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  },

  async getLeaderboard(): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('streakCount', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  },

  // Announcements
  async createAnnouncement(ann: Announcement): Promise<void> {
    try {
      await addDoc(collection(db, 'announcements'), ann);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'announcements');
    }
  },

  async getAnnouncements(userId: string): Promise<Announcement[]> {
    try {
      const q = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const all = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      // Filter for specific pings or general broadcasts
      return all.filter(a => !a.targetUserId || a.targetUserId === userId);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'announcements');
      return [];
    }
  }
};
