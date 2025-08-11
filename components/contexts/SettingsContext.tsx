import React, { ReactNode, useEffect } from 'react';
import { useLocalForage } from '../../hooks/useLocalForage';
import type { AppSettings } from '../../types';
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';
import { SettingsContext, SettingsContextType } from './settings.context';

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

  useEffect(() => {
    if (
      !settingsLoading &&
      (!settings.ontology || settings.ontology.length === 0)
    ) {
      setSettings((s) => ({ ...s, ontology: DEFAULT_ONTOLOGY }));
    }
  }, [settings.ontology, settingsLoading, setSettings]);

  const contextValue: SettingsContextType = {
    settings,
    setSettings,
    settingsLoading,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};
