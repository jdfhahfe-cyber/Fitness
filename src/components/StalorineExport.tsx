import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { fitnessService } from '../services/fitnessService';
import { motion } from 'motion/react';
import { FileCode, Download, Copy, Check, Info } from 'lucide-react';
import { calculateCalories } from '../lib/utils';

interface StalorineExportProps {
  user: User;
}

export default function StalorineExport({ user }: StalorineExportProps) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  const generateExport = async () => {
    setGenerating(true);
    try {
      const workouts = await fitnessService.getWorkouts(user.uid);
      const profile = await fitnessService.getUserProfile(user.uid);
      
      const totalCals = workouts.reduce((s, w) => s + w.calories, 0);
      const totalMins = workouts.reduce((s, w) => s + w.duration, 0);
      
      const workoutRows = workouts.slice(0, 20).map(w => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${w.type}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${w.duration}m</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${w.calories}kcal</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 11px;">${new Date(w.timestamp).toLocaleDateString()}</td>
        </tr>
      `).join('');

      const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aura Fitness - Stalorine Report for ${user.displayName}</title>
    <style>
        body { font-family: -apple-system, system-ui, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px; }
        .card { background: white; border-radius: 40px; box-shadow: 0 20px 40px rgba(79, 70, 229, 0.05); max-width: 600px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #312e81; color: white; padding: 60px 40px; text-align: center; }
        .stats { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
        .stat-item { padding: 40px 20px; text-align: center; border-right: 1px solid #f1f5f9; }
        .stat-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 8px; }
        .stat-value { font-size: 32px; font-weight: 900; color: #1e1b4b; }
        .content { padding: 50px 40px; }
        table { width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 14px; }
        th { text-align: left; background: #f8fafc; padding: 15px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
        td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #334155; }
        .footer { padding: 30px; text-align: center; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; background: #f8fafc; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px;">AURA FITNESS</h1>
            <p style="margin: 15px 0 0; opacity: 0.7; font-weight: 600; font-size: 14px; text-transform: uppercase; tracking: 2px;">Proprietary Performance Metrics</p>
        </div>
        <div class="stats">
            <div class="stat-item">
                <div class="stat-label">Energy Output</div>
                <div class="stat-value">${totalCals} <span style="font-size: 14px; opacity: 0.5;">KCAL</span></div>
            </div>
            <div class="stat-item" style="border-right: none;">
                <div class="stat-label">Active Time</div>
                <div class="stat-value">${Math.floor(totalMins / 60)}H ${totalMins % 60}M</div>
            </div>
        </div>
        <div class="content">
            <h3 style="margin: 0; font-weight: 900; font-size: 20px; color: #1e1b4b;">Historical Data</h3>
            <table>
                <thead>
                    <tr>
                        <th>Activity</th>
                        <th>Duration</th>
                        <th>Burn</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${workoutRows}
                </tbody>
            </table>
        </div>
        <div class="footer">
            Generated via Stalorine Integration &bull; ${new Date().toLocaleDateString()}
        </div>
    </div>
</body>
</html>
      `;
      setHtmlContent(template.trim());
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-stalorine-report-${user.displayName?.toLowerCase().replace(/\s/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Consolidated Export</h1>
        <p className="text-slate-500 mt-1 font-medium italic">Generate your standalone performance intelligence report.</p>
      </header>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm p-10 md:p-16 overflow-hidden relative group hover:shadow-2xl transition-all">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-12">
          <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <FileCode size={40} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Master Intelligence Report</h2>
            <p className="text-slate-500 leading-relaxed max-w-lg font-medium">
              Perfect for sharing with coaches, doctors, or keeping a permanent offline record of your activity. This contains all your recent workouts and key stats in a single portable file, secured via Stalorine protocols.
            </p>
          </div>
        </div>

        {!htmlContent ? (
          <button 
            onClick={generateExport}
            disabled={generating}
            className="w-full bg-indigo-900 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-indigo-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-[4px]"
          >
            {generating ? <Loader2 className="animate-spin" size={24} /> : <FileCode size={24} />}
            {generating ? 'Consolidating Datastreams...' : 'Initialize Export'}
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 shadow-inner">
               <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3 text-xs font-black text-indigo-900 uppercase tracking-widest">
                   <Info size={18} className="text-indigo-600" />
                   Intelligence Package Ready
                 </div>
                 <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">approx 12KB (UNCOMPRESSED)</div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={copyToClipboard}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 font-black py-5 rounded-3xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                  >
                    {copied ? <Check className="text-emerald-500" size={20} /> : <Copy size={20} />}
                    {copied ? 'Copied' : 'Copy Source'}
                  </button>
                  <button 
                    onClick={downloadFile}
                    className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-3xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 text-xs uppercase tracking-widest"
                  >
                    <Download size={20} />
                    Download Package
                  </button>
               </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => setHtmlContent('')}
                className="text-slate-400 text-[10px] font-black uppercase tracking-[3px] hover:text-indigo-600 mt-4"
              >
                Reset / Regenerate
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-16 flex flex-wrap items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[3px] justify-center opacity-70">
        <span>Self-Contained</span>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        <span>Hardware Optimized</span>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        <span>Offline Guaranteed</span>
      </div>
    </div>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} style={{ width: size, height: size }} />;
}
