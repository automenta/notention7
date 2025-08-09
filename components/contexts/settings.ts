import {createContext} from 'react';
import type {AppSettings} from '@/types';

export interface SettingsContextType {
    settings: AppSettings;
    setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
    settingsLoading: boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
    undefined
);
