import React, { useState } from 'react';
import { Calendar, Droplets, Sun, Bug, Truck, Sprout, Tractor, Scissors, Package, Settings, Info } from 'lucide-react';
import BackButton from '../components/BackButton';
import styles from '../styles/CropPlanner.module.css';
import { useTranslation } from '../services/i18n';

const CROP_SCHEDULES = {
    wheat: [
        { day: -15, title: 'land_prep', icon: <Tractor />, desc: 'wheat_land_prep_desc' },
        { day: -1, title: 'seed_treatment', icon: <Sprout />, desc: 'wheat_seed_treatment_desc' },
        { day: 0, title: 'sowing', icon: <Calendar />, desc: 'wheat_sowing_desc' },
        { day: 21, title: 'cri_stage', icon: <Droplets />, desc: 'wheat_cri_desc' },
        { day: 40, title: 'tillering_stage', icon: <Sun />, desc: 'wheat_tillering_desc' },
        { day: 65, title: 'jointing_stage', icon: <Droplets />, desc: 'wheat_jointing_desc' },
        { day: 85, title: 'flowering_stage', icon: <Sun />, desc: 'wheat_flowering_desc' },
        { day: 105, title: 'milking_stage', icon: <Droplets />, desc: 'wheat_milking_desc' },
        { day: 125, title: 'harvesting_stage', icon: <Scissors />, desc: 'wheat_harvesting_desc' },
        { day: 130, title: 'marketing', icon: <Truck />, desc: 'wheat_marketing_desc' }
    ],
    paddy: [
        { day: -20, title: 'nursery_prep', icon: <Sprout />, desc: 'paddy_nursery_desc' },
        { day: -5, title: 'main_field_prep', icon: <Tractor />, desc: 'paddy_field_prep_desc' },
        { day: 0, title: 'transplanting', icon: <Calendar />, desc: 'paddy_transplanting_desc' },
        { day: 15, title: 'gap_filling', icon: <Sprout />, desc: 'paddy_gap_filling_desc' },
        { day: 30, title: 'tillering_stage', icon: <Sun />, desc: 'paddy_tillering_desc' },
        { day: 50, title: 'panicle_initiation', icon: <Droplets />, desc: 'paddy_panicle_desc' },
        { day: 70, title: 'flowering_stage', icon: <Bug />, desc: 'paddy_flowering_desc' },
        { day: 100, title: 'draining', icon: <Sun />, desc: 'paddy_draining_desc' },
        { day: 110, title: 'harvesting_stage', icon: <Scissors />, desc: 'paddy_harvesting_desc' },
        { day: 115, title: 'threshing', icon: <Truck />, desc: 'paddy_threshing_desc' }
    ],
    maize: [
        { day: -10, title: 'ploughing', icon: <Tractor />, desc: 'maize_ploughing_desc' },
        { day: 0, title: 'sowing', icon: <Calendar />, desc: 'maize_sowing_desc' },
        { day: 20, title: 'knee_high_stage', icon: <Sun />, desc: 'maize_knee_high_desc' },
        { day: 45, title: 'tasseling', icon: <Droplets />, desc: 'maize_tasseling_desc' },
        { day: 60, title: 'silking', icon: <Bug />, desc: 'maize_silking_desc' },
        { day: 90, title: 'maturity', icon: <Sun />, desc: 'maize_maturity_desc' },
        { day: 100, title: 'harvesting_stage', icon: <Scissors />, desc: 'maize_harvesting_desc' },
        { day: 105, title: 'marketing', icon: <Truck />, desc: 'maize_marketing_desc' }
    ]
};

const CropPlanner = () => {
    const { t } = useTranslation();
    const [crop, setCrop] = useState('');
    const [sowingDate, setSowingDate] = useState('');
    const [plan, setPlan] = useState(null);

    const generatePlan = (e) => {
        e.preventDefault();
        if (!crop || !sowingDate) return;

        const schedule = CROP_SCHEDULES[crop];
        if (!schedule) {
            alert(t('schedule_coming_soon'));
            return;
        }

        const start = new Date(sowingDate);

        setPlan(schedule.map(s => {
            const d = new Date(start);
            d.setDate(d.getDate() + s.day);
            return {
                ...s,
                date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            };
        }));
    };

    return (
        <div className="container">
            <BackButton />
            <h2 className="text-center" style={{ margin: '1.5rem 0' }}>{t('crop_planner_title')}</h2>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={generatePlan} className={styles.form}>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>{t('crops_nav')}</label>
                            <select value={crop} onChange={e => setCrop(e.target.value)} required>
                                <option value="">-- {t('choose_crop')} --</option>
                                <option value="wheat">{t('wheat')}</option>
                                <option value="paddy">{t('paddy')}</option>
                                <option value="maize">{t('maize')}</option>
                                <option value="cotton">{t('cotton')}</option>
                                <option value="sugarcane">{t('sugarcane')}</option>
                                <option value="tomato">{t('tomato')}</option>
                                <option value="potato">{t('potato')}</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>{t('sowing_date')}</label>
                            <input type="date" value={sowingDate} onChange={e => setSowingDate(e.target.value)} required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {t('generate_schedule')}
                    </button>
                </form>

                {plan && (
                    <div className={styles.timeline}>
                        <h3 style={{ margin: '1rem 0 1.5rem', textAlign: 'center', color: '#10b981' }}>
                            {t('cultivation_roadmap')}
                        </h3>
                        {plan.map((stage, i) => (
                            <div key={i} className={styles.timelineItem}>
                                <div className={styles.dateCol}>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        color: stage.day < 0 ? '#ef4444' : '#10b981'
                                    }}>
                                        {stage.day === 0 ? t('sowing_day') : stage.day > 0 ? `${t('day_n')} ${stage.day}` : `${Math.abs(stage.day)} ${t('days_before')}`}
                                    </span>
                                    <span className={styles.dateText}>{stage.date}</span>
                                </div>
                                <div className={styles.marker}>
                                    <div className={styles.dot} style={{ backgroundColor: stage.day < 0 ? '#fca5a5' : '#34d399' }}></div>
                                    {i !== plan.length - 1 && <div className={styles.line}></div>}
                                </div>
                                <div className={styles.content}>
                                    <div className={styles.iconBox} style={{ color: '#059669' }}>{stage.icon}</div>
                                    <div>
                                        <h4>{t(stage.title)}</h4>
                                        <p>{t(stage.desc)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CropPlanner;
