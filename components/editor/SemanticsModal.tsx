import React from 'react';
import type {Property} from '@/types.ts';

export const SemanticsModal: React.FC<{
    tags: string[];
    properties: Property[];
    onClose: () => void;
}> = ({tags, properties, onClose}) => {
    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-white mb-4">Note Semantics</h2>
                <p className="text-sm text-gray-400 mb-6">
                    This is the structured, machine-readable data embedded in your note.
                </p>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-200 mb-2 uppercase text-xs tracking-wider">
                            Tags
                        </h3>
                        {tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span key={tag} className="tag">
                    #{tag}
                  </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No tags found.</p>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-200 mb-2 uppercase text-xs tracking-wider">
                            Properties
                        </h3>
                        {properties.length > 0 ? (
                            <ul className="space-y-2 text-sm font-mono">
                                {properties.map((prop, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center justify-between p-2 rounded-md bg-gray-700/50"
                                    >
                                        <div>
                                            <span className="text-indigo-300">{prop.key}</span>
                                            <span className="mx-2 font-bold text-gray-400">
                        {prop.operator}
                      </span>
                                            <span className="text-green-300">
                        {prop.values.map((v) => `"${v}"`).join(' & ')}
                      </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">No properties found.</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="mt-8 w-full py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};
