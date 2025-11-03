// Export and download utilities

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadHTML(html: string, css: string, js: string) {
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Code</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
  <script>
${js}
  </script>
</body>
</html>`;
  downloadFile(fullHTML, 'index.html', 'text/html');
}

export function downloadCSS(css: string) {
  downloadFile(css, 'styles.css', 'text/css');
}

export function downloadJS(js: string) {
  downloadFile(js, 'script.js', 'application/javascript');
}

export function downloadZIP(html: string, css: string, js: string) {
  // Simple ZIP implementation using JSZip would require adding the library
  // For now, we'll create a simple approach
  const files = [
    { name: 'index.html', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Code</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${html}
  <script src="script.js"></script>
</body>
</html>` },
    { name: 'styles.css', content: css },
    { name: 'script.js', content: js }
  ];

  // For ZIP, we'd need JSZip library, but for simplicity, let's create a text file with all files
  const zipContent = files.map(f => `=== ${f.name} ===\n${f.content}\n`).join('\n\n');
  downloadFile(zipContent, 'project.zip', 'application/zip');
}

