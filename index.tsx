import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {NotesProvider} from './components/contexts/NotesContext';
import {AppProvider} from './components/contexts/AppContext';
import localforage from 'localforage';

// Initialize and configure localForage
async function initStorage() {
    try {
        // Configure localForage
        localforage.config({
            name: 'Notention',
            storeName: 'notention_store',
            description: 'Storage for Notention app',
        });
        // Ensure the driver is ready
        await localforage.ready();
        console.log('localForage is ready and configured.');
        // Expose localforage to the window for verification scripts
        (window as any).localforage = localforage;
    } catch (e) {
        console.error('localForage initialization failed:', e);
        // You might want to show an error message to the user here
    }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

// Ensure storage is initialized before rendering the app
initStorage().then(() => {
    root.render(
        <React.StrictMode>
            <AppProvider>
                <NotesProvider>
                    <App/>
                </NotesProvider>
            </AppProvider>
        </React.StrictMode>
    );
});
