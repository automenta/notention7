import React, { useState } from 'react';
import { finalizeEvent } from 'nostr-tools';

import type { Note, AppSettings, Property } from '@/types.ts';
import {
    SparklesIcon, TrashIcon, LoadingSpinner, WorldIcon,
    CubeIcon, CodeBracketsIcon, XCircleIcon
} from '../icons';
import { summarizeText } from '@/services/geminiService.ts';
import { pool } from '@/services/nostrService.ts';
import { hexToBytes, DEFAULT_RELAYS } from '@/utils/nostr.ts';
import { SemanticsModal } from './SemanticsModal';
import { SummaryModal } from './SummaryModal';

interface EditorHeaderProps {
    note: Note;
    contentText: string;
    settings: AppSettings;
    title: string;
    setTitle: (title: string) => void;
    onDelete: (id: string) => void;
    onSave: (note: Note) => void;
    onInsertSummary: (summary: string) => void;
    tags: string[];
    properties: Property[];
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
    note, contentText, settings, title, setTitle, onDelete, onSave, onInsertSummary, tags, properties
}) => {
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [summaryResult, setSummaryResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [isSemanticsModalOpen, setIsSemanticsModalOpen] = useState(false);
    
    const handleSummarize = async () => {
        const textToSummarize = contentText;
        if (!textToSummarize.trim()) return;

        setIsSummarizing(true);
        setError(null);
        try {
            const summary = await summarizeText(textToSummarize);
            setSummaryResult(summary);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred during summarization.");
        } finally {
            setIsSummarizing(false);
        }
    };
    
    const handlePublish = async () => {
        if (!settings.nostr.privkey) {
            setError("Nostr private key not set. Cannot publish.");
            return;
        }

        setIsPublishing(true);
        setError(null);
        try {
            const privkeyBytes = hexToBytes(settings.nostr.privkey);
            const eventTags = tags.map(tag => ['t', tag.replace(/^#/, '')]);

            const eventTemplate = {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000),
                tags: eventTags,
                content: `${title}\n\n${contentText}`,
            };

            const signedEvent = finalizeEvent(eventTemplate, privkeyBytes);
            const pubs = await Promise.all(pool.publish(DEFAULT_RELAYS, signedEvent));
            
            if (pubs.length === 0) {
                throw new Error("Failed to publish to any relays.");
            }

            const updatedNote = { 
                ...note, 
                nostrEventId: signedEvent.id, 
                publishedAt: new Date(signedEvent.created_at * 1000).toISOString(),
            };
            onSave(updatedNote);

        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown publishing error occurred.");
            console.error("Publishing error:", error);
        } finally {
            setIsPublishing(false);
        }
    };
    
    const isPublished = !!note.nostrEventId;

    return (
        <>
            {error && (
                <div className="absolute top-4 right-4 z-50 bg-red-800 border border-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold">Error</h4>
                        <button onClick={() => setError(null)} className="p-1 -mr-2 -mt-2 rounded-full hover:bg-red-700">
                            <XCircleIcon className="h-6 w-6"/>
                        </button>
                    </div>
                    <p className="text-sm mt-2">{error}</p>
                </div>
            )}
            <div className="flex-shrink-0 flex flex-col p-4 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span title="This note contains structured data.">
                            <CubeIcon className="h-6 w-6 text-gray-300"/>
                        </span>
                        <button onClick={() => setIsSemanticsModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500">
                            <CodeBracketsIcon className="h-4 w-4" /> View Semantics
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                         <button
                            onClick={handlePublish}
                            disabled={isPublishing || isPublished}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            title={isPublished ? "Note already published" : "Publish to Nostr"}
                        >
                            {isPublishing ? <LoadingSpinner className="h-4 w-4" /> : <WorldIcon className="h-4 w-4" />}
                            <span>{isPublished ? 'Published' : 'Publish'}</span>
                        </button>
                         <button
                            onClick={handleSummarize}
                            disabled={!settings.aiEnabled || isSummarizing || !contentText.trim()}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            title={!settings.aiEnabled ? "Enable AI in settings" : "Generate a summary"}
                        >
                            {isSummarizing ? <LoadingSpinner className="h-4 w-4" /> : <SparklesIcon className="h-4 w-4" />}
                            <span>Summarize</span>
                        </button>
                        <button onClick={() => onDelete(note.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-md" title="Delete note">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                 <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note Title"
                    className="w-full bg-transparent text-3xl font-bold text-white placeholder-gray-500 focus:outline-none pt-4 pb-0"
                />
            </div>

            {isSemanticsModalOpen && (
                <SemanticsModal tags={tags} properties={properties} onClose={() => setIsSemanticsModalOpen(false)} />
            )}
            {summaryResult && (
                <SummaryModal
                    summary={summaryResult}
                    onClose={() => setSummaryResult(null)}
                    onInsert={(summaryToInsert) => {
                        onInsertSummary(summaryToInsert);
                        setSummaryResult(null);
                    }}
                />
            )}
        </>
    );
};