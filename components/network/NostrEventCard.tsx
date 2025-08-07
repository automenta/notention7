import React, { useMemo } from 'react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent, NostrProfile, Property } from '../../types';
import { formatNpub } from '../../utils/nostr';

type SearchCriterion = { key: string; op: string; values: readonly string[] };

export const NostrEventCard: React.FC<{
  event: NostrEvent;
  profile: NostrProfile | undefined;
  contentPreview?: string;
  matchingCriteria?: SearchCriterion[];
}> = ({ event, profile, contentPreview, matchingCriteria = [] }) => {
  const eventDate = new Date(event.created_at * 1000).toLocaleString();
  const authorNpub = useMemo(
    () => nip19.npubEncode(event.pubkey),
    [event.pubkey]
  );

  const matchedProperties = useMemo(() => {
    if (matchingCriteria.length === 0) return [];
    return event.tags
      .filter((tag) => {
        if (tag[0] !== 'p') return false;
        const [_, key, op, ...values] = tag;
        return matchingCriteria.some(
          (c) =>
            c.key === key &&
            c.op === op &&
            c.values.every((v, i) => v === values[i])
        );
      })
      .map((tag) => tag.slice(1));
  }, [event.tags, matchingCriteria]);

  return (
    <div
      className="bg-gray-800 p-4 rounded-lg border border-gray-700/80 animate-fade-in"
      data-testid="nostr-event-card"
    >
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

      {matchedProperties.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">
            Matching Properties
          </h4>
          <div className="flex flex-wrap gap-2">
            {matchedProperties.map((prop, i) => (
              <div
                key={i}
                className="bg-green-600/20 border border-green-500/50 text-green-300 px-2 py-1 rounded-md text-sm font-mono"
              >
                {prop[0]}:{prop[1]}:{prop.slice(2).join(',')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
