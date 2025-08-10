import React, { useState } from 'react';
import type { OntologyNode } from '@/types';
import { CodeBracketsIcon, TagIcon, PencilIcon, TrashIcon, PlusIcon } from '../icons';

// A simple modal for editing/adding tags
const TagEditorModal: React.FC<{
  tag: Partial<OntologyNode> | null;
  onSave: (tag: Partial<OntologyNode>) => void;
  onClose: () => void;
}> = ({ tag, onSave, onClose }) => {
  const [label, setLabel] = useState(tag?.label || '');
  const [description, setDescription] = useState(tag?.description || '');

  const handleSave = () => {
    onSave({ ...tag, id: tag?.id || `tag-${Date.now()}`, label, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{tag?.id ? 'Edit Tag' : 'Add Tag'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full p-2 bg-gray-900 rounded-md"
              placeholder="e.g., project-management"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-gray-900 rounded-md"
              rows={3}
              placeholder="A brief description of the tag's purpose"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
};


interface OntologyEditorProps {
  ontology: OntologyNode[];
  setOntology: (ontology: OntologyNode[]) => void;
}

const OntologyEditor: React.FC<OntologyEditorProps> = ({ ontology, setOntology }) => {
  const [isTagModalOpen, setTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Partial<OntologyNode> | null>(null);

  const tags = ontology.filter((n) => n.id !== 'properties' && n.id !== 'templates');
  const propertiesNode = ontology.find((n) => n.id === 'properties');

  const handleOpenTagModal = (tag: Partial<OntologyNode> | null = null) => {
    setEditingTag(tag);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setEditingTag(null);
    setTagModalOpen(false);
  };

  const handleSaveTag = (tagToSave: Partial<OntologyNode>) => {
    let newTags;
    if (editingTag?.id) {
      // Editing existing tag
      newTags = tags.map((t) => (t.id === tagToSave.id ? { ...t, ...tagToSave } : t));
    } else {
      // Adding new tag
      const newTag: OntologyNode = {
        id: `tag-${Date.now()}`,
        label: tagToSave.label || '',
        description: tagToSave.description,
        children: [],
      };
      newTags = [...tags, newTag];
    }
    // Reconstruct the full ontology object before saving
    setOntology([...newTags, propertiesNode].filter(Boolean) as OntologyNode[]);
  };

  const handleDeleteTag = (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      const newTags = tags.filter((t) => t.id !== tagId);
      setOntology([...newTags, propertiesNode].filter(Boolean) as OntologyNode[]);
    }
  };

  return (
    <div className="space-y-8">
      {isTagModalOpen && (
        <TagEditorModal
          tag={editingTag}
          onSave={handleSaveTag}
          onClose={handleCloseTagModal}
        />
      )}

      {/* TAGS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <TagIcon className="h-6 w-6" />
            Tags
          </h3>
          <button
            onClick={() => handleOpenTagModal()}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Add Tag
          </button>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-lg max-h-96 overflow-y-auto space-y-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
              <div>
                <p className="font-semibold">{tag.label}</p>
                {tag.description && <p className="text-sm text-gray-400">{tag.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenTagModal(tag)} className="p-2 text-gray-400 hover:text-white" title="Edit Tag">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button onClick={() => handleDeleteTag(tag.id)} className="p-2 text-gray-400 hover:text-red-500" title="Delete Tag">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROPERTIES SECTION (Placeholder) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <CodeBracketsIcon className="h-6 w-6" />
            Properties
          </h3>
          <button
            className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white text-sm font-semibold rounded-md disabled:opacity-50 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <PlusIcon className="h-4 w-4" />
            Add Property
          </button>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-lg">
          <p className="text-gray-400 text-center">Property editor coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default OntologyEditor;
