import React, { useEffect } from 'react';
import { useEditor } from '../hooks/useEditor';
import type { AppSettings, Note } from '@/types';
import { editorPlugins } from './editor/plugins';
import WidgetRenderer from './editor/widgets/WidgetRenderer';
import { SemanticInsertProvider } from './editor/plugins/SemanticInsertProvider';
import { getCursorPosition, setCursorPosition } from '../utils/selection';
import { sanitizeHTML } from '../utils/sanitize';

export const RichTextEditorV2: React.FC<{
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
  settings: AppSettings;
}> = ({ note, onSave, onDelete, settings }) => {
  const {
    editorRef,
    content,
    pendingWidgetEdit,
    handleInput,
    handleClick,
    handleKeyDown,
    headerComponents,
    toolbarComponents,
    modalComponents,
    popoverComponents,
    editorApi,
  } = useEditor(editorPlugins, note, settings, onSave, onDelete);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      const cursor = getCursorPosition(editorRef.current);
      editorRef.current.innerHTML = content;
      setCursorPosition(editorRef.current, cursor);
    }
  }, [content, editorRef]);

  useEffect(() => {
    if (pendingWidgetEdit) {
      const el = document.getElementById(pendingWidgetEdit);
      if (el) {
        editorApi.setEditingWidget(el);
      }
    }
  }, [pendingWidgetEdit, editorApi]);

  return (
    <SemanticInsertProvider>
      <div className="relative flex flex-col h-full bg-gray-800/50 rounded-lg overflow-hidden">
        {headerComponents.map((Component, index) => (
          <Component key={index} editorApi={editorApi} />
        ))}
        {toolbarComponents.map((Component, index) => (
          <Component key={index} editorApi={editorApi} />
        ))}

        <div className="flex-grow flex flex-col overflow-y-auto note-content relative">
          <div
            ref={editorRef}
            className="ProseMirror"
            contentEditable={true}
            onInput={handleInput}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            suppressContentEditableWarning={true}
            data-placeholder="Start writing..."
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
          />
          <WidgetRenderer editorApi={editorApi} />
          {popoverComponents.map((Popover, index) => (
            <Popover key={index} editorApi={editorApi} />
          ))}
        </div>

        {modalComponents.map((Modal, index) => (
          <Modal key={index} editorApi={editorApi} />
        ))}

        <div className="flex-shrink-0 p-2 text-xs text-center text-gray-500 border-t border-gray-700/50">
          Last saved: {new Date(note.updatedAt).toLocaleString()}
        </div>
      </div>
    </SemanticInsertProvider>
  );
};
