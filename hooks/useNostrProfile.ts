
import { useState, useEffect, useRef } from 'react';
import { pool } from '../services/nostrService';
import { DEFAULT_RELAYS } from '../utils/nostr';
import type { NostrProfile, NostrEvent } from '../types';

const profileCache = new Map<string, NostrProfile>();
const requestedPubkeys = new Set<string>();

export const useNostrProfile = (pubkeys: string[]): Record<string, NostrProfile> => {
    const [profiles, setProfiles] = useState<Record<string, NostrProfile>>(() => {
        const initialProfiles: Record<string, NostrProfile> = {};
        pubkeys.forEach(pk => {
            if (profileCache.has(pk)) {
                initialProfiles[pk] = profileCache.get(pk)!;
            }
        });
        return initialProfiles;
    });

    const subRef = useRef<any>(null);

    useEffect(() => {
        const pubkeysToFetch = pubkeys.filter(pk => !profileCache.has(pk) && !requestedPubkeys.has(pk));
        
        if (pubkeysToFetch.length === 0) {
            // Ensure local state is up-to-date with global cache
            const newProfiles: Record<string, NostrProfile> = {};
            let hasChanged = false;
            pubkeys.forEach(pk => {
                if (profileCache.has(pk)) {
                    newProfiles[pk] = profileCache.get(pk)!;
                    if (profiles[pk] !== newProfiles[pk]) {
                        hasChanged = true;
                    }
                }
            });
            if (hasChanged || Object.keys(newProfiles).length !== Object.keys(profiles).length) {
                setProfiles(newProfiles);
            }
            return;
        };

        pubkeysToFetch.forEach(pk => requestedPubkeys.add(pk));

        const handleEvent = (event: NostrEvent) => {
            try {
                const profile = JSON.parse(event.content) as NostrProfile;
                profileCache.set(event.pubkey, profile);
                setProfiles(prev => ({...prev, [event.pubkey]: profile}));
            } catch {}
        };
        
        if (subRef.current) {
            subRef.current.close();
        }

        subRef.current = pool.subscribeMany(DEFAULT_RELAYS, [{ kinds: [0], authors: pubkeysToFetch }], {
            onevent: handleEvent,
        });

        // No automatic close, let it listen for profile updates
        return () => {
            // The subscription might be managed elsewhere or be persistent
        };

    }, [pubkeys]);

    return profiles;
};
