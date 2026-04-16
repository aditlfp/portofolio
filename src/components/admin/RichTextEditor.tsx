'use client';

import React, { useEffect, useRef } from 'react';

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

  const runCommand = (command: string, commandValue?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, commandValue);
    updateValue();
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL (https://...)');
    if (!url) return;
    runCommand('createLink', url);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-label uppercase font-bold text-on-surface-variant">{label}</label>
      <div className="rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/20 focus-within:ring-2 focus-within:ring-primary">
        <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/15 px-3 py-2">
          <button type="button" title="Bold" className="px-2 py-1 text-xs font-bold rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('bold')}>B</button>
          <button type="button" title="Italic" className="px-2 py-1 text-xs italic rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('italic')}>I</button>
          <button type="button" title="Underline" className="px-2 py-1 text-xs underline rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('underline')}>U</button>
          <button type="button" title="Paragraph" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('formatBlock', 'p')}>P</button>
          <button type="button" title="Heading 2" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('formatBlock', 'h2')}>H2</button>
          <button type="button" title="Heading 3" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('formatBlock', 'h3')}>H3</button>
          <button type="button" title="Bullet List" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('insertUnorderedList')}>• List</button>
          <button type="button" title="Numbered List" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('insertOrderedList')}>1. List</button>
          <button type="button" title="Quote" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('formatBlock', 'blockquote')}>Quote</button>
          <button type="button" title="Align Left" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('justifyLeft')}>Left</button>
          <button type="button" title="Align Center" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('justifyCenter')}>Center</button>
          <button type="button" title="Align Right" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('justifyRight')}>Right</button>
          <button type="button" title="Insert Link" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={insertLink}>Link</button>
          <button type="button" title="Remove Link" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('unlink')}>Unlink</button>
          <button type="button" title="Undo" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('undo')}>Undo</button>
          <button type="button" title="Redo" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('redo')}>Redo</button>
          <button type="button" title="Clear Format" className="px-2 py-1 text-xs rounded-md bg-surface-container-high hover:bg-surface-container-highest" onClick={() => runCommand('removeFormat')}>Clear</button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          className="min-h-[220px] px-4 py-3 outline-none text-sm leading-relaxed text-on-surface [&_a]:text-primary [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_li]:ml-5 [&_ol]:my-4 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:my-4 [&_ul]:list-disc empty:before:content-[attr(data-placeholder)] empty:before:text-on-surface-variant"
          onInput={updateValue}
          onBlur={updateValue}
        />
      </div>
    </div>
  );
}
