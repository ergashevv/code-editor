// Code validation and linting utilities

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ValidationIssue {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

// CSS Validation
export function validateCSS(css: string): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  
  const lines = css.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for unclosed braces
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    
    // Check for unclosed strings
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    
    if (singleQuotes % 2 !== 0) {
      warnings.push({
        line: lineNum,
        column: line.indexOf("'") + 1,
        message: 'Unclosed single quote',
        severity: 'warning',
      });
    }
    
    if (doubleQuotes % 2 !== 0) {
      warnings.push({
        line: lineNum,
        column: line.indexOf('"') + 1,
        message: 'Unclosed double quote',
        severity: 'warning',
      });
    }
    
    // Check for missing semicolons (basic check)
    const hasProperty = line.match(/^\s*[a-zA-Z-]+\s*:/);
    const hasSemicolon = line.includes(';');
    const hasClosingBrace = line.includes('}');
    
    if (hasProperty && !hasSemicolon && !hasClosingBrace && !line.trim().endsWith('{')) {
      warnings.push({
        line: lineNum,
        column: line.length,
        message: 'Missing semicolon',
        severity: 'warning',
      });
    }
  });
  
  // Check for balanced braces
  let braceCount = 0;
  lines.forEach((line, index) => {
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceCount += openBraces - closeBraces;
    
    if (braceCount < 0) {
      errors.push({
        line: index + 1,
        column: line.indexOf('}') + 1,
        message: 'Unmatched closing brace',
        severity: 'error',
      });
    }
  });
  
  if (braceCount > 0) {
    errors.push({
      line: lines.length,
      column: lines[lines.length - 1].length,
      message: 'Unclosed brace',
      severity: 'error',
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// JavaScript Validation (basic)
export function validateJS(js: string): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  
  const lines = js.split('\n');
  
  // Check for common syntax errors
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for unclosed strings
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    const backticks = (line.match(/`/g) || []).length;
    
    if (singleQuotes % 2 !== 0) {
      warnings.push({
        line: lineNum,
        column: line.indexOf("'") + 1,
        message: 'Unclosed single quote',
        severity: 'warning',
      });
    }
    
    if (doubleQuotes % 2 !== 0) {
      warnings.push({
        line: lineNum,
        column: line.indexOf('"') + 1,
        message: 'Unclosed double quote',
        severity: 'warning',
      });
    }
    
    if (backticks % 2 !== 0) {
      warnings.push({
        line: lineNum,
        column: line.indexOf('`') + 1,
        message: 'Unclosed backtick',
        severity: 'warning',
      });
    }
    
    // Check for common mistakes
    if (line.includes('===') && line.includes('==')) {
      warnings.push({
        line: lineNum,
        column: line.indexOf('==') + 1,
        message: 'Consider using === instead of ==',
        severity: 'warning',
      });
    }
  });
  
  // Check for balanced brackets
  let parenCount = 0;
  let braceCount = 0;
  let bracketCount = 0;
  
  lines.forEach((line, index) => {
    const chars = line.split('');
    chars.forEach((char, colIndex) => {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
      
      if (parenCount < 0 || braceCount < 0 || bracketCount < 0) {
        errors.push({
          line: index + 1,
          column: colIndex + 1,
          message: 'Unmatched closing bracket',
          severity: 'error',
        });
      }
    });
  });
  
  if (parenCount > 0) {
    errors.push({
      line: lines.length,
      column: 1,
      message: 'Unclosed parenthesis',
      severity: 'error',
    });
  }
  
  if (braceCount > 0) {
    errors.push({
      line: lines.length,
      column: 1,
      message: 'Unclosed brace',
      severity: 'error',
    });
  }
  
  if (bracketCount > 0) {
    errors.push({
      line: lines.length,
      column: 1,
      message: 'Unclosed bracket',
      severity: 'error',
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

