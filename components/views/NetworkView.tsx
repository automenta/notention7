import React, { useEffect, useMemo, useState } from 'react';
import { getPublicKey, nip19 } from 'nostr-tools';
import type { NostrEvent, NostrProfile } from '../../types';
import { KeyIcon, LoadingSpinner, SettingsIcon } from '../icons';
import { DEFAULT_RELAYS, formatNpub, hexToBytes } from '../../utils/nostr';
import { pool } from '../../services/nostrService';
import { useNostrProfile } from '../../hooks/useNostrProfile';
import { ProfileHeader } from '../network/ProfileHeader';
import { useSettings } from '../contexts/SettingsContext';
import { useView } from '../contexts/ViewContext';

const NostrEventCard: React.FC<{
  event: NostrEvent;
  profile: NostrProfile | undefined;
}> = ({ event, profile }) => {
  const eventDate = new Date(event.created_at * 1000).toLocaleString();
  const authorNpub = useMemo(
    () => nip19.npubEncode(event.pubkey),
    [event.pubkey]
  );

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700/80 animate-fade-in">
      <div className="flex items-center text-sm text-gray-400 mb-2">
        {profile?.picture && (
          <img
            src={profile.picture}
            alt={profile.name || ''}
            className="h-6 w-6 rounded-full mr-2"
          />
        )}
        <span
          className="font-semibold text-blue-400 hover:underline cursor-pointer"
          title={authorNpub}
        >
          {profile?.name || formatNpub(authorNpub)}
        </span>
        <span className="ml-auto">{eventDate}</span>
      </div>
      <p className="text-gray-300 whitespace-pre-wrap break-words">
        {event.content}
      </p>
    </div>
  );
};

export const NetworkView: React.FC = () => {
  const { settings, setSettings } = useSettings();
  const { setActiveView } = useView();
  const onNavigateToSettings = () => setActiveView('settings');
  const pubkey = useMemo(
    () =>
      settings.nostr?.privkey
        ? getPublicKey(hexToBytes(settings.nostr.privkey))
        : null,
    [settings.nostr?.privkey]
  );
  const [events, setEvents] = useState<NostrEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!pubkey) return;

    setEvents([]); // Clear previous events
    setIsLoading(true);
    const seenEventIds = new Set<string>();

    const sub = pool.subscribeMany(
      DEFAULT_RELAYS,
      [{ kinds: [1], limit: 50 }],
      {
        onevent: (event) => {
          if (!seenEventIds.has(event.id)) {
            seenEventIds.add(event.id);
            setEvents((prev) => [...prev, event]);
          }
        },
      }
    );

    const timer = setTimeout(() => setIsLoading(false), 3000);

    return () => {
      clearTimeout(timer);
      sub.close();
    };
  }, [pubkey]);

  const sortedEvents = useMemo(() => {
    return events.sort((a, b) => b.created_at - a.created_at).slice(0, 100);
  }, [events]);

  const authorPubkeys = useMemo(() => {
    const pubkeys = new Set(sortedEvents.map((e) => e.pubkey));
    if (pubkey) {
      pubkeys.add(pubkey);
    }
    return Array.from(pubkeys);
  }, [sortedEvents, pubkey]);

  const profiles = useNostrProfile(authorPubkeys);

  if (!pubkey) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center bg-gray-800/50 rounded-lg">
        <KeyIcon className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Connect your Nostr Identity
        </h2>
        <p className="text-gray-400 mb-6 max-w-md">
          A Nostr identity is required to publish notes and interact with the
          network. You can generate one in settings.
        </p>
        <button
          onClick={onNavigateToSettings}
          className="flex items-center justify-center gap-3 mx-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SettingsIcon className="h-5 w-5" /> Go to Settings
        </button>
      </div>
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
            <LoadingSpinner className="h-8 w-8 text-gray-400" />
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
