'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface SuccessDisplayProps {
  message: string;
  onDismiss?: () => void;
  autoClose?: number; // milliseconds
}

export default function SuccessDisplay({
  message,
  onDismiss,
  autoClose = 3000
}: SuccessDisplayProps) {
  const successRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (successRef.current) {
      // Slide in from right
      animate(
        successRef.current,
        {
          translateX: [300, 0],
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 500,
          easing: 'easeOutElastic(1, .6)',
        }
      );

      // Checkmark animation
      if (checkmarkRef.current) {
        const pathLength = checkmarkRef.current.getTotalLength();
        checkmarkRef.current.style.strokeDasharray = `${pathLength}`;
        checkmarkRef.current.style.strokeDashoffset = `${pathLength}`;

        animate(
          { value: pathLength },
          {
            value: 0,
            duration: 600,
            delay: 200,
            easing: 'easeOutExpo',
            onRender: (anim) => {
              if (checkmarkRef.current) {
                checkmarkRef.current.style.strokeDashoffset = `${anim.value}`;
              }
            }
          }
        );
      }

      // Icon bounce
      if (iconRef.current) {
        animate(
          iconRef.current,
          {
            scale: [0, 1.2, 1],
            rotateZ: [0, 360],
            duration: 600,
            delay: 200,
            easing: 'easeOutElastic(1, .6)',
          }
        );
      }
    }

    // Auto close
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleDismiss = () => {
    if (successRef.current) {
      animate(
        successRef.current,
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

  return (
    <div
      ref={successRef}
      className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 rounded-lg p-4 shadow-lg"
      style={{ opacity: 0, transform: 'translateX(300px)' }}
    >
      <div className="flex items-start gap-3">
        <div ref={iconRef} className="flex-shrink-0" style={{ transform: 'scale(0)' }}>
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              ref={checkmarkRef}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-green-800 dark:text-green-300 font-semibold mb-1">
            Success
          </h3>
          <p className="text-green-700 dark:text-green-400 text-sm">
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

