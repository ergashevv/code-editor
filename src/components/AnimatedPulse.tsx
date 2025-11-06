'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { animate } from 'animejs';

interface AnimatedPulseProps {
  children: ReactNode;
  duration?: number;
  intensity?: number;
  className?: string;
}

export default function AnimatedPulse({
  children,
  duration = 2000,
  intensity = 0.1,
  className = ''
}: AnimatedPulseProps) {
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pulseRef.current) {
      const pulse = { value: 1 };

      // Pulse animation
      animate(
        pulse,
        {
          value: [1, 1 + intensity, 1],
          duration: duration,
          easing: 'easeInOutQuad',
          loop: true,
          onRender: () => {
            if (pulseRef.current) {
              pulseRef.current.style.transform = `scale(${pulse.value})`;
            }
          }
        }
      );
    }
  }, [duration, intensity]);

  return (
    <div ref={pulseRef} className={className}>
      {children}
    </div>
  );
}

