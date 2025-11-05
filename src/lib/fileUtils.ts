// File upload and import utilities

export interface FileContent {
  html?: string;
  css?: string;
  js?: string;
}

export function detectFileType(filename: string): 'html' | 'css' | 'javascript' | 'unknown' {
  const ext = filename.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'javascript':
      return 'javascript';
    default:
      return 'unknown';
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

export async function importFiles(files: File[]): Promise<FileContent> {
  const content: FileContent = {};
  
  for (const file of files) {
    const fileType = detectFileType(file.name);
    const text = await readFileAsText(file);
    
    switch (fileType) {
      case 'html':
        content.html = text;
        break;
      case 'css':
        content.css = text;
        break;
      case 'javascript':
        content.js = text;
        break;
    }
  }
  
  return content;
}

export function readImageAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read image'));
    };
    
    reader.readAsDataURL(file);
  });
}

