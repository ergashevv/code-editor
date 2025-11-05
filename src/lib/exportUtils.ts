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
  // Process HTML similar to Preview component
  let processedHtml = html;
  
  // Remove external stylesheets and scripts (we'll inject our own)
  processedHtml = processedHtml.replace(
    /<link\s+rel=["']stylesheet["'][^>]*href=["'][^"]*["'][^>]*>/gi,
    ''
  );
  processedHtml = processedHtml.replace(
    /<script\s+src=["'][^"]*["'][^>]*><\/script>/gi,
    ''
  );
  
  // Check if HTML already has <html> tag
  const hasHtmlTag = processedHtml.match(/<html[^>]*>/i);
  
  let fullHTML = '';
  
  if (hasHtmlTag) {
    // If HTML already has <html> tag, inject CSS and JS properly
    fullHTML = processedHtml;
    
    // Add CSS if not already present
    if (css && !fullHTML.includes('<style>')) {
      const cssBlock = `<style>\n${css}\n</style>`;
      if (fullHTML.includes('</head>')) {
        fullHTML = fullHTML.replace('</head>', `  ${cssBlock}\n</head>`);
      } else if (fullHTML.includes('<body')) {
        fullHTML = fullHTML.replace('<body', `${cssBlock}\n<body`);
      } else if (fullHTML.includes('<head>')) {
        fullHTML = fullHTML.replace('<head>', `<head>\n  ${cssBlock}`);
      }
    }
    
    // Add JS if not already present
    if (js && !fullHTML.includes('<script>')) {
      const jsBlock = `<script>\n${js}\n</script>`;
      if (fullHTML.includes('</body>')) {
        fullHTML = fullHTML.replace('</body>', `  ${jsBlock}\n</body>`);
      } else {
        fullHTML += jsBlock;
      }
    }
  } else {
    // If no <html> tag, create full HTML structure
    fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Code</title>
  <style>
${css || '/* No CSS */'}
  </style>
</head>
<body>
${processedHtml}
  <script>
${js || '// No JavaScript'}
  </script>
</body>
</html>`;
  }
  
  // Ensure images are properly styled
  if (!fullHTML.includes('img {') && !fullHTML.includes('img{')) {
    const imageStyles = `<style>
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  body {
    overflow-x: auto;
    word-wrap: break-word;
  }
</style>`;
    if (fullHTML.includes('</head>')) {
      fullHTML = fullHTML.replace('</head>', `  ${imageStyles}\n</head>`);
    } else if (fullHTML.includes('<body')) {
      fullHTML = fullHTML.replace('<body', `${imageStyles}\n<body`);
    }
  }
  
  downloadFile(fullHTML, 'index.html', 'text/html');
}

export function downloadCSS(css: string) {
  downloadFile(css, 'styles.css', 'text/css');
}

export function downloadJS(js: string) {
  downloadFile(js, 'script.js', 'application/javascript');
}

export function downloadZIP(html: string, css: string, js: string) {
  // Process HTML similar to downloadHTML
  let processedHtml = html;
  processedHtml = processedHtml.replace(
    /<link\s+rel=["']stylesheet["'][^>]*href=["'][^"]*["'][^>]*>/gi,
    ''
  );
  processedHtml = processedHtml.replace(
    /<script\s+src=["'][^"]*["'][^>]*><\/script>/gi,
    ''
  );
  
  // Check if HTML already has <html> tag
  const hasHtmlTag = processedHtml.match(/<html[^>]*>/i);
  
  let htmlContent = '';
  if (hasHtmlTag) {
    // If HTML already has structure, just replace external links
    htmlContent = processedHtml.replace(
      /<link\s+rel=["']stylesheet["'][^>]*>/gi,
      '<link rel="stylesheet" href="styles.css">'
    );
    // Add CSS link if not present
    if (!htmlContent.includes('styles.css')) {
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', '  <link rel="stylesheet" href="styles.css">\n</head>');
      } else if (htmlContent.includes('<head>')) {
        htmlContent = htmlContent.replace('<head>', '<head>\n  <link rel="stylesheet" href="styles.css">');
      }
    }
    // Add JS link if not present
    if (!htmlContent.includes('script.js')) {
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', '  <script src="script.js"></script>\n</body>');
      } else {
        htmlContent += '\n  <script src="script.js"></script>';
      }
    }
  } else {
    // If no HTML structure, create full HTML
    htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Code</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${processedHtml}
  <script src="script.js"></script>
</body>
</html>`;
  }
  
  const files = [
    { name: 'index.html', content: htmlContent },
    { name: 'styles.css', content: css || '/* No CSS */' },
    { name: 'script.js', content: js || '// No JavaScript' }
  ];

  // For ZIP, we'd need JSZip library, but for simplicity, let's create a text file with all files
  const zipContent = files.map(f => `=== ${f.name} ===\n${f.content}\n`).join('\n\n');
  downloadFile(zipContent, 'project.zip', 'application/zip');
}

