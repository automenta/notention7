import React, {createContext, useContext, ReactNode, useEffect} from 'react';
import {useLocalForage} from '../../hooks/useLocalForage';
import {AppSettings} from '../../types';
import {DEFAULT_ONTOLOGY} from '../../utils/ontology.default';

interface SettingsContextType {
    settings: AppSettings;
    setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
    settingsLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [settings, setSettings, settingsLoading] = useLocalForage<AppSettings>('notention-settings', {
        aiEnabled: false,
        theme: 'dark',
        nostr: {
            privkey: null,
        },
        ontology: [],
    });

    // Populate with default ontology on first run
    useEffect(() => {
        if (!settingsLoading && (!settings.ontology || settings.ontology.length === 0)) {
            setSettings(s => ({...s, ontology: DEFAULT_ONTOLOGY}));
        }
    }, [settings.ontology, settingsLoading, setSettings]);

    return (
        <SettingsContext.Provider value={{settings, setSettings, settingsLoading}}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
