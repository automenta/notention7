import {useEffect, useState} from 'react';
import {nostrService, NOTENTION_KIND} from '../services/NostrService';
import type {NostrEvent, Note, Property} from '@/types';

/**
 * Transforms a Nostr event into a Notention Note.
 * @param event The Nostr event to transform.
 * @returns A Note object, or null if the event is malformed.
 */
const eventToNote = (event: NostrEvent): Note | null => {
    try {
        const {title, content} = JSON.parse(event.content);
        const tags: string[] = [];
        const properties: Property[] = [];

        const idTag = event.tags.find((t) => t[0] === 'd');
        if (!idTag) return null; // A Notention note must have an id

        event.tags.forEach((tag) => {
            if (tag[0] === 't') {
                tags.push(tag[1]);
            } else if (tag[0] === 'p') {
                properties.push({
                    key: tag[1],
                    op: tag[2],
                    values: tag.slice(3),
                });
            }
        });

        return {
            id: idTag[1],
            title,
            content,
            tags,
            properties,
            createdAt: new Date(event.created_at * 1000).toISOString(),
            updatedAt: new Date(event.created_at * 1000).toISOString(), // Use created_at for both for now
            nostrEventId: event.id,
            publishedAt: new Date(event.created_at * 1000).toISOString(),
        };
    } catch (error) {
        console.error('Failed to parse Nostr event content:', error);
        return null;
    }
};

/**
 * A hook to discover 'real' notes from the Nostr network.
 * 'Real' notes are those that contain a property with the 'is' operator.
 */
export const useDiscovery = () => {
    const [discoveredNotes, setDiscoveredNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            setIsLoading(true);
            try {
                // Fetch all Notention notes. We cannot filter for the 'is' operator
                // on the relay side, so we do it on the client.
                const filter = {
                    kinds: [NOTENTION_KIND],
                    limit: 100, // Let's not fetch the entire history of the world
                };

                const events = await nostrService.findMatchingNotes(filter);
                const allNotes = events
                    .map(eventToNote)
                    .filter((note): note is Note => note !== null);

                // Now, filter for 'real' notes on the client side.
                // A note is 'real' if it has at least one property with the 'is' operator.
                const realNotes = allNotes.filter((note) =>
                    note.properties.some((prop) => prop.op === 'is')
                );

                console.log('Discovered real notes:', realNotes);
                setDiscoveredNotes(realNotes);
            } catch (error) {
                console.error('Failed to fetch discovery notes:', error);
                // We could also set an error state here
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, []);

    return {discoveredNotes, isLoading};
};
