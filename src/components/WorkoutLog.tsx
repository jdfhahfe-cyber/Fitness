import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { fitnessService } from '../services/fitnessService';
import { Workout, WorkoutType } from '../types';
import { motion } from 'motion/react';
import { Plus, X, Activity, Clock, Flame, MapPin, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';
import { calculateCalories, cn } from '../lib/utils';

interface WorkoutLogProps {
  user: User;
}

export default function WorkoutLog({ user }: WorkoutLogProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [type, setType] = useState<WorkoutType>(WorkoutType.RUNNING);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [distance, setDistance] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, [user.uid]);

  const fetchWorkouts = async () => {
    setLoading(true);
    const data = await fitnessService.getWorkouts(user.uid);
    setWorkouts(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const calories = calculateCalories(type, duration, intensity);
    const coinsEarned = Math.floor(calories / 10);
    
    const newWorkout: Workout = {
      userId: user.uid,
      type,
      duration,
      intensity,
      calories,
      coinsEarned,
      distance: distance > 0 ? distance : undefined,
      notes,
      timestamp: new Date().toISOString()
    };

    await fitnessService.logWorkout(newWorkout);
    await fetchWorkouts();
    setSubmitting(false);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setType(WorkoutType.RUNNING);
    setDuration(30);
    setIntensity('medium');
    setDistance(0);
    setNotes('');
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Workout Logs</h1>
          <p className="text-slate-500 mt-1 font-medium">Track every movement and reach your goals.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus size={20} />
          New Activity
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Activity className="animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {workouts.map((workout, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={workout.id}
              className="bg-white p-6 rounded-[32px] border border-slate-200 flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-xl hover:shadow-indigo-900/5 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center shadow-sm">
                <Activity className="text-indigo-600" size={28} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-black text-slate-800">{workout.type}</h3>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-3 py-1 rounded-full",
                    workout.intensity === 'high' ? "bg-rose-50 text-rose-600" :
                    workout.intensity === 'medium' ? "bg-orange-50 text-orange-600" :
                    "bg-emerald-50 text-emerald-600"
                  )}>
                    {workout.intensity}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-500" /> {workout.duration} mins</span>
                  <span className="flex items-center gap-1.5"><Flame size={14} className="text-orange-500" /> {workout.calories} kcal</span>
                  {workout.distance && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500" /> {workout.distance} km</span>}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <p className="text-sm font-black text-slate-800">{format(new Date(workout.timestamp), 'EEEE, MMM dd')}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(workout.timestamp), 'HH:mm')}</p>
              </div>
            </motion.div>
          ))}
          {workouts.length === 0 && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] py-32 text-center">
              <Activity className="mx-auto text-slate-200 mb-6" size={64} />
              <p className="text-slate-400 font-bold uppercase tracking-widest">Keep moving! Log your first activity.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white w-full max-w-xl rounded-[48px] p-12 relative shadow-2xl overflow-hidden"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-black text-slate-900 mb-10">Record Activity</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Activity Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as WorkoutType)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                  >
                    {Object.values(WorkoutType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Duration (mins)</label>
                  <input 
                    type="number" 
                    value={duration} 
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Intensity Level</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map(i => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => setIntensity(i as any)}
                        className={cn(
                          "flex-1 py-4 px-2 rounded-2xl text-[10px] font-black uppercase transition-all tracking-wider",
                          intensity === i ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Distance (km)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={distance} 
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Additional Notes</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                  rows={2}
                  placeholder="How was your session?"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all text-lg uppercase tracking-widest"
              >
                {submitting ? 'Recording...' : 'Finalize Log'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
