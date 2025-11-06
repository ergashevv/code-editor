'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import { animate } from 'animejs';

interface DropdownOption {
  id: string;
  label: string;
  icon?: string;
}

interface AnimatedDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AnimatedDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = ''
}: AnimatedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Menu entrance
      animate(
        menuRef.current,
        {
          opacity: [0, 1],
          scale: [0.95, 1],
          translateY: [-10, 0],
          duration: 300,
          easing: 'easeOutExpo',
        }
      );

      // Options stagger
      const optionItems = menuRef.current.querySelectorAll('.dropdown-option');
      animate(
        optionItems,
        {
          opacity: [0, 1],
          translateX: [-20, 0],
          duration: 300,
          delay: (el: any, i: number) => i * 50,
          easing: 'easeOutExpo',
        }
      );
    } else if (!isOpen && menuRef.current) {
      // Menu exit - oddiy fade out
      animate(
        menuRef.current,
        {
          opacity: [1, 0],
          duration: 150,
          easing: 'easeOutExpo',
        }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-gray-900 dark:text-white">
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon && <span>{selectedOption.icon}</span>}
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          )}
        </span>
        <span className={`text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
          style={{ opacity: 0 }}
        >
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className="dropdown-option w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              style={{ opacity: 0 }}
            >
              {option.icon && <span>{option.icon}</span>}
              <span className="text-gray-900 dark:text-white">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

