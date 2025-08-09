import React, {useState} from 'react';
import {ClipboardIcon, SparklesIcon} from '../icons';

interface SummaryModalProps {
    isOpen: boolean;
    isGenerating: boolean;
    summary: string;
    onClose: () => void;
    onInsert: (summary: string) => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
                                                              isOpen,
                                                              isGenerating,
                                                              summary,
                                                              onClose,
                                                              onInsert,
                                                          }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (isGenerating || !summary) return;
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3">
                    <SparklesIcon className="h-6 w-6 text-blue-400"/>
                    <h2 className="text-2xl font-bold text-white">AI Summary</h2>
                </div>
                <div
                    className="my-4 p-4 bg-gray-900/70 rounded-md min-h-[10rem] max-h-80 overflow-y-auto text-gray-300">
                    {isGenerating ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                        </div>
                    ) : (
                        <p>{summary}</p>
                    )}
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleCopy}
                        disabled={isGenerating || !summary}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors flex items-center gap-2 disabled:bg-gray-700 disabled:cursor-not-allowed"
                    >
                        <ClipboardIcon className="h-4 w-4"/>
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                        onClick={() => onInsert(summary)}
                        disabled={isGenerating || !summary}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-800/50 disabled:cursor-not-allowed"
                    >
                        Insert as Blockquote
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-transparent text-gray-400 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
