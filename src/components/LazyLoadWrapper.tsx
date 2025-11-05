import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  animationType?: 'fade' | 'slide' | 'scale' | 'slideUp';
}

export default function LazyLoadWrapper({ 
  children, 
  delay = 0,
  className = '',
  animationType = 'fade'
}: LazyLoadWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const animationVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    slide: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
    },
    slideUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
    },
  };

  const variant = animationVariants[animationType];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={variant.initial}
      animate={isVisible ? variant.animate : variant.initial}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

