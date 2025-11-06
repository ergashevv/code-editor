import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text, 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinnerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const container = fullScreen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-8';

  // Anime.js animations for loading spinner
  useEffect(() => {
    if (containerRef.current) {
      animate(
        containerRef.current,
        {
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 400,
          easing: 'easeOutExpo',
        }
      );
    }

    if (spinnerRef.current) {
      // Pulse animation
      const pulse = { value: 1 };
      animate(
        pulse,
        {
          value: [1, 1.2, 1],
          duration: 1500,
          easing: 'easeInOutQuad',
          loop: true,
          onRender: () => {
            if (spinnerRef.current) {
              spinnerRef.current.style.transform = `scale(${pulse.value})`;
            }
          }
        }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className={container}>
      <motion.div
        ref={spinnerRef}
        className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {text && (
        <motion.p
          className="mt-4 text-gray-600 dark:text-gray-400 text-sm font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

