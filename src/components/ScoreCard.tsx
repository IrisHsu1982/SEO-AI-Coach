import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ScoreCardProps {
  title: string;
  score: number;
  max?: number;
  description?: string;
  className?: string;
}

export function ScoreCard({ title, score, max = 100, description, className }: ScoreCardProps) {
  const percentage = (score / max) * 100;
  
  const getColor = (p: number) => {
    if (p >= 80) return 'text-emerald-500';
    if (p >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getBgColor = (p: number) => {
    if (p >= 80) return 'bg-emerald-500';
    if (p >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className={cn("p-4 rounded-xl bg-white border border-slate-200 shadow-sm", className)}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
        <span className={cn("text-2xl font-bold font-mono", getColor(percentage))}>
          {score}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn("h-full rounded-full", getBgColor(percentage))}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      {description && (
        <p className="mt-2 text-xs text-slate-400 leading-relaxed italic">
          {description}
        </p>
      )}
    </div>
  );
}
