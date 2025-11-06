/**
 * Beautify HTML/CSS/JS code
 * 
 * Bu funksiyalar kodni chiroyli formatlaydi:
 * - HTML: tag'larni indent qiladi, har bir tag yangi qatorda
 * - CSS: selector va property'larni indent qiladi
 * - JS: bracket va brace'larni indent qiladi
 */

export function beautifyHTML(html: string): string {
  if (!html || !html.trim()) return html;
  
  let formatted = '';
  let indent = 0;
  const indentSize = 2;
  
  // Self-closing tags ro'yxati
  const selfClosingTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);
  
  // HTML ni tozalash - ortiqcha bo'shliqlarni olib tashlash
  html = html.trim();
  
  // Tag'larni ajratish
  const regex = /(<\/?[^>]+>|[^<]+)/g;
  const tokens: string[] = [];
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    tokens.push(match[0]);
  }
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim();
    if (!token) continue;
    
    // Closing tag (</tag>)
    if (token.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += ' '.repeat(indent * indentSize) + token + '\n';
    }
    // Opening tag (<tag> yoki <tag />)
    else if (token.startsWith('<')) {
      const isSelfClosing = token.endsWith('/>') || 
        selfClosingTags.has(token.match(/<(\w+)/)?.[1]?.toLowerCase() || '');
      
      formatted += ' '.repeat(indent * indentSize) + token + '\n';
      
      if (!isSelfClosing && !token.endsWith('/>')) {
        indent++;
      }
    }
    // Text content
    else {
      const trimmed = token.trim();
      if (trimmed) {
        formatted += ' '.repeat(indent * indentSize) + trimmed + '\n';
      }
    }
  }
  
  return formatted.trim();
}

export function beautifyCSS(css: string): string {
  if (!css || !css.trim()) return css;
  
  let formatted = '';
  let indent = 0;
  const indentSize = 2;
  
  // CSS ni tozalash va formatlash
  css = css.trim();
  
  // Har bir qatorni alohida qilish
  const lines = css.split(/[;\n}]/);
  const formattedLines: string[] = [];
  let currentSelector = '';
  let inBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    // Selector topildi ( { bilan tugaydi)
    if (line.includes('{')) {
      const parts = line.split('{');
      currentSelector = parts[0].trim();
      formattedLines.push(' '.repeat(indent * indentSize) + currentSelector + ' {');
      indent++;
      inBlock = true;
    }
    // Property (; bilan tugaydi)
    else if (inBlock && line.includes(':')) {
      const parts = line.split(':');
      if (parts.length === 2) {
        const property = parts[0].trim();
        const value = parts[1].trim();
        formattedLines.push(' '.repeat(indent * indentSize) + property + ': ' + value + ';');
      }
    }
    // Closing brace
    else if (line.includes('}') || (i === lines.length - 1 && inBlock)) {
      indent = Math.max(0, indent - 1);
      formattedLines.push(' '.repeat(indent * indentSize) + '}');
      inBlock = false;
      currentSelector = '';
    }
  }
  
  // Agar oddiy format bo'lsa
  if (formattedLines.length === 0) {
    // Oddiy CSS formatlash
    css = css.replace(/\s*{\s*/g, ' {\n');
    css = css.replace(/\s*}\s*/g, '\n}\n');
    css = css.replace(/\s*;\s*/g, ';\n');
    css = css.replace(/\s*:\s*/g, ': ');
    
    const simpleLines = css.split('\n');
    for (const line of simpleLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.includes('}')) {
        indent = Math.max(0, indent - 1);
        formatted += ' '.repeat(indent * indentSize) + trimmed + '\n';
      } else if (trimmed.includes('{')) {
        formatted += ' '.repeat(indent * indentSize) + trimmed + '\n';
        indent++;
      } else {
        formatted += ' '.repeat(indent * indentSize) + trimmed + '\n';
      }
    }
    return formatted.trim();
  }
  
  return formattedLines.join('\n');
}

export function beautifyJS(js: string): string {
  if (!js || !js.trim()) return js;
  
  // Oddiy JS beautify - production uchun prettier yoki boshqa library ishlatish tavsiya etiladi
  let formatted = '';
  let indent = 0;
  const indentSize = 2;
  
  js = js.trim();
  const lines = js.split(/\n/);
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Bo'sh qator
    if (!line) {
      if (i < lines.length - 1) {
        formatted += '\n';
      }
      continue;
    }
    
    // Closing brackets/braces - indent kamayadi
    const closingCount = (line.match(/[}\]\)]/g) || []).length;
    const openingCount = (line.match(/[{\[\(]/g) || []).length;
    
    // Agar closing ko'p bo'lsa, indent kamayadi
    if (closingCount > openingCount) {
      indent = Math.max(0, indent - (closingCount - openingCount));
    }
    
    // Qatorni formatlash
    formatted += ' '.repeat(Math.max(0, indent * indentSize)) + line + '\n';
    
    // Opening brackets/braces - indent oshadi
    if (openingCount > closingCount) {
      indent += (openingCount - closingCount);
    } else if (line.endsWith('{') || line.endsWith('[') || 
               (line.includes('function') && line.includes('(') && !line.includes(')'))) {
      indent++;
    }
  }
  
  return formatted.trim();
}

