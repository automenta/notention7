import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WidgetRenderer from '@/components/editor/widgets/WidgetRenderer';
import type { EditorApi } from '@/types';

// SemanticWidget is the component being portal-rendered. We don't need to mock it.
// We can just check for its output.

const mockSetEditingWidget = vi.fn();

const createMockEditorApi = (editorDiv: HTMLDivElement): Partial<EditorApi> => {
  return {
    editorRef: { current: editorDiv },
    setEditingWidget: mockSetEditingWidget,
  };
};

describe('WidgetRenderer', () => {
  let mockEditorApi: Partial<EditorApi>;
  let editorContainer: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    editorContainer = document.createElement('div');
    document.body.appendChild(editorContainer);
    mockEditorApi = createMockEditorApi(editorContainer);
  });

  afterEach(() => {
    document.body.removeChild(editorContainer);
  });

  it('should not render anything if no widgets are in the editor', () => {
    const { container } = render(
      <WidgetRenderer editorApi={mockEditorApi as EditorApi} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render a portal for a widget that exists on initial render', async () => {
    const widgetHtml = `<span data-widget="semantic-property" data-property="test" data-operator="is" data-values='["value"]'></span>`;
    editorContainer.innerHTML = widgetHtml;

    render(<WidgetRenderer editorApi={mockEditorApi as EditorApi} />);

    await waitFor(() => {
      // The text content comes from the SemanticWidget component
      const renderedWidget = screen.getByText('test is value');
      expect(renderedWidget).toBeInTheDocument();
      // Check that it's inside the original node
      const placeholder = editorContainer.querySelector(
        '[data-widget="semantic-property"]'
      );
      expect(placeholder).toContainElement(renderedWidget);
    });
  });

  it('should render a portal for a widget added after initial render', async () => {
    render(<WidgetRenderer editorApi={mockEditorApi as EditorApi} />);

    // Widget doesn't exist yet
    expect(
      screen.queryByText('another is test')
    ).not.toBeInTheDocument();

    // Now, add the widget to the DOM, which should be detected by the MutationObserver
    const widgetNode = document.createElement('span');
    widgetNode.dataset.widget = 'semantic-property';
    widgetNode.dataset.property = 'another';
    widgetNode.dataset.operator = 'is';
    widgetNode.dataset.values = '["test"]';
    editorContainer.appendChild(widgetNode);

    await waitFor(() => {
      const renderedWidget = screen.getByText('another is test');
      expect(renderedWidget).toBeInTheDocument();
      expect(editorContainer.querySelector('span')).toContainElement(
        renderedWidget
      );
    });
  });

  it('should unmount cleanly without errors when a widget is present', () => {
    const widgetHtml = `<span data-widget="semantic-property" data-property="test" data-operator="is" data-values='["value"]'></span>`;
    editorContainer.innerHTML = widgetHtml;

    const { unmount } = render(
      <WidgetRenderer editorApi={mockEditorApi as EditorApi} />
    );

    // The component is now rendered. Now, let's unmount it and see if it throws.
    // We expect it to unmount without throwing the NotFoundError.
    expect(() => unmount()).not.toThrow();
  });
});
