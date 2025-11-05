/**
 * Level calculation utilities
 * Progressive XP system: Each level requires more XP than the previous
 * 
 * Level 1: 0-199 XP (starting level)
 * Level 2: 200-499 XP (200 XP needed for level 1->2, 300 XP needed for level 2->3)
 * Level 3: 500-899 XP (300 XP needed for level 2->3, 400 XP needed for level 3->4)
 * Level 4: 900-1399 XP (400 XP needed for level 3->4, 500 XP needed for level 4->5)
 * Level 5: 1400-1999 XP (500 XP needed for level 4->5, 600 XP needed for level 5->6)
 * 
 * Formula for total XP needed for level N: sum(2 to N) * 100 = (N*(N+1)/2 - 1) * 100
 * Formula for XP needed for level N-1 -> N: N * 100
 */

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXp(xp: number): number {
  if (xp < 200) return 1;
  
  // Solve: (level*(level+1)/2 - 1) * 100 <= xp
  // level*(level+1)/2 - 1 <= xp/100
  // level*(level+1) <= 2*(xp/100 + 1)
  // level^2 + level - 2*(xp/100 + 1) <= 0
  // Using quadratic formula: level = (-1 + sqrt(1 + 8*(xp/100 + 1))) / 2
  const level = Math.floor((-1 + Math.sqrt(1 + 8 * (xp / 100 + 1))) / 2);
  return Math.max(1, level);
}

/**
 * Calculate total XP needed for a specific level
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Sum of 2 to level, multiplied by 100
  // = (level*(level+1)/2 - 1) * 100
  return (level * (level + 1) / 2 - 1) * 100;
}

/**
 * Calculate XP needed to go from current level to next level
 */
export function getXpNeededForNextLevel(currentLevel: number): number {
  return (currentLevel + 1) * 100;
}

/**
 * Calculate XP progress within current level (0-100%)
 */
export function getXpProgress(xp: number, currentLevel: number): number {
  const xpForCurrentLevel = getXpForLevel(currentLevel);
  const xpForNextLevel = getXpForLevel(currentLevel + 1);
  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  
  if (xpNeeded <= 0) return 100;
  
  const progress = (xpInCurrentLevel / xpNeeded) * 100;
  return Math.min(Math.max(0, progress), 100);
}

