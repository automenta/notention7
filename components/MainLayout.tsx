import React from 'react';
import {Sidebar} from './Sidebar';
import {MainView} from './MainView';
import {useViewContext} from './contexts/ViewContext';

export const MainLayout: React.FC = () => {
    const {activeView} = useViewContext();

    return (
        <div className="flex flex-1 overflow-hidden">
            {activeView === 'notes' && (
                <div className="w-[320px] flex-shrink-0 bg-gray-900 border-r border-gray-700/50">
                    <Sidebar/>
                </div>
            )}

            <main className="flex-1 p-3 overflow-hidden">
                <MainView/>
            </main>
        </div>
    );
};
