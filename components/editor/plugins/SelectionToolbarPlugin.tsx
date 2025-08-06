import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { EditorApi, EditorPlugin } from '@/types/editor.ts';
import { PlusCircleIcon } from '@/components/icons';

const SelectionToolbar: React.FC<{ editorApi: EditorApi }> = ({ editorApi }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const selectedTextRef = useRef<string>('');

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      const text = selection.toString().trim();
      if (text.length > 0) {
        selectedTextRef.current = text;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setPosition({
          top: rect.top - 40, // Position above the selection
          left: rect.left + rect.width / 2,
        });
        setIsVisible(true);
        return;
      }
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const handleCreateProperty = () => {
    const context = {
      mode: 'property' as const,
      selectedValue: selectedTextRef.current,
    };
    editorApi.plugins['insert-menu'].open({ top: position.top + 40, left: position.left }, context);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    transform: 'translateX(-50%)',
    zIndex: 100,
  };

  return ReactDOM.createPortal(
    <div style={popoverStyle} className="bg-gray-900 rounded-md shadow-lg p-1 flex gap-1">
      <button
        onClick={handleCreateProperty}
        className="p-2 rounded-md transition-colors hover:bg-gray-700/80 text-gray-400 hover:text-gray-200"
        title="Create Property from Selection"
      >
        <PlusCircleIcon className="h-5 w-5" />
      </button>
    </div>,
    document.body
  );
};


export const selectionToolbarPlugin: EditorPlugin = {
  id: 'selection-toolbar',
  name: 'Selection Toolbar',
  Popover: SelectionToolbar,
};
