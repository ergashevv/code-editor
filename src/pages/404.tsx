import Head from 'next/head';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-9xl font-black text-gray-900 dark:text-white mb-4">
            404
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Page Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          <div>
            <Link
              href="/home"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if (typeof window === 'undefined') return;
              
              // Load animejs dynamically
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js';
              script.onload = function() {
                if (typeof anime === 'undefined') return;
                
                const container = document.querySelector('.min-h-screen');
                const number = container?.querySelector('.text-9xl');
                const text = container?.querySelector('.mb-8');
                const button = container?.querySelector('a, [href="/home"]');
                
                if (container) {
                  anime({
                    targets: container,
                    opacity: [0, 1],
                    duration: 500,
                    easing: 'easeOutExpo',
                  });
                }
                
                if (number) {
                  anime({
                    targets: number,
                    scale: [0, 1.2, 1],
                    rotateZ: [0, 360],
                    opacity: [0, 1],
                    duration: 1000,
                    easing: 'easeOutElastic(1, .6)',
                  });
                }
                
                if (text) {
                  setTimeout(function() {
                    anime({
                      targets: text,
                      opacity: [0, 1],
                      translateY: [20, 0],
                      duration: 600,
                      easing: 'easeOutExpo',
                    });
                  }, 300);
                }
                
                if (button) {
                  setTimeout(function() {
                    anime({
                      targets: button,
                      opacity: [0, 1],
                      translateY: [20, 0],
                      duration: 600,
                      easing: 'easeOutExpo',
                    });
                  }, 600);
                }
              };
              document.head.appendChild(script);
            })();
          `,
        }}
      />
    </>
  );
}
