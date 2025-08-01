
import React, { useCallback, useState, useEffect } from 'react';
import {
    BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon,
    Heading1Icon, Heading2Icon, Heading3Icon,
    ListUlIcon, ListOlIcon, QuoteIcon, CodeIcon, CodeBlockIcon,
    LinkIcon, HorizontalRuleIcon
} from '../icons';

// A helper to safely execute commands
const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
};

// A helper to query command state for simple inline styles
const queryCommandState = (command: string) => {
    try {
        return document.queryCommandState(command);
    } catch (e) {
        return false;
    }
};

const getSelectionParent = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    return selection.getRangeAt(0).startContainer.parentElement;
}


interface ToolbarProps {
    editorRef: React.RefObject<HTMLDivElement>;
    onLink: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editorRef, onLink }) => {
    const [activeButtons, setActiveButtons] = useState<Record<string, boolean>>({});

    const updateActiveStates = useCallback(() => {
        if (!editorRef.current) return;
        const parent = getSelectionParent();
        setActiveButtons({
            bold: queryCommandState('bold'),
            italic: queryCommandState('italic'),
            underline: queryCommandState('underline'),
            strikeThrough: queryCommandState('strikeThrough'),
            insertUnorderedList: queryCommandState('insertUnorderedList'),
            insertOrderedList: queryCommandState('insertOrderedList'),
            h1: parent?.closest('h1') !== null,
            h2: parent?.closest('h2') !== null,
            h3: parent?.closest('h3') !== null,
            blockquote: parent?.closest('blockquote') !== null,
            code: parent?.closest('code') !== null,
            codeBlock: parent?.closest('pre') !== null,
        });
    }, [editorRef]);

    useEffect(() => {
        const handleSelectionChange = () => {
            updateActiveStates();
        };
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, [updateActiveStates]);
    
    const toggleBlock = (tag: string) => {
        const parent = getSelectionParent();
        if (parent?.closest(tag)) {
            execCommand('formatBlock', '<p>');
        } else {
            execCommand('formatBlock', `<${tag}>`);
        }
        editorRef.current?.focus();
        updateActiveStates();
    }
    
    const toggleCodeBlock = () => {
        toggleBlock('pre');
    }
    
    const buttonClass = (isActive: boolean) =>
        `p-2 rounded-md transition-colors ${isActive ? 'bg-gray-600 text-white' : 'hover:bg-gray-700/80 text-gray-400 hover:text-gray-200'}`;
    
    return (
        <div className="flex-shrink-0 p-2 border-b border-gray-700/50 flex items-center flex-wrap gap-1">
            <button onClick={() => { execCommand('bold'); updateActiveStates(); }} className={buttonClass(activeButtons['bold'])} title="Bold"><BoldIcon className="h-5 w-5"/></button>
            <button onClick={() => { execCommand('italic'); updateActiveStates(); }} className={buttonClass(activeButtons['italic'])} title="Italic"><ItalicIcon className="h-5 w-5"/></button>
            <button onClick={() => { execCommand('underline'); updateActiveStates(); }} className={buttonClass(activeButtons['underline'])} title="Underline"><UnderlineIcon className="h-5 w-5"/></button>
            <button onClick={() => { execCommand('strikeThrough'); updateActiveStates(); }} className={buttonClass(activeButtons['strikeThrough'])} title="Strikethrough"><StrikethroughIcon className="h-5 w-5"/></button>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <button onClick={() => toggleBlock('h1')} className={buttonClass(activeButtons['h1'])} title="Heading 1"><Heading1Icon className="h-5 w-5"/></button>
            <button onClick={() => toggleBlock('h2')} className={buttonClass(activeButtons['h2'])} title="Heading 2"><Heading2Icon className="h-5 w-5"/></button>
            <button onClick={() => toggleBlock('h3')} className={buttonClass(activeButtons['h3'])} title="Heading 3"><Heading3Icon className="h-5 w-5"/></button>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <button onClick={() => { execCommand('insertUnorderedList'); updateActiveStates(); }} className={buttonClass(activeButtons['insertUnorderedList'])} title="Bullet List"><ListUlIcon className="h-5 w-5"/></button>
            <button onClick={() => { execCommand('insertOrderedList'); updateActiveStates(); }} className={buttonClass(activeButtons['insertOrderedList'])} title="Numbered List"><ListOlIcon className="h-5 w-5"/></button>
            <button onClick={() => toggleBlock('blockquote')} className={buttonClass(activeButtons['blockquote'])} title="Blockquote"><QuoteIcon className="h-5 w-5"/></button>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <button onClick={onLink} className={buttonClass(false)} title="Add Link"><LinkIcon className="h-5 w-5"/></button>
            <button onClick={() => { execCommand('formatBlock', '<code>'); updateActiveStates(); }} className={buttonClass(activeButtons['code'])} title="Inline Code"><CodeIcon className="h-5 w-5"/></button>
            <button onClick={toggleCodeBlock} className={buttonClass(activeButtons['codeBlock'])} title="Code Block"><CodeBlockIcon className="h-5 w-5"/></button>
            <button onClick={() => execCommand('insertHorizontalRule')} className={buttonClass(false)} title="Horizontal Rule"><HorizontalRuleIcon className="h-5 w-5"/></button>
        </div>
    );
};