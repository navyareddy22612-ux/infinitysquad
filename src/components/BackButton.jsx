import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../services/i18n';

const BackButton = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <button
            onClick={() => navigate('/')}
            className="btn btn-outline"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1rem',
                padding: '8px 16px',
                fontSize: '0.9rem',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
            }}
        >
            <ArrowLeft size={20} /> {t('back_to_dashboard')}
        </button>
    );
};

export default BackButton;
