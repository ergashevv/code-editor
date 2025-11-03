'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import { useTheme } from '../hooks/useTheme';
import type { Monaco } from '@monaco-editor/react';
import { htmlTags, htmlAttributes } from '../lib/autocomplete';
import { expandEmmet, shouldExpandEmmet } from '../lib/emmet';
import { validateHTML, ValidationError } from '../lib/htmlValidator';
import { isSelfClosingTag, findMatchingClosingTag, findOpeningTag, findClosingTagByPosition, findMatchingClosingTagSimple } from '../lib/htmlHelpers';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-gray-500">Loading editor...</div>,
});

interface EditorComponentProps {
  language: 'html' | 'css' | 'javascript';
  value: string;
  onChange: (value: string) => void;
  label: string;
  isMobile?: boolean;
  fontSize?: number;
}

export default function Editor({ language: editorLanguage, value, onChange, label, isMobile = false, fontSize = 14 }: EditorComponentProps) {
  const { t, language: i18nLanguage } = useI18n();
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const monacoLanguage = editorLanguage === 'javascript' ? 'javascript' : editorLanguage;

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set initial theme immediately
    const initialTheme = theme === 'dark' ? 'vs-dark' : 'vs';
    try {
      monaco.editor.setTheme(initialTheme);
    } catch (error) {
      console.error('Error setting initial Monaco theme:', error);
    }

    // Enable text selection on mobile devices
    if (isMobile) {
      const editorDomNode = editor.getDomNode();
      if (editorDomNode) {
        // Ensure text selection is enabled on the editor DOM node
        editorDomNode.style.userSelect = 'text';
        editorDomNode.style.webkitUserSelect = 'text';
        editorDomNode.style.touchAction = 'auto';
        
        // Allow selection on all child elements
        const setUserSelect = (element: HTMLElement) => {
          element.style.userSelect = 'text';
          element.style.webkitUserSelect = 'text';
          element.style.touchAction = 'auto';
          Array.from(element.children).forEach((child) => {
            if (child instanceof HTMLElement) {
              setUserSelect(child);
            }
          });
        };
        
        // Apply to all Monaco editor elements
        setTimeout(() => {
          const monacoElements = editorDomNode.querySelectorAll('.monaco-editor, .monaco-editor *');
          monacoElements.forEach((el: Element) => {
            if (el instanceof HTMLElement) {
              setUserSelect(el);
            }
          });
        }, 100);
      }
    }

    // Validate HTML and show markers
    const updateMarkers = () => {
      if (editorLanguage === 'html' && editor.getModel()) {
        const errors = validateHTML(value, i18nLanguage);
        const markers = errors.map((err) => ({
          startLineNumber: err.line,
          endLineNumber: err.line,
          startColumn: err.column,
          endColumn: err.column + 10,
          message: err.message,
          severity: err.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
          source: 'HTML Validator',
        }));

        monaco.editor.setModelMarkers(editor.getModel()!, 'html-validator', markers);
      }
    };

    // Initial validation
    updateMarkers();

    // Listen for language changes
    const handleLanguageChange = () => {
      updateMarkers();
    };
    window.addEventListener('language-changed', handleLanguageChange);

    // Cleanup
    editor.onDidDispose(() => {
      window.removeEventListener('language-changed', handleLanguageChange);
    });

    if (editorLanguage === 'html') {
      let renameTimeout: NodeJS.Timeout | null = null;
      
      // Combined handler for auto-close and auto-rename
      editor.onDidChangeModelContent((e: any) => {
        if (!e.changes || e.changes.length === 0) return;
        
        const change = e.changes[0];
        const model = editor.getModel();
        const position = change.range.getStartPosition();
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });
        
        // Auto-close tags when typing >
        if (change.text === '>' && change.rangeLength === 0) {
          // Check if we just closed an opening tag (not a closing tag)
          const tagMatch = textUntilPosition.match(/<([a-zA-Z][a-zA-Z0-9]*)\s*[^/>]*>$/);
          if (tagMatch && !textUntilPosition.match(/<\/\s*[^>]*>$/)) {
            const tagName = tagMatch[1];
            if (!isSelfClosingTag(tagName)) {
              // Check if there's already a closing tag immediately after
              const textAfterPosition = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: position.column + 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column + tagName.length + 4,
              });
              
              const closingTagPattern = new RegExp(`^<\\/\\s*${tagName}\\s*>`, 'i');
              if (!textAfterPosition.match(closingTagPattern)) {
                // Insert closing tag
                setTimeout(() => {
                  editor.executeEdits('auto-close-tag', [
                    {
                      range: new monaco.Range(
                        position.lineNumber,
                        position.column + 1,
                        position.lineNumber,
                        position.column + 1
                      ),
                      text: `</${tagName}>`,
                    },
                  ]);
                  // Move cursor back inside the tag
                  editor.setPosition(position);
                }, 0);
              }
            }
          }
        }
        
        // Auto-rename tags when opening tag name is changed (NEW SIMPLE APPROACH)
        // Only handle small text changes (tag name editing)
        if (change.text.length <= 10 && change.rangeLength <= 10 && change.text !== '>') {
          // Check if we're editing inside an opening tag name
          const openingTagMatch = textUntilPosition.match(/<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*$/);
          const isInClosingTag = textUntilPosition.match(/<\/\s*[a-zA-Z]/);
          const isInAttribute = textUntilPosition.match(/<[a-zA-Z][a-zA-Z0-9]*\s+[^>]*$/);
          
          if (openingTagMatch && !isInClosingTag && !isInAttribute) {
            const newTagName = openingTagMatch[1];
            
            // Only proceed if tag name is valid and not empty
            if (newTagName.length > 0 && !isSelfClosingTag(newTagName)) {
              // Clear previous timeout
              if (renameTimeout) {
                clearTimeout(renameTimeout);
              }
              
              // Simple immediate update
              renameTimeout = setTimeout(() => {
                const fullText = model.getValue();
                const currentPosition = editor.getPosition();
                if (!currentPosition) return;
                
                const offset = model.getOffsetAt(currentPosition);
                const beforePosition = fullText.substring(0, offset);
                
                // Find the opening tag position - look for the most recent <tagName
                let lastOpeningTagIndex = -1;
                const tagRegex = /<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*/g;
                let match;
                
                while ((match = tagRegex.exec(beforePosition)) !== null) {
                  const tagName = match[1];
                  if (!isSelfClosingTag(tagName)) {
                    lastOpeningTagIndex = match.index;
                  }
                }
                
                if (lastOpeningTagIndex === -1) return;
                
                // Verify the tag at this position matches newTagName
                const tagAtPos = fullText.substring(lastOpeningTagIndex).match(/^<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*/);
                if (!tagAtPos || tagAtPos[1].toLowerCase() !== newTagName.toLowerCase()) {
                  return;
                }
                
                // Find matching closing tag using simple depth algorithm
                const closingTag = findMatchingClosingTagSimple(fullText, lastOpeningTagIndex);
                
                if (closingTag && closingTag.found) {
                  // Get the closing tag to check its name
                  const closingTagText = model.getValueInRange({
                    startLineNumber: closingTag.line,
                    startColumn: closingTag.column,
                    endLineNumber: closingTag.line,
                    endColumn: Math.min(closingTag.endColumn, model.getLineLength(closingTag.line) + 1),
                  });
                  
                  // Extract closing tag name
                  const closingMatch = closingTagText.match(/<\/\s*([a-zA-Z][a-zA-Z0-9]*)\s*>/);
                  if (closingMatch) {
                    const currentClosingName = closingMatch[1];
                    
                    // Update if names don't match
                    if (currentClosingName.toLowerCase() !== newTagName.toLowerCase()) {
                      editor.executeEdits('auto-rename-tag', [
                        {
                          range: new monaco.Range(
                            closingTag.line,
                            closingTag.column + 2, // After </
                            closingTag.line,
                            closingTag.column + 2 + currentClosingName.length
                          ),
                          text: newTagName,
                        },
                      ]);
                    }
                  }
                }
              }, 100); // Simple debounce
            }
          }
        }
      });

      // Highlight matching tags when cursor is inside a tag
      editor.onDidChangeCursorPosition(() => {
        const model = editor.getModel();
        const position = editor.getPosition();
        if (!position) return;
        
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });
        
        // Check if cursor is inside a tag
        const insideOpeningTag = textUntilPosition.match(/<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*$/);
        const insideClosingTag = textUntilPosition.match(/<\/\s*([a-zA-Z][a-zA-Z0-9]*)\s*$/);
        
        if (insideOpeningTag || insideClosingTag) {
          const tagName = insideOpeningTag ? insideOpeningTag[1] : insideClosingTag![1];
          const fullText = model.getValue();
          const offset = model.getOffsetAt(position);
          
          // Find matching tag
          if (insideOpeningTag) {
            const closingTag = findMatchingClosingTag(fullText, offset, tagName);
            if (closingTag && closingTag.found) {
              // Monaco will automatically highlight matching brackets
              // We can add custom decorations here if needed
            }
          } else {
            const openingTag = findOpeningTag(fullText, offset);
            if (openingTag && openingTag.found && openingTag.tagName.toLowerCase() === tagName.toLowerCase()) {
              // Matching tag found
            }
          }
        }
      });

      // Helper function to expand Emmet and position cursor
      const expandEmmetAbbreviation = (abbreviation: string, range: any) => {
        const expanded = expandEmmet(abbreviation);
        if (!expanded) return false;

        editor.executeEdits('emmet-expand', [
          {
            range,
            text: expanded,
          },
        ]);

        // Position cursor at $0 marker
        setTimeout(() => {
          const model = editor.getModel();
          const newText = model.getValue();
          const cursorIndex = newText.indexOf('$0');
          if (cursorIndex !== -1) {
            const newPos = model.getPositionAt(cursorIndex);
            editor.setPosition(newPos);
            // Remove $0 marker
            const markerRange = new monaco.Range(
              newPos.lineNumber,
              newPos.column,
              newPos.lineNumber,
              newPos.column + 2
            );
            editor.executeEdits('remove-marker', [
              {
                range: markerRange,
                text: '',
              },
            ]);
          }
        }, 10);

        return true;
      };

      // Add Emmet expansion on Tab key
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE, () => {
        const model = editor.getModel();
        const position = editor.getPosition();
        const text = model.getValue();
        const offset = model.getOffsetAt(position);
        
        const { shouldExpand, abbreviation } = shouldExpandEmmet(text, offset);
        
        if (shouldExpand) {
          const lineStart = model.getLineContent(position.lineNumber);
          const abbreviationStart = lineStart.lastIndexOf(abbreviation);
          const startColumn = abbreviationStart >= 0 ? abbreviationStart + 1 : 1;
          
          const range = new monaco.Range(
            position.lineNumber,
            startColumn,
            position.lineNumber,
            position.column
          );
          
          expandEmmetAbbreviation(abbreviation, range);
        }
      });

      // Add Emmet expansion when Tab is pressed after abbreviation
      // Only intercept if Emmet abbreviation is detected, otherwise let default behavior work
      editor.onKeyDown((e: any) => {
        // Only handle Tab if no modifiers are pressed (let Ctrl+Tab, Shift+Tab work normally)
        if (e.keyCode === monaco.KeyCode.Tab && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
          const model = editor.getModel();
          const position = editor.getPosition();
          const text = model.getValue();
          const offset = model.getOffsetAt(position);
          
          const { shouldExpand, abbreviation } = shouldExpandEmmet(text, offset);
          
          // Only prevent default if Emmet expansion is possible
          if (shouldExpand && abbreviation) {
            e.preventDefault();
            e.stopPropagation();
            
            const lineStart = model.getLineContent(position.lineNumber);
            const abbreviationStart = lineStart.lastIndexOf(abbreviation);
            const startColumn = abbreviationStart >= 0 ? abbreviationStart + 1 : 1;
            
            const range = new monaco.Range(
              position.lineNumber,
              startColumn,
              position.lineNumber,
              position.column
            );
            
            if (expandEmmetAbbreviation(abbreviation, range)) {
              return;
            }
          }
          // If no Emmet expansion, let Tab work normally (indentation, etc.)
        }

        // Handle Enter key for ! abbreviation only
        // Don't interfere with other Enter key behaviors
        if (e.keyCode === monaco.KeyCode.Enter && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
          const model = editor.getModel();
          const position = editor.getPosition();
          const lineText = model.getLineContent(position.lineNumber);
          const trimmed = lineText.trim();
          
          // Only intercept if line is exactly "!" or "! "
          if (trimmed === '!' || trimmed === '! ') {
            e.preventDefault();
            e.stopPropagation();
            
            const lineStartColumn = lineText.match(/^\s*/)?.[0].length || 0;
            const range = new monaco.Range(
              position.lineNumber,
              lineStartColumn + 1,
              position.lineNumber,
              position.column
            );
            
            expandEmmetAbbreviation('!', range);
          }
          // Otherwise, let Enter work normally
        }
      });

      // Register custom HTML tag completions
      monaco.languages.registerCompletionItemProvider('html', {
        provideCompletionItems: (model, position, context) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          const word = model.getWordUntilPosition(position);
          const suggestions: any[] = [];

          // Check if we're typing after <
          const tagMatch = textUntilPosition.match(/<(\w*)$/);
          if (tagMatch) {
            const prefix = tagMatch[1].toLowerCase();
            htmlTags.forEach((tag) => {
              if (tag.startsWith(prefix) || prefix === '') {
                suggestions.push({
                  label: tag,
                  kind: monaco.languages.CompletionItemKind.Property,
                  insertText: tag,
                  documentation: `HTML tag: <${tag}>`,
                  range: {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: prefix.length > 0 ? position.column - prefix.length : position.column,
                    endColumn: position.column,
                  },
                  sortText: prefix === '' ? `0${tag}` : `1${tag}`,
                });
              }
            });
          }

          // Check if we're typing an attribute (after space in tag)
          const attrMatch = textUntilPosition.match(/<\w+[^>]*\s+(\w*)$/);
          if (attrMatch && suggestions.length === 0) {
            const prefix = attrMatch[1].toLowerCase();
            htmlAttributes.forEach((attr) => {
              if (attr.startsWith(prefix) || prefix === '') {
                suggestions.push({
                  label: attr,
                  kind: monaco.languages.CompletionItemKind.Field,
                  insertText: `${attr}="$1"`,
                  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  documentation: `HTML attribute: ${attr}`,
                  range: {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: prefix.length > 0 ? position.column - prefix.length : position.column,
                    endColumn: position.column,
                  },
                });
              }
            });
          }

          // Also suggest tags when typing without < (like typing "h1" should suggest <h1>)
          // This should work both on automatic trigger and manual invoke
          if (suggestions.length === 0) {
            const currentWord = word.word.toLowerCase();
            const lineText = model.getLineContent(position.lineNumber);
            const beforeWord = lineText.substring(0, word.startColumn - 1).trim();
            
            // Check if we're typing a tag name (not inside a tag, attribute, or string)
            const isInTag = /<[^>]*$/.test(textUntilPosition) && !textUntilPosition.match(/<\s*$/);
            const isInString = /["'][^"']*$/.test(textUntilPosition) || /=["'][^"']*$/.test(textUntilPosition);
            const isInAttribute = /<\w+[^>]*\s+\w+.*$/.test(textUntilPosition) && !textUntilPosition.match(/<\s*$/);
            
            // Only suggest if we're not inside a tag, attribute, or string
            // and the word looks like a tag name (at least 1 character)
            if (currentWord.length >= 1 && !isInTag && !isInString && !isInAttribute) {
              // Check if this looks like a tag name (letters and numbers, starting with letter)
              if (/^[a-z][a-z0-9]*$/i.test(currentWord)) {
                htmlTags.forEach((tag) => {
                  if (tag.startsWith(currentWord)) {
                    suggestions.push({
                      label: tag,
                      kind: monaco.languages.CompletionItemKind.Property,
                      insertText: `<${tag}>$0</${tag}>`,
                      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      documentation: `HTML tag: <${tag}>`,
                      range: {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn,
                      },
                      sortText: tag === currentWord ? `0${tag}` : tag.startsWith(currentWord) ? `1${tag}` : `2${tag}`,
                    });
                  }
                });
              }
            }
          }

          return suggestions.length > 0 ? { 
            suggestions,
            incomplete: false
          } : { suggestions: [] };
        },
        triggerCharacters: ['<', ' '],
      });
    }
  };

  // Update theme in real-time
  useEffect(() => {
    if (monacoRef.current) {
      const monaco = monacoRef.current;
      const newTheme = theme === 'dark' ? 'vs-dark' : 'vs';
      try {
        monaco.editor.setTheme(newTheme);
      } catch (error) {
        console.error('Error setting Monaco theme:', error);
      }
    }
  }, [theme]);

  // Update markers when value or language changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current && editorLanguage === 'html') {
      const errors = validateHTML(value, i18nLanguage);
      const markers = errors.map((err) => ({
        startLineNumber: err.line,
        endLineNumber: err.line,
        startColumn: err.column,
        endColumn: err.column + 10,
        message: err.message,
        severity: err.severity === 'error' 
          ? monacoRef.current!.MarkerSeverity.Error 
          : monacoRef.current!.MarkerSeverity.Warning,
        source: 'HTML Validator',
      }));

      if (editorRef.current.getModel()) {
        monacoRef.current.editor.setModelMarkers(
          editorRef.current.getModel()!,
          'html-validator',
          markers
        );
      }
    }
  }, [value, i18nLanguage, editorLanguage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className={`${isMobile ? 'px-2 py-1.5' : 'px-4 py-2'} bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700`}>
        <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-700 dark:text-gray-200`}>{label}</h3>
      </div>
      <div className="flex-1 min-h-0 bg-white dark:bg-gray-900" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
        <MonacoEditor
          height="100%"
          language={monacoLanguage}
          value={value}
          onChange={(val) => onChange(val || '')}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          onMount={handleEditorDidMount}
          options={{
            fontSize: fontSize || (isMobile ? 13 : 14),
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: isMobile ? 'off' : 'on',
            lineDecorationsWidth: isMobile ? 0 : 10,
            lineNumbersMinChars: isMobile ? 0 : 3,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            quickSuggestionsDelay: isMobile ? 300 : 100,
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: 'on',
            snippetSuggestions: 'top',
            wordBasedSuggestions: 'matchingDocuments',
            suggestSelection: 'first',
            tabCompletion: 'on',
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false,
            },
            renderLineHighlight: isMobile ? 'none' : 'all',
            // Enable all standard keyboard shortcuts
            multiCursorModifier: 'ctrlCmd',
            accessibilitySupport: 'on',
            // Don't disable any default commands
            readOnly: false,
            // Allow all default keyboard shortcuts
            contextmenu: true,
            // Enable selection shortcuts
            selectOnLineNumbers: true,
            glyphMargin: true,
            // Enable bracket matching and tag highlighting
            matchBrackets: 'always',
            // Enable find/replace shortcuts
            find: {
              addExtraSpaceOnTop: false,
              autoFindInSelection: 'never',
              seedSearchStringFromSelection: 'always',
            },
            // Enable word highlighting
            occurrencesHighlight: 'singleFile',
            // Enable selection highlighting
            selectionHighlight: true,
            // Enable text selection on mobile
            selectionClipboard: true,
            // Allow selection on touch devices
            disableLayerHinting: false,
            // Ensure text selection works
            emptySelectionClipboard: false,
          }}
        />
      </div>
    </motion.div>
  );
}

