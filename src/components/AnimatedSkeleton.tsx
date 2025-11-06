'use client';

import { useRef, useEffect } from 'react';
import { animate } from 'animejs';

interface AnimatedSkeletonProps {
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
}

export default function AnimatedSkeleton({
  width = '100%',
  height = '1rem',
  rounded = true,
  className = ''
}: AnimatedSkeletonProps) {
  const skeletonRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (skeletonRef.current) {
      // Fade in
      animate(
        skeletonRef.current,
        {
          opacity: [0, 1],
          duration: 400,
          easing: 'easeOutExpo',
        }
      );
    }

    // Shimmer animation
    if (shimmerRef.current) {
      const shimmer = { value: -100 };
      animate(
        shimmer,
        {
          value: [100, -100],
          duration: 2000,
          easing: 'linear',
          loop: true,
          onRender: () => {
            if (shimmerRef.current) {
              shimmerRef.current.style.transform = `translateX(${shimmer.value}%)`;
            }
          }
        }
      );
    }
  }, []);

  return (
    <div
      ref={skeletonRef}
      className={`relative overflow-hidden bg-gray-200 dark:bg-gray-700 ${rounded ? 'rounded' : ''} ${className}`}
      style={{ 
        width, 
        height,
        opacity: 0
      }}
    >
      <div
        ref={shimmerRef}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{ transform: 'translateX(-100%)' }}
      />
    </div>
  );
}

