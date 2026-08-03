import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Toggle({ checked, onChange, label, disabled = false, size = 'md', className = '' }: ToggleProps) {
  const sizeConfig = {
    sm: { track: 'w-8 h-5', thumb: 'w-3.5 h-3.5', translate: 'translate-x-3.5' },
    md: { track: 'w-11 h-6', thumb: 'w-4.5 h-4.5', translate: 'translate-x-5' },
  };

  const s = sizeConfig[size];

  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex shrink-0 ${s.track}
          rounded-full transition-colors duration-200 ease-smooth
          focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2
          cursor-pointer
          ${checked ? 'bg-primary-600' : 'bg-surface-300'}
        `}
      >
        <span
          className={`
            inline-block ${s.thumb}
            rounded-full bg-white shadow-sm
            transform transition-transform duration-200 ease-smooth
            translate-y-[3px] translate-x-[3px]
            ${checked ? s.translate : 'translate-x-[3px]'}
          `}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-surface-700">{label}</span>
      )}
    </label>
  );
}
