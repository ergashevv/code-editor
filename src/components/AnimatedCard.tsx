'use client';

import { useRef, useEffect, ReactNode, HTMLAttributes } from 'react';
import { animate } from 'animejs';

interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  delay?: number;
}

export default function AnimatedCard({ 
  children, 
  hover = true,
  delay = 0,
  className = '',
  ...props 
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      // Entrance animation
      setTimeout(() => {
        animate(
          cardRef.current!,
          {
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.95, 1],
            duration: 600,
            delay: delay,
            easing: 'easeOutExpo',
          }
        );
      }, delay);

      if (hover) {
        const card = cardRef.current;
        const glow = glowRef.current;

        // Hover enter
        const handleMouseEnter = () => {
          animate(
            card,
            {
              scale: [1, 1.05],
              translateY: [0, -8],
              rotateZ: [0, 1],
              duration: 400,
              easing: 'easeOutExpo',
            }
          );

          if (glow) {
            const glowIntensity = { value: 0 };
            animate(
              glowIntensity,
              {
                value: 30,
                duration: 400,
                easing: 'easeOutExpo',
                onRender: () => {
                  glow.style.boxShadow = `0 10px ${glowIntensity.value}px rgba(59, 130, 246, 0.4)`;
                }
              }
            );
          }
        };

        // Hover leave
        const handleMouseLeave = () => {
          animate(
            card,
            {
              scale: [1.05, 1],
              translateY: [-8, 0],
              rotateZ: [1, 0],
              duration: 400,
              easing: 'easeOutExpo',
            }
          );

          if (glow) {
            const glowIntensity = { value: 30 };
            animate(
              glowIntensity,
              {
                value: 0,
                duration: 400,
                easing: 'easeOutExpo',
                onRender: () => {
                  glow.style.boxShadow = `0 10px ${glowIntensity.value}px rgba(59, 130, 246, 0.4)`;
                }
              }
            );
          }
        };

        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          card.removeEventListener('mouseenter', handleMouseEnter);
          card.removeEventListener('mouseleave', handleMouseLeave);
        };
      }
    }
  }, [hover, delay]);

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{ opacity: 0 }}
      {...props}
    >
      <div 
        ref={glowRef}
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{ boxShadow: '0 10px 0px rgba(59, 130, 246, 0.4)' }}
      />
      {children}
    </div>
  );
}

