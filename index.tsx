import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {SettingsProvider} from './components/contexts/SettingsContext';
import {NotesProvider} from './components/contexts/NotesContext';
import {ViewProvider} from './components/contexts/ViewContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <SettingsProvider>
            <NotesProvider>
                <ViewProvider>
                    <App/>
                </ViewProvider>
            </NotesProvider>
        </SettingsProvider>
    </React.StrictMode>
);
