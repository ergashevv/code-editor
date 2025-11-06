'use client';

import { useRef, useEffect, InputHTMLAttributes } from 'react';
import { animate } from 'animejs';

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

export default function AnimatedInput({ 
  label, 
  error, 
  success,
  className = '',
  ...props 
}: AnimatedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      
      // Focus animation
      const handleFocus = () => {
        // Input scale and glow
        animate(
          input,
          {
            scale: [1, 1.02],
            duration: 300,
            easing: 'easeOutExpo',
          }
        );

        // Label animation
        if (labelRef.current) {
          animate(
            labelRef.current,
            {
              translateY: [0, -5],
              scale: [1, 0.9],
              duration: 300,
              easing: 'easeOutExpo',
            }
          );
        }

        // Glow effect
        if (glowRef.current) {
          const glow = { value: 0 };
          animate(
            glow,
            {
              value: 20,
              duration: 500,
              easing: 'easeOutExpo',
              onRender: () => {
                if (glowRef.current) {
                  glowRef.current.style.boxShadow = `0 0 ${glow.value}px rgba(59, 130, 246, 0.5)`;
                }
              }
            }
          );
        }
      };

      // Blur animation
      const handleBlur = () => {
        animate(
          input,
          {
            scale: [1.02, 1],
            duration: 300,
            easing: 'easeOutExpo',
          }
        );

        if (labelRef.current) {
          animate(
            labelRef.current,
            {
              translateY: [-5, 0],
              scale: [0.9, 1],
              duration: 300,
              easing: 'easeOutExpo',
            }
          );
        }

        if (glowRef.current) {
          const glow = { value: 20 };
          animate(
            glow,
            {
              value: 0,
              duration: 300,
              easing: 'easeOutExpo',
              onRender: () => {
                if (glowRef.current) {
                  glowRef.current.style.boxShadow = `0 0 ${glow.value}px rgba(59, 130, 246, 0.5)`;
                }
              }
            }
          );
        }
      };

      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);

      return () => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  // Error animation
  useEffect(() => {
    if (error && errorRef.current) {
      animate(
        errorRef.current,
        {
          opacity: [0, 1],
          translateX: [-20, 0],
          scale: [0.9, 1],
          duration: 400,
          easing: 'easeOutExpo',
        }
      );
    }
  }, [error]);

  // Success animation
  useEffect(() => {
    if (success && inputRef.current) {
      const successGlow = { value: 0 };
      animate(
        successGlow,
        {
          value: [0, 30, 0],
          duration: 1000,
          easing: 'easeOutExpo',
          onRender: () => {
            if (inputRef.current) {
              inputRef.current.style.boxShadow = `0 0 ${successGlow.value}px rgba(34, 197, 94, 0.5)`;
            }
          }
        }
      );
    }
  }, [success]);

  return (
    <div className="w-full">
      {label && (
        <label 
          ref={labelRef}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none transition-all ${
            error 
              ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
              : success
              ? 'border-green-500 focus:ring-2 focus:ring-green-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          } ${className}`}
          {...props}
        />
        <div 
          ref={glowRef}
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ boxShadow: '0 0 0px rgba(59, 130, 246, 0.5)' }}
        />
      </div>
      {error && (
        <div 
          ref={errorRef}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      )}
    </div>
  );
}

