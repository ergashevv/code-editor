'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { animate } from 'animejs';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export default function AnimatedButton({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  variant = 'primary',
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<any>(null);

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  useEffect(() => {
    if (buttonRef.current && !animationRef.current) {
      // Initial entrance animation
      animationRef.current = animate(
        buttonRef.current,
        {
          opacity: [0, 1],
          scale: [0.9, 1],
          translateY: [10, 0],
          duration: 400,
          easing: 'easeOutExpo',
        }
      );
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    // Ripple effect
    const rect = button.getBoundingClientRect();
    const x = e?.clientX ? e.clientX - rect.left : rect.width / 2;
    const y = e?.clientY ? e.clientY - rect.top : rect.height / 2;

    if (rippleRef.current) {
      rippleRef.current.style.left = `${x}px`;
      rippleRef.current.style.top = `${y}px`;
      
      // Ripple animation
      const ripple = { scale: 0, opacity: 1 };
      animate(
        ripple,
        {
          scale: [0, 4],
          opacity: [1, 0],
          duration: 600,
          easing: 'easeOutExpo',
          onRender: () => {
            if (rippleRef.current) {
              rippleRef.current.style.transform = `translate(-50%, -50%) scale(${ripple.scale})`;
              rippleRef.current.style.opacity = `${ripple.opacity}`;
            }
          }
        }
      );
    }

    // Button click animation
    const clickAnim = animate(
      button,
      {
        scale: [1, 0.95, 1],
        duration: 300,
        easing: 'easeOutExpo',
      }
    );

    // Restart entrance animation for feedback
    if (animationRef.current) {
      animationRef.current.restart();
    }

    onClick?.();
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden px-4 py-2 rounded-lg font-medium transition-colors ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span
        ref={rippleRef}
        className="absolute w-4 h-4 bg-white rounded-full pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scale(0)',
        }}
      />
    </button>
  );
}

