import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {CodeBracketsIcon, DocumentDuplicateIcon, PlusCircleIcon, TagIcon,} from '../../icons';
import {useOntologyIndex} from '@/hooks/useOntologyIndex.ts';
import {InsertMenu} from '../InsertMenu';
import type {InsertMenuItem} from '@/hooks/useInsertMenuItems.ts';
import type {EditorApi} from '@/types';
import {useSemanticInsert} from './useSemanticInsert';

export const SemanticInsertToolbar: React.FC = () => {
    const {openModal} = useSemanticInsert();
    return (
        <>
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            <button
                onClick={openModal}
                className="p-2 rounded-md transition-colors hover:bg-gray-700/80 text-gray-400 hover:text-gray-200"
                title="Insert Semantic Element"
            >
                <PlusCircleIcon className="h-5 w-5"/>
            </button>
        </>
    );
};

type ModalView = 'main' | 'tag' | 'template' | 'property';

export const SemanticInsertModalProvider: React.FC<{
    editorApi: EditorApi;
}> = ({editorApi}) => {
    const {isOpen, closeModal} = useSemanticInsert();
    const [view, setView] = useState<ModalView>('main');

    const {allTags, allTemplates, allProperties} = useOntologyIndex(
        editorApi.getSettings().ontology
    );

    const handleClose = useCallback(() => {
        setView('main');
        closeModal();
    }, [closeModal]);

    useEffect(() => {
        if (isOpen) {
            setView('main');
        }
    }, [isOpen]);

    const items: InsertMenuItem[] = useMemo(() => {
        switch (view) {
            case 'tag':
                return allTags.map((t) => ({
                    id: t.id,
                    label: t.label,
                    description: t.description,
                    type: 'tag',
                    action: () => {
                        const html = `<span class="widget tag" contenteditable="false" data-tag="${t.label}">#${t.label}</span>&nbsp;`;
                        editorApi.insertHtml(html);
                        handleClose();
                    },
                }));
            case 'property':
                return allProperties.map((p) => ({
                    id: p.id,
                    label: p.label,
                    description: p.description,
                    type: 'property',
                    action: () => {
                        const id = `widget-${crypto.randomUUID()}`;
                        const html = `<span id="${id}" class="widget property" contenteditable="false" data-key="${p.label}" data-operator="is" data-values='[""]'>[${p.label}:is:""]</span>&nbsp;`;
                        editorApi.insertHtml(html);
                        editorApi.scheduleWidgetEdit(id);
                        handleClose();
                    },
                }));
            case 'template':
                return allTemplates.map((t) => ({
                    id: t.id,
                    label: t.label,
                    description: t.description,
                    type: 'template',
                    action: () => {
                        const propertiesHtml = Object.keys(t.attributes || {})
                            .map((key) => {
                                const id = `widget-${crypto.randomUUID()}`;
                                return `<span id="${id}" class="widget property" contenteditable="false" data-key="${key}" data-operator="is" data-values='[""]'>[${key}:is:""]</span>`;
                            })
                            .join('&nbsp;');
                        editorApi.insertHtml(propertiesHtml);
                        handleClose();
                    },
                }));
            case 'main':
            default:
                return [
                    {
                        id: 'insert-tag',
                        label: 'Tag',
                        description: 'Insert a semantic tag',
                        type: 'action',
                        icon: TagIcon,
                        action: () => setView('tag'),
                    },
                    {
                        id: 'insert-property',
                        label: 'Property',
                        description: 'Insert a key:operator:value property',
                        type: 'action',
                        icon: CodeBracketsIcon,
                        action: () => setView('property'),
                    },
                    {
                        id: 'insert-template',
                        label: 'Template',
                        description: 'Insert a pre-defined template of properties',
                        type: 'action',
                        icon: DocumentDuplicateIcon,
                        action: () => setView('template'),
                    },
                ];
        }
    }, [view, allTags, allTemplates, allProperties, editorApi, handleClose]);

    if (!isOpen) {
        return null;
    }

    const handleSelect = (item: InsertMenuItem) => {
        item.action();
    };

    const getTitle = () => {
        switch (view) {
            case 'main':
                return 'Insert Semantic Element';
            case 'tag':
                return 'Insert Tag';
            case 'property':
                return 'Insert Property';
            case 'template':
                return 'Insert Template';
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start pt-20"
            role="dialog"
            aria-modal="true"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">{getTitle()}</h2>
                    {view !== 'main' && (
                        <button
                            onClick={() => setView('main')}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            Back
                        </button>
                    )}
                </div>
                <InsertMenu
                    items={items}
                    onSelect={handleSelect}
                    onClose={handleClose}
                />
            </div>
        </div>
    );
};

