import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-white/5 bg-background sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search notes, quizzes, or chats..." 
            className="w-full bg-surface border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-full transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-main">{user?.name || 'Lucky Joshi'}</p>
            <p className="text-xs text-text-muted">Pro Plan</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 hover:scale-105 active:scale-95 transition-all">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
