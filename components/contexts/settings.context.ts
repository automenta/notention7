import { createContext, useContext } from 'react';
import type { AppSettings } from '../../types';

export interface SettingsContextType {
  settings: AppSettings;
  setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
  settingsLoading: boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(
      'useSettingsContext must be used within a SettingsProvider'
    );
  }
  return context;
};
