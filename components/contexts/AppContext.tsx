import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useLocalForage} from '../../hooks/useLocalForage';
import type {AppSettings, View} from '../../types';
import {DEFAULT_ONTOLOGY} from '../../utils/ontology.default';

// 1. Define the combined context type
export interface AppContextType {
    // From SettingsContext
    settings: AppSettings;
    setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
    settingsLoading: boolean;

    // From ViewContext
    activeView: View;
    setActiveView: (view: View) => void;
    selectedNoteId: string | null;
    setSelectedNoteId: (id: string | null) => void;
}

// 2. Create the context
export const AppContext = createContext<AppContextType | undefined>(undefined);

// 3. Create the provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    // Logic from SettingsProvider
    const [settings, setSettings, settingsLoading] = useLocalForage<AppSettings>(
        'notention-settings',
        {
            aiEnabled: false,
            geminiApiKey: null,
            theme: 'dark',
            nostr: {
                privkey: null,
            },
            ontology: [],
        }
    );

    // Logic from ViewProvider
    const [activeView, setActiveView] = useState<View>('notes');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    // Effect from SettingsProvider
    useEffect(() => {
        if (
            !settingsLoading &&
            (!settings.ontology || settings.ontology.length === 0)
        ) {
            setSettings((s) => ({...s, ontology: DEFAULT_ONTOLOGY}));
        }
    }, [settings.ontology, settingsLoading, setSettings]);

    const contextValue: AppContextType = {
        settings,
        setSettings,
        settingsLoading,
        activeView,
        setActiveView,
        selectedNoteId,
        setSelectedNoteId,
    };

    return (
        <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
    );
};

// 4. Create the consumer hook
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
