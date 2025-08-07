import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { EditorApi } from '../../../types';
import SemanticWidget from './SemanticWidget';

interface WidgetRendererProps {
  editorApi: EditorApi;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ editorApi }) => {
  const [widgetNodes, setWidgetNodes] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const editor = editorApi.editorRef.current;
    if (!editor) return;

    const updateWidgets = () => {
      const newNodes = Array.from(
        editor.querySelectorAll<HTMLElement>('[data-widget="semantic-property"]')
      );
      setWidgetNodes((currentNodes) => {
        if (
          newNodes.length === currentNodes.length &&
          newNodes.every((node, i) => node === currentNodes[i])
        ) {
          return currentNodes;
        }
        return newNodes;
      });
    };

    updateWidgets();

    const observer = new MutationObserver(updateWidgets);

    observer.observe(editor, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [editorApi.editorRef]);

  return (
    <>
      {widgetNodes.map((node) => {
        const { property, operator, values: valuesJson } = node.dataset;
        if (property && operator && valuesJson) {
          const values = JSON.parse(valuesJson);
          return ReactDOM.createPortal(
            <SemanticWidget
              property={property}
              operator={operator}
              values={values}
              editorApi={editorApi}
              node={node}
            />,
            node,
            node.id || (node.id = `widget-portal-${Math.random()}`)
          );
        }
        return null;
      })}
    </>
  );
};

export default WidgetRenderer;
