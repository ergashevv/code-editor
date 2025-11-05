// Code minify and beautify utilities

export function minifyHTML(html: string): string {
  // Remove comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove whitespace between tags
  html = html.replace(/>\s+</g, '><');
  
  // Remove leading/trailing whitespace
  html = html.trim();
  
  return html;
}

export function minifyCSS(css: string): string {
  // Remove comments
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove whitespace around colons, semicolons, braces
  css = css.replace(/\s*{\s*/g, '{');
  css = css.replace(/\s*}\s*/g, '}');
  css = css.replace(/\s*:\s*/g, ':');
  css = css.replace(/\s*;\s*/g, ';');
  css = css.replace(/\s*,\s*/g, ',');
  
  // Remove whitespace around operators
  css = css.replace(/\s*>\s*/g, '>');
  css = css.replace(/\s*\+\s*/g, '+');
  css = css.replace(/\s*~\s*/g, '~');
  
  // Remove leading/trailing whitespace
  css = css.trim();
  
  return css;
}

export function minifyJS(js: string): string {
  // Remove single-line comments (but preserve URLs)
  js = js.replace(/(?<!:)\/\/.*$/gm, '');
  
  // Remove multi-line comments
  js = js.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove whitespace around operators (but be careful with strings)
  // This is a simple implementation - for production, use a proper minifier
  js = js.replace(/\s*([\{\}\(\)\[\];,=+\-*/])\s*/g, '$1');
  
  // Remove leading/trailing whitespace
  js = js.trim();
  
  return js;
}

export function beautifyHTML(html: string): string {
  let indent = 0;
  const indentSize = 2;
  let result = '';
  let inTag = false;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    const prevChar = html[i - 1];
    const nextChar = html[i + 1];
    
    if (char === '"' || char === "'") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && prevChar !== '\\') {
        inString = false;
      }
    }
    
    if (!inString) {
      if (char === '<') {
        if (nextChar === '/') {
          indent--;
          if (indent < 0) indent = 0;
        }
        result += '\n' + ' '.repeat(indent * indentSize);
        inTag = true;
      } else if (char === '>') {
        inTag = false;
        if (prevChar !== '/' && !html.substring(i).match(/^\s*<\//)) {
          indent++;
        }
      }
    }
    
    result += char;
  }
  
  // Clean up extra newlines
  result = result.replace(/\n{3,}/g, '\n\n').trim();
  
  return result;
}

export function beautifyCSS(css: string): string {
  let result = '';
  let indent = 0;
  const indentSize = 2;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < css.length; i++) {
    const char = css[i];
    const prevChar = css[i - 1];
    const nextChar = css[i + 1];
    
    if (char === '"' || char === "'") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && prevChar !== '\\') {
        inString = false;
      }
    }
    
    if (!inString) {
      if (char === '{') {
        result += ' {\n' + ' '.repeat(++indent * indentSize);
        continue;
      } else if (char === '}') {
        result += '\n' + ' '.repeat(--indent * indentSize) + '}';
        if (nextChar !== '}' && nextChar !== ',') {
          result += '\n';
        }
        continue;
      } else if (char === ';') {
        result += ';\n' + ' '.repeat(indent * indentSize);
        continue;
      } else if (char === ':') {
        result += ': ';
        continue;
      } else if (char === ',') {
        result += ', ';
        continue;
      }
    }
    
    result += char;
  }
  
  return result.trim();
}

export function beautifyJS(js: string): string {
  // Simple beautifier - for production, use a proper formatter like Prettier
  let result = '';
  let indent = 0;
  const indentSize = 2;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < js.length; i++) {
    const char = js[i];
    const prevChar = js[i - 1];
    const nextChar = js[i + 1];
    
    if (char === '"' || char === "'" || char === '`') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && prevChar !== '\\') {
        inString = false;
      }
    }
    
    if (!inString) {
      if (char === '{' || char === '[') {
        result += char + '\n' + ' '.repeat(++indent * indentSize);
        continue;
      } else if (char === '}' || char === ']') {
        result += '\n' + ' '.repeat(--indent * indentSize) + char;
        if (nextChar === ';' || nextChar === ',') {
          result += nextChar;
          i++;
        }
        continue;
      } else if (char === ';') {
        result += ';\n' + ' '.repeat(indent * indentSize);
        continue;
      } else if (char === ',') {
        result += ', ';
        continue;
      }
    }
    
    result += char;
  }
  
  return result.trim();
}

