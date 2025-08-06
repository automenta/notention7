import {useEffect, useState} from 'react';
import {pool} from '../services/nostrService';
import {DEFAULT_RELAYS} from '../utils/nostr';
import type {NostrEvent, NostrProfile} from '../types';

const profileCache = new Map<string, NostrProfile>();
const requestedPubkeys = new Set<string>();

export const useNostrProfile = (
    pubkeys: string[]
): Record<string, NostrProfile> => {
    const [profiles, setProfiles] = useState<Record<string, NostrProfile>>(() => {
        const initialProfiles: Record<string, NostrProfile> = {};
        pubkeys.forEach((pk) => {
            if (profileCache.has(pk)) {
                initialProfiles[pk] = profileCache.get(pk)!;
            }
        });
        return initialProfiles;
    });

    useEffect(() => {
        const pubkeysToFetch = pubkeys.filter(
            (pk) => !profileCache.has(pk) && !requestedPubkeys.has(pk)
        );

        if (pubkeysToFetch.length === 0) {
            // Ensure local state is up-to-date with global cache even if not fetching
            setProfiles((currentProfiles) => {
                const newProfiles: Record<string, NostrProfile> = {};
                let hasChanged = false;
                pubkeys.forEach((pk) => {
                    if (profileCache.has(pk)) {
                        newProfiles[pk] = profileCache.get(pk)!;
                        if (currentProfiles[pk] !== newProfiles[pk]) {
                            hasChanged = true;
                        }
                    }
                });
                if (
                    hasChanged ||
                    Object.keys(newProfiles).length !==
                    Object.keys(currentProfiles).length
                ) {
                    return newProfiles;
                }
                return currentProfiles;
            });
            return;
        }

        pubkeysToFetch.forEach((pk) => requestedPubkeys.add(pk));

        const handleEvent = (event: NostrEvent) => {
            try {
                const profile = JSON.parse(event.content) as NostrProfile;
                profileCache.set(event.pubkey, profile);
                setProfiles((prev) => ({...prev, [event.pubkey]: profile}));
            } catch {
            }
        };

        const sub = pool.subscribeMany(
            DEFAULT_RELAYS,
            [{kinds: [0], authors: pubkeysToFetch}],
            {
                onevent: handleEvent,
            }
        );

        // Cleanup subscription on unmount or when pubkeys change
        return () => {
            sub.close();
        };
    }, [pubkeys]);

    return profiles;
};
