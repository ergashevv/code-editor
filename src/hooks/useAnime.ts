'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface AnimeOptions {
  targets: string | HTMLElement | NodeList | null;
  [key: string]: any;
}

export function useAnime(options: AnimeOptions, deps: any[] = []) {
  const animationRef = useRef<anime.AnimeInstance | null>(null);

  useEffect(() => {
    if (options.targets) {
      animationRef.current = anime(options);
    }

    return () => {
      if (animationRef.current) {
        anime.remove(options.targets);
      }
    };
  }, deps);

  return animationRef.current;
}

export function animateOnMount(selector: string, options: Partial<AnimeOptions> = {}) {
  useEffect(() => {
    const defaultOptions: AnimeOptions = {
      targets: selector,
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
      easing: 'easeOutExpo',
      ...options,
    };

    const animation = anime(defaultOptions);

    return () => {
      anime.remove(selector);
    };
  }, [selector]);
}

export function animateStagger(selector: string, options: Partial<AnimeOptions> = {}) {
  useEffect(() => {
    const defaultOptions: AnimeOptions = {
      targets: selector,
      opacity: [0, 1],
      translateY: [50, 0],
      scale: [0.8, 1],
      duration: 600,
      delay: anime.stagger(100),
      easing: 'easeOutExpo',
      ...options,
    };

    const animation = anime(defaultOptions);

    return () => {
      anime.remove(selector);
    };
  }, [selector]);
}

export function animateProgressBar(selector: string, progress: number, duration: number = 1500) {
  useEffect(() => {
    anime({
      targets: selector,
      width: `${progress}%`,
      duration,
      easing: 'easeOutExpo',
    });
  }, [selector, progress, duration]);
}

export function animateCounter(selector: string, value: number, duration: number = 2000) {
  useEffect(() => {
    anime({
      targets: { value: 0 },
      value,
      duration,
      easing: 'easeOutExpo',
      update: function(anim) {
        const element = document.querySelector(selector);
        if (element) {
          element.textContent = Math.floor(anim.animatables[0].target.value).toLocaleString();
        }
      },
    });
  }, [selector, value, duration]);
}

