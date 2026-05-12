import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { fitnessService } from '../services/fitnessService';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown, Star, Flame } from 'lucide-react';

interface LeaderboardProps {
  user: User;
}

export default function Leaderboard({ user }: LeaderboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const data = await fitnessService.getLeaderboard();
    setUsers(data);
    setLoading(false);
  };

  const getTierIcon = (league: string) => {
    switch (league) {
      case 'Super': return <Medal className="text-yellow-400" size={16} />;
      case 'Diamond': return <Crown className="text-blue-400" size={16} />;
      case 'Gold': return <Star className="text-yellow-600" size={16} />;
      default: return <Star className="text-slate-300" size={16} />;
    }
  };

  if (loading) return null;

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Rankings</h1>
        <p className="text-slate-500 mt-1 font-medium italic">Rise through the leagues of legend.</p>
      </header>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Athlete</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">League</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u, idx) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  key={u.uid}
                  className={`hover:bg-slate-50/50 transition-colors ${u.uid === user.uid ? 'bg-indigo-50/50' : ''}`}
                >
                  <td className="px-8 py-6">
                    <span className={`text-lg font-black ${idx < 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200 overflow-hidden">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{u.name}</p>
                        {u.uid === user.uid && <p className="text-[10px] font-black text-indigo-600 uppercase">You</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {getTierIcon(u.league)}
                      <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{u.league}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Flame className="text-orange-500" size={16} />
                      <span className="text-lg font-black text-slate-800">{u.streakCount}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-20">
          <Trophy className="mx-auto text-slate-100 mb-6" size={80} />
          <p className="text-slate-400 font-bold uppercase tracking-widest">Calculating rankings...</p>
        </div>
      )}
    </div>
  );
}
