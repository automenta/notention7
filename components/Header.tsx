import React from 'react';
import type {View} from '@/types';
import {ChatIcon, MapIcon, NetworkIcon, NoteIcon, OntologyIcon, PlusIcon, SearchIcon, SettingsIcon,} from './icons';
import {useViewContext} from './contexts/view.context';

interface HeaderProps {
    onNewNote: () => void;
}

interface NavButtonProps {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({
                                                 icon,
                                                 label,
                                                 isActive,
                                                 onClick,
                                             }) => (
    <button
        onClick={onClick}
        title={label}
        className={`p-2 rounded-md transition-colors ${
            isActive
                ? 'bg-blue-600/30 text-white'
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
        }`}
    >
        {React.cloneElement(icon, {className: 'h-6 w-6'})}
    </button>
);

export const Header: React.FC<HeaderProps> = ({onNewNote}) => {
    const {activeView, setActiveView} = useViewContext();
    const navItems: { view: View; label: string; icon: React.ReactElement }[] = [
        {view: 'notes', label: 'Notes', icon: <NoteIcon/>},
        {view: 'map', label: 'Map', icon: <MapIcon/>},
        {view: 'network', label: 'Network', icon: <NetworkIcon/>},
        {view: 'discovery', label: 'Discovery', icon: <SearchIcon/>},
        {view: 'chat', label: 'Chat', icon: <ChatIcon/>},
        {view: 'ontology', label: 'Ontology', icon: <OntologyIcon/>},
    ];

    return (
        <header
            className="flex-shrink-0 bg-gray-900 h-16 px-4 flex items-center justify-between border-b border-gray-700/50">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onNewNote}
                    title="New Note"
                    className="flex items-center gap-2 px-3 py-1.5 transition-colors rounded-lg bg-blue-600 text-white hover:bg-blue-700 ml-4"
                >
                    <PlusIcon className="h-5 w-5"/>
                </button>
            </div>

            {/* Center Section - Navigation */}
            <div className="flex items-center gap-2">
                {navItems.map((item) => (
                    <NavButton
                        key={item.view}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeView === item.view}
                        onClick={() => setActiveView(item.view)}
                    />
                ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center">
                <NavButton
                    icon={<SettingsIcon/>}
                    label="Settings"
                    isActive={activeView === 'settings'}
                    onClick={() => setActiveView('settings')}
                />
            </div>
        </header>
    );
};
