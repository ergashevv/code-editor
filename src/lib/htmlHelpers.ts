// Helper functions for HTML auto-close and auto-rename

const selfClosingTags = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

export function isSelfClosingTag(tagName: string): boolean {
  return selfClosingTags.has(tagName.toLowerCase());
}

export function findMatchingClosingTag(
  text: string,
  position: number,
  openTagName: string
): { found: boolean; line: number; column: number; endColumn: number } | null {
  const lines = text.split('\n');
  const currentLine = text.substring(0, position).split('\n').length - 1;
  const currentColumn = position - text.substring(0, position).lastIndexOf('\n') - 1;
  
  let depth = 1;
  const openTagRegex = new RegExp(`<(\/?)(\\s*)(${openTagName})(\\s|>|/|$)`, 'gi');
  const searchText = text.substring(position);
  
  let match;
  while ((match = openTagRegex.exec(searchText)) !== null) {
    const isClosing = match[1] === '/';
    const tagName = match[3].toLowerCase();
    
    if (tagName.toLowerCase() === openTagName.toLowerCase()) {
      if (isClosing) {
        depth--;
        if (depth === 0) {
          const matchPosition = position + match.index;
          const matchLine = text.substring(0, matchPosition).split('\n').length - 1;
          const matchColumn = matchPosition - text.substring(0, matchPosition).lastIndexOf('\n') - 1;
          const endColumn = matchPosition + match[0].length - text.substring(0, matchPosition).lastIndexOf('\n') - 1;
          
          return {
            found: true,
            line: matchLine + 1,
            column: matchColumn + 1,
            endColumn: endColumn + 1
          };
        }
      } else {
        depth++;
      }
    }
  }
  
  return null;
}

export function findOpeningTag(
  text: string,
  position: number
): { found: boolean; tagName: string; line: number; column: number; endColumn: number } | null {
  const beforeCursor = text.substring(0, position);
  const lines = beforeCursor.split('\n');
  const currentLine = lines.length - 1;
  
  // Find the last opening tag before cursor
  const tagRegex = /<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*>/g;
  let match;
  let lastMatch = null;
  
  while ((match = tagRegex.exec(beforeCursor)) !== null) {
    const tagName = match[1];
    if (!isSelfClosingTag(tagName)) {
      lastMatch = {
        tagName,
        index: match.index,
        fullMatch: match[0]
      };
    }
  }
  
  if (lastMatch) {
    const matchLine = beforeCursor.substring(0, lastMatch.index).split('\n').length - 1;
    const matchColumn = lastMatch.index - (beforeCursor.substring(0, lastMatch.index).lastIndexOf('\n') || -1);
    const endColumn = matchColumn + lastMatch.fullMatch.length;
    
    return {
      found: true,
      tagName: lastMatch.tagName,
      line: matchLine + 1,
      column: matchColumn + 1,
      endColumn: endColumn + 1
    };
  }
  
  return null;
}

