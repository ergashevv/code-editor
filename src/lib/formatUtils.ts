// Code formatting utilities

export function formatHTML(html: string): string {
  // Simple HTML formatter
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  const lines = html.split(/\n/);
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted += '\n';
      continue;
    }
    
    // Check for closing tags
    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1);
    }
    
    formatted += tab.repeat(indent) + trimmed + '\n';
    
    // Check for opening tags (not self-closing)
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.match(/<(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)/i)) {
      if (!trimmed.endsWith('>')) {
        // Multi-line tag
        indent++;
      } else if (!trimmed.match(/<[^>]+>[^<]*<\/[^>]+>/)) {
        // Not a self-contained tag
        indent++;
      }
    }
  }
  
  return formatted.trim();
}

export function formatCSS(css: string): string {
  // Simple CSS formatter
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  
  css = css.replace(/\s*\{\s*/g, ' {\n');
  css = css.replace(/\s*\}\s*/g, '\n}\n');
  css = css.replace(/\s*;\s*/g, ';\n');
  css = css.replace(/\s*:\s*/g, ': ');
  
  const lines = css.split('\n');
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted += '\n';
      continue;
    }
    
    if (trimmed.endsWith('{')) {
      formatted += tab.repeat(indent) + trimmed + '\n';
      indent++;
    } else if (trimmed.startsWith('}')) {
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + trimmed + '\n';
    } else {
      formatted += tab.repeat(indent) + trimmed + '\n';
    }
  }
  
  return formatted.trim();
}

export function formatJS(js: string): string {
  // Simple JavaScript formatter
  // For better formatting, would need a library like Prettier
  // This is a basic formatter
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  
  js = js.replace(/\s*\{\s*/g, ' {\n');
  js = js.replace(/\s*\}\s*/g, '\n}\n');
  js = js.replace(/\s*;\s*/g, ';\n');
  
  const lines = js.split('\n');
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted += '\n';
      continue;
    }
    
    if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
      formatted += tab.repeat(indent) + trimmed + '\n';
      indent++;
    } else if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + trimmed + '\n';
    } else {
      formatted += tab.repeat(indent) + trimmed + '\n';
    }
  }
  
  return formatted.trim();
}

export function minifyHTML(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

export function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\{\s*/g, '{')
    .replace(/\s*\}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .trim();
}

export function minifyJS(js: string): string {
  // Simple minifier - removes comments and extra whitespace
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\{\s*/g, '{')
    .replace(/\s*\}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .trim();
}

