import React from 'react';

export type DataStatus = 'mock' | 'partial' | 'config' | 'ready';

interface DataStatusIndicatorProps {
  status: DataStatus;
  className?: string;
}

const statusConfig = {
  mock: {
    color: 'red',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    textColor: 'text-red-400',
    dotColor: 'bg-red-500',
    emoji: '🟥',
    label: '[MOCK] Using mock data'
  },
  partial: {
    color: 'orange',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    textColor: 'text-orange-400',
    dotColor: 'bg-orange-500',
    emoji: '🟧',
    label: '[PARTIAL] Partially integrated'
  },
  config: {
    color: 'yellow',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    textColor: 'text-yellow-400',
    dotColor: 'bg-yellow-500',
    emoji: '🟨',
    label: '[CONFIG] Needs configuration'
  },
  ready: {
    color: 'green',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    textColor: 'text-green-400',
    dotColor: 'bg-green-500',
    emoji: '🟩',
    label: '[READY] Production ready'
  }
};

export function DataStatusIndicator({ status, className = '' }: DataStatusIndicatorProps) {
  const config = statusConfig[status];
  
  return (
    <div className={`flex items-center gap-2 rounded-lg ${config.bgColor} border ${config.borderColor} px-4 py-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${config.dotColor} ${status !== 'ready' ? 'animate-pulse' : ''}`} />
      <span className={`text-sm ${config.textColor}`}>
        {config.emoji} {config.label}
      </span>
    </div>
  );
}

// Mini version for inline use
export function DataStatusBadge({ status }: { status: DataStatus }) {
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${config.textColor}`}>
      {config.emoji} {status.toUpperCase()}
    </span>
  );
} 