import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { fitnessService } from '../services/fitnessService';
import { UserProfile, Announcement } from '../types';
import { motion } from 'motion/react';
import { ShieldAlert, Users, Send, Ban, DollarSign, Bell, Activity } from 'lucide-react';

interface AdminPanelProps {
  user: User;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'broadcast' | 'ping'>('broadcast');
  const [targetUserId, setTargetUserId] = useState('');

  const [adminKey, setAdminKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized]);

  const fetchUsers = async () => {
    const data = await fitnessService.getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === 'rat12321') {
      setIsAuthorized(true);
    } else {
      alert('Unauthorized access. Invalid Admin Secret.');
    }
  };

  const handleAction = async (uid: string, action: string, value?: any) => {
    const userToUpdate = users.find(u => u.uid === uid);
    if (!userToUpdate) return;

    const updated = { ...userToUpdate };
    if (action === 'ban') updated.isBanned = !updated.isBanned;
    if (action === 'giveCoins') updated.coins += (value || 1000);
    if (action === 'promote') updated.league = 'Super';

    await fitnessService.saveUserProfile(updated);
    fetchUsers();
  };

  const sendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const ann: Announcement = {
      title: annTitle,
      message: annMessage,
      type: annType,
      targetUserId: annType === 'ping' ? targetUserId : undefined,
      createdAt: new Date().toISOString()
    };
    await fitnessService.createAnnouncement(ann);
    setAnnTitle('');
    setAnnMessage('');
    alert('Announcement sent successfully!');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[48px] border border-slate-200 p-12 text-center shadow-2xl shadow-indigo-900/10"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Restricted Area</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Confirm Administrative Key</p>
          
          <form onSubmit={handleAdminAuth} className="space-y-4">
            <input 
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center font-black text-slate-800 focus:ring-2 focus:ring-red-500 uppercase tracking-widest"
              placeholder="SECRET KEY"
            />
            <button 
              type="submit"
              className="w-full bg-indigo-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all uppercase tracking-widest text-xs"
            >
              Verify Identity
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Activity className="animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Control Panel</h1>
        <p className="text-slate-500 mt-1 font-medium italic">Administrative authorization confirmed.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Users size={24} className="text-indigo-600" />
              Athlete Registry
            </h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{users.length} Total Users</span>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Wealth</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.uid} className={`hover:bg-slate-50/50 transition-colors ${u.isBanned ? 'bg-red-50/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${u.isBanned ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {u.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-800 font-black">
                          <DollarSign size={14} className="text-yellow-500" />
                          {u.coins.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setAnnType('ping'); setTargetUserId(u.uid); setAnnTitle('Admin Update'); }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                            title="Ping User"
                          >
                            <Bell size={16} />
                          </button>
                          <button 
                            onClick={() => handleAction(u.uid, 'giveCoins')}
                            className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600 transition-colors"
                            title="Grant Coins"
                          >
                            <DollarSign size={16} />
                          </button>
                          <button 
                            onClick={() => handleAction(u.uid, 'ban')}
                            className={`p-2 rounded-lg transition-colors ${u.isBanned ? 'bg-emerald-600 text-white' : 'hover:bg-red-50 text-red-600'}`}
                            title={u.isBanned ? 'Unban' : 'Ban'}
                          >
                            <Ban size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Console / Communications */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Send size={24} className="text-indigo-600" />
            Global Transmissions
          </h2>

          <div className="bg-indigo-900 rounded-[40px] p-8 text-white shadow-2xl shadow-indigo-900/40">
            <form onSubmit={sendAnnouncement} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 px-1">Message Type</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setAnnType('broadcast')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${annType === 'broadcast' ? 'bg-white text-indigo-900 shadow-xl' : 'bg-indigo-800 text-indigo-300'}`}
                  >
                    Broadcast
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAnnType('ping')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${annType === 'ping' ? 'bg-white text-indigo-900 shadow-xl' : 'bg-indigo-800 text-indigo-300'}`}
                  >
                    Direct Ping
                  </button>
                </div>
              </div>

              {annType === 'ping' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 px-1">Target UID</label>
                  <input 
                    type="text"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full bg-indigo-800/50 border border-indigo-700/50 rounded-2xl p-4 text-white font-bold"
                    placeholder="Enter User ID"
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 px-1">Title</label>
                <input 
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full bg-indigo-800/50 border border-indigo-700/50 rounded-2xl p-4 text-white font-bold"
                  placeholder="System Update..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 px-1">Message Body</label>
                <textarea 
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full bg-indigo-800/50 border border-indigo-700/50 rounded-2xl p-4 text-white font-bold"
                  rows={4}
                  placeholder="Your message to the community..."
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-white text-indigo-900 font-black py-4 rounded-2xl shadow-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
              >
                Execute Transmission
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-sm">
             <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest">System Status</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                   <span>Global Streak Avg</span>
                   <span className="text-slate-800">14.2 Days</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                   <span>Active Powerups</span>
                   <span className="text-slate-800">32 users</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
