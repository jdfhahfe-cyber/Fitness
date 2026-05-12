import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { fitnessService } from '../services/fitnessService';
import { Announcement } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Info, AlertTriangle, Check, X } from 'lucide-react';

interface NotificationsProps {
  user: User;
}

export default function Notifications({ user }: NotificationsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [user.uid]);

  const fetchAnnouncements = async () => {
    const data = await fitnessService.getAnnouncements(user.uid);
    const profile = await fitnessService.getUserProfile(user.uid);
    
    let displayList = [...data];

    // Artificial Notification if streak is at risk
    if (profile?.streakCount) {
      const lastWorkout = profile.lastWorkoutDate;
      const today = new Date().toISOString().split('T')[0];
      if (lastWorkout !== today) {
        displayList.unshift({
          id: 'streak-warning',
          title: '🔥 STREAK EMERGENCY',
          message: `Your ${profile.streakCount} day streak is about to flatline. Connect and log energy output immediately!`,
          type: 'ping',
          createdAt: new Date().toISOString()
        });
      }
    }

    if (displayList.length > announcements.length && announcements.length > 0) {
      setHasNew(true);
    }
    setAnnouncements(displayList);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ping': return <AlertTriangle className="text-orange-500" size={16} />;
      default: return <Info className="text-indigo-600" size={16} />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => { setIsOpen(!isOpen); setHasNew(false); }}
        className="w-full flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all relative"
      >
        <Bell size={20} className={hasNew ? 'text-indigo-600' : ''} />
        <span className="font-bold text-sm">Transmissions</span>
        {hasNew && (
          <span className="absolute right-4 top-4 w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-full left-0 w-80 bg-white rounded-[32px] border border-slate-200 shadow-2xl mb-4 z-50 overflow-hidden"
          >
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Inbox</h4>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {announcements.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell className="mx-auto text-slate-100 mb-4" size={40} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active pings</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {announcements.map((ann, idx) => (
                    <motion.div 
                      key={ann.id || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="mt-0.5">{getIcon(ann.type)}</div>
                        <h5 className="text-sm font-black text-slate-800">{ann.title}</h5>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pl-7">{ann.message}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase mt-3 pl-7">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
