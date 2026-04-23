'use client';

import React, { useEffect, useMemo, useRef } from 'react';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const EMPTY_HTML_PATTERNS = new Set(['', '<br>', '<p><br></p>', '<div><br></div>']);

const normalizeHtml = (html: string): string => {
  const normalized = html.replace(/\u00a0/g, ' ').trim();
  return EMPTY_HTML_PATTERNS.has(normalized.toLowerCase()) ? '' : normalized;
};

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Write narrative...',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<Range | null>(null);

  const fontSizes = useMemo(() => {
    const sizes: number[] = [];
    for (let size = 2; size <= 72; size += 2) sizes.push(size);
    return sizes;
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const updateValue = () => {
    if (!editorRef.current) return;
    onChange(normalizeHtml(editorRef.current.innerHTML));
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!editorRef.current?.contains(range.commonAncestorContainer)) return;

    selectionRef.current = range.cloneRange();
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (!editorRef.current?.contains(range.commonAncestorContainer)) return;
      selectionRef.current = range.cloneRange();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const restoreSelection = () => {
    if (!selectionRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  };

  const runCommand = (command: string, commandValue?: string) => {
    if (!editorRef.current) return;
    const currentSelection = window.getSelection();
    const hasActiveEditorSelection =
      !!currentSelection &&
      currentSelection.rangeCount > 0 &&
      editorRef.current.contains(currentSelection.getRangeAt(0).commonAncestorContainer);

    editorRef.current.focus();
    if (!hasActiveEditorSelection) {
      restoreSelection();
    }
    document.execCommand(command, false, commandValue);
    saveSelection();
    updateValue();
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL (https://...)');
    if (!url) return;
    runCommand('createLink', url);
  };

  const applyFontSize = (size: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    if (range.collapsed) return;

    const fragment = range.extractContents();
    const span = document.createElement('span');
    span.style.fontSize = `${size}px`;
    span.appendChild(fragment);
    range.insertNode(span);

    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(nextRange);
    selectionRef.current = nextRange.cloneRange();

    updateValue();
  };

  const handleToolbarMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      event.preventDefault();
    }
  };

  const buttonClass =
    'px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest';

  return (
    <div className="space-y-2">
      <label className="text-xs font-label uppercase font-bold text-on-surface-variant">{label}</label>
      <div className="rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/20 focus-within:ring-2 focus-within:ring-primary">
        <div
          className="flex flex-wrap items-center gap-2 border-b border-outline-variant/15 px-3 py-2"
          onMouseDown={handleToolbarMouseDown}
        >
          <div className="flex items-center gap-1 rounded-lg bg-surface-container-low px-1.5 py-1">
            <button type="button" title="Bold" className={`${buttonClass} font-bold`} onClick={() => runCommand('bold')}>B</button>
            <button type="button" title="Italic" className={`${buttonClass} italic`} onClick={() => runCommand('italic')}>I</button>
            <button type="button" title="Underline" className={`${buttonClass} underline`} onClick={() => runCommand('underline')}>U</button>
          </div>

          <div className="h-6 w-px bg-outline-variant/30" />

          <div className="flex items-center gap-1 rounded-lg bg-surface-container-low px-1.5 py-1">
            <button type="button" title="Paragraph" className={buttonClass} onClick={() => runCommand('formatBlock', 'p')}>P</button>
            <button type="button" title="Heading 2" className={buttonClass} onClick={() => runCommand('formatBlock', 'h2')}>H2</button>
            <button type="button" title="Heading 3" className={buttonClass} onClick={() => runCommand('formatBlock', 'h3')}>H3</button>
            <select
              title="Font Size"
              className="h-7 rounded-md bg-surface-container-high px-2 text-xs outline-none ring-1 ring-transparent hover:bg-surface-container-highest focus:ring-primary"
              defaultValue=""
              onChange={(event) => {
                const nextSize = event.target.value;
                if (!nextSize) return;
                applyFontSize(nextSize);
                event.target.value = '';
              }}
            >
              <option value="" disabled>
                Size
              </option>
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size} pt
                </option>
              ))}
            </select>
          </div>

          <div className="h-6 w-px bg-outline-variant/30" />

          <div className="flex items-center gap-1 rounded-lg bg-surface-container-low px-1.5 py-1">
            <button type="button" title="Bullet List" className={buttonClass} onClick={() => runCommand('insertUnorderedList')}>* List</button>
            <button type="button" title="Numbered List" className={buttonClass} onClick={() => runCommand('insertOrderedList')}>1. List</button>
            <button type="button" title="Quote" className={buttonClass} onClick={() => runCommand('formatBlock', 'blockquote')}>Quote</button>
          </div>

          <div className="h-6 w-px bg-outline-variant/30" />

          <div className="flex items-center gap-1 rounded-lg bg-surface-container-low px-1.5 py-1">
            <button type="button" title="Align Left" className={buttonClass} onClick={() => runCommand('justifyLeft')}>Left</button>
            <button type="button" title="Align Center" className={buttonClass} onClick={() => runCommand('justifyCenter')}>Center</button>
            <button type="button" title="Align Right" className={buttonClass} onClick={() => runCommand('justifyRight')}>Right</button>
          </div>

          <div className="h-6 w-px bg-outline-variant/30" />

          <div className="flex items-center gap-1 rounded-lg bg-surface-container-low px-1.5 py-1">
            <button type="button" title="Insert Link" className={buttonClass} onClick={insertLink}>Link</button>
            <button type="button" title="Remove Link" className={buttonClass} onClick={() => runCommand('unlink')}>Unlink</button>
            <button type="button" title="Undo" className={buttonClass} onClick={() => runCommand('undo')}>Undo</button>
            <button type="button" title="Redo" className={buttonClass} onClick={() => runCommand('redo')}>Redo</button>
            <button type="button" title="Clear Format" className={buttonClass} onClick={() => runCommand('removeFormat')}>Clear</button>
          </div>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          className="min-h-[220px] px-4 py-3 outline-none text-sm leading-relaxed text-on-surface [&_a]:text-primary [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_li]:ml-5 [&_ol]:my-4 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:my-4 [&_ul]:list-disc empty:before:content-[attr(data-placeholder)] empty:before:text-on-surface-variant"
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          onInput={updateValue}
          onBlur={() => {
            saveSelection();
            updateValue();
          }}
        />
      </div>
    </div>
  );
}
