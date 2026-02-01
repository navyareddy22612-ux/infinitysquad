import React, { useState, useRef } from 'react';
import { useTranslation } from '../services/i18n';
import { CROPS } from '../constants';

const DiseaseDetectionPage = ({ isOnline = true }) => {
    const [images, setImages] = useState([]);
    const [crop, setCrop] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const fileInputRef = useRef(null);
    const { t, language } = useTranslation();

    // Actual online status check
    const [online, setOnline] = useState(navigator.onLine);
    React.useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const effectiveOnline = isOnline && online;

    const handleImageUpload = (e) => {
        const files = e.target.files;
        if (!files) return;

        const promises = Array.from(files).map((file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises).then(base64Images => {
            setImages(prev => [...prev, ...base64Images].slice(0, 5));
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleAnalyze = async () => {
        if (images.length === 0 || !crop) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const { analyzeDiseaseImages } = await import('../services/gemini');
            const result = await analyzeDiseaseImages(images, crop, symptoms, language);
            setAnalysisResult(result);
        } catch (error) {
            console.error('Disease analysis error:', error);
            setAnalysisResult({
                disease: t('analysis_error'),
                confidence: t('low'),
                symptoms: [error.message || t('something_went_wrong')],
                treatments: [t('check_internet')],
                preventiveMeasures: []
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setImages([]);
        setCrop('');
        setSymptoms('');
        setAnalysisResult(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="bg-[#10B981] rounded-3xl p-10 text-white shadow-md">
                <h2 className="text-4xl font-black tracking-tight mb-2">{t('disease_detection_nav')}</h2>
                <p className="text-white/90 text-base font-medium">
                    {t('disease_detection_subtitle')}
                </p>
            </div>

            {!analysisResult ? (
                <div className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100 space-y-8">
                    {/* Crop Selection */}
                    <div>
                        <label className="block text-xl font-bold text-stone-800 mb-5">{t('which_crop')}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {CROPS.slice(0, 7).map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCrop(c)}
                                    className={`p-5 rounded-2xl border-2 text-left transition-all font-bold text-lg ${crop === c
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-stone-50 bg-stone-50/50 text-stone-700 hover:border-emerald-200'
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <div className="mb-5">
                            <label className="block text-xl font-bold text-stone-800">{t('upload_plant_images')}</label>
                            <p className="text-sm text-stone-400 mt-1">{t('upload_limit_subtitle')}</p>
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-stone-200 rounded-[2.5rem] p-16 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-all bg-stone-50/30 group"
                        >
                            <div className="w-20 h-20 bg-stone-200/50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-100/50 transition-all">
                                <i className="fas fa-image text-stone-400 text-3xl group-hover:text-emerald-500"></i>
                            </div>
                            <span className="text-lg font-bold text-stone-600 mb-1">{t('upload_click')}</span>
                            <span className="text-xs text-stone-400">{t('upload_limit')}</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                            />
                        </div>

                        {images.length > 0 && (
                            <div className="grid grid-cols-5 gap-3 mt-4">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-stone-200 shadow-sm">
                                        <img src={img} className="w-full h-full object-cover" alt={`Plant ${i + 1}`} />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                            className="absolute top-1 right-1 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-xs text-red-500 shadow-md hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Symptoms (Optional) */}
                    <div>
                        <label className="block text-xl font-bold text-stone-800 mb-5">{t('symptoms_observed')}</label>
                        <textarea
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder={t('symptoms_placeholder')}
                            className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl p-6 text-base font-medium resize-none focus:outline-none focus:border-emerald-500 transition-all min-h-[120px]"
                        />
                    </div>

                    {!effectiveOnline && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                            <i className="fas fa-wifi-slash text-emerald-600"></i>
                            <p className="text-sm text-emerald-700 font-medium">{t('offline_mode_msg')}</p>
                        </div>
                    )}

                    {/* Analyze Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={images.length === 0 || !crop || isAnalyzing}
                        className="w-full bg-[#10B981] hover:bg-[#059669] disabled:bg-stone-300 text-white font-black py-6 rounded-3xl shadow-lg transition-all transform active:scale-[0.98] disabled:shadow-none flex items-center justify-center gap-3 text-xl"
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>{t('analyzing')}</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-microscope"></i>
                                <span>{t('analyze_images')}</span>
                            </>
                        )}
                    </button>
                </div>
            ) : (
                /* Analysis Results */
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                    {t('disease_analysis')}
                                </span>
                                <h3 className="text-2xl font-black text-stone-800 mt-3">{analysisResult.disease}</h3>
                                <p className="text-stone-500 text-sm font-medium">{t('crop_name')}: {t(crop.toLowerCase())}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
                                    {t('confidence')}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 font-black text-sm uppercase ${analysisResult.confidence === 'High' ? 'text-emerald-600' : 'text-amber-600'
                                    }`}>
                                    <i className="fas fa-certificate"></i>
                                    {analysisResult.confidence}
                                </span>
                            </div>
                        </div>

                        {/* Uploaded Images */}
                        {images.length > 0 && (
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                {images.map((img, i) => (
                                    <img key={i} src={img} className="w-20 h-20 rounded-lg object-cover border border-stone-200 flex-shrink-0" alt={`Analysis ${i + 1}`} />
                                ))}
                            </div>
                        )}

                        {/* Symptoms */}
                        {analysisResult.symptoms.length > 0 && (
                            <div className="bg-red-50 rounded-2xl p-6 border border-red-100 mb-6">
                                <h4 className="font-black text-red-800 text-xs uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <i className="fas fa-exclamation-triangle"></i> {t('symptoms_detected')}
                                </h4>
                                <ul className="space-y-2">
                                    {analysisResult.symptoms.map((symptom, idx) => (
                                        <li key={idx} className="flex gap-2 text-red-900 text-sm font-medium">
                                            <span className="text-red-500">•</span>
                                            <span>{symptom}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Treatments */}
                        {analysisResult.treatments.length > 0 && (
                            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 mb-6">
                                <h4 className="font-black text-emerald-800 text-xs uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <i className="fas fa-prescription-bottle"></i> {t('treatment_recommendations')}
                                </h4>
                                <ul className="space-y-2">
                                    {analysisResult.treatments.map((treatment, idx) => (
                                        <li key={idx} className="flex gap-2 text-emerald-900 text-sm font-medium">
                                            <span className="text-emerald-500">•</span>
                                            <span>{treatment}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Preventive Measures */}
                        {analysisResult.preventiveMeasures.length > 0 && (
                            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                <h4 className="font-black text-blue-800 text-xs uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <i className="fas fa-shield-alt"></i> {t('preventing_measures')}
                                </h4>
                                <ul className="space-y-2">
                                    {analysisResult.preventiveMeasures.map((measure, idx) => (
                                        <li key={idx} className="flex gap-2 text-blue-900 text-sm font-medium">
                                            <span className="text-blue-500">•</span>
                                            <span>{measure}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleReset}
                            className="bg-white border-2 border-stone-100 text-stone-600 font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-stone-50 transition-all"
                        >
                            <i className="fas fa-rotate"></i>
                            {t('new_analysis')}
                        </button>
                        <button className="bg-emerald-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-800 transition-all">
                            <i className="fas fa-file-pdf"></i>
                            {t('download_report')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiseaseDetectionPage;
