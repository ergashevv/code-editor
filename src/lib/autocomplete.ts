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

// Tag-specific attributes and templates
export const tagTemplates: Record<string, string> = {
  input: '<input type="text" name="$1" value="$2" placeholder="$3" />',
  textarea: '<textarea name="$1" placeholder="$2">$0</textarea>',
  button: '<button type="button" onclick="$1">$0</button>',
  form: '<form action="$1" method="post">$0</form>',
  label: '<label for="$1">$0</label>',
  img: '<img src="$1" alt="$2" />',
  a: '<a href="$1" target="$2">$0</a>',
  link: '<link rel="stylesheet" href="$1" />',
  script: '<script src="$1"></script>',
  meta: '<meta name="$1" content="$2" />',
  table: '<table>\n  <thead>\n    <tr>\n      <th>$1</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>$0</td>\n    </tr>\n  </tbody>\n</table>',
  select: '<select name="$1">\n  <option value="$2">$0</option>\n</select>',
};

// Tag-specific attributes
export const tagAttributes: Record<string, string[]> = {
  input: ['type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'maxlength', 'min', 'max', 'step', 'pattern'],
  textarea: ['name', 'placeholder', 'required', 'disabled', 'readonly', 'rows', 'cols', 'maxlength'],
  button: ['type', 'onclick', 'disabled', 'form', 'formaction', 'formmethod'],
  form: ['action', 'method', 'enctype', 'target', 'novalidate'],
  label: ['for', 'form'],
  img: ['src', 'alt', 'width', 'height', 'loading', 'srcset', 'sizes'],
  a: ['href', 'target', 'rel', 'download', 'hreflang'],
  link: ['rel', 'href', 'type', 'media', 'sizes'],
  script: ['src', 'type', 'async', 'defer', 'crossorigin'],
  meta: ['name', 'content', 'charset', 'http-equiv'],
  select: ['name', 'required', 'disabled', 'multiple', 'size'],
  table: ['border', 'cellpadding', 'cellspacing', 'width'],
  tr: ['align', 'valign'],
  td: ['colspan', 'rowspan', 'align', 'valign'],
  th: ['colspan', 'rowspan', 'align', 'valign', 'scope'],
};

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

