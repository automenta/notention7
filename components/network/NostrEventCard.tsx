import React, { useMemo } from 'react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent, NostrProfile } from '../../types';
import { formatNpub } from '../../utils/nostr';

export const NostrEventCard: React.FC<{
  event: NostrEvent;
  profile: NostrProfile | undefined;
  contentPreview?: string;
}> = ({ event, profile, contentPreview }) => {
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
        {contentPreview ?? event.content}
      </p>
    </div>
  );
};
