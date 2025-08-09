import React, {createContext, ReactNode, useContext, useState} from 'react';
import type {View} from '../../types';

// 1. Define the context type
export interface ViewContextType {
    activeView: View;
    setActiveView: (view: View) => void;
    selectedNoteId: string | null;
    setSelectedNoteId: (id: string | null) => void;
}

// 2. Create the context
// eslint-disable-next-line react-refresh/only-export-components
export const ViewContext = createContext<ViewContextType | undefined>(undefined);

// 3. Create the provider component
export const ViewProvider: React.FC<{ children: ReactNode }> = ({
                                                                    children,
                                                                }) => {
    const [activeView, setActiveView] = useState<View>('notes');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    return (
        <ViewContext.Provider
            value={{activeView, setActiveView, selectedNoteId, setSelectedNoteId}}
        >
            {children}
        </ViewContext.Provider>
    );
};

// 4. Create the consumer hook
// eslint-disable-next-line react-refresh/only-export-components
export const useViewContext = () => {
    const context = useContext(ViewContext);
    if (context === undefined) {
        throw new Error('useViewContext must be used within a ViewProvider');
    }
    return context;
};
