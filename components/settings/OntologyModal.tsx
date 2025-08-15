import React, {useState} from 'react';
import type {OntologyNode} from '@/types';
import Portal from '../common/Portal';

type OntologyItem = OntologyNode | (OntologyNode['attributes'] & { key: string });

interface OntologyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Partial<OntologyItem>) => void;
    itemType: 'tag' | 'property';
    itemData?: Partial<OntologyItem> | null;
}

const OntologyModal: React.FC<OntologyModalProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         onSave,
                                                         itemType,
                                                         itemData
                                                     }) => {
    const [label, setLabel] = useState(itemData?.label || '');
    const [description, setDescription] = useState(itemData?.description || '');

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        onSave({label, description});
        onClose();
    };

    const title = itemData ? `Edit ${itemType}` : `Add New ${itemType}`;

    return (
        <Portal>
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={onClose}
            >
                <div
                    className="bg-gray-800 border border-gray-700/50 rounded-lg p-6 w-full max-w-md shadow-2xl"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                    <h2 className="text-2xl font-bold mb-6 text-white capitalize">{title}</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="label" className="block text-sm font-medium text-gray-300 mb-1">
                                Label / Key
                            </label>
                            <input
                                id="label"
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="w-full p-2 bg-gray-900 rounded-md text-gray-200 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder={itemType === 'tag' ? "e.g., 'project-management'" : "e.g., 'dueDate'"}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full p-2 bg-gray-900 rounded-md text-gray-200 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="A short explanation of what this is."
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-md text-sm font-semibold text-gray-300 bg-gray-600/50 hover:bg-gray-500/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            Save {itemType}
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default OntologyModal;
