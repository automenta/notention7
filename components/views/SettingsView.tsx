import React, {useMemo, useState} from 'react';
import {generateSecretKey, getPublicKey, nip19} from 'nostr-tools';
import {bytesToHex, hexToBytes} from '@/utils/format.ts';
import {useAppContext} from '../contexts/AppContext';
import {AiSettingsTab} from '../settings/tabs/AiSettingsTab';
import {NostrSettingsTab} from '../settings/tabs/NostrSettingsTab';
import {DataSettingsTab} from '../settings/tabs/DataSettingsTab';
import {OntologySettingsTab} from '../settings/tabs/OntologySettingsTab';

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({label, isActive, onClick}) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            isActive
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
        }`}
    >
        {label}
    </button>
);

export const SettingsView: React.FC = () => {
    const {settings, setSettings} = useAppContext();
    const [activeTab, setActiveTab] = useState<
        'ai' | 'nostr' | 'data' | 'ontology'
    >('ai');
    const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey || '');

    const handleToggleAI = () => {
        if (!settings.geminiApiKey) return;
        setSettings((prev) => ({...prev, aiEnabled: !prev.aiEnabled}));
    };

    const handleSaveApiKey = () => {
        setSettings((prev) => ({...prev, geminiApiKey: apiKeyInput}));
        alert('API Key saved!');
    };

    const handleGenerateKeys = () => {
        const newPrivKeyHex = bytesToHex(generateSecretKey());
        setSettings((prev) => ({...prev, nostr: {privkey: newPrivKeyHex}}));
    };

    const handleLogout = () => {
        if (
            window.confirm(
                'Are you sure? This will remove your Nostr private key from this device. This action cannot be undone.'
            )
        ) {
            setSettings((prev) => ({...prev, nostr: {privkey: null}}));
        }
    };

    const {npub, nsec} = useMemo(() => {
        if (!settings.nostr.privkey) return {npub: null, nsec: null};
        try {
            const pubkey = getPublicKey(hexToBytes(settings.nostr.privkey));
            return {
                npub: nip19.npubEncode(pubkey),
                nsec: nip19.nsecEncode(hexToBytes(settings.nostr.privkey)),
            };
        } catch (e) {
            console.error('Error encoding keys:', e);
            return {npub: 'Error', nsec: 'Error'};
        }
    }, [settings.nostr.privkey]);

    return (
        <div className="p-8 h-full overflow-y-auto bg-gray-800/50 rounded-lg">
            <h1 className="text-3xl font-bold text-white mb-2">⚙️ Settings</h1>
            <div className="border-b border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton
                        label="🤖 AI"
                        isActive={activeTab === 'ai'}
                        onClick={() => setActiveTab('ai')}
                    />
                    <TabButton
                        label="🔑 Nostr"
                        isActive={activeTab === 'nostr'}
                        onClick={() => setActiveTab('nostr')}
                    />
                    <TabButton
                        label="📦 Data"
                        isActive={activeTab === 'data'}
                        onClick={() => setActiveTab('data')}
                    />
                    <TabButton
                        label="🧠 Ontology"
                        isActive={activeTab === 'ontology'}
                        onClick={() => setActiveTab('ontology')}
                    />
                </nav>
            </div>

            <div>
                {activeTab === 'ai' && (
                    <AiSettingsTab
                        settings={settings}
                        apiKeyInput={apiKeyInput}
                        setApiKeyInput={setApiKeyInput}
                        handleSaveApiKey={handleSaveApiKey}
                        handleToggleAI={handleToggleAI}
                    />
                )}

                {activeTab === 'nostr' && (
                    <NostrSettingsTab
                        settings={settings}
                        npub={npub}
                        nsec={nsec}
                        handleGenerateKeys={handleGenerateKeys}
                        handleLogout={handleLogout}
                    />
                )}

                {activeTab === 'data' && <DataSettingsTab/>}

                {activeTab === 'ontology' && (
                    <OntologySettingsTab settings={settings}/>
                )}
            </div>
        </div>
    );
};
