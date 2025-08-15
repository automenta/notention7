import React from 'react';
import {EditorApi} from '@/types';

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
        <div
            contentEditable="false"
            className="relative inline-block bg-blue-900/50 text-blue-300 px-2 py-1 rounded-md text-sm mx-0.5 cursor-pointer z-10"
            onClick={handleClick}
        >
            {`${property} ${operator} ${values.join(' and ')}`}
        </div>
    );
};

export default SemanticWidget;
