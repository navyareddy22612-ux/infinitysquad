import React from 'react';
import { Home, Sprout, Activity, TrendingUp, Calendar, MessageSquare, DollarSign } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/BottomNav.module.css';
import { useTranslation } from '../services/i18n';

const BottomNav = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.bottomNav}>
            <NavLink to="/" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <Home size={20} />
                <span>{t('home')}</span>
            </NavLink>
            <NavLink to="/recommend" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <Sprout size={20} />
                <span>{t('crops_nav')}</span>
            </NavLink>
            <NavLink to="/disease" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <Activity size={20} />
                <span>{t('health_nav')}</span>
            </NavLink>
            <NavLink to="/yield" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <DollarSign size={20} />
                <span>{t('yield_nav')}</span>
            </NavLink>
            <NavLink to="/planner" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <Calendar size={20} />
                <span>{t('plan_nav')}</span>
            </NavLink>
        </div>
    );
};

export default BottomNav;
