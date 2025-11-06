'use client';

import { useRef, useEffect } from 'react';
import { animate } from 'animejs';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}: AnimatedCounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (counterRef.current) {
      const startValue = 0;
      const counter = { value: startValue };

      // Counter animation
      animate(
        counter,
        {
          value: value,
          duration: duration,
          easing: 'easeOutExpo',
          onRender: () => {
            if (counterRef.current) {
              const formatted = decimals > 0 
                ? counter.value.toFixed(decimals)
                : Math.round(counter.value).toString();
              counterRef.current.textContent = `${prefix}${formatted}${suffix}`;
            }
          }
        }
      );

      // Entrance animation
      animate(
        counterRef.current,
        {
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 400,
          easing: 'easeOutExpo',
        }
      );
    }
  }, [value, duration, prefix, suffix, decimals]);

  return (
    <span
      ref={counterRef}
      className={className}
      style={{ opacity: 0 }}
    >
      {prefix}0{suffix}
    </span>
  );
}

