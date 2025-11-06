import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animate } from 'animejs';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  animation?: any;
  progressAnimation?: any;
}

let toastId = 0;
const toasts: Toast[] = [];
const listeners: Array<(toasts: Toast[]) => void> = [];

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = `toast-${++toastId}`;
  toasts.push({ id, message, type });
  listeners.forEach(listener => listener([...toasts]));
  
  // Auto remove after 4 seconds with progress bar
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      const toast = toasts[index];
      // Pause animations before removing
      if (toast.animation) toast.animation.pause();
      if (toast.progressAnimation) toast.progressAnimation.pause();
      toasts.splice(index, 1);
      listeners.forEach(listener => listener([...toasts]));
    }
  }, 4000);
}

export function ToastContainer() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToastList(newToasts);
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toastList.map((toast) => {
          const toastRef = useRef<HTMLDivElement>(null);
          const progressRef = useRef<HTMLDivElement>(null);
          const iconRef = useRef<HTMLDivElement>(null);
          const toastObj = toasts.find(t => t.id === toast.id);
          
          useEffect(() => {
            if (toastRef.current && !toastObj?.animation) {
              // Slide in from right with bounce - using timer methods
              const mainAnim = animate(
                toastRef.current,
                {
                  translateX: [100, 0],
                  opacity: [0, 1],
                  scale: [0.8, 1],
                  rotateZ: [-10, 0],
                  duration: 600,
                  easing: 'easeOutElastic(1, .6)',
                }
              );
              
              // Icon rotation animation
              if (iconRef.current) {
                animate(
                  iconRef.current,
                  {
                    rotateZ: [0, 360],
                    scale: [0, 1],
                    duration: 500,
                    delay: 200,
                    easing: 'easeOutExpo',
                  }
                );
              }
              
              // Progress bar animation with timer methods
              if (progressRef.current) {
                const progressWidth = { value: 0 };
                const progressAnim = animate(
                  progressWidth,
                  {
                    value: 100,
                    duration: 4000,
                    easing: 'linear',
                    onRender: () => {
                      if (progressRef.current) {
                        progressRef.current.style.width = `${progressWidth.value}%`;
                      }
                    }
                  }
                );
                
                if (toastObj) {
                  toastObj.progressAnimation = progressAnim;
                }
              }
              
              if (toastObj) {
                toastObj.animation = mainAnim;
              }
              
              // Pause on hover, resume on leave
              const handleMouseEnter = () => {
                if (toastObj?.progressAnimation) {
                  toastObj.progressAnimation.pause();
                }
              };
              
              const handleMouseLeave = () => {
                if (toastObj?.progressAnimation) {
                  toastObj.progressAnimation.resume();
                }
              };
              
              toastRef.current.addEventListener('mouseenter', handleMouseEnter);
              toastRef.current.addEventListener('mouseleave', handleMouseLeave);
              
              return () => {
                toastRef.current?.removeEventListener('mouseenter', handleMouseEnter);
                toastRef.current?.removeEventListener('mouseleave', handleMouseLeave);
              };
            }
          }, []);

          return (
            <motion.div
              key={toast.id}
              ref={toastRef}
              initial={{ opacity: 0, y: -20, scale: 0.95, x: 100 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95, x: 100 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
              className={`pointer-events-auto relative overflow-hidden rounded-lg shadow-xl flex items-center gap-3 min-w-[300px] max-w-[500px] ${
                toast.type === 'success'
                  ? 'bg-green-500 text-white'
                  : toast.type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                <div 
                  ref={progressRef}
                  className="h-full bg-white/50"
                  style={{ width: '0%' }}
                />
              </div>
              
              <div ref={iconRef} className="flex-shrink-0 text-xl px-4 py-3">
                {toast.type === 'success' && '✓'}
                {toast.type === 'error' && '✕'}
                {toast.type === 'info' && 'ℹ'}
              </div>
              <div className="flex-1 font-medium text-sm py-3">{toast.message}</div>
              <button
                onClick={() => {
                  const index = toasts.findIndex(t => t.id === toast.id);
                  if (index > -1) {
                    const toastItem = toasts[index];
                    if (toastItem.animation) toastItem.animation.pause();
                    if (toastItem.progressAnimation) toastItem.progressAnimation.pause();
                    toasts.splice(index, 1);
                    listeners.forEach(listener => listener([...toasts]));
                  }
                }}
                className="flex-shrink-0 text-white hover:text-gray-200 transition-colors px-4 py-3"
              >
                ✕
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
