export const htmlTags = [
  'div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img', 'button', 'input', 'textarea', 'form', 'label',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'header', 'footer', 'nav', 'section', 'article', 'aside',
  'br', 'hr', 'strong', 'em', 'code', 'pre', 'blockquote',
  'link', 'script', 'style', 'meta', 'title', 'head', 'body'
];

export const htmlAttributes = [
  'class', 'id', 'style', 'src', 'href', 'alt', 'title',
  'type', 'name', 'value', 'placeholder', 'required', 'disabled',
  'onclick', 'onchange', 'oninput', 'onload', 'onerror'
];

export function getAutocompleteSuggestions(text: string, position: number): string[] {
  const beforeCursor = text.substring(0, position);
  
  // Check if we're typing a tag (after <)
  const tagMatch = beforeCursor.match(/<(\w*)$/);
  if (tagMatch) {
    const prefix = tagMatch[1].toLowerCase();
    return htmlTags
      .filter(tag => tag.startsWith(prefix))
      .map(tag => tag.substring(prefix.length));
  }
  
  // Check if we're typing an attribute (after space or after tag name)
  const attrMatch = beforeCursor.match(/<\w+[^>]*\s+(\w*)$/);
  if (attrMatch) {
    const prefix = attrMatch[1].toLowerCase();
    return htmlAttributes
      .filter(attr => attr.startsWith(prefix))
      .map(attr => attr.substring(prefix.length));
  }
  
  return [];
}

