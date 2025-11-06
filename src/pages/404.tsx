import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { animate } from 'animejs';
import AnimatedButton from '../components/AnimatedButton';

export default function NotFoundPage() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      // Container fade in
      animate(
        containerRef.current,
        {
          opacity: [0, 1],
          duration: 500,
          easing: 'easeOutExpo',
        }
      );
    }

    // 404 number animation
    if (numberRef.current) {
      animate(
        numberRef.current,
        {
          scale: [0, 1.2, 1],
          rotateZ: [0, 360],
          opacity: [0, 1],
          duration: 1000,
          easing: 'easeOutElastic(1, .6)',
        }
      );
    }

    // Text animation
    if (textRef.current) {
      setTimeout(() => {
        animate(
          textRef.current!,
          {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutExpo',
          }
        );
      }, 300);
    }

    // Button animation
    if (buttonRef.current) {
      setTimeout(() => {
        animate(
          buttonRef.current!,
          {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutExpo',
          }
        );
      }, 600);
    }
  }, []);

  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
      </Head>
      <div
        ref={containerRef}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
        style={{ opacity: 0 }}
      >
        <div className="text-center max-w-md">
          <div
            ref={numberRef}
            className="text-9xl font-black text-gray-900 dark:text-white mb-4"
            style={{ opacity: 0 }}
          >
            404
          </div>
          <div ref={textRef} className="mb-8" style={{ opacity: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Page Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          <div ref={buttonRef} style={{ opacity: 0 }}>
            <AnimatedButton
              variant="primary"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/home';
                }
              }}
              className="px-8 py-3"
            >
              Go to Home
            </AnimatedButton>
          </div>
        </div>
      </div>
    </>
  );
}

