'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { SearchBar } from '../forms/SearchBar';
import { LogEntry, LogFilter, LogStats } from '@/types/logs';
import { formatDistanceToNow } from 'date-fns';

const LOG_LEVELS = [
  { value: 'error', label: 'Errors', color: 'bg-red-500' },
  { value: 'warn', label: 'Warnings', color: 'bg-yellow-500' },
  { value: 'info', label: 'Info', color: 'bg-blue-500' },
  { value: 'debug', label: 'Debug', color: 'bg-gray-500' },
];

export const MobileAppLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [filter, setFilter] = useState<LogFilter>({});
  const [search, setSearch] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['error', 'warn']);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLevels.length > 0) {
        params.append('level', selectedLevels.join(','));
      }
      if (search) {
        params.append('search', search);
      }
      params.append('limit', '200');

      const response = await fetch(`/api/mobile/logs?${params}`);
      const data = await response.json();
      
      setLogs(data.logs || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLevels, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchLogs, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const clearLogs = async () => {
    if (!confirm('Are you sure you want to clear all logs?')) return;
    
    try {
      await fetch('/api/mobile/logs', { method: 'DELETE' });
      await fetchLogs();
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-500/10';
      case 'warn': return 'text-yellow-400 bg-yellow-500/10';
      case 'info': return 'text-blue-400 bg-blue-500/10';
      case 'debug': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Mobile App Logs</h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time logs from your mobile app
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-gray-700 text-gray-300 border border-gray-600'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors border border-red-500/30"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-white">{stats.totalLogs}</div>
            <div className="text-sm text-gray-400">Total Logs</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-red-400">{stats.errorCount}</div>
            <div className="text-sm text-gray-400">Errors</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.warnCount}</div>
            <div className="text-sm text-gray-400">Warnings</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-400">{stats.uniqueUsers}</div>
            <div className="text-sm text-gray-400">Unique Users</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">iOS:</span>
                <span className="text-white">{stats.platforms.ios}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Android:</span>
                <span className="text-white">{stats.platforms.android}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Web:</span>
                <span className="text-white">{stats.platforms.web}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Log Levels</label>
            <div className="flex gap-2">
              {LOG_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => {
                    if (selectedLevels.includes(level.value)) {
                      setSelectedLevels(selectedLevels.filter(l => l !== level.value));
                    } else {
                      setSelectedLevels([...selectedLevels, level.value]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedLevels.includes(level.value)
                      ? `${level.color} text-white`
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Search</label>
            <SearchBar
              defaultValue={search}
              onSearch={setSearch}
              placeholder="Search logs..."
            />
          </div>
        </div>
      </Card>

      {/* Logs */}
      <Card className="p-0 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {isLoading && logs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No logs found</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => toggleLogExpansion(log.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLogLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="font-mono truncate">{log.message}</span>
                        {log.context?.screen && (
                          <span className="text-xs text-gray-500">
                            @ {log.context.screen}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{formatDistanceToNow(new Date(log.timestamp))} ago</span>
                        {log.userId && <span>User: {log.userId.slice(0, 8)}...</span>}
                        {log.platform && <span>{log.platform}</span>}
                      </div>
                      
                      {/* Expanded content */}
                      {expandedLogs.has(log.id) && (
                        <div className="mt-3 space-y-2">
                          {log.data && (
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Data:</div>
                              <pre className="text-xs bg-gray-900 rounded p-2 overflow-x-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.stackTrace && (
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Stack Trace:</div>
                              <pre className="text-xs bg-gray-900 rounded p-2 overflow-x-auto text-red-300">
                                {log.stackTrace}
                              </pre>
                            </div>
                          )}
                          {log.context && Object.keys(log.context).length > 0 && (
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Context:</div>
                              <pre className="text-xs bg-gray-900 rounded p-2 overflow-x-auto">
                                {JSON.stringify(log.context, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 space-y-0.5">
                            <div>Session: {log.sessionId}</div>
                            <div>Timestamp: {new Date(log.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}; 