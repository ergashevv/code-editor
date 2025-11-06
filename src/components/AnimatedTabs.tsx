'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { animate } from 'animejs';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function AnimatedTabs({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}: AnimatedTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsRef.current) {
      // Tabs entrance
      const tabButtons = tabsRef.current.querySelectorAll('button');
      animate(
        tabButtons,
        {
          opacity: [0, 1],
          translateY: [-10, 0],
          duration: 400,
          delay: (el: any, i: number) => i * 50,
          easing: 'easeOutExpo',
        }
      );
    }
  }, []);

  useEffect(() => {
    // Update indicator position
    if (indicatorRef.current && tabsRef.current) {
      const activeButton = tabsRef.current.querySelector(`button[data-tab="${activeTab}"]`) as HTMLElement;
      if (activeButton) {
        const { offsetLeft, offsetWidth } = activeButton;
        animate(
          indicatorRef.current,
          {
            translateX: [indicatorRef.current.style.transform ? parseFloat(indicatorRef.current.style.transform.match(/translateX\(([^)]+)\)/)?.[1] || '0') : 0, offsetLeft],
            width: [indicatorRef.current.offsetWidth, offsetWidth],
            duration: 400,
            easing: 'easeOutExpo',
            onRender: () => {
              if (indicatorRef.current) {
                indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
                indicatorRef.current.style.width = `${offsetWidth}px`;
              }
            }
          }
        );
      }
    }

    // Content animation
    if (contentRef.current) {
      animate(
        contentRef.current,
        {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 400,
          easing: 'easeOutExpo',
        }
      );
    }
  }, [activeTab]);

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      <div ref={tabsRef} className="relative flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex-1 px-4 py-2 rounded-md font-medium transition-colors z-10 ${
              activeTab === tab.id
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div
          ref={indicatorRef}
          className="absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-md shadow-sm transition-all duration-300 z-0"
          style={{ width: '0px', transform: 'translateX(0px)' }}
        />
      </div>
      <div ref={contentRef} className="mt-4" style={{ opacity: 0 }}>
        {activeContent}
      </div>
    </div>
  );
}

