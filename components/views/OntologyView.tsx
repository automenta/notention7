import React, { useState } from 'react';
import type { OntologyNode } from '../../types';
import { ChevronDownIcon } from '../icons';
import { useSettings } from '../../hooks/useSettingsContext';

interface OntologyNodeProps {
  node: OntologyNode;
  level: number;
}

const OntologyNodeItem: React.FC<OntologyNodeProps> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first few levels
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ paddingLeft: `${level * 1.5}rem` }}>
      <div
        className="flex items-center py-2 cursor-pointer group"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          <ChevronDownIcon
            className={`h-5 w-5 mr-2 text-gray-500 transition-transform transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
          />
        ) : (
          <div className="w-5 h-5 mr-2" /> // Placeholder for alignment
        )}
        <span className="font-semibold text-blue-400">#{node.label}</span>
        {node.description && (
          <span className="ml-4 text-sm text-gray-400 hidden md:inline group-hover:inline">
            - {node.description}
          </span>
        )}
      </div>
      {isOpen && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <OntologyNodeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const OntologyView: React.FC = () => {
  const { settings } = useSettings();
  const ontology = settings.ontology;

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-800/50 rounded-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Ontology</h1>
        <p className="text-gray-400 mb-8">
          This is the semantic structure that powers your notes. Use these
          concepts as `#tags` to create machine-readable, interconnected
          knowledge.
        </p>
        <div className="bg-gray-900/70 p-6 rounded-lg">
          {ontology.map((rootNode) => (
            <OntologyNodeItem key={rootNode.id} node={rootNode} level={0} />
          ))}
        </div>
      </div>
    </div>
  );
};
