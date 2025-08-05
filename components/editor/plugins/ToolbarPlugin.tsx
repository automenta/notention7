import React, { useState, useCallback, useEffect } from 'react';
import { EditorApi } from '../../../types/editor';
import {
    BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon,
    Heading1Icon, Heading2Icon, Heading3Icon, ListUlIcon,
    ListOlIcon, QuoteIcon, CodeBlockIcon, HorizontalRuleIcon,
} from '../../icons';

interface ToolbarPluginProps {
    editorApi: EditorApi;
}

export const ToolbarComponent: React.FC<ToolbarPluginProps> = ({ editorApi }) => {
    const [activeButtons, setActiveButtons] = useState<Record<string, boolean>>({});

    const updateActiveStates = useCallback(() => {
        const parent = editorApi.getSelectionParent();
        setActiveButtons({
            bold: editorApi.queryCommandState('bold'),
            italic: editorApi.queryCommandState('italic'),
            underline: editorApi.queryCommandState('underline'),
            strikeThrough: editorApi.queryCommandState('strikeThrough'),
            insertUnorderedList: editorApi.queryCommandState('insertUnorderedList'),
            insertOrderedList: editorApi.queryCommandState('insertOrderedList'),
            h1: parent?.closest('h1') !== null,
            h2: parent?.closest('h2') !== null,
            h3: parent?.closest('h3') !== null,
            blockquote: parent?.closest('blockquote') !== null,
            pre: parent?.closest('pre') !== null,
        });
    }, [editorApi]);

    useEffect(() => {
        const editor = editorApi.editorRef.current;
        const handleSelectionChange = () => updateActiveStates();

        document.addEventListener('selectionchange', handleSelectionChange);
        editor?.addEventListener('focus', handleSelectionChange);
        editor?.addEventListener('keyup', handleSelectionChange); // For block changes
        editor?.addEventListener('mouseup', handleSelectionChange); // For mouse-based selection

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            editor?.removeEventListener('focus', handleSelectionChange);
            editor?.removeEventListener('keyup', handleSelectionChange);
            editor?.removeEventListener('mouseup', handleSelectionChange);
        };
    }, [editorApi.editorRef, updateActiveStates]);

    const buttonClass = (isActive: boolean) =>
        `p-2 rounded-md transition-colors ${isActive ? 'bg-gray-600 text-white' : 'hover:bg-gray-700/80 text-gray-400 hover:text-gray-200'}`;

    return (
        <div className="flex-shrink-0 p-2 border-b border-gray-700/50 flex items-center flex-wrap gap-1">
            <button onClick={() => editorApi.execCommand('bold')} className={buttonClass(activeButtons['bold'])} title="Bold">
                <BoldIcon className="h-5 w-5" />
            </button>
            <button onClick={() => editorApi.execCommand('italic')} className={buttonClass(activeButtons['italic'])} title="Italic">
                <ItalicIcon className="h-5 w-5" />
            </button>
            <button onClick={() => editorApi.execCommand('underline')} className={buttonClass(activeButtons['underline'])} title="Underline">
                <UnderlineIcon className="h-5 w-5" />
            </button>
            <button onClick={() => editorApi.execCommand('strikeThrough')} className={buttonClass(activeButtons['strikeThrough'])} title="Strikethrough">
                <StrikethroughIcon className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <button onClick={() => editorApi.toggleBlock('h1')} className={buttonClass(activeButtons['h1'])} title="Heading 1">
                <Heading1Icon className="h-5 w-5" />
            </button>
            <button onClick={() => editorApi.toggleBlock('h2')} className={buttonClass(activeButtons['h2'])} title="Heading 2">
                <Heading2Icon className="h-5 w-5" />
            </button>
            <button onClick={() => editorApi.toggleBlock('h3')} className={buttonClass(activeButtons['h3'])} title="Heading 3">
                <Heading3Icon className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <button onClick={() => editorApi.execCommand('insertUnorderedList')} className={buttonClass(activeButtons['insertUnorderedList'])} title="Bullet List">
                <ListUlIcon className="h-5 w-5" />
            </button>
            <button onClick={() => editorApi.execCommand('insertOrderedList')} className={buttonClass(activeButtons['insertOrderedList'])} title="Numbered List">
                <ListOlIcon className="h-5 w-5" />
            </button>
            <button onClick={() => editorApi.toggleBlock('blockquote')} className={buttonClass(activeButtons['blockquote'])} title="Blockquote">
                <QuoteIcon className="h-5 w-5" />
            </button>
            <button onClick={() => editorApi.toggleBlock('pre')} className={buttonClass(activeButtons['pre'])} title="Code Block">
                <CodeBlockIcon className="h-5 w-5" />
            </button>
            <button onClick={() => editorApi.execCommand('insertHorizontalRule')} className={buttonClass(false)} title="Horizontal Rule">
                <HorizontalRuleIcon className="h-5 w-5" />
            </button>
        </div>
    );
};
