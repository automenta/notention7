import React, {useState} from 'react';
import type {AISuggestions} from '../../types';
import {TagIcon, XCircleIcon} from '../icons';

interface SemanticsModalProps {
    isOpen: boolean;
    suggestions: AISuggestions;
    onClose: () => void;
    onApply: (suggestions: AISuggestions) => void;
    isGenerating: boolean;
}

export const SemanticsModal: React.FC<SemanticsModalProps> = ({
                                                                  isOpen,
                                                                  suggestions,
                                                                  onClose,
                                                                  onApply,
                                                                  isGenerating,
                                                              }) => {
    const [selectedSuggestions, setSelectedSuggestions] = useState<AISuggestions>({
        tags: [],
        properties: [],
    });

    // Effect to reset selection when suggestions change
    React.useEffect(() => {
        if (suggestions) {
            setSelectedSuggestions(suggestions);
        }
    }, [suggestions]);

    if (!isOpen) return null;

    const handleTagToggle = (tag: string) => {
        setSelectedSuggestions((prev) => {
            const newTags = prev.tags.includes(tag)
                ? prev.tags.filter((t) => t !== tag)
                : [...prev.tags, tag];
            return {...prev, tags: newTags};
        });
    };

    const handlePropertyToggle = (property: { key: string; value: string }) => {
        setSelectedSuggestions((prev) => {
            const newProperties = prev.properties.some(
                (p) => p.key === property.key && p.value === property.value
            )
                ? prev.properties.filter(
                    (p) => p.key !== property.key || p.value !== property.value
                )
                : [...prev.properties, property];
            return {...prev, properties: newProperties};
        });
    };

    const handleApply = () => {
        onApply(selectedSuggestions);
    };

    const hasSuggestions = suggestions && (suggestions.tags?.length > 0 || suggestions.properties?.length > 0);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl border border-gray-700/50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Suggested Semantics</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XCircleIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-md mb-6 min-h-[200px]">
                    {isGenerating ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                        </div>
                    ) : !hasSuggestions ? (
                        <div className="text-center py-8 text-gray-400">
                            No new suggestions found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {suggestions.tags?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-200 mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.tags.map((tag) => (
                                            <label key={tag}
                                                   className="flex items-center gap-2 p-2 rounded-md bg-gray-700/50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSuggestions.tags.includes(tag)}
                                                    onChange={() => handleTagToggle(tag)}
                                                    className="form-checkbox h-4 w-4 bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
                                                />
                                                <span className="tag">#{tag}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {suggestions.properties?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-200 mb-2">Properties</h3>
                                    <div className="space-y-2">
                                        {suggestions.properties.map((prop, i) => (
                                            <label key={`${prop.key}-${i}`}
                                                   className="flex items-center gap-2 p-2 rounded-md bg-gray-700/50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSuggestions.properties.some(p => p.key === prop.key && p.value === prop.value)}
                                                    onChange={() => handlePropertyToggle(prop)}
                                                    className="form-checkbox h-4 w-4 bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
                                                />
                                                <span className="font-mono text-sm">
                          <span className="text-indigo-300">{prop.key}</span>
                          <span className="mx-2 font-bold text-gray-400">:</span>
                          <span className="text-green-300">"{prop.value}"</span>
                        </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={handleApply}
                        disabled={isGenerating || !hasSuggestions}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                    >
                        <TagIcon className="h-4 w-4"/>
                        Apply Selected
                    </button>
                </div>
            </div>
        </div>
    );
};
