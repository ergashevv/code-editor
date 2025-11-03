// Share and URL utilities

export function encodeCode(html: string, css: string, js: string): string {
  const data = JSON.stringify({ html, css, js });
  return btoa(encodeURIComponent(data));
}

export function decodeCode(encoded: string): { html: string; css: string; js: string } | null {
  try {
    const decoded = decodeURIComponent(atob(encoded));
    const data = JSON.parse(decoded);
    return { html: data.html || '', css: data.css || '', js: data.js || '' };
  } catch (error) {
    return null;
  }
}

export function getShareUrl(html: string, css: string, js: string): string {
  const encoded = encodeCode(html, css, js);
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${window.location.pathname}?code=${encoded}`;
  }
  return '';
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
  document.body.removeChild(textArea);
  return Promise.resolve();
}

