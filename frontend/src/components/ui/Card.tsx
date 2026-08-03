import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  glow = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-surface-100 border border-surface-300 rounded-xl shadow-sm
        transition-all duration-300 ease-smooth
        ${hover ? 'hover:bg-surface-150 hover:border-surface-400 hover:shadow-md hover:-translate-y-0.5' : ''}
        ${glow ? 'hover:shadow-glow-primary' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold text-surface-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-surface-600 mt-1 ${className}`}>
      {children}
    </p>
  );
}
