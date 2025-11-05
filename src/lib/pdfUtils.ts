// PDF export utilities - Carbon.now.sh style

export async function generatePDF(html: string, css: string, js: string): Promise<void> {
  // Dynamic import for client-side only
  const { default: jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;
  
  // Create a temporary container for PDF generation
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '1200px';
  tempContainer.style.backgroundColor = '#1e1e1e';
  tempContainer.style.padding = '40px 20px';
  tempContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Code", "Droid Sans", "Helvetica Neue", sans-serif';
  document.body.appendChild(tempContainer);
  
  // Process HTML similar to Preview component
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
  
  let livePreviewHTML = '';
  if (hasHtmlTag) {
    livePreviewHTML = processedHtml;
    // Inject CSS and JS for live preview
    if (css && !livePreviewHTML.includes('<style>')) {
      const cssBlock = `<style>\n${css}\n</style>`;
      if (livePreviewHTML.includes('</head>')) {
        livePreviewHTML = livePreviewHTML.replace('</head>', `  ${cssBlock}\n</head>`);
      } else if (livePreviewHTML.includes('<body')) {
        livePreviewHTML = livePreviewHTML.replace('<body', `${cssBlock}\n<body`);
      }
    }
    if (js && !livePreviewHTML.includes('<script>')) {
      const jsBlock = `<script>\n${js}\n</script>`;
      if (livePreviewHTML.includes('</body>')) {
        livePreviewHTML = livePreviewHTML.replace('</body>', `  ${jsBlock}\n</body>`);
      } else {
        livePreviewHTML += jsBlock;
      }
    }
  } else {
    livePreviewHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
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
  
  // Generate HTML content using helper function
  const fullHTML = generatePDFHTML(html, css, js, livePreviewHTML);
  
  // Set the HTML content
  tempContainer.innerHTML = fullHTML;
  
  try {
    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Convert HTML to canvas
    const canvas = await html2canvas(tempContainer, {
      backgroundColor: '#1e1e1e',
      scale: 2,
      useCORS: true,
      logging: false,
      width: tempContainer.scrollWidth,
      height: tempContainer.scrollHeight,
    });
    
    // Calculate PDF dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    });
    
    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Save PDF
    pdf.save('code-export.pdf');
    
    // Cleanup
    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
    document.body.removeChild(tempContainer);
  }
}

// Print function (opens print dialog)
export function printCode(html: string, css: string, js: string): void {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to print');
    return;
  }
  
  // Process HTML similar to Preview component
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
  
  let livePreviewHTML = '';
  if (hasHtmlTag) {
    livePreviewHTML = processedHtml;
    if (css && !livePreviewHTML.includes('<style>')) {
      const cssBlock = `<style>\n${css}\n</style>`;
      if (livePreviewHTML.includes('</head>')) {
        livePreviewHTML = livePreviewHTML.replace('</head>', `  ${cssBlock}\n</head>`);
      } else if (livePreviewHTML.includes('<body')) {
        livePreviewHTML = livePreviewHTML.replace('<body', `${cssBlock}\n<body`);
      }
    }
    if (js && !livePreviewHTML.includes('<script>')) {
      const jsBlock = `<script>\n${js}\n</script>`;
      if (livePreviewHTML.includes('</body>')) {
        livePreviewHTML = livePreviewHTML.replace('</body>', `  ${jsBlock}\n</body>`);
      } else {
        livePreviewHTML += jsBlock;
      }
    }
  } else {
    livePreviewHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
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
  
  // Use the same HTML structure as PDF but for printing
  const fullHTML = generatePDFHTML(html, css, js, livePreviewHTML);
  
  printWindow.document.write(fullHTML);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}

// Helper function to generate HTML for both PDF and Print
function generatePDFHTML(html: string, css: string, js: string, livePreviewHTML: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Export</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Code', 'Droid Sans', 'Helvetica Neue', sans-serif;
      background: #1e1e1e;
      color: #e5e5e5;
      padding: 40px 20px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      font-size: 14px;
      color: #888;
      font-weight: 400;
    }
    
    .code-section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .code-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      padding: 12px 16px;
      background: #252526;
      border-radius: 8px 8px 0 0;
      border-bottom: 1px solid #333;
    }
    
    .code-header .language-icon {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }
    
    .code-header .html-icon { background: #e34c26; color: white; }
    .code-header .css-icon { background: #264de4; color: white; }
    .code-header .js-icon { background: #f7df1e; color: #000; }
    
    .code-header .language-name {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .code-wrapper {
      background: #1e1e1e;
      border-radius: 0 0 8px 8px;
      overflow: hidden;
      border: 1px solid #333;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .code-container {
      position: relative;
      background: #1e1e1e;
      padding: 0;
      overflow-x: auto;
    }
    
    pre {
      margin: 0;
      padding: 24px;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre;
      overflow-x: auto;
      tab-size: 2;
    }
    
    code {
      font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
      color: #d4d4d4;
    }
    
    .preview-section {
      margin-top: 50px;
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .preview-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      padding: 12px 16px;
      background: #252526;
      border-radius: 8px 8px 0 0;
      border-bottom: 1px solid #333;
    }
    
    .preview-icon {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      background: #4caf50;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: white;
    }
    
    .preview-header .preview-name {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .preview-wrapper {
      background: #ffffff;
      border-radius: 0 0 8px 8px;
      overflow: hidden;
      border: 1px solid #333;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      min-height: 400px;
    }
    
    .preview-container {
      padding: 20px;
      background: #ffffff;
      min-height: 400px;
    }
    
    @media print {
      body {
        padding: 20px 10px;
        background: #1e1e1e;
      }
      
      .code-section,
      .preview-section {
        page-break-inside: avoid;
        margin-bottom: 30px;
      }
      
      .code-wrapper,
      .preview-wrapper {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      
      @page {
        margin: 0.5cm;
        size: A4 landscape;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Code Export</h1>
      <div class="subtitle">Generated from Code Editor</div>
    </div>
    
    ${html ? `
    <div class="code-section">
      <div class="code-header">
        <div class="language-icon html-icon">HTML</div>
        <div class="language-name">HTML</div>
      </div>
      <div class="code-wrapper">
        <div class="code-container">
          <pre><code>${escapeHtml(html)}</code></pre>
        </div>
      </div>
    </div>
    ` : ''}
    
    ${css ? `
    <div class="code-section">
      <div class="code-header">
        <div class="language-icon css-icon">CSS</div>
        <div class="language-name">CSS</div>
      </div>
      <div class="code-wrapper">
        <div class="code-container">
          <pre><code>${escapeHtml(css)}</code></pre>
        </div>
      </div>
    </div>
    ` : ''}
    
    ${js ? `
    <div class="code-section">
      <div class="code-header">
        <div class="language-icon js-icon">JS</div>
        <div class="language-name">JavaScript</div>
      </div>
      <div class="code-wrapper">
        <div class="code-container">
          <pre><code>${escapeHtml(js)}</code></pre>
        </div>
      </div>
    </div>
    ` : ''}
    
    <div class="preview-section">
      <div class="preview-header">
        <div class="preview-icon">▶</div>
        <div class="preview-name">Live Preview</div>
      </div>
      <div class="preview-wrapper">
        <div class="preview-container">
          ${livePreviewHTML.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

