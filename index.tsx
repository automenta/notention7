import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {NotesProvider} from './components/contexts/NotesContext';
import {AppProvider} from './components/contexts/AppContext';
import {NotificationProvider} from './components/contexts/NotificationContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <NotificationProvider>
            <AppProvider>
                <NotesProvider>
                    <App/>
                </NotesProvider>
            </AppProvider>
        </NotificationProvider>
    </React.StrictMode>
);
