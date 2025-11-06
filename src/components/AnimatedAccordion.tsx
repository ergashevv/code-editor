'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import { animate } from 'animejs';

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface AnimatedAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export default function AnimatedAccordion({
  items,
  allowMultiple = false,
  className = ''
}: AnimatedAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const accordionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (accordionRef.current) {
      // Items entrance
      const accordionItems = accordionRef.current.querySelectorAll('.accordion-item');
      animate(
        accordionItems,
        {
          opacity: [0, 1],
          translateX: [-30, 0],
          duration: 500,
          delay: (el: any, i: number) => i * 100,
          easing: 'easeOutExpo',
        }
      );
    }
  }, []);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      if (allowMultiple) {
        return prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId];
      } else {
        return prev.includes(itemId) ? [] : [itemId];
      }
    });
  };

  return (
    <div ref={accordionRef} className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItems.includes(item.id)}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </div>
  );
}

function AccordionItem({ item, isOpen, onToggle }: { item: AccordionItem; isOpen: boolean; onToggle: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        // Expand animation
        animate(
          contentRef.current,
          {
            height: [0, contentRef.current.scrollHeight],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutExpo',
          }
        );

        // Icon rotation
        if (iconRef.current) {
          animate(
            iconRef.current,
            {
              rotateZ: [0, 180],
              duration: 400,
              easing: 'easeOutExpo',
            }
          );
        }
      } else {
        // Collapse animation
        animate(
          contentRef.current,
          {
            height: [contentRef.current.scrollHeight, 0],
            opacity: [1, 0],
            duration: 400,
            easing: 'easeInExpo',
          }
        );

        // Icon rotation
        if (iconRef.current) {
          animate(
            iconRef.current,
            {
              rotateZ: [180, 0],
              duration: 400,
              easing: 'easeInExpo',
            }
          );
        }
      }
    }
  }, [isOpen]);

  return (
    <div className="accordion-item border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" style={{ opacity: 0 }}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
        <div
          ref={iconRef}
          className="text-gray-500 dark:text-gray-400"
          style={{ transform: 'rotate(0deg)' }}
        >
          ▼
        </div>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: '0px', opacity: 0 }}
      >
        <div className="px-4 py-3 text-gray-600 dark:text-gray-300">
          {item.content}
        </div>
      </div>
    </div>
  );
}

