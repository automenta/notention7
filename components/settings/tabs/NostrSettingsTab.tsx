import React from 'react';
import { KeyIcon } from '../../icons';
import { CopyableField } from '../../common/CopyableField';
import type { AppSettings } from '../../../types';

interface NostrSettingsTabProps {
  settings: AppSettings;
  npub: string | null;
  nsec: string | null;
  handleGenerateKeys: () => void;
  handleLogout: () => void;
}

export const NostrSettingsTab: React.FC<NostrSettingsTabProps> = ({
  settings,
  npub,
  nsec,
  handleGenerateKeys,
  handleLogout,
}) => {
  return (
    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
        <KeyIcon className="h-6 w-6 text-yellow-400" />
        Nostr Identity
      </h2>
      {settings.nostr.privkey && nsec && npub ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Your keys are stored locally on this device. Keep your private key
            safe and do not share it.
          </p>
          <CopyableField label="Public Key (npub)" value={npub} />
          <CopyableField
            label="Private Key (nsec)"
            value={nsec}
            isSecret
          />
          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <KeyIcon className="h-5 w-5" /> Log Out & Clear Private Key
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            You don&apos;t have a Nostr identity set up on this device yet.
          </p>
          <button
            onClick={handleGenerateKeys}
            className="flex items-center justify-center gap-3 mx-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <KeyIcon className="h-5 w-5" /> Generate New Keys
          </button>
        </div>
      )}
    </div>
  );
};
