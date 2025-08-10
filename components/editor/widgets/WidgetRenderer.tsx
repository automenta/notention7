import React from 'react';
import ReactDOM from 'react-dom';
import { EditorApi, PropertyWidgetNode } from '@/types';
import SemanticWidget from './SemanticWidget';

interface WidgetRendererProps {
  editorApi: EditorApi;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ editorApi }) => {
  // The contentModel is the single source of truth.
  const model = editorApi.getContentModel();
  const editor = editorApi.editorRef.current;

  // We only want to render widgets if the editor DOM is available.
  if (!editor) {
    return null;
  }

  const widgetNodes = model.filter(
    (node) => node.type === 'widget'
  ) as PropertyWidgetNode[];

  return (
    <>
      {widgetNodes.map((widgetData) => {
        // Find the corresponding DOM node that was rendered by the main editor.
        const domNode = editor.querySelector<HTMLElement>(`#${widgetData.id}`);

        if (domNode) {
          return ReactDOM.createPortal(
            <SemanticWidget
              property={widgetData.key}
              operator={widgetData.operator}
              values={widgetData.values}
              editorApi={editorApi}
              node={domNode}
            />,
            domNode,
            widgetData.id
          );
        }
        return null;
      })}
    </>
  );
};

export default WidgetRenderer;
