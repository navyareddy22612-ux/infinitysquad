import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Activity, TrendingUp, DollarSign, Calendar, MessageSquare, MapPin, CloudSun, Globe, ChevronRight } from 'lucide-react';
import styles from '../styles/Home.module.css';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../services/i18n';
import MapPicker from '../components/MapPicker';

const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' }
];

const Home = () => {
    const { location, updateLocation } = useLocation();
    const { language, changeLanguage } = useLanguage();
    const { t } = useTranslation();
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    const features = [
        {
            title: t('crop_recommendation'),
            desc: t('crop_recommendation_desc'),
            icon: <Sprout size={32} />,
            color: "emerald",
            link: "/recommend"
        },
        {
            title: t('disease_detection'),
            desc: t('disease_detection_desc'),
            icon: <Activity size={32} />,
            color: "red",
            link: "/disease"
        },
        {
            title: t('yield_profit'),
            desc: t('yield_profit_desc'),
            icon: <DollarSign size={32} />,
            color: "yellow",
            link: "/yield"
        },
        {
            title: t('price_forecasting'),
            desc: t('price_forecasting_desc'),
            icon: <TrendingUp size={32} />,
            color: "blue",
            link: "/forecast"
        },
        {
            title: t('crop_planner'),
            desc: t('crop_planner_desc'),
            icon: <Calendar size={32} />,
            color: "purple",
            link: "/planner"
        },
        {
            title: t('ai_assistant'),
            desc: t('ai_assistant_desc'),
            icon: <MessageSquare size={32} />,
            color: "teal",
            link: "/chat"
        }
    ];

    const handleLocationSelect = (pos) => {
        updateLocation(pos.lat, pos.lng);
        setIsMapOpen(false);
    };

    return (
        <div className={styles.homeContainer}>
            {isMapOpen && (
                <MapPicker
                    onLocationSelect={handleLocationSelect}
                    onClose={() => setIsMapOpen(false)}
                />
            )}
            <header className={styles.hero}>
                <div className="container">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className={styles.title}>{t('welcome')}</h1>
                            <p className={styles.subtitle}>{t('subtitle')}</p>
                        </div>
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="bg-white/20 hover:bg-white/30 p-3 rounded-full backdrop-blur-md transition-all flex items-center gap-2 group border border-white/20"
                        >
                            <Globe size={20} className="text-white" />
                            <span className="text-white font-bold text-sm">
                                {languages.find(l => l.code === language)?.native}
                            </span>
                        </button>
                    </div>

                    {isLangOpen && (
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        changeLanguage(lang.code);
                                        setIsLangOpen(false);
                                    }}
                                    className={`p-3 rounded-xl transition-all text-sm font-bold flex flex-col items-center justify-center gap-1 ${language === lang.code
                                            ? 'bg-white text-[#10B981] shadow-lg scale-105'
                                            : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    <span>{lang.native}</span>
                                    <span className="text-[10px] opacity-60 uppercase">{lang.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className={styles.weatherCard}>
                        <div className={styles.weatherMain}>
                            <div className={styles.location} onClick={() => setIsMapOpen(true)} style={{ cursor: 'pointer' }}>
                                <MapPin size={16} /> {location.name}
                            </div>
                            <div className={styles.temp}>
                                <CloudSun size={24} className="text-yellow-400" />
                                <span>28°C</span>
                            </div>
                        </div>
                        <div className={styles.date}>
                            {new Date().toLocaleDateString(language === 'en' ? 'en-IN' : language, { weekday: 'long', day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                </div>
            </header>

            <section className="container pb-20">
                <h2 className={styles.sectionTitle}>{t('our_services')}</h2>
                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <Link to={feature.link} key={index} className={styles.featureCard}>
                            <div className={`${styles.iconWrapper} ${styles[feature.color]}`}>
                                {feature.icon}
                            </div>
                            <div className="flex flex-col flex-1">
                                <h3 className={styles.cardTitle}>{feature.title}</h3>
                                <p className={styles.cardDesc}>{feature.desc}</p>
                            </div>
                            <ChevronRight size={20} className="text-stone-300 group-hover:text-stone-500 transition-all ml-auto" />
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
