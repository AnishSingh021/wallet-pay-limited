import React from 'react';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  className?: string;
  status?: 'online' | 'offline' | 'away';
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; status: string }> = {
  sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2 h-2 border' },
  md: { container: 'w-10 h-10', text: 'text-sm', status: 'w-2.5 h-2.5 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3 h-3 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-lg', status: 'w-3.5 h-3.5 border-2' },
};

const statusColors = {
  online: 'bg-success-500',
  offline: 'bg-surface-400',
  away: 'bg-warning-500',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    'from-primary-500 to-primary-700',
    'from-accent-500 to-accent-700',
    'from-danger-500 to-danger-600',
    'from-warning-500 to-warning-600',
    'from-info-500 to-info-600',
    'from-primary-400 to-accent-500',
  ];
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export function Avatar({ src, name, size = 'md', className = '', status }: AvatarProps) {
  const s = sizeClasses[size];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${s.container} rounded-full object-cover ring-2 ring-surface-300`}
        />
      ) : (
        <div
          className={`
            ${s.container} rounded-full
            bg-gradient-to-br ${getAvatarColor(name)}
            flex items-center justify-center
            ring-2 ring-surface-300
          `}
        >
          <span className={`${s.text} font-semibold text-white`}>
            {getInitials(name)}
          </span>
        </div>
      )}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 ${s.status}
            rounded-full border-surface-100
            ${statusColors[status]}
          `}
        />
      )}
    </div>
  );
}
