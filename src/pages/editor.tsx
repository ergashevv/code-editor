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
import ConsoleViewer from '../components/ConsoleViewer';
import ImportFiles from '../components/ImportFiles';
import CodeHistoryModal from '../components/CodeHistoryModal';
import MinifyBeautifyMenu from '../components/MinifyBeautifyMenu';
import ValidationPanel from '../components/ValidationPanel';
import ImageUploadModal from '../components/ImageUploadModal';
import ExportMenu from '../components/ExportMenu';
import ExportModal from '../components/ExportModal';
import { formatHTML, formatCSS, formatJS } from '../lib/formatUtils';
import { getShareUrl, copyToClipboard, decodeCode } from '../lib/shareUtils';
import { Template } from '../lib/templates';
import { isAuthenticated, ensureAuthenticated } from '../lib/api';
import { FileContent } from '../lib/fileUtils';
import { CodeVersion } from '../lib/historyUtils';
import { useRef } from 'react';

type TabType = 'html' | 'css' | 'javascript';

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function EditorPage() {
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
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (router.isReady) {
        if (!isAuthenticated()) {
          router.push('/auth');
          return;
        }

        const isValid = await ensureAuthenticated();
        if (!isValid) {
          router.push('/auth');
        }
      }
    };

    checkAuth();

    // Set up periodic token refresh
    const refreshInterval = setInterval(async () => {
      if (isAuthenticated()) {
        await ensureAuthenticated();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
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
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
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

  const handleImportFiles = (content: FileContent) => {
    if (content.html !== undefined) setHtml(content.html);
    if (content.css !== undefined) setCss(content.css);
    if (content.js !== undefined) setJs(content.js);
    setIsImportOpen(false);
  };

  const handleRestoreVersion = (version: CodeVersion) => {
    setHtml(version.html);
    setCss(version.css);
    setJs(version.js);
  };

  const handleUpdateCode = (newHtml: string, newCss: string, newJs: string) => {
    setHtml(newHtml);
    setCss(newCss);
    setJs(newJs);
  };

  const handleInsertImage = (imageCode: string) => {
    if (!html.trim() || !html.includes('<body')) {
      if (!html.trim()) {
        setHtml(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    ${imageCode}
</body>
</html>`);
      } else {
        setHtml(html + '\n' + imageCode);
      }
    } else {
      if (html.includes('</body>')) {
        setHtml(html.replace('</body>', `    ${imageCode}\n</body>`));
      } else {
        setHtml(html + '\n' + imageCode);
      }
    }
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
        <title>{t('appName')} - Code Editor</title>
        <meta name="description" content={`${t('appName')} - ${t('typeCodeBelow')}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="h-screen flex flex-col overflow-hidden bg-transparent">
        <Navbar
          onClear={handleClear}
          onSettings={() => setIsSettingsOpen(true)}
          isMobile={isMobile}
        />
        
        {/* Mobile: Minimal Header with Back and Toggle */}
        {isMobile ? (
          <div className="flex items-center justify-between px-2 py-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/home');
                }
              }}
              className="text-xs text-blue-600 dark:text-blue-400 active:text-blue-700 dark:active:text-blue-300 flex items-center gap-1 font-medium px-2 py-1 touch-manipulation"
            >
              ← {t('back') || 'Back'}
            </button>
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                onClick={() => setMobileView('editor')}
                className={`px-2 py-1 text-[10px] font-semibold rounded transition-all touch-manipulation ${
                  mobileView === 'editor'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                💻 {t('editor') || 'Editor'}
              </button>
              <button
                onClick={() => setMobileView('preview')}
                className={`px-2 py-1 text-[10px] font-semibold rounded transition-all touch-manipulation ${
                  mobileView === 'preview'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                👁️ {t('preview') || 'Preview'}
              </button>
            </div>
            
            {/* Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-xs text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-white px-2 py-1 touch-manipulation"
            >
              ☰
            </button>
          </div>
        ) : (
          <>
            {/* Desktop: Back Button */}
            <div className="px-4 py-2 shrink-0">
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    router.back();
                  } else {
                    router.push('/home');
                  }
                }}
                className="text-base sm:text-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 font-bold"
              >
                ← {t('back') || 'Back'}
              </button>
            </div>
            
            {/* Desktop: Action Buttons Bar */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 overflow-x-auto shrink-0">
              <ExportMenu html={html} css={css} js={js} isMobile={isMobile} onOpen={() => setIsExportOpen(true)} />
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 rounded-lg transition-all flex items-center justify-center"
                title={t('import')}
              >
                <span className="text-sm font-medium">{t('import')}</span>
              </button>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 rounded-lg transition-all flex items-center justify-center"
                title={t('history')}
              >
                <span className="text-sm font-medium">{t('history')}</span>
              </button>
              <button
                onClick={() => setIsValidationOpen(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 rounded-lg transition-all flex items-center justify-center"
                title={t('validation')}
              >
                <span className="text-sm font-medium">{t('validation')}</span>
              </button>
              <button
                onClick={() => setIsImageUploadOpen(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 rounded-lg transition-all flex items-center justify-center"
                title={t('imageUpload')}
              >
                <span className="text-sm font-medium">{t('imageUpload')}</span>
              </button>
            </div>
          </>
        )}
        
        {/* Mobile: Collapsible Menu */}
        {isMobile && showMobileMenu && (
          <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 py-2 shrink-0">
            <div className="flex flex-wrap gap-1">
              <ExportMenu html={html} css={css} js={js} isMobile={isMobile} onOpen={() => setIsExportOpen(true)} />
              <button
                onClick={() => { setIsImportOpen(true); setShowMobileMenu(false); }}
                className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white active:bg-gray-200 dark:active:bg-gray-600 rounded-lg transition-all touch-manipulation"
                title={t('import')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>
              <button
                onClick={() => { setIsHistoryOpen(true); setShowMobileMenu(false); }}
                className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white active:bg-gray-200 dark:active:bg-gray-600 rounded-lg transition-all touch-manipulation"
                title={t('history')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => { setIsValidationOpen(true); setShowMobileMenu(false); }}
                className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white active:bg-gray-200 dark:active:bg-gray-600 rounded-lg transition-all touch-manipulation"
                title={t('validation')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => { setIsImageUploadOpen(true); setShowMobileMenu(false); }}
                className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white active:bg-gray-200 dark:active:bg-gray-600 rounded-lg transition-all touch-manipulation"
                title={t('imageUpload')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => { setIsSettingsOpen(true); setShowMobileMenu(false); }}
                className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white active:bg-gray-200 dark:active:bg-gray-600 rounded-lg transition-all touch-manipulation"
                title={t('settings')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-inherit min-h-0">
          {/* Editor Section */}
          <div 
            className={`editor-container flex flex-col bg-white dark:bg-gray-900 ${
              isMobile 
                ? (mobileView === 'editor' ? 'h-full' : 'hidden')
                : isTablet 
                  ? 'h-[45vh]' 
                  : 'h-full'
            } ${!isMobile && !isTablet ? 'border-r border-gray-200 dark:border-gray-700' : ''} ${isMobile || isTablet ? 'border-b border-gray-200 dark:border-gray-700' : ''} transition-all ${isFullscreen && fullscreenMode === 'editor' ? 'fixed inset-0 z-50' : ''}`}
            style={!isMobile && !isTablet && !isFullscreen ? { width: `${editorWidth}%` } : {}}
          >
            {/* Tabs */}
            <div className="flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isMobile ? 'px-2 py-1.5 text-[10px]' : 'px-6 py-3 text-sm'
                  } font-medium transition-all whitespace-nowrap touch-manipulation ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                      : 'text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <div className={`ml-auto flex items-center gap-1 ${isMobile ? 'px-2' : 'px-4'}`}>
                {!isMobile && (
                  <MinifyBeautifyMenu
                    html={html}
                    css={css}
                    js={js}
                    activeTab={activeTab}
                    onUpdate={handleUpdateCode}
                    isMobile={isMobile}
                  />
                )}
                <button
                  onClick={() => handleFullscreen('editor')}
                  className={`${isMobile ? 'px-1.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-medium transition-all touch-manipulation`}
                  title={isFullscreen && fullscreenMode === 'editor' ? t('exitFullscreen') : t('fullscreen')}
                >
                  {isFullscreen && fullscreenMode === 'editor' ? '⤓' : '⤢'}
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className={`flex-1 min-h-0 ${isMobile ? 'p-1' : 'p-4'}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
              isMobile 
                ? (mobileView === 'preview' ? 'h-full' : 'hidden')
                : isTablet 
                  ? 'h-[55vh]' 
                  : 'h-full'
            } ${isFullscreen && fullscreenMode === 'preview' ? 'fixed inset-0 z-50' : ''}`}
            style={!isMobile && !isTablet && !isFullscreen ? { width: `${100 - editorWidth}%` } : {}}
          >
            <div className={`flex-1 min-h-0 ${isMobile ? 'p-1' : 'p-4'} relative flex flex-col`} style={{ height: '100%' }}>
              <div className={`absolute ${isMobile ? 'top-1 right-1' : 'top-2 right-2'} z-10 flex gap-1 shrink-0`}>
                {!isMobile && (
                  <button
                    onClick={() => setShowConsole(!showConsole)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all shadow-sm ${
                      showConsole 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white'
                    }`}
                    title={t('console')}
                  >
                    Console
                  </button>
                )}
                <button
                  onClick={() => handleFullscreen('preview')}
                  className={`${isMobile ? 'px-1.5 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-medium transition-all shadow-sm touch-manipulation`}
                  title={isFullscreen && fullscreenMode === 'preview' ? t('exitFullscreen') : t('fullscreen')}
                >
                  {isFullscreen && fullscreenMode === 'preview' ? '⤓' : '⤢'}
                </button>
              </div>
              <div className="flex-1 min-h-0" style={{ height: '100%', marginTop: isMobile ? '24px' : '0' }}>
                <Preview 
                  html={html} 
                  css={css} 
                  js={js} 
                  isMobile={isMobile} 
                  showConsole={showConsole}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          html={html}
          css={css}
          js={js}
          isMobile={isMobile}
        />

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

        <CodeHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          html={html}
          css={css}
          js={js}
          onRestore={handleRestoreVersion}
          isMobile={isMobile}
        />

        {isImportOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 p-6 pb-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('import')}</h2>
                <button
                  onClick={() => setIsImportOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 pt-4">
                <ImportFiles onImport={handleImportFiles} isMobile={isMobile} />
              </div>
            </div>
          </div>
        )}

        {isValidationOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 p-6 pb-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('validation')}</h2>
                <button
                  onClick={() => setIsValidationOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 pt-4">
                <ValidationPanel css={css} js={js} isMobile={isMobile} />
              </div>
            </div>
          </div>
        )}

        <ImageUploadModal
          isOpen={isImageUploadOpen}
          onClose={() => setIsImageUploadOpen(false)}
          onInsert={handleInsertImage}
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

