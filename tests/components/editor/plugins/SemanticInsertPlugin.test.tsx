import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
    SemanticInsertModalProvider,
    SemanticInsertToolbar,
} from '@/components/editor/plugins/SemanticInsertPlugin.tsx';
import type {EditorApi} from '@/types';
import * as OntologyIndexHook from '../../../../hooks/useOntologyIndex';
import {SemanticInsertProvider} from '@/components/editor/plugins/SemanticInsertProvider.tsx';
import {createMockEditorApi} from '../../../utils/mocks';

// Mock the useOntologyIndex hook
vi.mock('../../../../hooks/useOntologyIndex');

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
                                                                  children,
                                                              }) =>
    <SemanticInsertProvider>{children}</SemanticInsertProvider>;

describe('SemanticInsertPlugin', () => {
    let mockEditorApi: EditorApi;

    beforeEach(() => {
        mockEditorApi = createMockEditorApi();
        vi.mocked(OntologyIndexHook.useOntologyIndex).mockReturnValue({
            allTags: [{id: 'tag1', label: 'TestTag', description: 'A test tag'}],
            allTemplates: [
                {
                    id: 'template1',
                    label: 'TestTemplate',
                    description: 'A test template',
                    attributes: {prop1: {type: 'string'}},
                },
            ],
            allProperties: [],
            propertyTypes: new Map(),
        });
    });

    it('opens and closes the modal when interacting with the toolbar', () => {
        render(
            <>
                <SemanticInsertToolbar/>
                <SemanticInsertModalProvider editorApi={mockEditorApi}/>
            </>,
            {wrapper: TestWrapper}
        );

        // Modal should be closed initially
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        // Click the toolbar button to open the modal
        fireEvent.click(screen.getByTitle('Insert Semantic Element'));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Insert Semantic Element')).toBeInTheDocument();

        // Click the overlay to close the modal
        fireEvent.click(screen.getByRole('dialog'));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('allows inserting a tag', () => {
        render(
            <>
                <SemanticInsertToolbar/>
                <SemanticInsertModalProvider editorApi={mockEditorApi}/>
            </>,
            {wrapper: TestWrapper}
        );

        // Open the modal
        fireEvent.click(screen.getByTitle('Insert Semantic Element'));

        // Go to tag view
        fireEvent.click(screen.getByText('Tag'));

        // Click the tag to insert it
        fireEvent.click(screen.getByText('TestTag'));

        // Assert that the editorApi was called
        expect(mockEditorApi.insertHtml).toHaveBeenCalledWith(
            '<span class="widget tag" contenteditable="false" data-tag="TestTag">#TestTag</span>&nbsp;'
        );

        // Assert that the modal is closed
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
