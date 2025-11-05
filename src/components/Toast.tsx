import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;
const toasts: Toast[] = [];
const listeners: Array<(toasts: Toast[]) => void> = [];

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = `toast-${++toastId}`;
  toasts.push({ id, message, type });
  listeners.forEach(listener => listener([...toasts]));
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach(listener => listener([...toasts]));
    }
  }, 3000);
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
        {toastList.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[300px] max-w-[500px] ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            <div className="flex-shrink-0 text-xl">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'info' && 'ℹ'}
            </div>
            <div className="flex-1 font-medium text-sm">{toast.message}</div>
            <button
              onClick={() => {
                const index = toasts.findIndex(t => t.id === toast.id);
                if (index > -1) {
                  toasts.splice(index, 1);
                  listeners.forEach(listener => listener([...toasts]));
                }
              }}
              className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
