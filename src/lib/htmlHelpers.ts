// Helper functions for HTML auto-close and auto-rename

const selfClosingTags = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

export function isSelfClosingTag(tagName: string): boolean {
  return selfClosingTags.has(tagName.toLowerCase());
}

// Simple function to find matching closing tag for an opening tag
// Uses depth algorithm - works for any tag name
export function findMatchingClosingTagSimple(
  text: string,
  openTagStartIndex: number
): { found: boolean; line: number; column: number; endColumn: number; tagName: string } | null {
  // Find the opening tag
  const afterStart = text.substring(openTagStartIndex);
  const openTagMatch = afterStart.match(/^<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*/);
  if (!openTagMatch) return null;
  
  const tagName = openTagMatch[1].toLowerCase();
  if (isSelfClosingTag(tagName)) return null;
  
  // Find where the opening tag ends
  const tagEndIndex = afterStart.indexOf('>');
  if (tagEndIndex === -1) return null; // Incomplete tag
  
  // Start searching from after the opening tag
  const searchStart = openTagStartIndex + tagEndIndex + 1;
  const searchText = text.substring(searchStart);
  
  // Use depth algorithm to find matching closing tag
  let depth = 1;
  const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*>/g;
  let match;
  
  while ((match = tagRegex.exec(searchText)) !== null) {
    const isClosing = match[1] === '/';
    const currentTagName = match[2].toLowerCase();
    
    // Skip self-closing tags
    if (isSelfClosingTag(currentTagName) && !isClosing) {
      continue;
    }
    
    if (isClosing) {
      depth--;
      if (depth === 0) {
        // Found matching closing tag!
        const matchPosition = searchStart + match.index;
        const lines = text.substring(0, matchPosition).split('\n');
        const lineNumber = lines.length;
        const columnNumber = matchPosition - (text.substring(0, matchPosition).lastIndexOf('\n') + 1) + 1;
        const endColumn = columnNumber + match[0].length;
        
        return {
          found: true,
          line: lineNumber,
          column: columnNumber,
          endColumn: endColumn,
          tagName: match[2] // Return actual tag name from closing tag
        };
      }
    } else {
      // Opening tag increases depth
      depth++;
    }
  }
  
  return null;
}

export function findMatchingClosingTag(
  text: string,
  openTagPosition: number,
  openTagName: string
): { found: boolean; line: number; column: number; endColumn: number } | null {
  const result = findMatchingClosingTagSimple(text, openTagPosition);
  if (result && result.found) {
    return {
      found: true,
      line: result.line,
      column: result.column,
      endColumn: result.endColumn
    };
  }
  return null;
}

export function findClosingTagByPosition(
  text: string,
  openTagIndex: number,
  newTagName?: string
): { found: boolean; line: number; column: number; endColumn: number; tagName: string } | null {
  return findMatchingClosingTagSimple(text, openTagIndex);
}

export function findOpeningTag(
  text: string,
  position: number
): { found: boolean; tagName: string; line: number; column: number; endColumn: number } | null {
  const beforeCursor = text.substring(0, position);
  
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
    const matchLine = beforeCursor.substring(0, lastMatch.index).split('\n').length;
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
