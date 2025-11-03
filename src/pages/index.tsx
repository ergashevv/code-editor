'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Navbar from '../components/Navbar';
import Editor from '../components/Editor';
import Preview from '../components/Preview';

type TabType = 'html' | 'css' | 'javascript';

export default function Home() {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('html');
  const [html, setHtml] = useLocalStorage<string>('editor-html', '<h1>Hello World</h1>\n<p>Start coding...</p>');
  const [css, setCss] = useLocalStorage<string>('editor-css', 'body {\n  font-family: Inter, sans-serif;\n  padding: 20px;\n}');
  const [js, setJs] = useLocalStorage<string>('editor-js', '// JavaScript code here');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50); // Percentage for desktop
  const [isResizing, setIsResizing] = useState(false);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Listen for language changes to force re-render
  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);

  // Handle resize for desktop
  const handleMouseDown = () => {
    if (!isMobile && !isTablet) {
      setIsResizing(true);
    }
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile && !isTablet) {
        const containerWidth = window.innerWidth;
        const newWidth = (e.clientX / containerWidth) * 100;
        // Limit between 20% and 80%
        const clampedWidth = Math.max(20, Math.min(80, newWidth));
        setEditorWidth(clampedWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isMobile, isTablet]);

  const handleClear = () => {
    setHtml('');
    setCss('');
    setJs('');
  };

  // Memoize tabs to update when language changes
  const tabs: { id: TabType; label: string }[] = [
    { id: 'html', label: t('html') },
    { id: 'css', label: t('css') },
    { id: 'javascript', label: t('javascript') },
  ];

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'html':
        return html;
      case 'css':
        return css;
      case 'javascript':
        return js;
    }
  };

  const setCurrentCode = (value: string) => {
    switch (activeTab) {
      case 'html':
        setHtml(value);
        break;
      case 'css':
        setCss(value);
        break;
      case 'javascript':
        setJs(value);
        break;
    }
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <div className="min-h-screen bg-white flex flex-col overflow-hidden">
        <Navbar onClear={handleClear} isMobile={isMobile} />
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Editor Section */}
        <div 
          className={`flex flex-col ${
            isMobile ? 'h-[50vh]' : isTablet ? 'h-[45vh]' : 'h-full'
          } ${!isMobile && !isTablet ? 'border-r border-gray-200' : ''} ${isMobile || isTablet ? 'border-b border-gray-200' : ''} transition-all`}
          style={!isMobile && !isTablet ? { width: `${editorWidth}%` } : {}}
        >
          {/* Tabs */}
          <div className="flex bg-gray-50 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  isMobile ? 'px-3 py-2.5 text-xs' : 'px-6 py-3 text-sm'
                } font-medium transition-all whitespace-nowrap touch-manipulation ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-600 active:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className={`flex-1 min-h-0 ${isMobile ? 'p-2' : 'p-4'}`}>
            <Editor
              language={activeTab}
              value={getCurrentCode()}
              onChange={setCurrentCode}
              label={tabs.find(t => t.id === activeTab)?.label || t('html')}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* Resizer for desktop */}
        {!isMobile && !isTablet && (
          <div
            onMouseDown={handleMouseDown}
            className={`w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors ${
              isResizing ? 'bg-blue-400' : ''
            }`}
            style={{ userSelect: 'none' }}
          />
        )}

        {/* Preview Section */}
        <div 
          className={`flex flex-col ${
            isMobile ? 'h-[50vh]' : isTablet ? 'h-[55vh]' : 'h-full'
          }`}
          style={!isMobile && !isTablet ? { width: `${100 - editorWidth}%` } : {}}
        >
          <div className={`flex-1 min-h-0 ${isMobile ? 'p-2' : 'p-4'}`}>
            <Preview html={html} css={css} js={js} isMobile={isMobile} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

