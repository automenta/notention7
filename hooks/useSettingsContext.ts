import { useContext } from 'react';
import {
  SettingsContext,
  type SettingsContextType,
} from '../components/contexts/settings';

export const useSettingsContext = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};
