import React, { useState } from 'react';
import { Sprout, Droplets, Clock, MapPin, Search, Map } from 'lucide-react';
import MapPicker from '../components/MapPicker';
import BackButton from '../components/BackButton';
import styles from '../styles/CropRecommendation.module.css';
import { useTranslation } from '../services/i18n';

// Mock Database for Indian States
const SOIL_DATA = {
    Punjab: {
        N: 140, P: 50, K: 50, ph: 7.5, crops:
            [{ name: "wheat", score: 98, duration: "125 days", water: "high" }, { name: "paddy", score: 90, duration: "110 days", water: "high" }, { name: "maize", score: 85, duration: "100 days", water: "medium" }, { name: "sugarcane", score: 80, duration: "300+ days", water: "high" }]
    },
    Maharashtra: {
        N: 80, P: 40, K: 60, ph: 6.8, crops:
            [{ name: "cotton", score: 95, duration: "160 days", water: "medium" }, { name: "sugarcane", score: 92, duration: "365 days", water: "high" }, { name: "soybean", score: 88, duration: "95 days", water: "low" }, { name: "jowar", score: 82, duration: "110 days", water: "low" }]
    },
    TamilNadu: {
        N: 100, P: 45, K: 55, ph: 6.5, crops:
            [{ name: "paddy", score: 94, duration: "120 days", water: "high" }, { name: "banana", score: 89, duration: "300 days", water: "high" }, { name: "coconut", score: 96, duration: "running", water: "medium" }, { name: "groundnut", score: 85, duration: "105 days", water: "low" }]
    },
    Rajasthan: {
        N: 60, P: 30, K: 40, ph: 8.0, crops:
            [{ name: "bajra", score: 98, duration: "85 days", water: "very_low" }, { name: "mustard", score: 92, duration: "110 days", water: "low" }, { name: "guar", score: 88, duration: "90 days", water: "low" }, { name: "wheat", score: 70, duration: "120 days", water: "medium" }]
    },
    WestBengal: {
        N: 120, P: 60, K: 55, ph: 6.0, crops:
            [{ name: "paddy", score: 98, duration: "115 days", water: "high" }, { name: "jute", score: 95, duration: "120 days", water: "high" }, { name: "potato", score: 90, duration: "90 days", water: "medium" }, { name: "mustard", score: 80, duration: "100 days", water: "low" }]
    },
    UttarPradesh: {
        N: 125, P: 55, K: 45, ph: 7.2, crops:
            [{ name: "sugarcane", score: 96, duration: "360 days", water: "high" }, { name: "wheat", score: 95, duration: "130 days", water: "medium" }, { name: "potato", score: 88, duration: "90 days", water: "medium" }, { name: "paddy", score: 85, duration: "115 days", water: "high" }]
    },
    Gujarat: {
        N: 90, P: 40, K: 50, ph: 7.6, crops:
            [{ name: "groundnut", score: 96, duration: "110 days", water: "low" }, { name: "cotton", score: 94, duration: "160 days", water: "medium" }, { name: "castor", score: 90, duration: "150 days", water: "low" }, { name: "bajra", score: 80, duration: "90 days", water: "low" }]
    },
    Karnataka: {
        N: 95, P: 50, K: 55, ph: 6.8, crops:
            [{ name: "ragi", score: 96, duration: "110 days", water: "low" }, { name: "coffee", score: 90, duration: "running", water: "medium" }, { name: "maize", score: 85, duration: "100 days", water: "medium" }, { name: "sunflower", score: 80, duration: "90 days", water: "low" }]
    },
    Kerala: {
        N: 110, P: 45, K: 60, ph: 5.5, crops:
            [{ name: "rubber", score: 98, duration: "running", water: "high" }, { name: "coconut", score: 95, duration: "running", water: "medium" }, { name: "pepper", score: 90, duration: "running", water: "high" }, { name: "banana", score: 88, duration: "300 days", water: "high" }]
    },
};

const CropRecommendation = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [detectedLocation, setDetectedLocation] = useState('');
    const [inputs, setInputs] = useState({ N: '', P: '', K: '', ph: '' });
    const [result, setResult] = useState(null);
    const [showMap, setShowMap] = useState(false);

    // Function to match state name from API to our DB keys
    const matchStateToDB = (stateName) => {
        if (!stateName) return null;
        const cleanName = stateName.replace(/\s+/g, ''); // "Tamil Nadu" -> "TamilNadu"
        const keys = Object.keys(SOIL_DATA);
        return keys.find(key => key.toLowerCase() === cleanName.toLowerCase());
    };

    const calculateFallBackFromLat = (lat) => {
        if (lat > 28) return "Punjab";
        if (lat > 24) return "UttarPradesh";
        if (lat > 18) return "Maharashtra";
        return "TamilNadu";
    };

    const handleSearch = async () => {
        if (!searchText.trim()) return;

        setSearchLoading(true);
        try {
            // Free Geocoding API (OpenStreetMap Nominatim)
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&addressdetails=1&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const place = data[0];
                const address = place.address;
                const state = address.state || address.region || "";
                const city = address.city || address.town || address.village || address.county || searchText;

                let dbKey = matchStateToDB(state);

                // If state not found in DB, try simulating based on Lat/Lon
                if (!dbKey) {
                    const lat = parseFloat(place.lat);
                    dbKey = calculateFallBackFromLat(lat);
                }

                if (dbKey && SOIL_DATA[dbKey]) {
                    const soil = SOIL_DATA[dbKey];
                    setInputs({ N: soil.N, P: soil.P, K: soil.K, ph: soil.ph });
                    setDetectedLocation(`${city}, ${state}`);
                } else {
                    // Absolute fallback
                    setDetectedLocation(`${city} (Generic Data)`);
                    setInputs({ N: 90, P: 40, K: 40, ph: 6.5 });
                }
            } else {
                alert("Location not found. Please try a major city name.");
            }
        } catch (error) {
            console.error("Search failed", error);
            alert("Could not fetch location data. Check internet.");
        }
        setSearchLoading(false);
    };

    const handleMapSelection = async (latlng) => {
        setSearchLoading(true);
        // Optimistic Update
        setDetectedLocation(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}...`);

        try {
            // Improve Map Accuracy by Reverse Geocoding the pinned location
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`);
            const data = await response.json();

            const address = data.address || {};
            const state = address.state || "";
            const district = address.state_district || address.county || "";
            const city = address.city || address.town || address.village || district || "Selected Area";

            let dbKey = matchStateToDB(state);

            if (!dbKey) {
                dbKey = calculateFallBackFromLat(latlng.lat);
            }

            if (dbKey && SOIL_DATA[dbKey]) {
                const soil = SOIL_DATA[dbKey];
                setInputs({ N: soil.N, P: soil.P, K: soil.K, ph: soil.ph });
                setDetectedLocation(`${city}, ${state}`);
            } else {
                setDetectedLocation(`${city} (Generic)`);
                setInputs({ N: 100, P: 50, K: 50, ph: 7.0 });
            }

        } catch (e) {
            console.error(e);
            // Silent fallback if API fails
            setInputs({ N: 100, P: 50, K: 50, ph: 7.0 });
            setDetectedLocation(`${latlng.lat.toFixed(2)}, ${latlng.lng.toFixed(2)}`);
        }
        setSearchLoading(false);
    };

    const handleInputChange = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputs.N || !inputs.P) {
            alert("Please enter soil details or use location search.");
            return;
        }

        setLoading(true);

        setTimeout(() => {
            // Find best match logic if available
            let recommendations = [];
            // Try to find if the detected location matches any key in our DB (simplified)
            const foundKey = Object.keys(SOIL_DATA).find(k => detectedLocation.includes(k));

            if (foundKey) {
                recommendations = SOIL_DATA[foundKey].crops;
            } else {
                // If manual input or generic location, return balanced recommendation
                recommendations = [
                    { name: "wheat", score: 85, duration: "120 days", water: "medium" },
                    { name: "millets", score: 80, duration: "90 days", water: "low" },
                    { name: "pulses", score: 75, duration: "100 days", water: "low" },
                    { name: "tomato", score: 70, duration: "110 days", water: "medium" },
                ];
            }
            setResult(recommendations);
            setLoading(false);
        }, 1200);
    };

    // Helper to format duration string "X days" -> "X t('days')"
    const formatDuration = (str) => {
        if (!str) return '';
        if (str === 'running') return t('running');
        return str.replace('days', t('days'));
    };

    return (
        <div className="container">
            <BackButton />
            <h2 className="text-center" style={{ margin: '1.5rem 0' }}>{t('crop_recommendation')}</h2>

            {!result ? (
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit} className={styles.form}>

                        <div className={styles.stateSelect}>
                            <label>{t('search_location')}</label>
                            <div className="flex gap-2">
                                <div className={styles.selectWrapper} style={{ flex: 1 }}>
                                    <Search size={18} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        placeholder={t('location_placeholder')}
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                                        className={styles.searchInput}
                                    />
                                    <button type="button" className={styles.searchBtnInner} onClick={handleSearch} disabled={searchLoading}>
                                        {searchLoading ? '...' : 'Go'}
                                    </button>
                                </div>

                                <button type="button" className={`btn btn-outline ${styles.mapBtn}`} onClick={() => setShowMap(true)}>
                                    <Map size={20} /> {t('use_map')}
                                </button>
                            </div>

                            {detectedLocation && (
                                <div className={styles.autoHint}>
                                    <MapPin size={12} /> {t('detected_location')}: <b>{detectedLocation}</b> ({t('soil_autofill_hint')})
                                </div>
                            )}
                        </div>

                        <div className={styles.divider}><span>{t('or_edit_soil')}</span></div>

                        <div className={styles.inputGrid}>
                            <div className={styles.inputGroup}>
                                <label>{t('nitrogen')}</label>
                                <input type="number" name="N" value={inputs.N} onChange={handleInputChange} placeholder="0-200" required />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>{t('phosphorus')}</label>
                                <input type="number" name="P" value={inputs.P} onChange={handleInputChange} placeholder="0-100" required />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>{t('potassium')}</label>
                                <input type="number" name="K" value={inputs.K} onChange={handleInputChange} placeholder="0-100" required />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>{t('ph_level')}</label>
                                <input type="number" name="ph" value={inputs.ph} onChange={handleInputChange} step="0.1" placeholder="0-14" required />
                            </div>
                        </div>

                        <button disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
                            {loading ? t('analyzing_soil') : t('get_best_crops')}
                        </button>
                    </form>
                </div>
            ) : (
                <div className={styles.results}>
                    <div className={styles.topResult}>
                        <div className={styles.badge}>{t('best_match_for')} {detectedLocation || "You"}</div>
                        <h3>{t(result[0].name.toLowerCase())}</h3>
                        <div className={styles.scoreChart}>
                            <span>{result[0].score}%</span>
                            <small>{t('suitability')}</small>
                        </div>
                        <div className={styles.meta}>
                            <span><Clock size={16} /> {formatDuration(result[0].duration)}</span>
                            <span><Droplets size={16} /> {t(result[0].water.toLowerCase())}</span>
                        </div>
                        <button className="btn btn-outline w-full" onClick={() => setResult(null)}>{t('check_another')}</button>
                    </div>

                    <h4 style={{ marginTop: '1.5rem', textAlign: 'center' }}>{t('alternative_crops')}</h4>
                    <div className={styles.otherList}>
                        {result.slice(1).map((crop, i) => (
                            <div key={i} className={styles.otherCard}>
                                <div className="flex justify-between items-center w-full">
                                    <span className={styles.otherName}>{t(crop.name.toLowerCase())}</span>
                                    <div className="flex items-center gap-4">
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{formatDuration(crop.duration)}</span>
                                        <span className={styles.otherScore}>{crop.score}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showMap && <MapPicker onLocationSelect={handleMapSelection} onClose={() => setShowMap(false)} />}
        </div>
    );
};

export default CropRecommendation;
