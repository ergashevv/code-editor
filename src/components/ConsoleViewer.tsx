'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';

export interface ConsoleLog {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

interface ConsoleViewerProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isMobile?: boolean;
}

export default function ConsoleViewer({ iframeRef, isMobile = false }: ConsoleViewerProps) {
  const { t } = useI18n();
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'warn'>('all');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't setup if iframe is not available
    if (!iframeRef.current) {
      return;
    }

    let retryCount = 0;
    const maxRetries = 10; // Max 1 second of retries
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    // Wait for iframe to be ready
    const setupConsole = () => {
      if (!iframeRef.current?.contentWindow) {
        retryCount++;
        if (retryCount < maxRetries) {
          // Retry after a short delay if iframe is not ready
          timeoutId = setTimeout(setupConsole, 100);
        }
        return;
      }

      const iframeWindow = iframeRef.current.contentWindow as any;
      
      // Check if console is already overridden
      if (iframeWindow.console?.__editorConsoleOverridden) {
        return;
      }

      if (!iframeWindow.console) {
        return;
      }

      const originalConsole = {
        log: iframeWindow.console.log.bind(iframeWindow.console),
        error: iframeWindow.console.error.bind(iframeWindow.console),
        warn: iframeWindow.console.warn.bind(iframeWindow.console),
        info: iframeWindow.console.info.bind(iframeWindow.console),
      };

      // Mark as overridden
      iframeWindow.console.__editorConsoleOverridden = true;

      function addLog(type: ConsoleLog['type'], args: any[]) {
        const message = args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');

        setLogs(prev => {
          // Limit logs to prevent memory issues
          const newLogs = [...prev, {
            type,
            message,
            timestamp: Date.now(),
          }];
          return newLogs.slice(-100); // Keep only last 100 logs
        });
      }

      // Override console methods
      if (iframeWindow.console) {
        iframeWindow.console.log = (...args: any[]) => {
          originalConsole.log(...args);
          addLog('log', args);
        };

        iframeWindow.console.error = (...args: any[]) => {
          originalConsole.error(...args);
          addLog('error', args);
        };

        iframeWindow.console.warn = (...args: any[]) => {
          originalConsole.warn(...args);
          addLog('warn', args);
        };

        iframeWindow.console.info = (...args: any[]) => {
          originalConsole.info(...args);
          addLog('info', args);
        };
      }

      // Capture errors
      const errorHandler = (event: ErrorEvent) => {
        addLog('error', [`Error: ${event.message}`, event.filename, event.lineno]);
      };

      const rejectionHandler = (event: PromiseRejectionEvent) => {
        addLog('error', [`Unhandled Promise Rejection: ${event.reason}`]);
      };

      iframeWindow.addEventListener('error', errorHandler);
      iframeWindow.addEventListener('unhandledrejection', rejectionHandler);

      // Store cleanup function
      iframeWindow.__consoleCleanup = () => {
        if (iframeWindow.console?.__editorConsoleOverridden) {
          iframeWindow.console.log = originalConsole.log;
          iframeWindow.console.error = originalConsole.error;
          iframeWindow.console.warn = originalConsole.warn;
          iframeWindow.console.info = originalConsole.info;
          delete iframeWindow.console.__editorConsoleOverridden;
        }
        
        iframeWindow.removeEventListener('error', errorHandler);
        iframeWindow.removeEventListener('unhandledrejection', rejectionHandler);
      };
    };

    setupConsole();

    return () => {
      // Clear timeout if still pending
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Cleanup on unmount
      if (iframeRef.current?.contentWindow) {
        const iframeWindow = iframeRef.current.contentWindow as any;
        const cleanup = iframeWindow.__consoleCleanup;
        if (cleanup) {
          cleanup();
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  const clearConsole = () => {
    setLogs([]);
  };

  const getLogIcon = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  const getLogColor = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warn':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">{t('console')}</span>
          <span className="text-gray-500 dark:text-gray-400">({filteredLogs.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded text-xs ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('log')}
              className={`px-2 py-1 rounded text-xs ${filter === 'log' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Log
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-1 rounded text-xs ${filter === 'error' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Error
            </button>
            <button
              onClick={() => setFilter('warn')}
              className={`px-2 py-1 rounded text-xs ${filter === 'warn' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Warn
            </button>
          </div>
          <button
            onClick={clearConsole}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs"
          >
            {t('clearConsole')}
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono">
        <AnimatePresence>
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {t('noLogs')}
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <motion.div
                key={`${log.timestamp}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-2 ${getLogColor(log.type)}`}
              >
                <span>{getLogIcon(log.type)}</span>
                <span className="flex-1 break-all">{log.message}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

