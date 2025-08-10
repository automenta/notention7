import React, {useMemo} from 'react';
import {getPublicKey} from 'nostr-tools';
import {KeyIcon, LoadingSpinner, SettingsIcon} from '../icons';
import {hexToBytes} from '@/utils/format.ts';
import {ProfileHeader} from '../network/ProfileHeader';
import {NostrEventCard} from '../network/NostrEventCard';
import {useSettingsContext} from '../contexts/SettingsContext';
import {useViewContext} from '../contexts/ViewContext';
import {useNostrFeed} from '../../hooks/useNostrFeed';
import {Placeholder} from '../common/Placeholder';

export const NetworkView: React.FC = () => {
    const {settings, setSettings} = useSettingsContext();
    const {setActiveView} = useViewContext();
    const onNavigateToSettings = () => setActiveView('settings');

    const pubkey = useMemo(
        () =>
            settings.nostr?.privkey
                ? getPublicKey(hexToBytes(settings.nostr.privkey))
                : null,
        [settings.nostr?.privkey]
    );

    const {isLoading, sortedEvents, profiles} = useNostrFeed(pubkey);

    if (!pubkey) {
        return (
            <Placeholder
                icon={<KeyIcon/>}
                title="Connect your Nostr Identity"
                message="A Nostr identity is required to publish notes and interact with the network. You can generate one in settings."
                actions={
                    <button
                        onClick={onNavigateToSettings}
                        className="flex items-center justify-center gap-3 mx-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <SettingsIcon className="h-5 w-5"/> Go to Settings
                    </button>
                }
            />
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-800/50 rounded-lg overflow-hidden">
            <ProfileHeader
                settings={settings}
                setSettings={setSettings}
                pubkey={pubkey}
                profileCache={profiles}
            />
            <div className="p-4 md:p-6 flex-grow overflow-y-auto">
                <h1 className="text-2xl font-bold text-white mb-6">⚡️ Public Feed</h1>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <LoadingSpinner className="h-8 w-8 text-gray-400"/>
                    </div>
                ) : sortedEvents.length > 0 ? (
                    <div className="space-y-4">
                        {sortedEvents.map((event) => (
                            <NostrEventCard
                                key={event.id}
                                event={event}
                                profile={profiles[event.pubkey]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        <p>No public notes found from connected relays.</p>
                        <p className="text-sm mt-1">
                            This could be a temporary connection issue.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
