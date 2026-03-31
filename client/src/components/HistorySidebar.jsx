import React, { useState } from 'react';
import { 
  MessageSquare, 
  FileText, 
  PenTool, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  Plus,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

const HistorySidebar = ({ 
  items = [], 
  activeId = null, 
  onSelect = () => {}, 
  onNew = () => {},
  type = 'chat',
  isLoading = false 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'chat': return MessageSquare;
      case 'note': return FileText;
      case 'quiz': return PenTool;
      default: return Clock;
    }
  };

  const Icon = getIcon();

  // --- Collapsed view ---
  if (isCollapsed) {
    return (
      <div className="w-14 h-full border-r border-white/5 bg-surface/30 backdrop-blur-xl flex flex-col items-center py-4 gap-3 transition-all duration-300">
        {/* Expand button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2.5 rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
          title="Expand history"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* New item button */}
        <button
          onClick={onNew}
          className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all border border-primary/20"
          title={`New ${type}`}
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="w-8 border-t border-white/10 my-1" />

        {/* Icon indicators for each item */}
        <div className="flex-1 overflow-y-auto w-full flex flex-col items-center gap-2 custom-scrollbar">
          {items.slice(0, 10).map((item) => (
            <button
              key={item._id}
              onClick={() => onSelect(item)}
              title={item.title || item.topic || `Untitled ${type}`}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all border",
                activeId === item._id
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-white/5 border-transparent text-text-muted hover:text-primary hover:bg-primary/10"
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Expanded view ---
  return (
    <div className="w-72 h-full border-r border-white/5 bg-surface/30 backdrop-blur-xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            History
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={onNew}
              className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all border border-primary/20"
              title={`New ${type}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {/* Collapse button — icon only */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
              title="Collapse"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl py-2 px-3">
          <Icon className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            Recent {type}s
          </span>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <Icon className="w-7 h-7 text-text-muted opacity-20 mb-3" />
            <p className="text-xs text-text-muted font-medium">
              No history yet.<br />Start your first {type}!
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map((item) => (
              <button
                key={item._id}
                onClick={() => onSelect(item)}
                className={cn(
                  "w-full text-left p-3.5 rounded-2xl transition-all group relative border border-transparent",
                  activeId === item._id
                    ? "bg-primary/10 border-primary/30 text-white"
                    : "hover:bg-white/5 text-text-muted hover:text-text-main"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                      {item.title || item.topic || `Untitled ${type}`}
                    </p>
                    <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-widest">
                      {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    "w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform",
                    activeId === item._id ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                  )} />
                </div>

                {activeId === item._id && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer tip */}
      <div className="p-4 border-t border-white/5 bg-white/5">
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Zap className="w-3 h-3 fill-current" />
            Pro Tip
          </p>
          <p className="text-[10px] text-text-muted leading-relaxed font-medium">
            Your history is synced across devices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;
