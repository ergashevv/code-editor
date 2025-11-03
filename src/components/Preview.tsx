'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';

interface PreviewProps {
  html: string;
  css: string;
  js: string;
  isMobile?: boolean;
}

export default function Preview({ html, css, js, isMobile = false }: PreviewProps) {
  const { t, language } = useI18n();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    let processedHtml = html;

    // Replace <link rel="stylesheet" href="..."> with inline style
    // The CSS from the CSS editor will be injected anyway, so we remove the link tag
    processedHtml = processedHtml.replace(
      /<link\s+rel=["']stylesheet["'][^>]*href=["'][^"]*["'][^>]*>/gi,
      ''
    );

    // Replace <script src="..."> with inline script
    // The JS from the JS editor will be injected anyway, so we remove the script tag
    processedHtml = processedHtml.replace(
      /<script\s+src=["'][^"]*["'][^>]*><\/script>/gi,
      ''
    );

    // Check if HTML already has <html> tag
    const hasHtmlTag = processedHtml.match(/<html[^>]*>/i);
    
    // Combine all code - always use white background (default)
    let fullHtml = '';
    
    if (hasHtmlTag) {
      // If HTML already has <html> tag, keep it as is (don't add dark class)
      fullHtml = processedHtml;
      
      // Add CSS and JS if not already present
      if (css && !fullHtml.includes('<style>')) {
        const cssBlock = `<style>${css}</style>`;
        if (fullHtml.includes('</head>')) {
          fullHtml = fullHtml.replace('</head>', `${cssBlock}</head>`);
        } else if (fullHtml.includes('<body')) {
          fullHtml = fullHtml.replace('<body', `${cssBlock}<body`);
        }
      }
      
      if (js && !fullHtml.includes('<script>')) {
        const jsBlock = `<script>${js}</script>`;
        if (fullHtml.includes('</body>')) {
          fullHtml = fullHtml.replace('</body>', `${jsBlock}</body>`);
        } else {
          fullHtml += jsBlock;
        }
      }
    } else {
      // If no <html> tag, create full HTML structure with default white background
      fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              background: #ffffff;
              color: #222;
              margin: 0;
              padding: 0;
            }
          </style>
          <style>
            ${css}
          </style>
        </head>
        <body>
          ${processedHtml}
          <script>
            ${js}
          </script>
        </body>
        </html>
      `;
    }

    // Use srcdoc for better compatibility
    if (iframeRef.current) {
      iframeRef.current.srcdoc = fullHtml;
    }
  }, [html, css, js]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden"
    >
      <div className={`${isMobile ? 'px-2 py-1.5' : 'px-4 py-2'} bg-gray-50 border-b border-gray-200`}>
        <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-700`}>{t('result')}</h3>
      </div>
      <div className="flex-1 min-h-0 bg-white overflow-hidden">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title="Preview"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        />
      </div>
    </motion.div>
  );
}

