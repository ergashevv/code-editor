// Code history and version control utilities

export interface CodeVersion {
  id: string;
  timestamp: number;
  html: string;
  css: string;
  js: string;
  label?: string;
}

const HISTORY_KEY = 'code-editor-history';
const MAX_HISTORY_SIZE = 50;

export function saveVersion(html: string, css: string, js: string, label?: string): CodeVersion {
  const version: CodeVersion = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    html,
    css,
    js,
    label,
  };
  
  const history = getHistory();
  history.unshift(version);
  
  // Keep only last MAX_HISTORY_SIZE versions
  if (history.length > MAX_HISTORY_SIZE) {
    history.splice(MAX_HISTORY_SIZE);
  }
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
    // If storage is full, remove oldest entries
    if (history.length > 10) {
      const trimmed = history.slice(0, 10);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
      } catch (e) {
        // If still fails, clear all history
        localStorage.removeItem(HISTORY_KEY);
      }
    }
  }
  
  return version;
}

export function getHistory(): CodeVersion[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

export function getVersion(id: string): CodeVersion | null {
  const history = getHistory();
  return history.find(v => v.id === id) || null;
}

export function deleteVersion(id: string): boolean {
  const history = getHistory();
  const filtered = history.filter(v => v.id !== id);
  
  if (filtered.length === history.length) {
    return false;
  }
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete version:', error);
    return false;
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function compareVersions(v1: CodeVersion, v2: CodeVersion): {
  htmlDiff: number;
  cssDiff: number;
  jsDiff: number;
} {
  const htmlDiff = Math.abs(v1.html.length - v2.html.length);
  const cssDiff = Math.abs(v1.css.length - v2.css.length);
  const jsDiff = Math.abs(v1.js.length - v2.js.length);
  
  return { htmlDiff, cssDiff, jsDiff };
}

