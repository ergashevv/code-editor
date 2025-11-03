// Code statistics utilities

export interface CodeStats {
  lines: number;
  characters: number;
  words: number;
  charactersNoSpaces: number;
}

export function getCodeStatistics(code: string): CodeStats {
  const lines = code.split('\n').length;
  const characters = code.length;
  const words = code.trim() ? code.trim().split(/\s+/).length : 0;
  const charactersNoSpaces = code.replace(/\s/g, '').length;
  
  return {
    lines,
    characters,
    words,
    charactersNoSpaces
  };
}

export function getAllStatistics(html: string, css: string, js: string): CodeStats {
  const allCode = html + '\n' + css + '\n' + js;
  return getCodeStatistics(allCode);
}

