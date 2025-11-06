'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { animate } from 'animejs';

interface AnimatedBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  pulse?: boolean;
  className?: string;
}

export default function AnimatedBadge({ 
  children, 
  variant = 'primary',
  pulse = false,
  className = ''
}: AnimatedBadgeProps) {
  const badgeRef = useRef<HTMLSpanElement>(null);

  const variantClasses = {
    primary: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
    info: 'bg-gray-500 text-white',
  };

  useEffect(() => {
    if (badgeRef.current) {
      // Entrance animation - rotateZ o'chirildi, faqat fade in va scale
      animate(
        badgeRef.current,
        {
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 400,
          easing: 'easeOutExpo',
        }
      );

      // Pulse animation o'chirildi - aylanib ketmaydi
    }
  }, []);

  return (
    <span
      ref={badgeRef}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      style={{ opacity: 0 }}
    >
      {children}
    </span>
  );
}

