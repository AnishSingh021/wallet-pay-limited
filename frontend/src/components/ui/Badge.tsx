import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'accent';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-500/15 text-success-400 border-success-500/25',
  warning: 'bg-warning-500/15 text-warning-400 border-warning-500/25',
  danger: 'bg-danger-500/15 text-danger-400 border-danger-500/25',
  info: 'bg-info-500/15 text-info-400 border-info-500/25',
  neutral: 'bg-surface-300/40 text-surface-600 border-surface-300/50',
  primary: 'bg-primary-500/15 text-primary-400 border-primary-500/25',
  accent: 'bg-accent-500/15 text-accent-400 border-accent-500/25',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
  neutral: 'bg-surface-500',
  primary: 'bg-primary-500',
  accent: 'bg-accent-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ children, variant = 'neutral', size = 'md', dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}
