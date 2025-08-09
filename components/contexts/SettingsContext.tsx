import React, {createContext, ReactNode, useContext, useEffect} from 'react';
import {useLocalForage} from '../../hooks/useLocalForage';
import type {AppSettings} from '../../types';
import {DEFAULT_ONTOLOGY} from '../../utils/ontology.default';

// 1. Define the context type
export interface SettingsContextType {
    settings: AppSettings;
    setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
    settingsLoading: boolean;
}

// 2. Create the context
// eslint-disable-next-line react-refresh/only-export-components
export const SettingsContext = createContext<SettingsContextType | undefined>(
    undefined
);

// 3. Create the provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
                                                                        children,
                                                                    }) => {
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

    // Populate with default ontology on first run
    useEffect(() => {
        if (
            !settingsLoading &&
            (!settings.ontology || settings.ontology.length === 0)
        ) {
            setSettings((s) => ({...s, ontology: DEFAULT_ONTOLOGY}));
        }
    }, [settings.ontology, settingsLoading, setSettings]);

    return (
        <SettingsContext.Provider
            value={{settings, setSettings, settingsLoading}}
        >
            {children}
        </SettingsContext.Provider>
    );
};

// 4. Create the consumer hook
// eslint-disable-next-line react-refresh/only-export-components
export const useSettingsContext = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettingsContext must be used within a SettingsProvider');
    }
    return context;
};
