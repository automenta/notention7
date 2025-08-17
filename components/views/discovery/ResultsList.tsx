import React from 'react';
import { NostrEvent } from 'nostr-tools';
import { NostrProfile, SearchCriterion } from '@/types';
import { parseNostrEventContent } from '@/utils/discovery';
import { NostrEventCard } from '../../network/NostrEventCard';

interface ResultsListProps {
  results: NostrEvent[];
  profiles: Record<string, NostrProfile>;
  searchCriteria: SearchCriterion[];
}

export const ResultsList: React.FC<ResultsListProps> = ({
  results,
  profiles,
  searchCriteria,
}) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">
        Found {results.length} matching note(s)
      </h2>
      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((event) => {
            const { title, contentPreview } = parseNostrEventContent(event);
            return (
              <NostrEventCard
                key={event.id}
                event={event}
                profile={profiles[event.pubkey]}
                title={title}
                contentPreview={contentPreview}
                matchingCriteria={searchCriteria}
              />
            );
          })
        ) : (
          <p className="text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
};
