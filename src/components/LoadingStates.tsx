'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface LoadingStatesProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  progress?: number; // 0-100 for progress type
}

export default function LoadingStates({
  type = 'spinner',
  size = 'md',
  message,
  progress = 0
}: LoadingStatesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  useEffect(() => {
    if (containerRef.current) {
      animate(
        containerRef.current,
        {
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 300,
          easing: 'easeOutExpo',
        }
      );
    }

    // Spinner animation
    if (spinnerRef.current && type === 'spinner') {
      const spinner = { rotate: 0 };
      animate(
        spinner,
        {
          rotate: 360,
          duration: 1000,
          easing: 'linear',
          loop: true,
          onRender: () => {
            if (spinnerRef.current) {
              spinnerRef.current.style.transform = `rotate(${spinner.rotate}deg)`;
            }
          }
        }
      );
    }

    // Dots animation
    if (dotsRef.current && type === 'dots') {
      const dots = dotsRef.current.querySelectorAll('.dot');
      animate(
        dots,
        {
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
          duration: 1200,
          delay: (el: any, i: number) => i * 200,
          easing: 'easeInOutQuad',
          loop: true,
        }
      );
    }

    // Pulse animation
    if (pulseRef.current && type === 'pulse') {
      const pulse = { scale: 1, opacity: 1 };
      animate(
        pulse,
        {
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
          duration: 1500,
          easing: 'easeInOutQuad',
          loop: true,
          onRender: () => {
            if (pulseRef.current) {
              pulseRef.current.style.transform = `scale(${pulse.scale})`;
              pulseRef.current.style.opacity = `${pulse.opacity}`;
            }
          }
        }
      );
    }

    // Progress animation
    if (progressRef.current && type === 'progress') {
      const progressWidth = { value: 0 };
      animate(
        progressWidth,
        {
          value: progress,
          duration: 1000,
          easing: 'easeOutExpo',
          onRender: () => {
            if (progressRef.current) {
              progressRef.current.style.width = `${progressWidth.value}%`;
            }
          }
        }
      );
    }
  }, [type, progress]);

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center gap-4 p-8" style={{ opacity: 0 }}>
      {type === 'spinner' && (
        <div ref={spinnerRef} className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full`} />
      )}

      {type === 'dots' && (
        <div ref={dotsRef} className="flex gap-2">
          <div className="dot w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full" />
          <div className="dot w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full" />
          <div className="dot w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full" />
        </div>
      )}

      {type === 'pulse' && (
        <div
          ref={pulseRef}
          className={`${sizeClasses[size]} bg-blue-600 dark:bg-blue-400 rounded-full`}
        />
      )}

      {type === 'skeleton' && (
        <div className="w-full space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: '100%' }} />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: '80%' }} />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: '60%' }} />
        </div>
      )}

      {type === 'progress' && (
        <div className="w-full max-w-xs">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              ref={progressRef}
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
              style={{ width: '0%' }}
            />
          </div>
          {progress > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              {Math.round(progress)}%
            </p>
          )}
        </div>
      )}

      {message && (
        <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
      )}
    </div>
  );
}

