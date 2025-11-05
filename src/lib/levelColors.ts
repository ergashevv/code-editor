// Level and XP color utilities

export interface LevelColor {
  bg: string;
  bgGradient: string;
  text: string;
  border: string;
  progress: string;
  name: string;
}

/**
 * Get color scheme based on level
 */
export function getLevelColor(level: number): LevelColor {
  if (level >= 1 && level <= 5) {
    // Beginner: Gray to Blue
    return {
      bg: 'bg-gray-500',
      bgGradient: 'from-gray-500 to-gray-600',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-400',
      progress: 'bg-gray-400',
      name: 'Beginner',
    };
  } else if (level >= 6 && level <= 10) {
    // Intermediate: Blue
    return {
      bg: 'bg-blue-500',
      bgGradient: 'from-blue-500 to-blue-600',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-400',
      progress: 'bg-blue-400',
      name: 'Intermediate',
    };
  } else if (level >= 11 && level <= 15) {
    // Advanced: Green
    return {
      bg: 'bg-green-500',
      bgGradient: 'from-green-500 to-emerald-600',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-400',
      progress: 'bg-green-400',
      name: 'Advanced',
    };
  } else if (level >= 16 && level <= 20) {
    // Expert: Yellow to Orange
    return {
      bg: 'bg-yellow-500',
      bgGradient: 'from-yellow-500 to-orange-500',
      text: 'text-yellow-700 dark:text-yellow-300',
      border: 'border-yellow-400',
      progress: 'bg-yellow-400',
      name: 'Expert',
    };
  } else if (level >= 21 && level <= 30) {
    // Master: Orange to Red
    return {
      bg: 'bg-orange-500',
      bgGradient: 'from-orange-500 to-red-500',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-400',
      progress: 'bg-orange-400',
      name: 'Master',
    };
  } else {
    // Legendary: Red to Purple
    return {
      bg: 'bg-red-500',
      bgGradient: 'from-red-500 via-pink-500 to-purple-600',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-400',
      progress: 'bg-purple-400',
      name: 'Legendary',
    };
  }
}

/**
 * Get color scheme based on XP (alternative method)
 */
export function getXpColor(xp: number): LevelColor {
  // Import at top level to avoid require in function
  const { calculateLevelFromXp } = require('./levelUtils');
  const level = calculateLevelFromXp(xp);
  return getLevelColor(level);
}

/**
 * Get rank badge color
 */
export function getRankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-400 bg-yellow-900/30 border-yellow-400'; // Gold
  if (rank === 2) return 'text-gray-300 bg-gray-700/30 border-gray-400'; // Silver
  if (rank === 3) return 'text-orange-400 bg-orange-900/30 border-orange-400'; // Bronze
  return 'text-blue-400 bg-blue-900/30 border-blue-400'; // Default
}

