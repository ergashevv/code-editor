// Basic Emmet expansion for common abbreviations
export function expandEmmet(abbreviation: string): string {
  // HTML5 boilerplate
  if (abbreviation === '!' || abbreviation === 'html:5') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  $0
</body>
</html>`;
  }

  // Common tag abbreviations
  const tagMap: Record<string, string> = {
    'div': '<div>$0</div>',
    'p': '<p>$0</p>',
    'span': '<span>$0</span>',
    'a': '<a href="$1">$0</a>',
    'img': '<img src="$1" alt="$2">',
    'input': '<input type="$1" name="$2">',
    'button': '<button>$0</button>',
    'form': '<form action="$1" method="$2">$0</form>',
    'ul': '<ul>\n  <li>$0</li>\n</ul>',
    'ol': '<ol>\n  <li>$0</li>\n</ol>',
    'table': '<table>\n  <tr>\n    <td>$0</td>\n  </tr>\n</table>',
    'header': '<header>$0</header>',
    'footer': '<footer>$0</footer>',
    'nav': '<nav>$0</nav>',
    'section': '<section>$0</section>',
    'article': '<article>$0</article>',
    'aside': '<aside>$0</aside>',
    'main': '<main>$0</main>',
  };

  // Remove trailing dots, colons, or other trigger characters
  const cleanAbbr = abbreviation.replace(/[.:!]$/, '').trim();

  if (tagMap[cleanAbbr]) {
    return tagMap[cleanAbbr];
  }

  // Handle class/id syntax (div.className or div#id)
  const classMatch = cleanAbbr.match(/^(\w+)\.([\w-]+)$/);
  if (classMatch) {
    const [, tag, className] = classMatch;
    return `<${tag} class="${className}">$0</${tag}>`;
  }

  const idMatch = cleanAbbr.match(/^(\w+)#([\w-]+)$/);
  if (idMatch) {
    const [, tag, id] = idMatch;
    return `<${tag} id="${id}">$0</${tag}>`;
  }

  // Handle multiplication (div*3)
  const multiplyMatch = cleanAbbr.match(/^(\w+)\*(\d+)$/);
  if (multiplyMatch) {
    const [, tag, count] = multiplyMatch;
    const num = parseInt(count, 10);
    return Array(num).fill(`<${tag}>$0</${tag}>`).join('\n');
  }

  // If it's a simple tag name, wrap it
  if (/^[a-z][a-z0-9]*$/i.test(cleanAbbr)) {
    return `<${cleanAbbr}>$0</${cleanAbbr}>`;
  }

  return '';
}

export function shouldExpandEmmet(text: string, position: number): { shouldExpand: boolean; abbreviation: string } {
  const beforeCursor = text.substring(0, position);
  const lineStart = beforeCursor.lastIndexOf('\n') + 1;
  const lineText = text.substring(lineStart, position).trimEnd();
  
  // Check for ! at start of line or after whitespace (with optional trailing space)
  if (/^\s*!\s*$/.test(lineText)) {
    return { shouldExpand: true, abbreviation: '!' };
  }

  // Check for Emmet abbreviations (word characters, dots, hashes, etc.)
  // Match patterns like: div, div.class, div#id, div.class#id, div*3
  const emmetPattern = /^[\s]*([a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9-]+)*(?:#[\w-]+)*(?:\*[\d]+)?)\s*$/;
  const match = lineText.match(emmetPattern);
  
  if (match && match[1] && match[1] !== '!') {
    return { shouldExpand: true, abbreviation: match[1] };
  }

  return { shouldExpand: false, abbreviation: '' };
}

