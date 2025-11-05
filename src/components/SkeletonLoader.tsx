import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: string;
}

export function SkeletonLoader({ 
  className = '', 
  count = 1,
  height = 'h-4' 
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`${height} bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
          initial={{ opacity: 0.6 }}
          animate={{ 
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.1,
          }}
        />
      ))}
    </>
  );
}

export function SkeletonCard() {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SkeletonLoader className="w-3/4 mb-4" height="h-6" count={1} />
      <SkeletonLoader className="w-full mb-2" height="h-4" count={2} />
      <SkeletonLoader className="w-1/2" height="h-4" count={1} />
    </motion.div>
  );
}

