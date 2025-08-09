import {finalizeEvent, getPublicKey, SimplePool} from 'nostr-tools';
import type {NostrEvent, Note} from '@/types';
import {DEFAULT_RELAYS, hexToBytes} from '../utils/nostr';

/**
 * A shared Nostr SimplePool instance to be used across the entire application.
 * This prevents creating multiple WebSocket connections to the same relays and ensures
 * connection state is managed centrally.
 */
export const pool = new SimplePool();

/**
 * The custom Nostr kind for Notention notes.
 * Using a kind in the 30000-39999 range for replaceable events.
 * 30019 is arbitrarily chosen for "Notention".
 */
export const NOTENTION_KIND = 30019;

/**
 * Publishes a note to the Nostr network.
 * @param note The note to publish.
 * @param privkey The user's Nostr private key (hex).
 * @returns The signed and published Nostr event.
 */
export const publishNote = async (
    note: Note,
    privkey: string
): Promise<NostrEvent> => {
    const privkeyBytes = hexToBytes(privkey);
    const pubkey = getPublicKey(privkeyBytes);

    const tags: string[][] = [];

    // Add note ID as a replaceable event identifier ('d' tag)
    tags.push(['d', note.id]);

    // Add simple tags (e.g., #idea)
    note.tags.forEach((tag) => {
        tags.push(['t', tag.toLowerCase()]);
    });

    // Add properties (e.g., [status:is:done])
    note.properties.forEach((prop) => {
        // e.g., ['p', 'status', 'is', 'done']
        tags.push(['p', prop.key, prop.op, ...prop.values]);
    });

    const unsignedEvent = {
        kind: NOTENTION_KIND,
        pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: JSON.stringify({
            title: note.title,
            content: note.content,
        }),
    };

    const signedEvent = finalizeEvent(unsignedEvent, privkeyBytes);

    // Publish the event to the default relays
    const pubs = pool.publish(DEFAULT_RELAYS, signedEvent);

    // Wait for the event to be published to at least one relay
    await Promise.any(pubs);

    return signedEvent;
};

/**
 * Finds notes on the Nostr network that match a given filter.
 * Subscribes to relays, collects events for a short period, and then closes the subscription.
 * @param filter The Nostr filter to query for.
 * @returns A promise that resolves to an array of found Nostr events.
 */
export const findMatchingNotes = (
    filter: Record<string, any>
): Promise<NostrEvent[]> => {
    return new Promise((resolve) => {
        const foundEvents: NostrEvent[] = [];
        const seenEventIds = new Set<string>();

        const sub = pool.subscribeMany(DEFAULT_RELAYS, [filter], {
            onevent: (event) => {
                if (!seenEventIds.has(event.id)) {
                    seenEventIds.add(event.id);
                    foundEvents.push(event);
                }
            },
            onclose: () => {
                resolve(foundEvents);
            },
        });

        // Close the subscription after a delay to gather some results
        setTimeout(() => {
            sub.close();
        }, 3000); // 3 seconds for discovery
    });
};
