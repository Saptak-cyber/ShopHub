import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

export default function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-800 text-zinc-200',
    success: 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
    error: 'bg-red-900/50 text-red-400 border-red-800',
    warning: 'bg-amber-900/50 text-amber-400 border-amber-800',
    info: 'bg-blue-900/50 text-blue-400 border-blue-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
