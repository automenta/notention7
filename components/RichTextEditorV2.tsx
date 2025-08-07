import React, { useEffect } from 'react';
import { useEditor } from '../hooks/useEditor';
import { sanitizeHTML } from '../utils/sanitize';
import type { AppSettings, Note } from '../types';
import { editorPlugins } from './editor/plugins';
import WidgetRenderer from './editor/widgets/WidgetRenderer';
import { SemanticInsertProvider } from './editor/plugins/SemanticInsertProvider';

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
    // Sync the editor's DOM with the state, but only if they differ.
    // This is to avoid resetting cursor position on every input.
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
    // We only want this to run when the content state changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

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
            // Set initial content. After this, the useEffect will sync state to the DOM.
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(note.content) }}
          />
          <WidgetRenderer editorApi={editorApi} />
          {/* Render all popover components provided by plugins */}
          {popoverComponents.map((Popover, index) => (
            <Popover key={index} editorApi={editorApi} />
          ))}
        </div>

        {/* Render all modal components provided by plugins */}
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
