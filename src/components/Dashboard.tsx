import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { fitnessService } from '../services/fitnessService';
import { Workout, WorkoutType } from '../types';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Flame, 
  Clock, 
  TrendingUp, 
  Target,
  ChevronRight,
  TrendingDown,
  Activity,
  Dumbbell
} from 'lucide-react';
import { formatDuration } from '../lib/utils';
import { format } from 'date-fns';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fitnessService.getWorkouts(user.uid);
      setWorkouts(data);
      setLoading(false);
    };
    fetchData();
  }, [user.uid]);

  const totalCalories = workouts.reduce((acc, curr) => acc + curr.calories, 0);
  const totalDuration = workouts.reduce((acc, curr) => acc + curr.duration, 0);
  const activityCount = workouts.length;

  // Chart data
  const chartData = workouts.slice(0, 7).reverse().map(w => ({
    date: format(new Date(w.timestamp), 'MMM dd'),
    calories: w.calories,
    duration: w.duration
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return null;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 md:p-10 max-w-7xl mx-auto space-y-10"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, {user.displayName?.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1 font-medium">Here's your fitness overview for today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Elite Member Status</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Flame className="text-orange-500" size={24} />}
          label="Calories Burned"
          value={totalCalories.toLocaleString()}
          unit="kcal"
          progress={82}
          theme="orange"
          variants={itemVariants}
        />
        <StatCard 
          icon={<Clock className="text-indigo-500" size={24} />}
          label="Active Duration"
          value={totalDuration.toString()}
          unit="min"
          progress={64}
          theme="indigo"
          variants={itemVariants}
        />
        <StatCard 
          icon={<Target className="text-emerald-500" size={24} />}
          label="Success Rate"
          value="95"
          unit="%"
          progress={95}
          theme="emerald"
          variants={itemVariants}
        />
      </div>

      {/* Highlight Training Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-indigo-900 rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden shadow-2xl shadow-indigo-200/50"
      >
        <div className="z-10 text-center md:text-left">
          <span className="bg-indigo-500/30 text-indigo-100 text-[10px] font-bold uppercase tracking-[2px] px-4 py-2 rounded-full border border-white/10">Current Training Plan</span>
          <h2 className="text-4xl md:text-5xl font-black mt-6 leading-tight">Advanced HIIT<br/>Power Cycle</h2>
          <p className="text-indigo-200 mt-4 max-w-sm font-medium leading-relaxed">Personalized 6-week endurance program tailored to your morning recovery rate.</p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
            <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-slate-50 transition-all active:scale-95">
              Start Session
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all">
              View Schedule
            </button>
          </div>
        </div>
        
        <div className="absolute right-[-40px] top-[-40px] opacity-10 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="20" fill="none"/></svg>
        </div>

        <div className="flex flex-col gap-4 mt-12 md:mt-0 z-10 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col gap-1 w-full md:w-48">
            <p className="text-xs opacity-70 font-medium">Progress</p>
            <p className="text-xl font-black">32% Complete</p>
            <div className="mt-2 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
               <div className="bg-white w-[32%] h-full"></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col gap-1 w-full md:w-48">
            <p className="text-xs opacity-70 font-medium">Next Milestone</p>
            <p className="text-xl font-black">Elite Stamina</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800">Performance Trends</h3>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '20px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontWeight: 700
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#4f46e5" 
                  fillOpacity={1} 
                  fill="url(#colorCalories)" 
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Workouts */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800">Activity History</h3>
            <button className="text-indigo-600 font-bold text-xs uppercase tracking-tighter hover:underline">View History</button>
          </div>
          <div className="space-y-4 flex-1">
            {workouts.slice(0, 5).map((workout) => (
              <div key={workout.id} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 transition-all shadow-sm">
                  <Activity size={20} className="text-slate-400 group-hover:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{workout.type}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(workout.timestamp), 'MMM dd, HH:mm')}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-indigo-600 text-sm">+{workout.calories}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">kcal</p>
                </div>
              </div>
            ))}
            {workouts.length === 0 && (
              <div className="text-center py-16">
                <Dumbbell className="mx-auto text-slate-200 mb-4" size={40} />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">No activities recorded<br/>Start your journey today</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, unit, progress, theme, variants }: any) {
  const themes: any = {
    orange: "bg-orange-500",
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500"
  };

  const bgThemes: any = {
    orange: "bg-orange-50",
    indigo: "bg-indigo-50",
    emerald: "bg-emerald-50"
  };

  return (
    <motion.div 
      variants={variants}
      className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-900/5 transition-all"
    >
      <div className={`p-4 rounded-2xl w-fit mb-6 ${bgThemes[theme]}`}>
        {icon}
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-baseline gap-2 mb-4">
        <h2 className="text-4xl font-black text-slate-800">{value}</h2>
        <span className="text-slate-400 text-sm font-bold">{unit}</span>
      </div>
      
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${themes[theme]}`}
        />
      </div>
      <p className="text-[10px] mt-3 font-bold text-slate-500">{progress}% of daily goal reached</p>
    </motion.div>
  );
}
