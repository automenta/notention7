import {useEffect, useMemo, useState} from 'react';
import type {NostrEvent} from '@/types';
import {nostrService} from '@/services/NostrService';
import {useNostrProfile} from './useNostrProfile';

export const useNostrFeed = (pubkey: string | null) => {
    const [events, setEvents] = useState<NostrEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!pubkey) {
            setEvents([]);
            setIsLoading(false);
            return;
        }

        setEvents([]); // Clear previous events
        setIsLoading(true);
        const seenEventIds = new Set<string>();

        const sub = nostrService.subscribeToPublicFeed((event) => {
            if (!seenEventIds.has(event.id)) {
                seenEventIds.add(event.id);
                setEvents((prev) => [...prev, event]);
            }
        });

        // Stop loading after a timeout, as Nostr streams can be slow
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

    return {
        isLoading,
        sortedEvents,
        profiles,
    };
};
