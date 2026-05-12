import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { fitnessService } from '../services/fitnessService';
import { Milestone } from '../types';
import { motion } from 'motion/react';
import { Trophy, Star, ShieldCheck, Heart, Zap, Award } from 'lucide-react';
import { format } from 'date-fns';

interface MilestonesProps {
  user: User;
}

export default function Milestones({ user }: MilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      const data = await fitnessService.getMilestones(user.uid);
      setMilestones(data);
      setLoading(false);
    };
    fetchMilestones();
  }, [user.uid]);

  const achievementHistory = [
    { title: "Day 1", icon: <Star />, color: "bg-yellow-500", desc: "Started the journey", type: "starter" },
    { title: "First 1000 kcal", icon: <Zap />, color: "bg-orange-500", desc: "Burned your first 1000 calories", type: "power" },
    { title: "Consistency King", icon: <ShieldCheck />, color: "bg-blue-500", desc: "Logged 5 days in a row", type: "habit" },
    { title: "Heart of Lion", icon: <Heart />, color: "bg-red-500", desc: "Completed high intensity session", type: "grit" },
    { title: "Milestone Master", icon: <Award />, color: "bg-purple-500", desc: "Achieved 10 personal goals", type: "pro" }
  ];

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hall of Fame</h1>
        <p className="text-slate-500 mt-1 font-medium">Your milestones, celebrated and tracked.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {achievementHistory.map((ach, idx) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={ach.title}
            className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-center gap-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-900/5 transition-all"
          >
            <div className={`w-20 h-20 shrink-0 rounded-full flex items-center justify-center text-white border-8 ${ach.type === 'starter' ? 'bg-yellow-400 border-yellow-50' : 'bg-indigo-600 border-indigo-50'} shadow-inner shadow-black/10`}>
              {React.cloneElement(ach.icon as React.ReactElement, { size: 32 } as any)}
            </div>
            
            <div className="flex-1">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[2px] mb-1">Badge Unlocked</p>
              <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{ach.title}</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed">{ach.desc}</p>
            </div>

            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <ShieldCheck className="text-emerald-500" size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 bg-indigo-950 rounded-[60px] p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0,rgba(255,255,255,0.4),transparent)]" />
        <Trophy className="mx-auto text-yellow-400 mb-8 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" size={80} />
        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Top Tier Performance</h2>
        <p className="text-indigo-200 max-w-sm mx-auto mb-12 leading-relaxed font-bold uppercase tracking-widest text-xs">Global Ranking: Top 5%</p>
        
        <div className="flex justify-center items-center gap-12">
           <div className="text-center">
             <p className="text-4xl font-black text-white">12</p>
             <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[3px] mt-2">Levels</p>
           </div>
           <div className="w-px h-16 bg-white/10" />
           <div className="text-center">
             <p className="text-4xl font-black text-white">43</p>
             <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[3px] mt-2">Badges</p>
           </div>
        </div>
      </div>
    </div>
  );
}
