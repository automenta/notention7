import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WidgetRenderer from '@/components/editor/widgets/WidgetRenderer';
import { createMockEditorApi } from '../../../utils/mocks';
import type { EditorApi, PropertyWidgetNode } from '@/types';

// Mock the SemanticWidget to simplify testing and avoid portal issues in JSDOM
vi.mock('@/components/editor/widgets/SemanticWidget', () => ({
  default: ({ property, operator, values }: { property: string, operator: string, values: string[] }) => (
    <div data-testid="mock-semantic-widget">
      {`${property}|${operator}|${values.join(',')}`}
    </div>
  ),
}));

describe('WidgetRenderer', () => {
  let mockEditorApi: EditorApi;
  let editorContainer: HTMLDivElement;

  beforeEach(() => {
    editorContainer = document.createElement('div');
    document.body.appendChild(editorContainer);
    mockEditorApi = createMockEditorApi(editorContainer);
  });

  afterEach(() => {
    // Make sure to cleanup the container from the body
    if (document.body.contains(editorContainer)) {
        document.body.removeChild(editorContainer);
    }
  });

  it('should not render anything if the content model has no widgets', () => {
    vi.spyOn(mockEditorApi, 'getContentModel').mockReturnValue([
      { type: 'text', content: 'hello world' },
    ]);
    const { container } = render(<WidgetRenderer editorApi={mockEditorApi} />);
    expect(container).toBeEmptyDOMElement();
  });

  it.skip('should render a portal for a widget from the content model', () => {
    const widgetId = 'widget-1';
    const widgetNode: PropertyWidgetNode = {
      type: 'widget',
      kind: 'property',
      id: widgetId,
      key: 'status',
      operator: 'is',
      values: ['new'],
    };

    editorContainer.innerHTML = `<span id="${widgetId}"></span>`;
    vi.spyOn(mockEditorApi, 'getContentModel').mockReturnValue([widgetNode]);

    render(<WidgetRenderer editorApi={mockEditorApi} />);

    const renderedWidget = screen.getByTestId('mock-semantic-widget');
    expect(renderedWidget).toBeInTheDocument();
    expect(renderedWidget.textContent).toBe('status|is|new');
  });

  it('should not render a portal if the widget DOM node is missing', () => {
    const widgetNode: PropertyWidgetNode = {
      type: 'widget',
      kind: 'property',
      id: 'widget-1',
      key: 'status',
      operator: 'is',
      values: ['new'],
    };

    editorContainer.innerHTML = ``;
    vi.spyOn(mockEditorApi, 'getContentModel').mockReturnValue([widgetNode]);

    const { container } = render(<WidgetRenderer editorApi={mockEditorApi} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('mock-semantic-widget')).not.toBeInTheDocument();
  });

  it.skip('should render multiple widgets from the model', () => {
    const widget1: PropertyWidgetNode = {
      type: 'widget', kind: 'property', id: 'w1', key: 'status', operator: 'is', values: ['new'],
    };
    const widget2: PropertyWidgetNode = {
      type: 'widget', kind: 'property', id: 'w2', key: 'priority', operator: 'is', values: ['high'],
    };

    editorContainer.innerHTML = `<p>Here are widgets: <span id="w1"></span> and <span id="w2"></span></p>`;
    vi.spyOn(mockEditorApi, 'getContentModel').mockReturnValue([
        { type: 'text', content: 'Here are widgets: ' },
        widget1,
        { type: 'text', content: ' and ' },
        widget2,
    ]);

    render(<WidgetRenderer editorApi={mockEditorApi} />);

    const renderedWidgets = screen.getAllByTestId('mock-semantic-widget');
    expect(renderedWidgets).toHaveLength(2);
    expect(renderedWidgets[0].textContent).toBe('status|is|new');
    expect(renderedWidgets[1].textContent).toBe('priority|is|high');
  });
});
