"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '../ui/Button';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  showFilters?: boolean;
  onFilterClick?: () => void;
  debounceMs?: number;
  defaultValue?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  showFilters = false,
  onFilterClick,
  debounceMs = 300,
  defaultValue = '',
  size = 'md',
  className = '',
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const sizeClasses = {
    sm: {
      container: 'h-8',
      input: 'text-sm pl-8 pr-8',
      icon: 'h-3.5 w-3.5',
    },
    md: {
      container: 'h-10',
      input: 'text-sm pl-10 pr-10',
      icon: 'h-4 w-4',
    },
    lg: {
      container: 'h-12',
      input: 'text-base pl-12 pr-12',
      icon: 'h-5 w-5',
    },
  };

  const sizes = sizeClasses[size];

  // Debounced search
  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    setTimeoutId(newTimeoutId);

    return () => {
      if (newTimeoutId) {
        clearTimeout(newTimeoutId);
      }
    };
  }, [value]);

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className={`relative flex-1 ${sizes.container}`}>
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${sizes.icon} text-white/40`} />
        
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full h-full ${sizes.input}
            bg-white/[0.03] border border-white/10 rounded-lg
            text-white placeholder-white/40
            focus:outline-none focus:border-primary/50 focus:bg-white/[0.05]
            transition-all duration-200
          `}
        />
        
        {value && (
          <button
            onClick={handleClear}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2
              text-white/40 hover:text-white transition-colors
            `}
          >
            <X className={sizes.icon} />
          </button>
        )}
      </div>
      
      {showFilters && (
        <Button
          variant="ghost"
          size={size === 'lg' ? 'md' : 'sm'}
          onClick={onFilterClick}
          className="flex-shrink-0"
        >
          <Filter className={`mr-2 ${sizes.icon}`} />
          Filters
        </Button>
      )}
    </div>
  );
} 