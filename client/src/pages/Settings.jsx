import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, LogOut, Shield, Bell, Moon, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user, logout } = useAuth();

  const preferences = [
    { label: 'Notifications', description: 'Manage your email alerts', icon: Bell, status: 'Enabled' },
    { label: 'Dark Mode', description: 'Classic Mentixo theme', icon: Moon, status: 'Default' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        <p className="text-text-muted mt-1">View your profile and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Profile Information — read only */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-white/5 rounded-3xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-white">Profile Information</h2>
            </div>

            <div className="p-6 space-y-6">
              {[
                { label: 'Full Name', value: user?.name || '—', icon: User },
                { label: 'Email Address', value: user?.email || '—', icon: Mail },
              ].map((field) => (
                <div key={field.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{field.label}</p>
                    <p className="text-white font-medium mt-1">{field.value}</p>
                  </div>
                  {/* Edit disabled — show lock badge instead */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted bg-white/5 px-3 py-2 rounded-lg border border-white/5 cursor-not-allowed select-none">
                    <Lock className="w-3 h-3" />
                    Locked
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface border border-white/5 rounded-3xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-white">Preferences</h2>
            </div>

            <div className="p-6 space-y-4">
              {preferences.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-background border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-surface border border-white/5">
                      <item.icon className="w-5 h-5 text-text-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-xs text-text-muted">{item.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded-md text-text-muted uppercase tracking-tight">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Right column — Free tier info + logout */}
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <h3 className="text-xl font-bold text-white mb-4 relative z-10">Your Plan</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Current Plan</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md uppercase">
                  Free Tier
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                You are on the free tier. All core features — chat, notes, and quizzes — are available at no cost.
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Logout from Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
