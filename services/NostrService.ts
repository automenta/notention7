import {finalizeEvent, getPublicKey, SimplePool, Sub, Filter} from 'nostr-tools';
import type {Contact, NostrEvent, Note} from '@/types';
import {DEFAULT_RELAYS, hexToBytes} from '../utils/format';

export const NOTENTION_KIND = 30019;

class NostrService {
    private pool = new SimplePool();

    public publishNote = async (
        note: Note,
        privkey: string
    ): Promise<NostrEvent> => {
        const privkeyBytes = hexToBytes(privkey);
        const pubkey = getPublicKey(privkeyBytes);

        const tags: string[][] = [['d', note.id]];
        note.tags.forEach((tag) => tags.push(['t', tag.toLowerCase()]));
        note.properties.forEach((prop) =>
            tags.push(['p', prop.key, prop.op, ...prop.values])
        );

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
        const pubs = this.pool.publish(DEFAULT_RELAYS, signedEvent);
        await Promise.any(pubs);
    };

    public publishProfile = async (
        privkey: string,
        profile: NostrProfile
    ): Promise<void> => {
        const privkeyBytes = hexToBytes(privkey);
        const unsignedEvent = {
            kind: 0,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: JSON.stringify(profile),
        };
        const signedEvent = finalizeEvent(unsignedEvent, privkeyBytes);
        const pubs = this.pool.publish(DEFAULT_RELAYS, signedEvent);
        await Promise.any(pubs);
    };

    public publishContactList = async (
        privkey: string,
        contacts: Contact[]
    ): Promise<void> => {
        const privkeyBytes = hexToBytes(privkey);
        const tags = contacts.map((c) => ['p', c.pubkey]);
        const unsignedEvent = {
            kind: 3,
            created_at: Math.floor(Date.now() / 1000),
            tags,
            content: '',
        };
        const signedEvent = finalizeEvent(unsignedEvent, privkeyBytes);
        const pubs = this.pool.publish(DEFAULT_RELAYS, signedEvent);
        await Promise.any(pubs);
        return signedEvent;
    };

    public findMatchingNotes = (filter: Filter): Promise<NostrEvent[]> => {
        return new Promise((resolve) => {
            const foundEvents: NostrEvent[] = [];
            const seenEventIds = new Set<string>();

            const sub = this.pool.subscribeMany(DEFAULT_RELAYS, [filter], {
                onevent: (event) => {
                    if (!seenEventIds.has(event.id)) {
                        seenEventIds.add(event.id);
                        foundEvents.push(event);
                    }
                },
                onclose: () => resolve(foundEvents),
            });

            setTimeout(() => sub.close(), 3000);
        });
    };

    public subscribeToPublicFeed = (
        onevent: (event: NostrEvent) => void
    ): Sub => {
        return this.pool.subscribeMany(DEFAULT_RELAYS, [{kinds: [1], limit: 50}], {
            onevent,
        });
    };

    public subscribeToProfiles = (
        pubkeys: string[],
        onevent: (event: NostrEvent) => void
    ): Sub => {
        return this.pool.subscribeMany(
            DEFAULT_RELAYS,
            [{kinds: [0], authors: pubkeys}],
            {onevent}
        );
    };

    public subscribeToContactList = (
        pubkey: string,
        onevent: (event: NostrEvent) => void
    ): Sub => {
        return this.pool.subscribeMany(
            DEFAULT_RELAYS,
            [{kinds: [3], authors: [pubkey], limit: 1}],
            {onevent}
        );
    };

    public subscribeToDms = (
        pubkey: string,
        peerPubkey: string,
        onevent: (event: NostrEvent) => void
    ): Sub => {
        return this.pool.subscribeMany(
            DEFAULT_RELAYS,
            [
                {kinds: [4], authors: [pubkey], '#p': [peerPubkey]},
                {kinds: [4], authors: [peerPubkey], '#p': [pubkey]},
            ],
            {onevent}
        );
    };

    public sendMessage = async (
        privkey: string,
        peerPubkey: string,
        content: string
    ): Promise<NostrEvent> => {
        const privkeyBytes = hexToBytes(privkey);
        const pubkey = getPublicKey(privkeyBytes);
        const encryptedContent = nip04.encrypt(privkey, peerPubkey, content);
        const unsignedEvent = {
            kind: 4,
            pubkey,
            created_at: Math.floor(Date.now() / 1000),
            tags: [['p', peerPubkey]],
            content: encryptedContent,
        };
        const signedEvent = finalizeEvent(unsignedEvent, privkeyBytes);
        const pubs = this.pool.publish(DEFAULT_RELAYS, signedEvent);
        await Promise.any(pubs);
        return signedEvent;
    };
}

export const nostrService = new NostrService();
