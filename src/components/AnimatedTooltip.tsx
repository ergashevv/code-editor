'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import { animate } from 'animejs';

interface AnimatedTooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function AnimatedTooltip({
  children,
  content,
  position = 'top',
  delay = 200
}: AnimatedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  let timeoutId: NodeJS.Timeout;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
  };

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      // Tooltip entrance
      animate(
        tooltipRef.current,
        {
          opacity: [0, 1],
          scale: [0.8, 1],
          translateY: position === 'top' ? [10, 0] : position === 'bottom' ? [-10, 0] : [0, 0],
          translateX: position === 'left' ? [10, 0] : position === 'right' ? [-10, 0] : [0, 0],
          duration: 300,
          easing: 'easeOutExpo',
        }
      );
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
    if (tooltipRef.current) {
      animate(
        tooltipRef.current,
        {
          opacity: [1, 0],
          scale: [1, 0.8],
          duration: 200,
          easing: 'easeInExpo',
          onComplete: () => {
            setIsVisible(false);
          }
        }
      );
    } else {
      setIsVisible(false);
    }
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap ${positionClasses[position]}`}
          style={{ opacity: 0 }}
        >
          {content}
          <div className={`absolute w-0 h-0 border-4 border-transparent ${arrows[position]}`} />
        </div>
      )}
    </div>
  );
}

