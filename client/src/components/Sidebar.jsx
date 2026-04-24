import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MessageSquare, 
  FileText, 
  PenTool, 
  LayoutDashboard, 
  Settings,
  ChevronLeft, 
  ChevronRight,
  Zap,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import UsageBar from './UsageBar';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare, label: 'Chat',        path: '/chat' },
  { icon: FileText,       label: 'Notes',      path: '/notes' },
  { icon: PenTool,        label: 'Quiz',       path: '/quiz' },
  { icon: Settings,       label: 'Settings',   path: '/settings' },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();

  // ── Collapsed ──────────────────────────────────────────────────────────────
  if (isCollapsed) {
    return (
      <aside className="w-14 h-screen border-r border-white/5 bg-surface/30 backdrop-blur-xl flex flex-col items-center py-4 gap-3 sticky top-0 transition-all duration-300">
        {/* Logo icon */}
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <Zap className="text-white w-4 h-4 fill-current" />
        </div>

        <div className="w-8 border-t border-white/10 my-1" />

        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) => cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all border",
                isActive
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-white/5 border-transparent text-text-muted hover:text-primary hover:bg-primary/10"
              )}
            >
              <item.icon className="w-4 h-4" />
            </NavLink>
          ))}
        </nav>

        {/* Usage indicator */}
        <UsageBar collapsed />

        {/* Logout icon */}
        <button
          onClick={logout}
          title="Logout"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-transparent text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Expand button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2.5 rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 transition-all border-t border-white/5 w-full flex items-center justify-center"
          title="Expand"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  // ── Expanded ───────────────────────────────────────────────────────────────
  return (
    <aside className="w-72 h-screen border-r border-white/5 bg-surface/30 backdrop-blur-xl flex flex-col sticky top-0 transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <Zap className="text-white w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">Mentixo AI</span>
          </div>
          {/* Collapse button — icon only */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
            title="Collapse"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Label pill */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl py-2 px-3">
          <LayoutDashboard className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            Navigation
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group relative border border-transparent",
              isActive
                ? "bg-primary/10 border-primary/30 text-white"
                : "hover:bg-white/5 text-text-muted hover:text-white"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-primary" : "group-hover:text-primary"
                )} />
                <span className="text-xs font-semibold group-hover:text-primary transition-colors">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group border border-transparent text-text-muted hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-semibold">Logout</span>
        </button>
      </div>

      {/* Usage bar */}
      <UsageBar />
    </aside>
  );
};

export default Sidebar;
