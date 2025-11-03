'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import type { Monaco } from '@monaco-editor/react';
import { htmlTags, htmlAttributes } from '../lib/autocomplete';
import { expandEmmet, shouldExpandEmmet } from '../lib/emmet';
import { validateHTML, ValidationError } from '../lib/htmlValidator';

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
}

export default function Editor({ language: editorLanguage, value, onChange, label, isMobile = false }: EditorComponentProps) {
  const { t, language: i18nLanguage } = useI18n();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const monacoLanguage = editorLanguage === 'javascript' ? 'javascript' : editorLanguage;

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

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
      className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden"
    >
      <div className={`${isMobile ? 'px-2 py-1.5' : 'px-4 py-2'} bg-gray-50 border-b border-gray-200`}>
        <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-700`}>{label}</h3>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language={monacoLanguage}
          value={value}
          onChange={(val) => onChange(val || '')}
          theme="vs"
          onMount={handleEditorDidMount}
          options={{
            fontSize: isMobile ? 13 : 14,
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
            // Enable find/replace shortcuts
            find: {
              addExtraSpaceOnTop: false,
              autoFindInSelection: 'never',
              seedSearchStringFromSelection: 'always',
            },
          }}
        />
      </div>
    </motion.div>
  );
}

