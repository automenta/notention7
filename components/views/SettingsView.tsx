import React, {useMemo, useState} from 'react';
import {generateSecretKey, getPublicKey, nip19} from 'nostr-tools';
import {bytesToHex, hexToBytes} from '@/utils/nostr.ts';
import {ClipboardIcon, KeyIcon, SparklesIcon, TrashIcon} from '../icons';
import {useSettingsContext} from '../contexts/SettingsContext';
import OntologyEditor from '../settings/OntologyEditor';

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

const CopyableField: React.FC<{
    label: string;
    value: string;
    isSecret?: boolean;
}> = ({label, value, isSecret = false}) => {
    const [copied, setCopied] = useState(false);
    const [visible, setVisible] = useState(!isSecret);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
                {label}
            </label>
            <div className="flex items-center gap-2">
                <input
                    type={visible ? 'text' : 'password'}
                    readOnly
                    value={value}
                    className="flex-grow p-2 bg-gray-800 rounded-md text-gray-300 font-mono text-xs focus:outline-none"
                />
                {isSecret && (
                    <button
                        onClick={() => setVisible(!visible)}
                        className="p-2 text-gray-400 hover:text-white rounded-md text-xs bg-gray-700 hover:bg-gray-600"
                    >
                        {visible ? 'Hide' : 'Show'}
                    </button>
                )}
                <button
                    onClick={handleCopy}
                    className="p-2 bg-gray-600 rounded-md hover:bg-gray-500"
                    title="Copy to clipboard"
                >
                    <ClipboardIcon className="h-4 w-4"/>
                </button>
            </div>
            {copied && (
                <p className="text-xs text-green-400 mt-1">Copied to clipboard!</p>
            )}
        </div>
    );
};

export const SettingsView: React.FC = () => {
    const {settings, setSettings} = useSettingsContext();
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
                    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
                            <SparklesIcon className="h-6 w-6 text-blue-400"/>
                            AI Enhancements
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label
                                    htmlFor="gemini-api-key"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Google Gemini API Key
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="gemini-api-key"
                                        type="password"
                                        value={apiKeyInput}
                                        onChange={(e) => setApiKeyInput(e.target.value)}
                                        placeholder="Enter your Gemini API key"
                                        className="flex-grow p-2 bg-gray-800 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={handleSaveApiKey}
                                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-gray-700/50 pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-grow">
                                        <label
                                            htmlFor="ai-toggle"
                                            className={`font-medium ${
                                                settings.geminiApiKey
                                                    ? 'text-gray-300'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            Enable AI Features
                                        </label>
                                        <p
                                            className={`text-sm mt-1 ${
                                                settings.geminiApiKey
                                                    ? 'text-gray-400'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            Enables features like note summarization and semantic
                                            suggestions.
                                        </p>
                                    </div>
                                    <div
                                        className="relative"
                                        title={
                                            !settings.geminiApiKey
                                                ? 'You must save a valid Gemini API key to enable this feature.'
                                                : ''
                                        }
                                    >
                                        <button
                                            id="ai-toggle"
                                            onClick={handleToggleAI}
                                            disabled={!settings.geminiApiKey}
                                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${
                                                settings.geminiApiKey
                                                    ? settings.aiEnabled
                                                        ? 'bg-blue-600'
                                                        : 'bg-gray-600'
                                                    : 'bg-gray-700 cursor-not-allowed'
                                            }`}
                                        >
                      <span
                          aria-hidden="true"
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${
                              settings.aiEnabled && settings.geminiApiKey
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                          }`}
                      />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!settings.geminiApiKey && (
                            <div
                                className="mt-6 p-3 bg-yellow-900/50 border border-yellow-700 text-yellow-300 text-sm rounded-md">
                                <strong>Action Required:</strong> A Google Gemini API key has
                                not been set. AI features are disabled. Please enter your key
                                above to proceed.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'nostr' && (
                    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
                            <KeyIcon className="h-6 w-6 text-yellow-400"/>
                            Nostr Identity
                        </h2>
                        {settings.nostr.privkey && nsec && npub ? (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-400">
                                    Your keys are stored locally on this device. Keep your private
                                    key safe and do not share it.
                                </p>
                                <CopyableField label="Public Key (npub)" value={npub}/>
                                <CopyableField
                                    label="Private Key (nsec)"
                                    value={nsec}
                                    isSecret
                                />
                                <button
                                    onClick={handleLogout}
                                    className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <KeyIcon className="h-5 w-5"/> Log Out & Clear Private Key
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-400 mb-4">
                                    You don&apos;t have a Nostr identity set up on this device
                                    yet.
                                </p>
                                <button
                                    onClick={handleGenerateKeys}
                                    className="flex items-center justify-center gap-3 mx-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <KeyIcon className="h-5 w-5"/> Generate New Keys
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
                            <TrashIcon className="h-6 w-6 text-red-400"/>
                            Data Management
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Your notes and settings are stored locally in your browser&apos;s
                            IndexedDB. Clearing data is irreversible.
                        </p>
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 flex items-center gap-2"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        'Are you sure you want to delete all data? This action cannot be undone.'
                                    )
                                ) {
                                    window.localStorage.clear();
                                    window.indexedDB.deleteDatabase('localforage');
                                    window.location.reload();
                                }
                            }}
                        >
                            <TrashIcon className="h-5 w-5"/> Clear All Local Data
                        </button>
                    </div>
                )}

                {activeTab === 'ontology' && (
                    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">
                            Ontology Management
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Define the types of tags and properties you can use in your notes.
                        </p>
                        <OntologyEditor ontology={settings.ontology}/>
                    </div>
                )}
            </div>
        </div>
    );
};
