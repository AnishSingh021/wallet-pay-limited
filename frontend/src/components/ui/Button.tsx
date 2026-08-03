import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-700 shadow-md hover:shadow-glow-primary',
  secondary:
    'bg-surface-200 text-surface-900 border border-surface-300 hover:bg-surface-250 active:bg-surface-300',
  ghost:
    'bg-transparent text-surface-700 hover:bg-surface-150 active:bg-surface-200',
  danger:
    'bg-danger-600 text-white hover:bg-danger-500 active:bg-danger-600 shadow-md',
  accent:
    'bg-accent-600 text-white hover:bg-accent-500 active:bg-accent-700 shadow-md hover:shadow-glow-accent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-md',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 ease-smooth
        focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        cursor-pointer select-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !isLoading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
