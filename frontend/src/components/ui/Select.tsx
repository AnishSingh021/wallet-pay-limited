import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-3.5 text-base',
};

export function Select({
  label,
  options,
  error,
  placeholder = 'Select...',
  size = 'md',
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full appearance-none rounded-lg
            bg-surface-200 text-surface-900
            border border-surface-300
            transition-all duration-200 ease-smooth
            hover:border-surface-400
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none
            pr-10 cursor-pointer
            ${error ? 'border-danger-500' : ''}
            ${sizeClasses[size]}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-danger-500 mt-0.5">{error}</p>}
    </div>
  );
}
