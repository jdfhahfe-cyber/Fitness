import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  Link,
  useLocation
} from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, db } from './lib/firebase';
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
  FileCode
} from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import WorkoutLog from './components/WorkoutLog';
import TrainingPlanView from './components/TrainingPlan';
import Milestones from './components/Milestones';
import StalorineExport from './components/StalorineExport';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
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

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      {!user ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center"
          >
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Activity className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Aura Fitness</h1>
            <p className="text-slate-500 mb-8">Elevate your performance with AI-powered training.</p>
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
              Continue with Google
            </button>
          </motion.div>
        </div>
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

            <nav className="flex-1 space-y-2">
              <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <NavItem to="/workouts" icon={<Dumbbell size={20} />} label="Workouts" />
              <NavItem to="/plans" icon={<ClipboardList size={20} />} label="Training Plans" />
              <NavItem to="/milestones" icon={<Trophy size={20} />} label="Milestones" />
              <NavItem to="/export" icon={<FileCode size={20} />} label="Stalorine Export" />
            </nav>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-slate-50">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200">
                  <img src={user.photoURL || ''} alt={user.displayName || ''} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.displayName}</p>
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
                <Route path="/export" element={<StalorineExport user={user} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AnimatePresence>
          </main>

          {/* Mobile Nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-4">
             <Link to="/"><LayoutDashboard className="text-gray-400" size={24} /></Link>
             <Link to="/workouts"><Dumbbell className="text-gray-400" size={24} /></Link>
             <Link to="/plans"><ClipboardList className="text-gray-400" size={24} /></Link>
             <Link to="/milestones"><Trophy className="text-gray-400" size={24} /></Link>
          </nav>
        </div>
      )}
    </Router>
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
