import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { LocationProvider } from './context/LocationContext';
import { LanguageProvider } from './context/LanguageContext';

// Hardened Security: Clear any legacy/compromised keys from browser storage
localStorage.removeItem('gemini_api_key');
localStorage.removeItem('app_language_old'); // Cleanup other potential legacy keys if needed

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <LanguageProvider>
            <LocationProvider>
                <App />
            </LocationProvider>
        </LanguageProvider>
    </React.StrictMode>
);
