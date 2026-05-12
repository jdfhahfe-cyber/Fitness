import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { fitnessService } from '../services/fitnessService';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Coins, Zap, Snowflake, TrendingUp, ShoppingBag, Check } from 'lucide-react';

interface ShopProps {
  user: User;
}

export default function Shop({ user }: ShopProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [user.uid]);

  const fetchProfile = async () => {
    const p = await fitnessService.getUserProfile(user.uid);
    setProfile(p);
    setLoading(false);
  };

  const shopItems = [
    {
      id: 'streak_freeze',
      name: 'Streak Freeze',
      description: 'Protects your streak if you miss a day.',
      cost: 500,
      icon: <Snowflake className="text-blue-400" size={32} />,
      type: 'consumable'
    },
    {
      id: 'multiplier_2',
      name: '2x Coin Multiplier',
      description: 'Double your coin earnings for all workouts.',
      cost: 2000,
      icon: <TrendingUp className="text-emerald-400" size={32} />,
      type: 'powerup'
    },
    {
      id: 'multiplier_3',
      name: '3x Coin Multiplier',
      description: 'Triple your coin earnings for all workouts.',
      cost: 5000,
      icon: <Zap className="text-yellow-400" size={32} />,
      type: 'powerup'
    }
  ];

  const buyItem = async (item: typeof shopItems[0]) => {
    if (!profile || profile.coins < item.cost) return;
    
    setPurchasing(item.id);
    const updatedProfile = { ...profile };
    updatedProfile.coins -= item.cost;

    if (item.id === 'streak_freeze') {
      updatedProfile.streakFreezes = (updatedProfile.streakFreezes || 0) + 1;
    } else if (item.id === 'multiplier_2') {
      updatedProfile.coinMultiplier = 2;
    } else if (item.id === 'multiplier_3') {
      updatedProfile.coinMultiplier = 3;
    }

    await fitnessService.saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setPurchasing(null);
  };

  if (loading) return null;

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Marketplace</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Equip yourself for greatness.</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
            <Coins className="text-yellow-500" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Balance</p>
            <p className="text-xl font-black text-slate-800">{profile?.coins.toLocaleString()}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {shopItems.map((item, idx) => {
          const canAfford = (profile?.coins || 0) >= item.cost;
          const isOwned = item.type === 'powerup' && profile?.coinMultiplier === (item.id === 'multiplier_2' ? 2 : 3);
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={item.id}
              className={`bg-white p-8 rounded-[40px] border border-slate-200 flex flex-col items-center text-center group hover:shadow-2xl transition-all relative overflow-hidden ${isOwned ? 'bg-slate-50 opacity-75' : ''}`}
            >
              <div className="mb-6 p-6 bg-slate-50 rounded-[32px] group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              
              <h3 className="text-xl font-black text-slate-800 mb-2">{item.name}</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8">{item.description}</p>
              
              <div className="mt-auto w-full">
                <button
                  disabled={!canAfford || isOwned || !!purchasing}
                  onClick={() => buyItem(item)}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isOwned ? 'bg-emerald-50 text-emerald-600' :
                    canAfford ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700' : 
                    'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isOwned ? (
                    <><Check size={16} /> Active</>
                  ) : purchasing === item.id ? (
                    'Processing...'
                  ) : (
                    <><ShoppingBag size={16} /> {item.cost} Coins</>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-16 bg-indigo-900 rounded-[48px] p-12 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <ShoppingBag size={200} />
        </div>
        <div className="relative z-10 max-w-sm">
          <h2 className="text-2xl font-black mb-4">Elite Membership Benefits</h2>
          <p className="text-indigo-200 text-sm font-medium leading-relaxed mb-6">Unlock exclusive items and priority 3x multiplier access with Elite status.</p>
          <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Upgrade Now</button>
        </div>
      </div>
    </div>
  );
}
