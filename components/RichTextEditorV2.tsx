import React from 'react';
import {useEditor} from '../hooks/useEditor';
import {sanitizeHTML} from '../utils/sanitize';
import {EditorPlugin} from '../types/editor';
import type {AppSettings, Note} from '../types';

import {toolbarPlugin} from './editor/plugins/ToolbarPlugin';
import {semanticInsertPlugin} from './editor/plugins/SemanticInsertPlugin';
import {propertyEditorPlugin} from './editor/plugins/PropertyEditorPlugin';
import {inputRulesPlugin} from './editor/plugins/inputRulesPlugin';
import {editorHeaderPlugin} from './editor/plugins/EditorHeaderPlugin';

const editorPlugins: EditorPlugin[] = [
    editorHeaderPlugin,
    toolbarPlugin,
    semanticInsertPlugin,
    propertyEditorPlugin,
    inputRulesPlugin,
];

export const RichTextEditorV2: React.FC<{
    note: Note;
    onSave: (note: Note) => void;
    onDelete: (id: string) => void;
    settings: AppSettings;
}> = ({note, onSave, onDelete, settings}) => {
    const {
        editorRef,
        handleInput,
        handleClick,
        handleKeyDown,
        headerComponents,
        toolbarComponents,
        modalComponents,
        popoverComponents,
        editorApi,
    } = useEditor(editorPlugins, note, settings, onSave, onDelete);

    return (
        <div className="relative flex flex-col h-full bg-gray-800/50 rounded-lg overflow-hidden">
            {headerComponents.map((Component, index) => (
                <Component key={index} editorApi={editorApi}/>
            ))}
            {toolbarComponents.map((Component, index) => (
                <Component key={index} editorApi={editorApi}/>
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
                    dangerouslySetInnerHTML={{__html: sanitizeHTML(note.content)}}
                />
                {/* Render all popover components provided by plugins */}
                {popoverComponents.map((Popover, index) => (
                    <Popover key={index} editorApi={editorApi}/>
                ))}
            </div>

            {/* Render all modal components provided by plugins */}
            {modalComponents.map((Modal, index) => (
                <Modal key={index} editorApi={editorApi}/>
            ))}

            <div className="flex-shrink-0 p-2 text-xs text-center text-gray-500 border-t border-gray-700/50">
                Last saved: {new Date(note.updatedAt).toLocaleString()}
            </div>
        </div>
    );
};
