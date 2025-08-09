import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {getPublicKey, nip04} from 'nostr-tools';
import type {Contact, NostrEvent} from '@/types';
import {hexToBytes} from '@/utils/format.ts';
import {nostrService} from '@/services/NostrService.ts';
import {ContactList} from '../chat/ContactList';
import {ChatWindow} from '../chat/ChatWindow';
import {useAppContext} from '../contexts/AppContext';

export const ChatView: React.FC = () => {
    const {settings} = useAppContext();
    const privkey = settings.nostr.privkey;
    const pubkey = useMemo(
        () => (privkey ? getPublicKey(hexToBytes(privkey)) : null),
        [privkey]
    );

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [messages, setMessages] = useState<
        Record<string, (NostrEvent & { content: string })[]>
    >({});
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const addMessage = useCallback(
        (peerPubkey: string, event: NostrEvent, decryptedContent: string) => {
            setMessages((prev) => {
                const existing = prev[peerPubkey] || [];
                if (existing.some((m) => m.id === event.id)) return prev;
                const newMessages = [
                    ...existing,
                    {...event, content: decryptedContent},
                ];
                newMessages.sort((a, b) => a.created_at - b.created_at);
                return {...prev, [peerPubkey]: newMessages.slice(-100)};
            });
        },
        []
    );

    const handleDecryption = useCallback(
        async (event: NostrEvent) => {
            if (!privkey) return;
            try {
                const peerPubkey =
                    event.pubkey === pubkey
                        ? event.tags.find((t) => t[0] === 'p')?.[1]
                        : event.pubkey;
                if (!peerPubkey) return;

                const decryptedContent = nip04.decrypt(
                    privkey,
                    peerPubkey,
                    event.content
                );
                addMessage(peerPubkey, event, decryptedContent);
            } catch {
                // Decryption errors are expected if a message is not intended for the user, so they are suppressed.
            }
        },
        [privkey, pubkey, addMessage]
    );

    // Fetch initial contact list (kind: 3)
    useEffect(() => {
        if (!pubkey) {
            setIsLoading(false);
            return;
        }

        const sub = nostrService.subscribeToContactList(pubkey, (event) => {
            const newContacts: Contact[] = event.tags
                .filter((tag) => tag[0] === 'p' && tag[1])
                .map((tag) => ({pubkey: tag[1]}));
            setContacts(newContacts);
            setIsLoading(false);
        });

        const timer = setTimeout(() => {
            if (contacts.length === 0) setIsLoading(false);
            sub.close();
        }, 3000);

        return () => {
            clearTimeout(timer);
            sub.close();
        };
    }, [pubkey, contacts.length]);

    // Subscribe to messages for the selected contact
    useEffect(() => {
        if (!selectedContact || !pubkey || !privkey) return;

        const sub = nostrService.subscribeToDms(
            pubkey,
            selectedContact.pubkey,
            handleDecryption
        );

        return () => sub.close();
    }, [selectedContact, pubkey, privkey, handleDecryption]);

    if (!privkey || !pubkey) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center bg-gray-800/50 rounded-lg p-8">
                <h2 className="text-3xl font-bold text-gray-400">
                    Chat Requires Nostr Account
                </h2>
                <p className="text-gray-500 mt-2">
                    Please create or configure your Nostr account in the
                    &quot;Network&quot; tab.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-800/50 rounded-lg overflow-hidden">
            <div
                className={`w-full md:w-1/3 md:flex-shrink-0 ${selectedContact ? 'hidden md:block' : 'block'}`}
            >
                <ContactList
                    privkey={privkey}
                    pubkey={pubkey}
                    contacts={contacts}
                    setContacts={setContacts}
                    selectedContact={selectedContact}
                    onSelectContact={setSelectedContact}
                    isLoading={isLoading}
                />
            </div>
            <div
                className={`w-full ${!selectedContact ? 'hidden md:block' : 'block'}`}
            >
                <ChatWindow
                    privkey={privkey}
                    pubkey={pubkey}
                    selectedContact={selectedContact}
                    onBack={() => setSelectedContact(null)}
                    messages={
                        selectedContact ? messages[selectedContact.pubkey] || [] : []
                    }
                    onSendMessage={(peerPubkey, event, decryptedContent) =>
                        addMessage(peerPubkey, event, decryptedContent)
                    }
                />
            </div>
        </div>
    );
};
