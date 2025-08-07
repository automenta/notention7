import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { EditorApi } from '../../../types';
import SemanticWidget from './SemanticWidget';

interface WidgetRendererProps {
  editorApi: EditorApi;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ editorApi }) => {
  const [widgetNodes, setWidgetNodes] = useState<HTMLElement[]>([]);
  // This token is used to force a re-render when the observer detects a change.
  // The observer callback updates the token, which is a dependency of the useEffect hook.
  const [updateToken, setUpdateToken] = useState(0);

  useEffect(() => {
    const editor = editorApi.editorRef.current;
    if (!editor) return;

    // This function runs on mount and whenever the updateToken changes.
    const findWidgets = () => {
      const newNodes = Array.from(
        editor.querySelectorAll<HTMLElement>('.widget.property')
      );
      setWidgetNodes(newNodes);
    };

    findWidgets();

    const observer = new MutationObserver(() => {
      // When a mutation occurs, we don't need to inspect the mutations themselves.
      // We just trigger a re-render, and the findWidgets function will re-query the DOM.
      setUpdateToken((token) => token + 1);
    });

    // Observe changes to the editor, focusing on attributes relevant to widgets.
    observer.observe(editor, {
      childList: true, // For when widgets are added or removed
      subtree: true,
      attributes: true,
      // We specifically care about the data attributes that hold property values.
      attributeFilter: ['data-key', 'data-operator', 'data-values'],
    });

    return () => {
      observer.disconnect();
    };
  }, [editorApi.editorRef, updateToken]);

  return (
    <>
      {widgetNodes.map((node) => {
        const { key: property, operator, values: valuesJson } = node.dataset;
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
