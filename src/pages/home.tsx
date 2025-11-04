'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../hooks/useTheme';
import Navbar from '../components/Navbar';
import Editor from '../components/Editor';
import Preview from '../components/Preview';
import SettingsModal from '../components/SettingsModal';
import TemplatesModal from '../components/TemplatesModal';
import StatisticsModal from '../components/StatisticsModal';
import ShortcutsModal from '../components/ShortcutsModal';
import { formatHTML, formatCSS, formatJS } from '../lib/formatUtils';
import { getShareUrl, copyToClipboard, decodeCode } from '../lib/shareUtils';
import { Template } from '../lib/templates';
import { isAuthenticated } from '../lib/api';

type TabType = 'html' | 'css' | 'javascript';

// Disable static optimization
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function Home() {
  const router = useRouter();
  const { t, language } = useI18n();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('html');
  const [html, setHtml] = useLocalStorage<string>('editor-html', '<h1>Hello World</h1>\n<p>Start coding...</p>');
  const [css, setCss] = useLocalStorage<string>('editor-css', 'body {\n  font-family: Inter, sans-serif;\n  padding: 20px;\n}');
  const [js, setJs] = useLocalStorage<string>('editor-js', '// JavaScript code here');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [fontSize, setFontSize] = useLocalStorage<number>('editor-font-size', 14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState<'editor' | 'preview' | null>(null);
  
  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (router.isReady) {
      if (!isAuthenticated()) {
        router.push('/auth');
      }
    }
  }, [router]);

  // Load code from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code');
      if (codeParam) {
        const decoded = decodeCode(codeParam);
        if (decoded) {
          setHtml(decoded.html);
          setCss(decoded.css);
          setJs(decoded.js);
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Fullscreen handlers
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setFullscreenMode(null);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullscreen = (mode: 'editor' | 'preview') => {
    const element = mode === 'editor' 
      ? document.querySelector('.editor-container') as HTMLElement
      : document.querySelector('.preview-container') as HTMLElement;
    
    if (element) {
      if (!isFullscreen) {
        element.requestFullscreen?.();
        setIsFullscreen(true);
        setFullscreenMode(mode);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
        setFullscreenMode(null);
      }
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all code?')) {
      setHtml('');
      setCss('');
      setJs('');
    }
  };

  const handleFormat = () => {
    switch (activeTab) {
      case 'html':
        setHtml(formatHTML(html));
        break;
      case 'css':
        setCss(formatCSS(css));
        break;
      case 'javascript':
        setJs(formatJS(js));
        break;
    }
  };

  const handleShare = async () => {
    const url = getShareUrl(html, css, js);
    await copyToClipboard(url);
    setShowShareNotification(true);
    setTimeout(() => setShowShareNotification(false), 3000);
  };

  const handleSelectTemplate = (template: Template) => {
    setHtml(template.html);
    setCss(template.css);
    setJs(template.js);
  };

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
        <title>{t('appName')} - Online HTML, CSS, JavaScript Editor</title>
        <meta name="description" content={`${t('appName')} - ${t('typeCodeBelow')}. Online HTML, CSS va JavaScript kodlarini yozish, tahrirlash va natijani darhol ko'rish.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="keywords" content="kod editor, html editor, css editor, javascript editor, online code editor, live preview, code playground" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content={theme === 'dark' ? 'black-translucent' : 'default'} />
        <meta name="theme-color" content={theme === 'dark' ? '#111827' : '#ffffff'} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${t('appName')} - Online Code Editor`} />
        <meta property="og:description" content={`${t('typeCodeBelow')} - Live preview bilan kod yozing.`} />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t('appName')} - Online Code Editor`} />
        <meta name="twitter:description" content={`${t('typeCodeBelow')} - Live preview bilan kod yozing.`} />
        <meta name="twitter:image" content="/logo.png" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://yourdomain.com/home" />
      </Head>
      <div className="h-screen flex flex-col overflow-hidden bg-transparent">
        <Navbar 
          onClear={handleClear}
          onSettings={() => setIsSettingsOpen(true)}
          isMobile={isMobile}
        />
      
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-inherit min-h-0">
          {/* Editor Section */}
          <div 
            className={`editor-container flex flex-col bg-white dark:bg-gray-900 ${
              isMobile ? 'h-[50vh]' : isTablet ? 'h-[45vh]' : 'h-full'
            } ${!isMobile && !isTablet ? 'border-r border-gray-200 dark:border-gray-700' : ''} ${isMobile || isTablet ? 'border-b border-gray-200 dark:border-gray-700' : ''} transition-all ${isFullscreen && fullscreenMode === 'editor' ? 'fixed inset-0 z-50' : ''}`}
            style={!isMobile && !isTablet && !isFullscreen ? { width: `${editorWidth}%` } : {}}
          >
            {/* Tabs */}
            <div className="flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isMobile ? 'px-3 py-2.5 text-xs' : 'px-6 py-3 text-sm'
                  } font-medium transition-all whitespace-nowrap touch-manipulation ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                      : 'text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              {!isMobile && (
                <div className="ml-auto flex items-center px-4">
                  <button
                    onClick={() => handleFullscreen('editor')}
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-medium transition-all"
                    title={isFullscreen && fullscreenMode === 'editor' ? t('exitFullscreen') : t('fullscreen')}
                  >
                    {isFullscreen && fullscreenMode === 'editor' ? '⤓' : '⤢'}
                  </button>
                </div>
              )}
            </div>

            {/* Editor */}
            <div className={`flex-1 min-h-0 ${isMobile ? 'p-2' : 'p-4'}`}>
              <Editor
                language={activeTab}
                value={getCurrentCode()}
                onChange={setCurrentCode}
                label={tabs.find(t => t.id === activeTab)?.label || t('html')}
                isMobile={isMobile}
                fontSize={fontSize}
              />
            </div>
          </div>

          {/* Resizer for desktop */}
          {!isMobile && !isTablet && !isFullscreen && (
            <div
              onMouseDown={handleMouseDown}
              className={`w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize transition-colors ${
                isResizing ? 'bg-blue-400' : ''
              }`}
              style={{ userSelect: 'none' }}
            />
          )}

          {/* Preview Section */}
          <div 
            className={`preview-container flex flex-col bg-white dark:bg-gray-900 ${
              isMobile ? 'h-[50vh]' : isTablet ? 'h-[55vh]' : 'h-full'
            } ${isFullscreen && fullscreenMode === 'preview' ? 'fixed inset-0 z-50' : ''}`}
            style={!isMobile && !isTablet && !isFullscreen ? { width: `${100 - editorWidth}%` } : {}}
          >
            <div className={`flex-1 min-h-0 ${isMobile ? 'p-2' : 'p-4'} relative`}>
              {!isMobile && (
                  <button
                    onClick={() => handleFullscreen('preview')}
                    className="absolute top-2 right-2 z-10 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-medium transition-all shadow-sm"
                    title={isFullscreen && fullscreenMode === 'preview' ? t('exitFullscreen') : t('fullscreen')}
                  >
                    {isFullscreen && fullscreenMode === 'preview' ? '⤓' : '⤢'}
                  </button>
              )}
              <Preview html={html} css={css} js={js} isMobile={isMobile} />
            </div>
          </div>
        </div>

        {/* Modals */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          isMobile={isMobile}
        />

        <TemplatesModal
          isOpen={isTemplatesOpen}
          onClose={() => setIsTemplatesOpen(false)}
          onSelectTemplate={handleSelectTemplate}
          isMobile={isMobile}
        />

        <StatisticsModal
          isOpen={isStatisticsOpen}
          onClose={() => setIsStatisticsOpen(false)}
          html={html}
          css={css}
          js={js}
          isMobile={isMobile}
        />

        <ShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
          isMobile={isMobile}
        />

        {/* Share Notification */}
        {showShareNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50"
          >
            {t('copied')}
          </motion.div>
        )}
      </div>
    </>
  );
}
