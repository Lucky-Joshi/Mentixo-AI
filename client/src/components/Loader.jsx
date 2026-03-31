import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const Loader = ({ className, size = "md" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizes[size])} />
    </div>
  );
};

export const Skeleton = ({ className }) => {
  return (
    <div className={cn("animate-pulse bg-white/5 rounded-lg", className)}></div>
  );
};

export default Loader;
