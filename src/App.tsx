import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  Link,
  useLocation
} from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { fitnessService } from './services/fitnessService';
import { UserProfile, Workout, Milestone, TrainingPlan } from './types';
import { doc, getDocFromServer } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  LayoutDashboard, 
  ClipboardList, 
  Trophy, 
  Settings, 
  LogOut, 
  Dumbbell,
  FileCode,
  Store,
  ShieldAlert,
  Bell,
  Dna
} from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import WorkoutLog from './components/WorkoutLog';
import TrainingPlanView from './components/TrainingPlan';
import Milestones from './components/Milestones';
import StalorineExport from './components/StalorineExport';
import Shop from './components/Shop';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import Notifications from './components/Notifications';
import Auth from './components/Auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate Connection to Firestore (Instruction requirement)
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        if (error?.message?.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        let p = await fitnessService.getUserProfile(u.uid);
        if (!p) {
          p = await fitnessService.createUserProfile(u);
        }
        if (p.isBanned) {
          await signOut(auth);
          alert("Your account has been banned.");
          return;
        }
        setProfile(p);
      }
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Dna className="animate-spin text-indigo-600" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Syncing Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {!user ? (
        <Auth />
      ) : (
        <div className="min-h-screen bg-slate-50 flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 hidden md:flex">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">AURA</span>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
              <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <NavItem to="/workouts" icon={<Dumbbell size={20} />} label="Workouts" />
              <NavItem to="/plans" icon={<ClipboardList size={20} />} label="Training Plans" />
              <NavItem to="/milestones" icon={<Trophy size={20} />} label="Milestones" />
              <NavItem to="/leaderboard" icon={<Trophy size={20} />} label="Leaderboard" />
              <NavItem to="/shop" icon={<Store size={20} />} label="Market" />
              <NavItem to="/export" icon={<FileCode size={20} />} label="Stalorine Export" />
              {profile?.role === 'admin' && (
                <NavItem to="/admin" icon={<ShieldAlert size={20} />} label="Admin Panel" />
              )}
            </nav>

            <div className="pt-6 border-t border-slate-100">
              <Notifications user={user} />
              <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-slate-50 mt-4">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200">
                  <img src={user.photoURL || ''} alt={user.displayName || ''} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.displayName}</p>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase">{profile?.league || 'Beginner'}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut size={20} />
                <span className="font-bold text-sm">Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/workouts" element={<WorkoutLog user={user} />} />
                <Route path="/plans" element={<TrainingPlanView user={user} />} />
                <Route path="/milestones" element={<Milestones user={user} />} />
                <Route path="/leaderboard" element={<Leaderboard user={user} />} />
                <Route path="/shop" element={<Shop user={user} />} />
                <Route path="/export" element={<StalorineExport user={user} />} />
                <Route path="/admin" element={profile?.role === 'admin' ? <AdminPanel user={user} /> : <Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AnimatePresence>
          </main>

          {/* Mobile Nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex justify-around p-4 z-50 safe-area-bottom">
             <MobileNavItem to="/" icon={<LayoutDashboard size={24} />} label="Home" />
             <MobileNavItem to="/workouts" icon={<Dumbbell size={24} />} label="Train" />
             <MobileNavItem to="/leaderboard" icon={<Trophy size={24} />} label="Arena" />
             <MobileNavItem to="/shop" icon={<Store size={24} />} label="Shop" />
          </nav>
        </div>
      )}
    </Router>
  );
}

function MobileNavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className="flex flex-col items-center gap-1">
      <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
        {label}
      </span>
    </Link>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200
        ${isActive 
          ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
      `}
    >
      {React.cloneElement(icon as React.ReactElement, {
        className: isActive ? 'text-indigo-600' : 'text-slate-400',
        size: 20
      } as any)}
      <span className="font-bold text-sm">{label}</span>
    </Link>
  );
}
