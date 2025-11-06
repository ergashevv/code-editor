'use client';

import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';

interface ErrorDisplayProps {
  error: string | Error;
  onDismiss?: () => void;
  showDetails?: boolean;
  autoClose?: number; // milliseconds
}

export default function ErrorDisplay({
  error,
  onDismiss,
  showDetails = false,
  autoClose
}: ErrorDisplayProps) {
  const errorRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const errorMessage = error instanceof Error ? error.message : error;

  useEffect(() => {
    if (errorRef.current) {
      // Slide in from top
      animate(
        errorRef.current,
        {
          translateY: [-50, 0],
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 500,
          easing: 'easeOutElastic(1, .6)',
        }
      );

      // Icon shake animation
      if (iconRef.current) {
        animate(
          iconRef.current,
          {
            rotateZ: [0, -10, 10, -10, 10, 0],
            duration: 500,
            delay: 200,
            easing: 'easeOutExpo',
          }
        );
      }
    }

    // Auto close
    if (autoClose && autoClose > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    if (errorRef.current) {
      animate(
        errorRef.current,
        {
          opacity: [1, 0],
          duration: 200,
          easing: 'easeOutExpo',
          onComplete: () => {
            onDismiss?.();
          }
        }
      );
    } else {
      onDismiss?.();
    }
  };

  const toggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      ref={errorRef}
      className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 rounded-lg p-4 shadow-lg"
      style={{ opacity: 0, transform: 'translateY(-50px)' }}
    >
      <div className="flex items-start gap-3">
        <div ref={iconRef} className="flex-shrink-0 text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-red-800 dark:text-red-300 font-semibold mb-1">
            Error
          </h3>
          <p className="text-red-700 dark:text-red-400 text-sm">
            {errorMessage}
          </p>
          {showDetails && error instanceof Error && error.stack && (
            <button
              onClick={toggleDetails}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              {isExpanded ? 'Hide' : 'Show'} details
            </button>
          )}
          {isExpanded && error instanceof Error && error.stack && (
            <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

