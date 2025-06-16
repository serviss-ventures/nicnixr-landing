"use client";

import React from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
}: TabNavigationProps) {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  const baseClasses = 'transition-all font-medium';

  const variantClasses = {
    default: {
      container: 'flex gap-1 rounded-lg bg-white/[0.03] p-1',
      tab: `${baseClasses} rounded-lg`,
      active: 'bg-white/10 text-white',
      inactive: 'text-white/60 hover:text-white hover:bg-white/[0.05]',
    },
    pills: {
      container: 'flex gap-2',
      tab: `${baseClasses} rounded-full`,
      active: 'bg-primary text-white',
      inactive: 'bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white',
    },
    underline: {
      container: 'flex border-b border-white/10',
      tab: `${baseClasses} relative pb-3`,
      active: 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary',
      inactive: 'text-white/60 hover:text-white',
    },
  };

  const styles = variantClasses[variant];

  return (
    <div className={`${styles.container} ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={`
              ${styles.tab}
              ${sizeClasses[size]}
              ${isActive ? styles.active : styles.inactive}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${variant === 'default' ? 'flex-1' : ''}
              flex items-center justify-center gap-2
            `}
          >
            {Icon && <Icon className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`
                ${size === 'sm' ? 'text-xs px-1' : size === 'lg' ? 'text-sm px-2' : 'text-xs px-1.5'}
                rounded-full bg-white/20 ml-1
              `}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
} 