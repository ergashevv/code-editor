'use client';

import { useRef, useEffect } from 'react';
import { animate } from 'animejs';

interface AnimatedProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AnimatedProgressBar({
  value,
  max = 100,
  color = 'blue',
  showLabel = true,
  height = 'md',
  className = ''
}: AnimatedProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
  };

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  };

  useEffect(() => {
    if (containerRef.current) {
      // Container entrance
      animate(
        containerRef.current,
        {
          opacity: [0, 1],
          scale: [0.95, 1],
          duration: 400,
          easing: 'easeOutExpo',
        }
      );
    }
  }, []);

  useEffect(() => {
    if (progressRef.current) {
      const percentage = Math.min((value / max) * 100, 100);
      const progressWidth = { value: 0 };

      // Progress animation
      animate(
        progressWidth,
        {
          value: percentage,
          duration: 1500,
          easing: 'easeOutExpo',
          onRender: () => {
            if (progressRef.current) {
              progressRef.current.style.width = `${progressWidth.value}%`;
            }
          }
        }
      );

      // Label counting animation
      if (showLabel && labelRef.current) {
        const labelValue = { value: 0 };
        animate(
          labelValue,
          {
            value: percentage,
            duration: 1500,
            easing: 'easeOutExpo',
            onRender: () => {
              if (labelRef.current) {
                labelRef.current.textContent = `${Math.round(labelValue.value)}%`;
              }
            }
          }
        );
      }
    }
  }, [value, max, showLabel]);

  return (
    <div ref={containerRef} className={`w-full ${className}`} style={{ opacity: 0 }}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span ref={labelRef} className="text-xs font-medium text-gray-700 dark:text-gray-300">0%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          ref={progressRef}
          className={`${colorClasses[color]} rounded-full transition-all duration-300 ${heightClasses[height]}`}
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
}

