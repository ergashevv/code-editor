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
  openTagPosition: number,
  openTagName: string
): { found: boolean; line: number; column: number; endColumn: number } | null {
  // Find the opening tag at or before the position
  const beforePosition = text.substring(0, openTagPosition);
  
  // Look for opening tag at the exact position or just before
  const tagName = openTagName.toLowerCase();
  
  // Find the most recent opening tag - look backwards from cursor
  const tagRegex = /<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*>/g;
  let match;
  let lastOpeningTag = null;
  
  // Find all opening tags before cursor position
  while ((match = tagRegex.exec(beforePosition)) !== null) {
    const currentTagName = match[1].toLowerCase();
    if (currentTagName === tagName && !isSelfClosingTag(currentTagName)) {
      lastOpeningTag = {
        index: match.index,
        fullMatch: match[0],
        tagName: currentTagName
      };
    }
  }
  
  if (!lastOpeningTag) {
    return null;
  }
  
  // Start searching from after the opening tag
  const searchStart = lastOpeningTag.index + lastOpeningTag.fullMatch.length;
  const searchText = text.substring(searchStart);
  
  let depth = 1;
  const closingTagRegex = /<(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*>/g;
  
  while ((match = closingTagRegex.exec(searchText)) !== null) {
    const isClosing = match[1] === '/';
    const currentTagName = match[2].toLowerCase();
    
    if (currentTagName === tagName) {
      if (isClosing) {
        depth--;
        if (depth === 0) {
          const matchPosition = searchStart + match.index;
          const matchLine = text.substring(0, matchPosition).split('\n').length;
          const lineStart = text.substring(0, matchPosition).lastIndexOf('\n') + 1;
          const matchColumn = matchPosition - lineStart + 1;
          const endColumn = matchColumn + match[0].length;
          
          return {
            found: true,
            line: matchLine,
            column: matchColumn,
            endColumn: endColumn
          };
        }
      } else {
        depth++;
      }
    }
  }
  
  return null;
}

// Find closing tag by opening tag position (works regardless of tag name in closing tag)
// This function finds the matching closing tag for an opening tag at a given position,
// even if the closing tag has a different name (e.g., after renaming opening tag)
export function findClosingTagByPosition(
  text: string,
  openTagIndex: number,
  newTagName?: string
): { found: boolean; line: number; column: number; endColumn: number; tagName: string } | null {
  // Extract the opening tag at the given position
  const afterTag = text.substring(openTagIndex);
  
  // Find the opening tag at this position (handle incomplete tags without >)
  const openingTagMatch = afterTag.match(/^<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*/);
  if (!openingTagMatch) {
    return null;
  }
  
  const openTagName = openingTagMatch[1].toLowerCase();
  const actualNewTagName = (newTagName || openTagName).toLowerCase();
  
  // Skip self-closing tags
  if (isSelfClosingTag(openTagName)) {
    return null;
  }
  
  // Start searching from after the opening tag
  // If tag is incomplete (no >), search from after the tag name
  // Otherwise, search from after the full tag including >
  const tagEndIndex = afterTag.indexOf('>');
  const searchStart = tagEndIndex >= 0 
    ? openTagIndex + tagEndIndex + 1 
    : openTagIndex + openingTagMatch[0].length;
  const searchText = text.substring(searchStart);
  
  let depth = 1;
  const tagRegex = /<(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*>/g;
  let match;
  
  // We need to try both new and old tag names
  // The old name is what might be in the closing tag if it wasn't updated yet
  const tagNamesToTry = new Set<string>();
  tagNamesToTry.add(actualNewTagName);
  
  // If the opening tag name differs from new tag name, it might have been renamed
  // So we should also try the opening tag name (which might be the old name)
  if (openTagName !== actualNewTagName) {
    tagNamesToTry.add(openTagName);
  }
  
  // Reset regex and depth for search
  tagRegex.lastIndex = 0;
  depth = 1;
  
  // First, try to find with expected tag names
  while ((match = tagRegex.exec(searchText)) !== null) {
    const isClosing = match[1] === '/';
    const currentTagName = match[2].toLowerCase();
    
    // Check if this tag matches any of the names we're looking for
    if (tagNamesToTry.has(currentTagName)) {
      if (isClosing) {
        depth--;
        if (depth === 0) {
          const matchPosition = searchStart + match.index;
          const matchLine = text.substring(0, matchPosition).split('\n').length;
          const lineStart = text.substring(0, matchPosition).lastIndexOf('\n') + 1;
          const matchColumn = matchPosition - lineStart + 1;
          const endColumn = matchColumn + match[0].length;
          
          return {
            found: true,
            line: matchLine,
            column: matchColumn,
            endColumn: endColumn,
            tagName: match[2] // Return the actual tag name from closing tag
          };
        }
      } else {
        // Opening tag with same name increases depth
        depth++;
      }
    }
  }
  
  // Fallback: if we didn't find with expected names, use depth algorithm with ANY tag name
  // This handles the case where closing tag has a completely different name
  tagRegex.lastIndex = 0;
  depth = 1;
  
  while ((match = tagRegex.exec(searchText)) !== null) {
    const isClosing = match[1] === '/';
    
    if (isClosing) {
      depth--;
      if (depth === 0) {
        // Found the matching closing tag (first one that brings depth to 0)
        const matchPosition = searchStart + match.index;
        const matchLine = text.substring(0, matchPosition).split('\n').length;
        const lineStart = text.substring(0, matchPosition).lastIndexOf('\n') + 1;
        const matchColumn = matchPosition - lineStart + 1;
        const endColumn = matchColumn + match[0].length;
        
        return {
          found: true,
          line: matchLine,
          column: matchColumn,
          endColumn: endColumn,
          tagName: match[2] // Return the actual tag name from closing tag
        };
      }
    } else {
      // Opening tag increases depth
      depth++;
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
