import React from 'react';
import { FileX, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-200 flex items-center justify-center mb-5">
        {icon || <FileX className="w-8 h-8 text-surface-500" />}
      </div>
      <h3 className="text-lg font-semibold text-surface-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-surface-500 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-danger-500/15 flex items-center justify-center mb-5">
        <AlertTriangle className="w-8 h-8 text-danger-500" />
      </div>
      <h3 className="text-lg font-semibold text-surface-800 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-surface-500 max-w-sm mb-6">{message}</p>
      )}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} icon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
      )}
    </div>
  );
}
