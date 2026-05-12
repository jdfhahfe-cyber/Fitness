import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { fitnessService } from '../services/fitnessService';
import { aiService } from '../services/aiService';
import { TrainingPlan, Workout } from '../types';
import { motion } from 'motion/react';
import { Sparkles, Loader2, Calendar, ClipboardCheck, Dumbbell } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TrainingPlanViewProps {
  user: User;
}

export default function TrainingPlanView({ user }: TrainingPlanViewProps) {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [user.uid]);

  const fetchPlans = async () => {
    setLoading(true);
    const data = await fitnessService.getTrainingPlans(user.uid);
    setPlans(data);
    setLoading(false);
  };

  const generateNewPlan = async () => {
    setGenerating(true);
    try {
      const workouts = await fitnessService.getWorkouts(user.uid);
      const profile = await fitnessService.getUserProfile(user.uid) || { 
        uid: user.uid, 
        name: user.displayName || 'User', 
        email: user.email || '', 
        createdAt: new Date().toISOString() 
      };

      const newContent = await aiService.generateTrainingPlan(profile, workouts);
      
      const newPlan: TrainingPlan = {
        userId: user.uid,
        content: newContent,
        startDate: new Date().toISOString(),
        status: 'active'
      };

      await fitnessService.saveTrainingPlan(newPlan);
      await fetchPlans();
    } catch (error) {
      console.error("Plan Generation Error:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Training Plans</h1>
          <p className="text-slate-500 mt-1 font-medium">Personalized guidance based on your activity and goals.</p>
        </div>
        <button 
          onClick={generateNewPlan}
          disabled={generating}
          className="bg-indigo-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-900 transition-all disabled:opacity-50 shadow-2xl shadow-indigo-100 uppercase text-xs tracking-widest"
        >
          {generating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="text-yellow-400" />}
          {generating ? 'Crafting your plan...' : 'Optimize My Training'}
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-200" />
        </div>
      ) : (
        <div className="space-y-8">
          {plans.map((plan, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={plan.id}
              className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all"
            >
              <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center shadow-sm border border-slate-100">
                    <Calendar className="text-indigo-600" size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">Elite Training Routine</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Initialized {new Date(plan.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-full border border-emerald-100">
                  {plan.status}
                </span>
              </div>
              
              <div className="p-10 md:p-14 prose prose-indigo max-w-none prose-h1:text-3xl prose-h1:font-black prose-h2:text-2xl prose-h2:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                <div className="markdown-body">
                   <ReactMarkdown>{plan.content}</ReactMarkdown>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">
                  <ClipboardCheck size={20} />
                  Archive Routine
                </button>
              </div>
            </motion.div>
          ))}
          
          {plans.length === 0 && !generating && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[48px] py-40 text-center">
              <Dumbbell className="mx-auto text-slate-100 mb-8" size={80} />
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Active Strategies</h3>
              <p className="text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">Let our proprietary AI engines analyze your performance metrics to craft a dominant training routine.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
