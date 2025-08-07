import React from 'react';
import { EditorApi } from '../../../types';

interface SemanticWidgetProps {
  property: string;
  operator: string;
  values: string[];
  editorApi: EditorApi;
  node: HTMLElement;
}

const SemanticWidget: React.FC<SemanticWidgetProps> = ({
  property,
  operator,
  values,
  editorApi,
  node,
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    editorApi.setEditingWidget(node);
  };

  return (
    <span
      contentEditable="false"
      className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded-md text-sm mx-1 cursor-pointer"
      data-widget="semantic-property"
      data-property={property}
      data-operator={operator}
      data-values={JSON.stringify(values)}
      onClick={handleClick}
    >
      {property} {operator} {values.join(' and ')}
    </span>
  );
};

export default SemanticWidget;
