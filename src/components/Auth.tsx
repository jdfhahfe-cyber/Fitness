import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { fitnessService } from '../services/fitnessService';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Dna, Activity } from 'lucide-react';

export default function Auth() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Generate a virtual email from the nickname for Firebase Auth
    const sanitizedNickname = nickname.trim().replace(/\s+/g, '_').toLowerCase();
    const virtualEmail = `${sanitizedNickname}@aura.fit`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, virtualEmail, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, virtualEmail, password);
        await updateProfile(userCredential.user, { displayName: nickname.trim() });
        await fitnessService.createUserProfile(userCredential.user);
      }
    } catch (err: any) {
      console.error(err.code, err.message);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError(isLogin ? 'Athlete ID or Security Code incorrect.' : 'This ID is already taken or invalid.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This ID is already registered. Try logging in.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid characters in ID. Please use letters, numbers, or underscores.');
      } else if (err.code === 'auth/weak-password') {
        setError('Security Code must be at least 6 characters.');
      } else {
        setError('Connection failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 -ml-48 -mb-48" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[48px] shadow-2xl shadow-indigo-900/10 p-10 md:p-14 relative z-10 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
            <Activity className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">
            {isLogin ? 'Aura Sync' : 'Initialize'}
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            {isLogin ? 'Strategic Entry' : 'Create Identity'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Athlete ID (Unique Nickname)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="shadow_hunter"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Security Code</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl">{error}</p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 uppercase tracking-[4px] text-xs"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sync Profile' : 'Register Identity')}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            {isLogin ? "No identity found? Register" : "Identity detected? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
