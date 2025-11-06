'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { animate } from 'animejs';

interface AnimatedNotificationProps {
  children: ReactNode;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
  autoClose?: number; // milliseconds
  className?: string;
}

export default function AnimatedNotification({
  children,
  type = 'info',
  onClose,
  autoClose = 5000,
  className = ''
}: AnimatedNotificationProps) {
  const notificationRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressAnimationRef = useRef<any>(null);

  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-white',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  useEffect(() => {
    if (notificationRef.current) {
      // Slide in from right
      animate(
        notificationRef.current,
        {
          translateX: [300, 0],
          opacity: [0, 1],
          scale: [0.8, 1],
          rotateZ: [-10, 0],
          duration: 600,
          easing: 'easeOutElastic(1, .6)',
        }
      );

      // Icon rotation
      if (iconRef.current) {
        animate(
          iconRef.current,
          {
            rotateZ: [0, 360],
            scale: [0, 1],
            duration: 500,
            delay: 200,
            easing: 'easeOutExpo',
          }
        );
      }

      // Progress bar
      if (progressRef.current && autoClose > 0) {
        const progressWidth = { value: 0 };
        const progressAnim = animate(
          progressWidth,
          {
            value: 100,
            duration: autoClose,
            easing: 'linear',
            onRender: () => {
              if (progressRef.current) {
                progressRef.current.style.width = `${progressWidth.value}%`;
              }
            }
          }
        );
        progressAnimationRef.current = progressAnim;
      }

      // Auto close
      if (autoClose > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoClose);

        return () => clearTimeout(timer);
      }
    }
  }, [autoClose]);

  const handleClose = () => {
    if (notificationRef.current) {
      if (progressAnimationRef.current) {
        progressAnimationRef.current.pause();
      }

      animate(
        notificationRef.current,
        {
          opacity: [1, 0],
          duration: 200,
          easing: 'easeOutExpo',
          onComplete: () => {
            onClose?.();
          }
        }
      );
    }
  };

  return (
    <div
      ref={notificationRef}
      className={`relative overflow-hidden rounded-lg shadow-xl p-4 flex items-center gap-3 min-w-[300px] max-w-[500px] ${typeClasses[type]} ${className}`}
      style={{ opacity: 0, transform: 'translateX(300px)' }}
    >
      {/* Progress bar */}
      {autoClose > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div
            ref={progressRef}
            className="h-full bg-white/50"
            style={{ width: '0%' }}
          />
        </div>
      )}

      <div ref={iconRef} className="flex-shrink-0 text-xl" style={{ transform: 'scale(0)' }}>
        {icons[type]}
      </div>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}

