
import React, { useState, useMemo } from 'react';
import { nip19, finalizeEvent } from 'nostr-tools';
import type { AppSettings, NostrProfile } from '@/types.ts';
import { LoadingSpinner, EditIcon } from '../icons';
import { DEFAULT_RELAYS, hexToBytes, formatNpub } from '@/utils/nostr.ts';
import { pool } from '@/services/nostrService.ts';

const ProfileEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (profile: NostrProfile) => Promise<void>;
    initialProfile: NostrProfile;
    isSaving: boolean;
}> = ({ isOpen, onClose, onSave, initialProfile, isSaving }) => {
    const [profile, setProfile] = useState(initialProfile);

    React.useEffect(() => setProfile(initialProfile), [initialProfile]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(profile);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input type="text" placeholder="Display Name" value={profile.name || ''} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" placeholder="Picture URL" value={profile.picture || ''} onChange={e => setProfile(p => ({ ...p, picture: e.target.value }))} className="w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <textarea placeholder="About" value={profile.about || ''} onChange={e => setProfile(p => ({ ...p, about: e.target.value }))} className="w-full p-2 bg-gray-700 rounded-md text-white h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait transition-colors flex items-center gap-2">
                           {isSaving && <LoadingSpinner className="h-4 w-4" />} {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const ProfileHeader: React.FC<{
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    pubkey: string;
    profileCache: Record<string, NostrProfile>;
}> = ({ settings, setSettings, pubkey, profileCache }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    
    const myProfile = profileCache[pubkey] || null;
    const npub = useMemo(() => nip19.npubEncode(pubkey), [pubkey]);

    const handleSaveProfile = async (profile: NostrProfile) => {
        if (!settings.nostr.privkey) return;
        setIsSavingProfile(true);
        try {
            const privkeyUI8A = hexToBytes(settings.nostr.privkey);
            const eventTemplate = {
                kind: 0,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: JSON.stringify(profile),
            };
            const signedEvent = finalizeEvent(eventTemplate, privkeyUI8A);

            await Promise.all(pool.publish(DEFAULT_RELAYS, signedEvent));
            // Profile will be updated via the nostr subscription
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsSavingProfile(false);
            setIsModalOpen(false);
        }
    };
    
    const handleCopy = () => navigator.clipboard.writeText(npub);

    return (
        <>
            <div className="flex-shrink-0 p-4 border-b border-gray-700/50 flex items-center gap-4 bg-gray-900/50">
                <img src={myProfile?.picture || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${npub}`} alt="avatar" className="h-16 w-16 rounded-full border-2 border-gray-600" />
                <div className="flex-grow">
                    <h2 className="text-xl font-bold text-white">{myProfile?.name || 'Anonymous'}</h2>
                    <p className="text-sm text-gray-400 font-mono cursor-pointer hover:text-blue-400" onClick={handleCopy} title="Click to copy">{formatNpub(npub)}</p>
                    {myProfile?.about && <p className="text-sm text-gray-300 mt-1">{myProfile.about}</p>}
                </div>
                <button onClick={() => setIsModalOpen(true)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" title="Edit Profile">
                    <EditIcon className="h-5 w-5" />
                </button>
            </div>
             <ProfileEditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProfile}
                initialProfile={myProfile || {}}
                isSaving={isSavingProfile}
            />
        </>
    );
};
