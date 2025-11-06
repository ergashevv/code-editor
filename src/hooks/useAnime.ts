'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface AnimeOptions {
  targets: string | HTMLElement | NodeList | null;
  [key: string]: any;
}

export function useAnime(options: AnimeOptions, deps: any[] = []) {
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (options.targets) {
      animationRef.current = animate(options.targets, options);
    }

    return () => {
      if (animationRef.current && options.targets) {
        // Cleanup if needed
      }
    };
  }, deps);

  return animationRef.current;
}

// Bu funksiyalar React Hook qoidalariga mos kelmaydi, shuning uchun o'chirildi
// Agar kerak bo'lsa, component ichida to'g'ridan-to'g'ri ishlatilishi kerak

