import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUsage } from '../context/UsageContext';

const UsageBar = ({ collapsed = false }) => {
  const { remaining, maxDaily } = useUsage();
  const percentage = Math.max(0, (remaining / maxDaily) * 100);
  const isLow = remaining <= 5;
  const isDepleted = remaining <= 0;

  if (collapsed) {
    return (
      <div
        title={`${remaining} messages left today`}
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all",
          isDepleted
            ? "bg-red-500/10 border-red-500/30 text-red-500"
            : isLow
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
              : "bg-primary/10 border-primary/30 text-primary"
        )}
      >
        {remaining}
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-white/5">
      <div className={cn(
        "p-3.5 rounded-2xl border transition-all",
        isDepleted
          ? "bg-red-500/5 border-red-500/15"
          : isLow
            ? "bg-amber-500/5 border-amber-500/15"
            : "bg-primary/5 border-primary/10"
      )}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            {isDepleted ? (
              <AlertTriangle className="w-3 h-3 text-red-500" />
            ) : (
              <Zap className={cn("w-3 h-3 fill-current", isLow ? "text-amber-500" : "text-primary")} />
            )}
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isDepleted ? "text-red-500" : isLow ? "text-amber-500" : "text-primary"
            )}>
              Daily Usage
            </span>
          </div>
          <span className={cn(
            "text-[10px] font-black tabular-nums",
            isDepleted ? "text-red-500" : isLow ? "text-amber-500" : "text-text-muted"
          )}>
            {remaining}/{maxDaily}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isDepleted
                ? "bg-red-500"
                : isLow
                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                  : "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-[10px] text-text-muted mt-2 font-medium leading-relaxed">
          {isDepleted
            ? "Limit reached. Upgrade for unlimited access."
            : `${remaining} message${remaining !== 1 ? 's' : ''} left today`}
        </p>
      </div>
    </div>
  );
};

export default UsageBar;
