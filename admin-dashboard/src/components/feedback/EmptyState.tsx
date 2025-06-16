"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      icon: 'h-10 w-10',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12 px-6',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center text-center ${sizes.container} ${className}`}>
      {Icon && (
        <div className="mb-4 rounded-full bg-white/[0.05] p-3">
          <Icon className={`${sizes.icon} text-white/40`} />
        </div>
      )}
      
      <h3 className={`font-medium text-white ${sizes.title}`}>
        {title}
      </h3>
      
      {description && (
        <p className={`mt-2 max-w-sm text-white/60 ${sizes.description}`}>
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              size={size === 'lg' ? 'md' : 'sm'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              variant="ghost"
              size={size === 'lg' ? 'md' : 'sm'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 