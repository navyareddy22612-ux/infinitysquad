import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import BackButton from '../components/BackButton';
import styles from '../styles/PriceForecasting.module.css';
import { useTranslation } from '../services/i18n';

// Mock price database
const PRICE_DATABASE = {
    'wheat': {
        'Punjab': {
            'Ludhiana': {
                'Ludhiana Mandi': { wholesale: 2100, retail: 2300, msp: 2015, trend: [2000, 2050, 2100, 2150, 2200, 2250] },
                'Khanna Mandi': { wholesale: 2150, retail: 2350, msp: 2015, trend: [2050, 2100, 2150, 2200, 2250, 2300] }
            },
            'Amritsar': {
                'Amritsar Mandi': { wholesale: 2080, retail: 2280, msp: 2015, trend: [1980, 2030, 2080, 2130, 2180, 2230] }
            }
        },
        'Andhra Pradesh': {
            'Guntur': {
                'Guntur Market': { wholesale: 2200, retail: 2400, msp: 2015, trend: [2100, 2150, 2200, 2250, 2300, 2350] }
            }
        }
    },
    'paddy': {
        'Punjab': {
            'Ludhiana': {
                'Ludhiana Mandi': { wholesale: 3200, retail: 3500, msp: 2183, trend: [3000, 3100, 3200, 3300, 3400, 3500] }
            }
        },
        'Andhra Pradesh': {
            'Krishna': {
                'Vijayawada Market': { wholesale: 3100, retail: 3400, msp: 2183, trend: [2900, 3000, 3100, 3200, 3300, 3400] }
            }
        }
    },
    'tomato': {
        'Andhra Pradesh': {
            'Guntur': {
                'Guntur Market': { wholesale: 25, retail: 35, msp: null, trend: [20, 22, 25, 28, 30, 32] }
            },
            'Krishna': {
                'Vijayawada Market': { wholesale: 28, retail: 38, msp: null, trend: [22, 25, 28, 31, 34, 37] }
            }
        },
        'Maharashtra': {
            'Pune': {
                'Pune Market': { wholesale: 30, retail: 40, msp: null, trend: [24, 27, 30, 33, 36, 39] }
            }
        }
    },
    'cotton': {
        'Punjab': {
            'Bathinda': {
                'Bathinda Mandi': { wholesale: 6500, retail: 6800, msp: 6620, trend: [6200, 6300, 6500, 6600, 6700, 6800] }
            }
        },
        'Andhra Pradesh': {
            'Guntur': {
                'Guntur Market': { wholesale: 6400, retail: 6700, msp: 6620, trend: [6100, 6200, 6400, 6500, 6600, 6700] }
            }
        }
    },
    'maize': {
        'Andhra Pradesh': {
            'Guntur': {
                'Guntur Market': { wholesale: 1850, retail: 2050, msp: 1962, trend: [1750, 1800, 1850, 1900, 1950, 2000] }
            }
        }
    }
};

const PriceForecasting = () => {
    const { t } = useTranslation();
    const [crop, setCrop] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [market, setMarket] = useState('');
    const [rateType, setRateType] = useState('wholesale');
    const [selectedDate, setSelectedDate] = useState('');
    const [result, setResult] = useState(null);

    const crops = Object.keys(PRICE_DATABASE);
    const states = crop ? Object.keys(PRICE_DATABASE[crop] || {}) : [];
    const districts = state && crop ? Object.keys(PRICE_DATABASE[crop]?.[state] || {}) : [];
    const markets = district && state && crop ? Object.keys(PRICE_DATABASE[crop]?.[state]?.[district] || {}) : [];

    const handleSearch = (e) => {
        e.preventDefault();
        if (!crop || !state || !district || !market) {
            alert('Please fill all fields');
            return;
        }

        const priceData = PRICE_DATABASE[crop]?.[state]?.[district]?.[market];
        if (!priceData) {
            alert('No data found for this combination');
            return;
        }

        let currentPrice = priceData[rateType];
        const trendData = priceData.trend.map((price, idx) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][idx],
            price: price
        }));

        // Calculate price for selected date if provided
        let priceForDate = currentPrice;
        let dateLabel = t('current_price');

        if (selectedDate) {
            const selected = new Date(selectedDate);
            const today = new Date();
            const diffDays = Math.floor((selected - today) / (1000 * 60 * 60 * 24));

            if (diffDays < -180) {
                // More than 6 months ago - use oldest trend data
                priceForDate = Math.round(currentPrice * 0.85);
                dateLabel = `${t('current_price')} on ${selected.toLocaleDateString('en-IN')}`;
            } else if (diffDays < 0) {
                // Historical (within 6 months) - interpolate from trend
                const monthsAgo = Math.abs(Math.floor(diffDays / 30));
                priceForDate = priceData.trend[Math.max(0, 5 - monthsAgo)] || currentPrice;
                dateLabel = `${t('current_price')} on ${selected.toLocaleDateString('en-IN')}`;
            } else if (diffDays > 180) {
                // More than 6 months in future
                priceForDate = Math.round(currentPrice * 1.15);
                dateLabel = `${t('predicted_next_month')} on ${selected.toLocaleDateString('en-IN')}`;
            } else if (diffDays > 0) {
                // Future prediction
                const monthsAhead = Math.ceil(diffDays / 30);
                priceForDate = Math.round(currentPrice * (1 + (monthsAhead * 0.02)));
                dateLabel = `${t('predicted_next_month')} on ${selected.toLocaleDateString('en-IN')}`;
            }
        }

        const predictedPrice = Math.round(currentPrice * 1.05);
        const changePercent = ((predictedPrice - currentPrice) / currentPrice * 100).toFixed(1);

        setResult({
            crop,
            state,
            district,
            market,
            rateType,
            currentPrice,
            priceForDate,
            dateLabel,
            predictedPrice,
            changePercent,
            trendData,
            msp: priceData.msp
        });
    };

    return (
        <div className="container">
            <BackButton />
            <h2 className="text-center" style={{ margin: '1.5rem 0' }}>{t('price_forecasting_title')}</h2>

            <div className="card" style={{ maxWidth: '900px', margin: '0 auto 2rem' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('crop_name')}</label>
                            <select value={crop} onChange={(e) => { setCrop(e.target.value); setState(''); setDistrict(''); setMarket(''); }} required style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                <option value="">-- {t('choose_crop')} --</option>
                                {crops.map(c => <option key={c} value={c}>{t(c)}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('state')}</label>
                            <select value={state} onChange={(e) => { setState(e.target.value); setDistrict(''); setMarket(''); }} required disabled={!crop} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                <option value="">-- {t('state')} --</option>
                                {states.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('district')}</label>
                            <select value={district} onChange={(e) => { setDistrict(e.target.value); setMarket(''); }} required disabled={!state} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                <option value="">-- {t('district')} --</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('market_mandi')}</label>
                            <select value={market} onChange={(e) => setMarket(e.target.value)} required disabled={!district} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                <option value="">-- {t('market_mandi')} --</option>
                                {markets.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('rate_type')}</label>
                            <select value={rateType} onChange={(e) => setRateType(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                <option value="wholesale">{t('wholesale')}</option>
                                <option value="retail">{t('retail')}</option>
                                <option value="msp">{t('msp')}</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('select_date_opt')}</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            />
                            <small style={{ fontSize: '0.75rem', color: '#6b7280' }}>{t('date_hint')}</small>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <Search size={18} /> {t('get_forecast')}
                    </button>
                </form>
            </div>

            {result && (
                <div className={styles.marketCard}>
                    <div className={styles.header}>
                        <div>
                            <h3>{t(result.crop)} ({result.rateType === 'wholesale' ? t('wholesale') : result.rateType === 'retail' ? t('retail') : 'MSP'})</h3>
                            <span className={styles.location}>{t('market_mandi')}: {result.market}, {result.district}, {result.state}</span>
                            {result.msp && <span className={styles.location} style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.85rem' }}>{t('msp')}: ₹{result.msp}/{t('quintals')}</span>}
                        </div>
                        <div className={styles.priceTag}>
                            {selectedDate && (
                                <>
                                    <span className={styles.label}>{result.dateLabel}</span>
                                    <span className={styles.value} style={{ fontSize: '2rem', color: '#10b981' }}>₹{result.priceForDate}</span>
                                    <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.75rem 0', paddingTop: '0.75rem' }}></div>
                                </>
                            )}
                            <span className={styles.label}>{t('current_price')}</span>
                            <span className={styles.value}>₹{result.currentPrice}</span>
                            <span className={styles.label} style={{ marginTop: '0.5rem' }}>{t('predicted_next_month')}</span>
                            <span className={styles.value} style={{ fontSize: '1.5rem' }}>₹{result.predictedPrice}</span>
                            <span className={styles.trend} style={{ color: result.changePercent > 0 ? '#10b981' : '#ef4444' }}>
                                {result.changePercent > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {result.changePercent > 0 ? '+' : ''}{result.changePercent}%
                            </span>
                        </div>
                    </div>

                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={styles.recommendation}>
                        <div className={styles.recIcon}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h4>{result.changePercent > 3 ? t('strong_hold_signal') : result.changePercent > 0 ? t('hold_signal') : t('sell_signal')}</h4>
                            <p>
                                {result.changePercent > 3
                                    ? t('rise_msg', { percent: result.changePercent })
                                    : result.changePercent > 0
                                        ? t('moderate_msg')
                                        : t('decline_msg')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PriceForecasting;
