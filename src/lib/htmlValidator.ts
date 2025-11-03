import { Language } from '../hooks/useI18n';
import uzErrors from '../i18n/errors/uz.json';
import ruErrors from '../i18n/errors/ru.json';
import enErrors from '../i18n/errors/en.json';

const errorTranslations: Record<Language, Record<string, string>> = {
  uz: uzErrors,
  ru: ruErrors,
  en: enErrors,
};

export interface ValidationError {
  line: number;
  column: number;
  severity: 'error' | 'warning';
  message: string;
  code: string;
}

export function validateHTML(html: string, language: Language = 'uz'): ValidationError[] {
  const errors: ValidationError[] = [];
  const t = (key: string, params?: Record<string, string>): string => {
    let msg = errorTranslations[language][key] || errorTranslations['uz'][key] || key;
    if (params) {
      Object.keys(params).forEach((k) => {
        msg = msg.replace(`{${k}}`, params[k]);
      });
    }
    return msg;
  };

  const lines = html.split('\n');
  const tagStack: Array<{ tag: string; line: number; column: number }> = [];
  const ids = new Set<string>();

  // Self-closing tags
  const selfClosingTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  // Parse HTML and validate
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    const openTagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\s*([^>]*)>/g;
    let match;

    while ((match = openTagRegex.exec(line)) !== null) {
      const isClosing = match[1] === '/';
      const tagName = match[2].toLowerCase();
      const attributes = match[3];
      const column = match.index + 1;

      if (isClosing) {
        // Closing tag
        if (tagStack.length === 0) {
          errors.push({
            line: lineNum + 1,
            column,
            severity: 'error',
            message: t('mismatchedTag', { tag: tagName }),
            code: 'MISMATCHED_TAG',
          });
        } else {
          const lastTag = tagStack[tagStack.length - 1];
          if (lastTag.tag !== tagName) {
            errors.push({
              line: lineNum + 1,
              column,
              severity: 'error',
              message: t('mismatchedTag', { tag: tagName }),
              code: 'MISMATCHED_TAG',
            });
          } else {
            tagStack.pop();
          }
        }
      } else if (!selfClosingTags.has(tagName)) {
        // Opening tag (not self-closing)
        tagStack.push({ tag: tagName, line: lineNum + 1, column });

        // Check for duplicate IDs
        const idMatch = attributes.match(/\bid\s*=\s*["']([^"']+)["']/i);
        if (idMatch) {
          const id = idMatch[1];
          if (ids.has(id)) {
            errors.push({
              line: lineNum + 1,
              column,
              severity: 'error',
              message: t('duplicateId', { id }),
              code: 'DUPLICATE_ID',
            });
          }
          ids.add(id);
        }

        // Check for required attributes
        if (tagName === 'img' && !attributes.includes('alt')) {
          errors.push({
            line: lineNum + 1,
            column,
            severity: 'warning',
            message: t('missingRequiredAttribute', { attr: 'alt' }),
            code: 'MISSING_ALT',
          });
        }

        if (tagName === 'a' && !attributes.includes('href')) {
          errors.push({
            line: lineNum + 1,
            column,
            severity: 'warning',
            message: t('missingRequiredAttribute', { attr: 'href' }),
            code: 'MISSING_HREF',
          });
        }
      }
    }
  }

  // Check for unclosed tags
  tagStack.forEach(({ tag, line, column }) => {
    errors.push({
      line,
      column,
      severity: 'error',
      message: t('unclosedTag', { tag }),
      code: 'UNCLOSED_TAG',
    });
  });

  return errors;
}

