// Lessons cache utility with expiration and versioning

const CACHE_KEY = 'lessons_cache';
const CACHE_EXPIRY = 30 * 1000; // 30 seconds (very short for aggressive cache invalidation)

interface CachedLessons {
  lessons: any[];
  timestamp: number;
  lastUpdated?: number; // Server's lastUpdated timestamp
  userId?: string;
}

export function getCachedLessons(userId?: string, serverLastUpdated?: number): any[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedLessons = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // ALWAYS check if server has newer data (cache invalidation)
    // If serverLastUpdated is provided, compare it with cached lastUpdated
    if (serverLastUpdated !== undefined) {
      // If cached data doesn't have lastUpdated, invalidate cache
      if (!data.lastUpdated) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      // If server has newer data (even 1ms difference), invalidate cache
      if (serverLastUpdated > data.lastUpdated) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      // If serverLastUpdated is different from cached (even if less), invalidate cache
      // This ensures cache is always in sync with server
      if (serverLastUpdated !== data.lastUpdated) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    } else {
      // If serverLastUpdated is not provided, don't trust cache - invalidate it
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Check if cache is for same user (admin sees different lessons)
    if (userId && data.userId !== userId) {
      return null;
    }

    return data.lessons;
  } catch (error) {
    console.error('Error reading lessons cache:', error);
    return null;
  }
}

export function setCachedLessons(lessons: any[], userId?: string, lastUpdated?: number): void {
  if (typeof window === 'undefined') return;

  try {
    // Always save with current timestamp and lastUpdated
    const data: CachedLessons = {
      lessons,
      timestamp: Date.now(),
      lastUpdated: lastUpdated || Date.now(), // Always set lastUpdated, even if not provided
      userId,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving lessons cache:', error);
  }
}

export function clearLessonsCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}

