// Auto-grader utility for HTML/CSS validation

import * as cheerio from 'cheerio';

export interface Check {
  id: string;
  type: 'html' | 'css';
  rule: string;
  hint: string;
}

export interface CheckResult {
  checkId: string;
  passed: boolean;
  message: string;
}

/**
 * Evaluate HTML and CSS against checks
 */
export function evaluateHtmlCss(
  html: string,
  css: string,
  checks: Check[]
): CheckResult[] {
  const results: CheckResult[] = [];
  
  // Store original HTML for DOCTYPE checks (cheerio removes DOCTYPE)
  const originalHtml = html.trim();
  
  // Fix common typos in HTML tags before parsing
  // This helps handle cases like <nead> instead of <head>
  let fixedHtml = originalHtml
    .replace(/<nead\b/gi, '<head') // Fix <nead> typo
    .replace(/<\/nead>/gi, '</head>') // Fix </nead> typo
    .replace(/<hed\b/gi, '<head') // Fix <hed> typo
    .replace(/<\/hed>/gi, '</head>') // Fix </hed> typo
    .replace(/<bod\b/gi, '<body') // Fix <bod> typo
    .replace(/<\/bod>/gi, '</body>') // Fix </bod> typo
    .replace(/<htlm\b/gi, '<html') // Fix <htlm> typo
    .replace(/<\/htlm>/gi, '</html>') // Fix </htlm> typo
    .replace(/<htl\b/gi, '<html') // Fix <htl> typo
    .replace(/<\/htl>/gi, '</html>'); // Fix </htl> typo
  
  // Normalize HTML - ensure it can be parsed correctly by cheerio
  // Cheerio needs a valid HTML structure to parse correctly
  let normalizedHtml = fixedHtml;
  
  // Check if HTML has DOCTYPE or html tag
  const hasDoctype = /<!DOCTYPE/i.test(normalizedHtml);
  const hasHtmlTag = /<html/i.test(normalizedHtml);
  const hasHeadTag = /<head/i.test(normalizedHtml);
  const hasBodyTag = /<body/i.test(normalizedHtml);
  
  // Extract content between head and body tags if they exist
  let headContent = '';
  let bodyContent = '';
  
  // More robust head extraction - handle typos and mismatched tags
  const headRegex = /<head[^>]*>([\s\S]*?)<\/head>/i;
  const headMatch = normalizedHtml.match(headRegex);
  if (headMatch) {
    headContent = headMatch[1];
  } else if (hasHeadTag) {
    // If opening <head> exists but closing tag is missing or typo, extract until </head> or </nead> or next tag
    const headStartMatch = normalizedHtml.match(/<head[^>]*>/i);
    if (headStartMatch) {
      const startIndex = headStartMatch.index! + headStartMatch[0].length;
      const afterHead = normalizedHtml.substring(startIndex);
      // Find closing tag (</head>, </nead>, or </hed>)
      const closingMatch = afterHead.match(/(?:<\/head>|<\/nead>|<\/hed>)/i);
      if (closingMatch) {
        headContent = afterHead.substring(0, closingMatch.index);
      } else {
        // If no closing tag, extract until </body> or </html>
        const bodyStartMatch = afterHead.match(/<body/i);
        if (bodyStartMatch) {
          headContent = afterHead.substring(0, bodyStartMatch.index);
        }
      }
    }
  }
  
  // More robust body extraction
  const bodyRegex = /<body[^>]*>([\s\S]*?)<\/body>/i;
  const bodyMatch = normalizedHtml.match(bodyRegex);
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  } else {
    // If no body tag, try to extract content after head or just use everything
    if (hasHeadTag) {
      const afterHead = normalizedHtml.split(/<\/head>|<\/nead>|<\/hed>/i)[1];
      if (afterHead) {
        bodyContent = afterHead.replace(/<\/html>.*/i, '').trim();
      }
    } else if (hasHtmlTag) {
      // If html tag exists but no head/body, extract content between <html> and </html>
      const htmlMatch = normalizedHtml.match(/<html[^>]*>([\s\S]*?)<\/html>/i);
      if (htmlMatch) {
        bodyContent = htmlMatch[1].trim();
      }
    } else {
      // No structure at all, use everything as body content
      bodyContent = normalizedHtml;
    }
  }
  
  // Build normalized HTML for parsing
  if (!hasHtmlTag) {
    normalizedHtml = `<!DOCTYPE html><html><head>${headContent}</head><body>${bodyContent}</body></html>`;
  } else if (!hasBodyTag) {
    // If html tag exists but body doesn't, add body
    normalizedHtml = normalizedHtml.replace(/<\/html>/i, `<body>${bodyContent}</body></html>`);
  } else if (!hasHeadTag && hasBodyTag) {
    // If body exists but head doesn't, add head
    normalizedHtml = normalizedHtml.replace(/<body/i, `<head>${headContent}</head><body`);
  }
  
  // Parse HTML with cheerio (it will auto-fix some issues)
  const $ = cheerio.load(normalizedHtml);
  
  // Parse CSS into rules map
  const cssRules = parseCSSRules(css);
  
  for (const check of checks) {
    let passed = false;
    let message = '';
    
    try {
      if (check.type === 'html') {
        const result = evaluateHTMLCheck($, check.rule, originalHtml); // Use original HTML for DOCTYPE checks
        passed = result.passed;
        message = result.message || check.hint;
      } else if (check.type === 'css') {
        const result = evaluateCSSCheck(cssRules, check.rule);
        passed = result.passed;
        message = result.message || check.hint;
      }
    } catch (error: any) {
      passed = false;
      message = `Error: ${error.message || 'Unknown error'}`;
    }
    
    results.push({
      checkId: check.id,
      passed,
      message: passed ? `✓ ${message}` : `✗ ${message}`,
    });
  }
  
  return results;
}

/**
 * Evaluate HTML check
 * Rules format:
 * - exists:selector - element must exist
 * - has:selector - element must have the selector
 * - attr:selector.attribute - element must have attribute
 * - text:selector=value - element text must match
 * - count:selector=n - must have n elements
 */
function evaluateHTMLCheck($: cheerio.CheerioAPI, rule: string, html: string = ''): { passed: boolean; message?: string } {
  const parts = rule.split(':');
  if (parts.length < 2) {
    return { passed: false, message: 'Invalid rule format' };
  }
  
  const command = parts[0];
  const rest = parts.slice(1).join(':');
  
  switch (command) {
    case 'exists': {
      // Special handling for DOCTYPE
      if (rest === '!DOCTYPE' || rest === 'DOCTYPE') {
        const hasDoctype = /<!DOCTYPE\s+html/i.test(html);
        return {
          passed: hasDoctype,
          message: hasDoctype ? 'Found DOCTYPE declaration' : 'Missing DOCTYPE declaration',
        };
      }
      
      // Special handling for semantic equivalents
      // b and strong are equivalent for bold
      // i and em are equivalent for italic
      let selector = rest;
      let equivalentSelectors = [rest];
      
      if (rest === 'b') {
        equivalentSelectors = ['b', 'strong'];
      } else if (rest === 'strong') {
        equivalentSelectors = ['strong', 'b'];
      } else if (rest === 'i') {
        equivalentSelectors = ['i', 'em'];
      } else if (rest === 'em') {
        equivalentSelectors = ['em', 'i'];
      }
      
      // Try to find elements with the selector
      let elements = $(equivalentSelectors.join(','));
      let exists = elements.length > 0;
      
      // If not found, try searching in body only
      if (!exists && rest !== 'body' && rest !== 'html' && rest !== 'head') {
        elements = $('body').find(equivalentSelectors.join(','));
        exists = elements.length > 0;
      }
      
      // If still not found, try case-insensitive search for tag names
      if (!exists && rest !== 'body' && rest !== 'html' && rest !== 'head') {
        const lowerSelectors = equivalentSelectors.map(s => s.toLowerCase());
        $('*').each((i, el) => {
          const tagName = (el as any).tagName?.toLowerCase();
          if (lowerSelectors.includes(tagName)) {
            exists = true;
            return false; // Break
          }
        });
      }
      
      return {
        passed: exists,
        message: exists ? `Found ${rest}${equivalentSelectors.length > 1 ? ` or ${equivalentSelectors.find(s => s !== rest)}` : ''}` : `Missing ${rest}${equivalentSelectors.length > 1 ? ` or ${equivalentSelectors.find(s => s !== rest)}` : ''}`,
      };
    }
    
    case 'has': {
      const [parent, child] = rest.split(' ');
      if (!parent || !child) {
        return { passed: false, message: 'Invalid has rule format' };
      }
      const parentEl = $(parent);
      const hasChild = parentEl.find(child).length > 0;
      return {
        passed: hasChild,
        message: hasChild ? `${parent} contains ${child}` : `${parent} missing ${child}`,
      };
    }
    
    case 'attr': {
      const [selector, attr] = rest.split('.');
      if (!selector || !attr) {
        return { passed: false, message: 'Invalid attr rule format' };
      }
      const elements = $(selector);
      if (elements.length === 0) {
        return { passed: false, message: `${selector} not found` };
      }
      const hasAttr = elements.attr(attr) !== undefined;
      return {
        passed: hasAttr,
        message: hasAttr ? `${selector} has ${attr} attribute` : `${selector} missing ${attr} attribute`,
      };
    }
    
    case 'text': {
      const [selector, expected] = rest.split('=');
      if (!selector) {
        return { passed: false, message: 'Invalid text rule format' };
      }
      const elements = $(selector);
      if (elements.length === 0) {
        return { passed: false, message: `${selector} not found` };
      }
      const text = elements.text().trim();
      // Case-insensitive comparison and normalize whitespace
      const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedExpected = expected ? expected.toLowerCase().replace(/\s+/g, ' ').trim() : '';
      const match = expected ? normalizedText === normalizedExpected : text.length > 0;
      return {
        passed: match,
        message: match 
          ? `Text matches${expected ? `: "${expected}"` : ''}` 
          : `Text mismatch. Expected: "${expected}", Got: "${text}"`,
      };
    }
    
    case 'count': {
      // Support both count:selector=n and count:selector>=n formats
      const match = rest.match(/^(.+?)(>=|<=|>|<|=)(\d+)$/);
      if (match) {
        const [, selector, operator, countStr] = match;
        const count = parseInt(countStr, 10);
        if (isNaN(count)) {
          return { passed: false, message: 'Invalid count number' };
        }
        
        // Special handling for semantic equivalents in count checks
        let searchSelectors = [selector];
        if (selector === 'b') {
          searchSelectors = ['b', 'strong'];
        } else if (selector === 'strong') {
          searchSelectors = ['strong', 'b'];
        } else if (selector === 'i') {
          searchSelectors = ['i', 'em'];
        } else if (selector === 'em') {
          searchSelectors = ['em', 'i'];
        }
        
        // Try to find elements with the selector
        // First try direct selector (searches entire document)
        let elements = $(searchSelectors.join(','));
        let actualCount = elements.length;
        
        // If not found, try searching in body only (most elements should be in body)
        if (actualCount === 0 && selector !== 'body' && selector !== 'html' && selector !== 'head') {
          const body = $('body');
          if (body.length > 0) {
            elements = body.find(searchSelectors.join(','));
            actualCount = elements.length;
          } else {
            // If no body tag, try searching in the entire document
            elements = $('*').filter((i, el) => {
              const tagName = (el as any).tagName?.toLowerCase();
              return searchSelectors.map(s => s.toLowerCase()).includes(tagName);
            });
            actualCount = elements.length;
          }
        }
        
        // If still not found, try case-insensitive search for tag names
        if (actualCount === 0 && selector !== 'body' && selector !== 'html' && selector !== 'head') {
          const lowerSelectors = searchSelectors.map(s => s.toLowerCase());
          $('*').each((i, el) => {
            const tagName = (el as any).tagName?.toLowerCase();
            if (lowerSelectors.includes(tagName)) {
              actualCount++;
            }
          });
        }
        
        let passed = false;
        switch (operator) {
          case '>=':
            passed = actualCount >= count;
            break;
          case '<=':
            passed = actualCount <= count;
            break;
          case '>':
            passed = actualCount > count;
            break;
          case '<':
            passed = actualCount < count;
            break;
          case '=':
          default:
            passed = actualCount === count;
        }
        return {
          passed,
          message: `Expected ${selector} ${operator} ${count}, found ${actualCount}`,
        };
      }
      
      // Fallback to old format
      const [selector, countStr] = rest.split('=');
      if (!selector || !countStr) {
        return { passed: false, message: 'Invalid count rule format' };
      }
      const count = parseInt(countStr, 10);
      if (isNaN(count)) {
        return { passed: false, message: 'Invalid count number' };
      }
      const elements = $(selector);
      const actualCount = elements.length;
      return {
        passed: actualCount === count,
        message: `Expected ${count} ${selector}, found ${actualCount}`,
      };
    }
    
    default:
      return { passed: false, message: `Unknown command: ${command}` };
  }
}

/**
 * Parse CSS into a map of selectors to properties
 */
function parseCSSRules(css: string): Map<string, Map<string, string>> {
  const rules = new Map<string, Map<string, string>>();
  
  if (!css || !css.trim()) {
    return rules;
  }
  
  // Simple CSS parser - split by }
  // Handle nested rules by finding matching braces
  let currentPos = 0;
  while (currentPos < css.length) {
    // Find next opening brace
    const openBrace = css.indexOf('{', currentPos);
    if (openBrace === -1) break;
    
    // Find matching closing brace
    let braceCount = 1;
    let closeBrace = openBrace + 1;
    while (closeBrace < css.length && braceCount > 0) {
      if (css[closeBrace] === '{') braceCount++;
      if (css[closeBrace] === '}') braceCount--;
      if (braceCount > 0) closeBrace++;
    }
    
    if (closeBrace >= css.length) break;
    
    let selector = css.substring(currentPos, openBrace).trim();
    
    // Remove comments from selector
    selector = selector.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    
    // Split multiple selectors (comma-separated)
    const selectors = selector.split(',').map(s => s.trim()).filter(s => s);
    
    const propsText = css.substring(openBrace + 1, closeBrace);
    // Remove comments from properties
    const cleanPropsText = propsText.replace(/\/\*[\s\S]*?\*\//g, '');
    const declarations = cleanPropsText.split(';').filter(prop => prop.trim());
    
    const properties = new Map<string, string>();
    for (const decl of declarations) {
      const colonIndex = decl.indexOf(':');
      if (colonIndex === -1) continue;
      
      const prop = decl.substring(0, colonIndex).trim();
      const value = decl.substring(colonIndex + 1).trim();
      
      if (prop && value) {
        // Store both original and normalized property names
        properties.set(prop.toLowerCase(), value);
      }
    }
    
    // Store properties for each selector (handle comma-separated selectors)
    if (selectors.length > 0 && properties.size > 0) {
      for (const sel of selectors) {
        // Normalize selector (remove extra whitespace, handle >, +, ~ combinators)
        const normalizedSelector = sel.replace(/\s+/g, ' ').replace(/\s*>\s*/g, ' > ').replace(/\s*\+\s*/g, ' + ').replace(/\s*~\s*/g, ' ~ ').trim();
        // Store properties for this selector (merge if already exists)
        const existingProps = rules.get(normalizedSelector) || new Map<string, string>();
        properties.forEach((value, key) => {
          existingProps.set(key, value);
        });
        rules.set(normalizedSelector, existingProps);
      }
    }
    
    currentPos = closeBrace + 1;
  }
  
  return rules;
}

/**
 * Evaluate CSS check
 * Rules format:
 * - rule:selector property=value - selector must have property with value
 * - class:.classname property=value - class must have property
 * - exists:selector - selector must exist in CSS
 */
function evaluateCSSCheck(
  cssRules: Map<string, Map<string, string>>,
  rule: string
): { passed: boolean; message?: string } {
  const parts = rule.split(':');
  if (parts.length < 2) {
    return { passed: false, message: 'Invalid CSS rule format' };
  }
  
  const command = parts[0];
  const rest = parts.slice(1).join(':');
  
  switch (command) {
    case 'rule': {
      // Handle rule:selector property=value format
      // Support both space and dot notation (rule:.class property=value)
      const parts = rest.split(' ');
      if (parts.length < 2) {
        return { passed: false, message: 'Invalid rule format. Expected: selector property=value' };
      }
      
      // Last part is property=value, rest is selector
      const propValue = parts[parts.length - 1];
      const selector = parts.slice(0, -1).join(' ').trim();
      
      if (!selector || !propValue) {
        return { passed: false, message: 'Invalid rule format' };
      }
      
      const [prop, expectedValue] = propValue.split('=');
      if (!prop) {
        return { passed: false, message: 'Invalid property format' };
      }
      
      // Try to find selector with normalized version
      const normalizedSelector = selector.replace(/\s+/g, ' ').trim();
      let properties = cssRules.get(normalizedSelector);
      
      // If not found, try to find with different whitespace
      if (!properties) {
        for (const [key, value] of Array.from(cssRules.entries())) {
          if (key.replace(/\s+/g, ' ').trim() === normalizedSelector) {
            properties = value;
            break;
          }
        }
      }
      
      if (!properties) {
        return { passed: false, message: `Selector "${selector}" not found in CSS` };
      }
      
      const actualValue = properties.get(prop.toLowerCase());
      if (!actualValue) {
        return { passed: false, message: `Property "${prop}" not found in ${selector}` };
      }
      
      if (expectedValue) {
        // Normalize values for comparison (remove spaces, quotes, etc.)
        const normalizedActual = normalizeCSSValue(actualValue);
        const normalizedExpected = normalizeCSSValue(expectedValue);
        const match = normalizedActual === normalizedExpected;
        return {
          passed: match,
          message: match 
            ? `${selector} has ${prop}: ${expectedValue}` 
            : `Expected ${prop}: ${expectedValue}, got ${actualValue}`,
        };
      } else {
        return {
          passed: true,
          message: `${selector} has ${prop}`,
        };
      }
    }
    
    case 'class': {
      // Similar to rule but for class selectors
      return evaluateCSSCheck(cssRules, `rule:${rest}`);
    }
    
    case 'exists': {
      const selector = rest.trim();
      const normalizedSelector = selector.replace(/\s+/g, ' ').trim();
      
      // Check if selector exists (exact match)
      let exists = cssRules.has(normalizedSelector);
      
      // If not found, try to find with different whitespace
      if (!exists) {
        for (const key of Array.from(cssRules.keys())) {
          if (key.replace(/\s+/g, ' ').trim() === normalizedSelector) {
            exists = true;
            break;
          }
        }
      }
      
      return {
        passed: exists,
        message: exists ? `Selector "${selector}" exists` : `Selector "${selector}" not found in CSS`,
      };
    }
    
    default:
      return { passed: false, message: `Unknown CSS command: ${command}` };
  }
}

/**
 * Normalize CSS value for comparison
 */
function normalizeCSSValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/['"]/g, '') // Remove quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/!important/gi, '') // Remove !important
    .trim();
}

