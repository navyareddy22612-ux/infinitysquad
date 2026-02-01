import React from 'react';
import { Leaf, Globe } from 'lucide-react';
import styles from '../styles/Navbar.module.css';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
    const { language } = useLanguage();

    const languageNameMap = {
        en: 'English', hi: 'हिन्दी', te: 'తెలుగు', ta: 'தமிழ்', kn: 'ಕನ್ನಡ',
        ml: 'മലയാളം', mr: 'मराठी', gu: 'ગુજરાતી', bn: 'বাংলা',
        pa: 'ਪੰਜਾਬੀ', ur: 'اردو', or: 'ଓଡ଼ିଆ'
    };

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContent}`}>
                <div className={styles.brand}>
                    <div className={styles.logoIcon}>
                        <Leaf size={24} color="white" />
                    </div>
                    <span className={styles.brandName}>Infinity Kisan</span>
                </div>

                <div className={styles.actions}>
                    <div className="flex items-center gap-2 text-white/80 text-sm font-bold bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                        <Globe size={16} />
                        <span>{languageNameMap[language] || 'English'}</span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
