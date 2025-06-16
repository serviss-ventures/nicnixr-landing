"use client";

import React from 'react';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';
type StatusSize = 'xs' | 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: StatusSize;
  dot?: boolean;
  className?: string;
}

// Common status mappings
const defaultVariantMap: Record<string, StatusVariant> = {
  active: 'success',
  completed: 'success',
  success: 'success',
  online: 'success',
  approved: 'success',
  
  pending: 'warning',
  processing: 'warning',
  warning: 'warning',
  review: 'warning',
  
  failed: 'error',
  error: 'error',
  rejected: 'error',
  offline: 'error',
  critical: 'error',
  
  paused: 'info',
  draft: 'info',
  scheduled: 'info',
  
  inactive: 'default',
  disabled: 'default',
  archived: 'default',
};

export function StatusBadge({
  status,
  variant,
  size = 'sm',
  dot = false,
  className = '',
}: StatusBadgeProps) {
  const finalVariant = variant || defaultVariantMap[status.toLowerCase()] || 'default';

  const variantClasses = {
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    error: 'bg-destructive/20 text-destructive border-destructive/30',
    info: 'bg-primary/20 text-primary border-primary/30',
    primary: 'bg-primary/20 text-primary border-primary/30',
    default: 'bg-white/10 text-white/60 border-white/20',
  };

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const dotSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        border ${variantClasses[finalVariant]} ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span 
          className={`rounded-full ${dotSizes[size]} ${
            finalVariant === 'success' ? 'bg-success' :
            finalVariant === 'warning' ? 'bg-warning' :
            finalVariant === 'error' ? 'bg-destructive' :
            finalVariant === 'info' || finalVariant === 'primary' ? 'bg-primary' :
            'bg-white/60'
          }`}
        />
      )}
      <span className="capitalize">{status}</span>
    </span>
  );
} 