import React, { useState } from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

import { useLanguage } from '../context/LanguageContext';

const Layout = ({ children }) => {
    const { language } = useLanguage();

    return (
        <div className="layout" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            {/* Navbar for Desktop/Tablet */}
            <Navbar />

            {/* Main Content Area */}
            <main style={{ minHeight: '100vh', paddingBottom: '80px' }}>
                {children}
            </main>

            {/* Bottom Nav for Mobile */}
            <BottomNav />
        </div>
    );
};

export default Layout;
