import React, {useMemo, useState} from 'react';
import {finalizeEvent, nip19} from 'nostr-tools';
import {useNostrProfile} from '@/hooks/useNostrProfile.ts';
import {pool} from '@/services/nostrService.ts';
import type {Contact} from '@/types.ts';
import {DEFAULT_RELAYS, formatNpub, hexToBytes} from '@/utils/nostr.ts';
import {UserPlusIcon} from '../icons';

interface ContactListProps {
    privkey: string;
    pubkey: string;
    contacts: Contact[];
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    selectedContact: Contact | null;
    onSelectContact: (contact: Contact) => void;
    isLoading: boolean;
}

export const ContactList: React.FC<ContactListProps> = ({
                                                            privkey,
                                                            pubkey,
                                                            contacts,
                                                            setContacts,
                                                            selectedContact,
                                                            onSelectContact,
                                                            isLoading,
                                                        }) => {
    const [newContactNpub, setNewContactNpub] = useState('');
    const [error, setError] = useState<string | null>(null);

    const contactPubkeys = useMemo(
        () => contacts.map((c) => c.pubkey),
        [contacts]
    );
    const contactProfiles = useNostrProfile(contactPubkeys);

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!newContactNpub.trim()) return;

        try {
            const {data: newPubkey} = nip19.decode(newContactNpub.trim());
            //if (type !== 'npub' || typeof newPubkey !== 'string') throw new Error("Invalid npub format.");
            if (contacts.some((c) => c.pubkey === newPubkey) || newPubkey === pubkey)
                throw new Error('Contact already exists or is yourself.');

            const currentTags = contacts.map((c) => ['p', c.pubkey]);
            const newTags = [...currentTags, ['p', newPubkey]];

            const event = finalizeEvent(
                {
                    kind: 3,
                    created_at: Math.floor(Date.now() / 1000),
                    tags: newTags,
                    content: '',
                },
                hexToBytes(privkey)
            );

            await Promise.all(pool.publish(DEFAULT_RELAYS, event));

            setContacts((c) => [...c, {pubkey: newPubkey}]);
            setNewContactNpub('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add contact.');
            console.error(err);
        }
    };

    return (
        <div className="h-full flex flex-col border-r border-gray-700/50 bg-gray-900/50">
            <div className="p-4 flex-shrink-0 border-b border-gray-700/50">
                <form onSubmit={handleAddContact} className="flex gap-2">
                    <input
                        type="text"
                        value={newContactNpub}
                        onChange={(e) => setNewContactNpub(e.target.value)}
                        placeholder="Add contact npub..."
                        className="flex-grow p-2 text-sm bg-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="p-2 bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        <UserPlusIcon className="h-5 w-5"/>
                    </button>
                </form>
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>
            <div className="flex-grow overflow-y-auto">
                {isLoading && (
                    <div className="p-4 text-center text-gray-400">
                        Loading contacts...
                    </div>
                )}
                {!isLoading && contacts.length === 0 && (
                    <div className="p-4 text-center text-gray-400">
                        No contacts found.
                    </div>
                )}
                {contacts.map((contact) => {
                    const profile = contactProfiles[contact.pubkey];
                    return (
                        <div
                            key={contact.pubkey}
                            onClick={() => onSelectContact(contact)}
                            className={`flex items-center gap-3 p-3 cursor-pointer border-l-4 ${selectedContact?.pubkey === contact.pubkey ? 'bg-blue-600/20 border-blue-500' : 'border-transparent hover:bg-gray-800'}`}
                        >
                            <img
                                src={
                                    profile?.picture ||
                                    `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${contact.pubkey}`
                                }
                                className="h-10 w-10 rounded-full bg-gray-700"
                            />
                            <div className="overflow-hidden">
                                <p className="font-semibold truncate text-white">
                                    {profile?.name ||
                                        formatNpub(nip19.npubEncode(contact.pubkey))}
                                </p>
                                <p className="text-sm text-gray-400 truncate">
                                    {profile?.about || '...'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
