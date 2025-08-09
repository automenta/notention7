import React from 'react';
import type {OntologyNode} from '@/types';
import {CodeBracketsIcon, TagIcon} from '../icons';

interface OntologyEditorProps {
    ontology: OntologyNode[];
}

const OntologyEditor: React.FC<OntologyEditorProps> = ({ontology}) => {
    // For now, we will just display the raw structure.
    // We can make this more user-friendly later.

    const tags = ontology.filter((n) => n.id !== 'templates');
    const properties = ontology
        .flatMap((n) => Object.entries(n.attributes || {}))
        .map(([key, val]) => ({
            key,
            ...val,
        }));

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold flex items-center">
                        <TagIcon className="h-5 w-5 mr-2"/>
                        Tags
                    </h3>
                    <button
                        className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-500 disabled:opacity-50"
                        disabled
                        title="Coming soon"
                    >
                        Add Tag
                    </button>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg max-h-96 overflow-y-auto">
          <pre className="text-xs text-gray-300">
            {JSON.stringify(tags, null, 2)}
          </pre>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold flex items-center">
                        <CodeBracketsIcon className="h-5 w-5 mr-2"/>
                        Properties
                    </h3>
                    <button
                        className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-500 disabled:opacity-50"
                        disabled
                        title="Coming soon"
                    >
                        Add Property
                    </button>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg max-h-96 overflow-y-auto">
          <pre className="text-xs text-gray-300">
            {JSON.stringify(properties, null, 2)}
          </pre>
                </div>
            </div>
        </div>
    );
};

export default OntologyEditor;
