import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  Award,
  ArrowUpRight,
  Clock,
  Zap,
  Loader2,
  Calendar,
  PenTool
} from 'lucide-react';
import { cn } from '../lib/utils';
import { dashboardService } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardService.getDashboard();
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        setError('Failed to load real-time analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsConfig = [
    { 
      label: 'Chat Sessions', 
      value: data?.totalChats ?? '0', 
      icon: MessageSquare, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Saved Notes', 
      value: data?.totalNotes ?? '0', 
      icon: BookOpen, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10' 
    },
    { 
      label: 'Quiz Attempts', 
      value: data?.totalQuizzes ?? '0', 
      icon: PenTool, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10' 
    },
    { 
      label: 'Average Score', 
      value: `${data?.averageScore ?? '0'}%`, 
      icon: Award, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
  ];

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Zap className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse fill-current" />
        </div>
        <p className="text-text-muted font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Learning Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Learning Hub</h1>
          <p className="text-text-muted mt-2 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Insights for {new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-surface border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
             <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Real-time Network Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsConfig.map((stat) => (
          <div key={stat.label} className="p-8 rounded-[2rem] bg-surface/50 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-[1.25rem] shadow-inner", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <div>
              <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-4xl font-black mt-2 text-white tabular-nums tracking-tighter">{stat.value}</p>
            </div>
            {/* Hover Decor */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Recent Activity</h2>
              <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">View All history</button>
           </div>
           
           <div className="space-y-4">
              {data?.recentActivity?.length > 0 ? (
                data.recentActivity.map((activity, i) => (
                  <div 
                    key={i} 
                    className="p-6 rounded-3xl bg-surface/30 border border-white/5 hover:bg-surface/50 transition-all flex items-center justify-between group cursor-pointer shadow-lg"
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                        activity.type === 'chat' ? 'bg-blue-500/10 text-blue-500' : 
                        activity.type === 'note' ? 'bg-purple-500/10 text-purple-500' : 
                        'bg-orange-500/10 text-orange-500'
                      )}>
                        {activity.type === 'chat' ? <MessageSquare className="w-5 h-5" /> : 
                         activity.type === 'note' ? <BookOpen className="w-5 h-5" /> : 
                         <PenTool className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">{activity.title}</h3>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em] mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {new Date(activity.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          {activity.score !== undefined && (
                            <span className="ml-2 text-emerald-500 font-black">Score: {activity.score}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-text-muted opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))
              ) : (
                <div className="p-12 rounded-[2.5rem] bg-surface/20 border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Zap className="w-8 h-8 text-text-muted opacity-30" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No activity yet</h3>
                  <p className="text-sm text-text-muted max-w-xs mt-2 font-medium">Start using Mentixo AI to track your learning progress and unlock insights.</p>
                </div>
              )}
           </div>
        </div>

        {/* Learning Efficiency Summary */}
        <div className="space-y-8">
           <h2 className="text-2xl font-black text-white tracking-tight">Intelligence</h2>
           
           <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-primary/5 to-surface border border-primary/20 relative overflow-hidden group shadow-2xl">
              <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-48 h-48 text-primary" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <div className="text-center">
                    <span className="text-4xl font-black text-white tabular-nums">{data?.averageScore ?? '0'}</span>
                    <span className="text-lg font-bold text-primary">%</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Knowledge Index</h3>
                <p className="text-xs text-text-muted leading-relaxed font-medium">
                  Based on your quiz performance and concept mastery across all sessions.
                </p>
                
                <div className="w-full mt-8 p-6 rounded-3xl bg-surface/50 border border-white/5">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Confidence Level</span>
                      <span className="text-xs font-bold text-primary">High</span>
                   </div>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: '85%' }}></div>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
