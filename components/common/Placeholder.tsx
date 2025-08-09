import React from 'react';

interface PlaceholderProps {
    icon: React.ReactElement<{ className?: string }>;
    title: string;
    message: string;
    actions?: React.ReactNode;
}

export const Placeholder: React.FC<PlaceholderProps> = ({
                                                            icon,
                                                            title,
                                                            message,
                                                            actions,
                                                        }) => (
    <div
        className="flex flex-col items-center justify-center h-full text-center bg-gray-800/50 rounded-lg p-8 text-gray-400">
        <div className="text-blue-500 mb-6">
            {React.cloneElement(icon, {className: 'h-24 w-24'})}
        </div>
        <h2 className="text-4xl font-bold text-white mb-3">{title}</h2>
        <p className="max-w-md mb-8">{message}</p>
        {actions && <div className="flex justify-center">{actions}</div>}
    </div>
);
