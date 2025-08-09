import React, {useEffect, useMemo, useRef, useState} from 'react';
import {finalizeEvent, nip04, nip19} from 'nostr-tools';
import type {Contact, NostrEvent} from '@/types';
import {useNostrProfile} from '@/hooks/useNostrProfile.ts';
import {pool} from '@/services/nostrService.ts';
import {DEFAULT_RELAYS, formatNpub, hexToBytes} from '@/utils/nostr.ts';
import {ArrowLeftIcon, SendIcon} from '../icons';

interface ChatWindowProps {
    privkey: string;
    pubkey: string;
    selectedContact: Contact | null;
    onBack: () => void;
    messages: (NostrEvent & { content: string })[];
    onSendMessage: (
        peerPubkey: string,
        event: NostrEvent,
        decryptedContent: string
    ) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
                                                          privkey,
                                                          pubkey,
                                                          selectedContact,
                                                          onBack,
                                                          messages,
                                                          onSendMessage,
                                                      }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const contactPubkey = useMemo(
        () => (selectedContact ? [selectedContact.pubkey] : []),
        [selectedContact]
    );
    const profiles = useNostrProfile(contactPubkey);
    const selectedProfile = selectedContact
        ? profiles[selectedContact.pubkey]
        : null;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        try {
            const encryptedContent = nip04.encrypt(
                privkey,
                selectedContact.pubkey,
                newMessage.trim()
            );
            const event = finalizeEvent(
                {
                    kind: 4,
                    created_at: Math.floor(Date.now() / 1000),
                    tags: [['p', selectedContact.pubkey]],
                    content: encryptedContent,
                },
                hexToBytes(privkey)
            );

            await Promise.all(pool.publish(DEFAULT_RELAYS, event));
            onSendMessage(selectedContact.pubkey, event, newMessage.trim());
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    if (!selectedContact) {
        return (
            <div className="h-full flex flex-col bg-gray-800/70 items-center justify-center text-center text-gray-500">
                <p>Select a contact to start chatting.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-800/70">
            <div className="flex-shrink-0 p-3 border-b border-gray-700/50 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="md:hidden p-2 -ml-1 text-gray-400 hover:text-white"
                >
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <img
                    src={
                        selectedProfile?.picture ||
                        `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${selectedContact.pubkey}`
                    }
                    className="h-10 w-10 rounded-full bg-gray-700"
                />
                <div>
                    <p className="font-bold text-white">
                        {selectedProfile?.name || 'Anonymous'}
                    </p>
                    <p
                        className="text-xs text-gray-400 font-mono"
                        title={nip19.npubEncode(selectedContact.pubkey)}
                    >
                        {formatNpub(nip19.npubEncode(selectedContact.pubkey))}
                    </p>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.pubkey === pubkey ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-lg px-4 py-2 rounded-xl ${msg.pubkey === pubkey ? 'bg-blue-600' : 'bg-gray-600'}`}
                        >
                            <p className="text-white whitespace-pre-wrap break-words">
                                {msg.content}
                            </p>
                            <p className="text-xs text-gray-300/70 text-right mt-1">
                                {new Date(msg.created_at * 1000).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef}/>
            </div>
            <div className="flex-shrink-0 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500"
                    >
                        <SendIcon className="h-6 w-6"/>
                    </button>
                </form>
            </div>
        </div>
    );
};
