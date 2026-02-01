import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, User, Bot, Volume2 } from 'lucide-react';
import BackButton from '../components/BackButton';
import styles from '../styles/Chatbot.module.css';
import { useTranslation } from '../services/i18n';

const Chatbot = () => {
    const { t, language } = useTranslation();
    const [messages, setMessages] = useState([
        { id: 1, text: t('namaste'), sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const chatEndRef = useRef(null);

    // API Key State
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const envKey = process.env.REACT_APP_GEMINI_API_KEY;
        if (envKey) {
            setApiKey(envKey);
        }
    }, []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);



    const handleSpeak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);

            // Map common codes to voices
            const langMap = {
                'en': 'en-IN',
                'hi': 'hi-IN',
                'te': 'te-IN',
                'ta': 'ta-IN',
                'mr': 'mr-IN',
                'bn': 'bn-IN',
                'gu': 'gu-IN'
            };

            utterance.lang = langMap[language] || 'en-IN';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech is not supported in your browser.');
        }
    };

    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in your browser. Please use Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();

        const langMap = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'te': 'te-IN',
            'ta': 'ta-IN',
            'mr': 'mr-IN',
            'bn': 'bn-IN',
            'gu': 'gu-IN'
        };

        recognition.lang = langMap[language] || 'en-IN';
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? " " : "") + transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                alert("Microphone access denied. Please allow microphone permissions in your browser settings.");
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const KNOWLEDGE_BASE = [
        { keywords: ['hi', 'hello', 'namaste', 'hey'], response: t('namaste') },
        { keywords: ['wheat', 'gehu'], response: "Wheat is a Rabi crop. Best sown in Nov-Dec. Requires cool climate and 4-5 irrigations. Recommended variety: HD-2967." },
        { keywords: ['rice', 'paddy', 'dhan'], response: "Paddy needs standing water. Transplanting is done in Kharif (June-July). Nitrogen application is crucial at tillering stage." },
        { keywords: ['tomato', 'tamatar'], response: "Tomatoes thrive in warm soil. Watch out for Early Blight. Staking helps improve fruit quality." },
        { keywords: ['summer', 'zaid'], response: "Best crops for summer (Zaid season) are Watermelon, Muskmelon, Cucumber, Pumpkin, and Moong Dal. Ensure good irrigation." },
        { keywords: ['fertilizer', 'khad', 'urea', 'npk'], response: "Soil testing is recommended before applying fertilizer. Generally, NPK 4:2:1 ratio is good for grains." },
        { keywords: ['pest', 'insect', 'bug', 'worm'], response: "For pests, first identify the insect. Neem oil spray is a good organic deterrent using 5ml/liter water. For severe infestation, consult a local expert." },
        { keywords: ['anthracnose', 'fungus', 'fungicide', 'blight', 'rust', 'disease'], response: "For fungal diseases like Anthracnose or Blight, you can use fungicides like Mancozeb (2.5g/L) or Carbendazim (1g/L). Ensure good drainage." },
        { keywords: ['weather', 'rain'], response: "I can't check live weather yet, but usually, monsoon starts in June. Ensure drainage if heavy rain is expected." },
        { keywords: ['price', 'rate', 'mandi'], response: "For exact prices, please visit the 'Price Forecasting' section in the app. Prices change daily based on demand." },
    ];

    const generateLocalResponse = (text) => {
        const lowerText = text.toLowerCase();
        for (const entry of KNOWLEDGE_BASE) {
            if (entry.keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(lowerText))) {
                return entry.response;
            }
        }
        return "I'm using local knowledge. For better answers, please add a Google Gemini API Key in settings.";
    };

    const fetchGeminiResponse = async (userText) => {
        try {
            const languageNameMap = {
                en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil', kn: 'Kannada',
                ml: 'Malayalam', mr: 'Marathi', gu: 'Gujarati', bn: 'Bengali',
                pa: 'Punjabi', ur: 'Urdu', or: 'Odia'
            };
            const targetLanguage = languageNameMap[language] || 'English';

            const contextualPrompt = `You are a helpful farming assistant for Indian farmers. 
            Answer the following question about agriculture in ${targetLanguage}. 
            Keep your response concise and practical.

            Question: ${userText}`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: contextualPrompt }]
                    }]
                })
            });

            const data = await response.json();
            if (data.error) return `Error: ${data.error.message}.`;

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "Sorry, I couldn't generate a response.";
            }
        } catch (error) {
            return "Sorry, I couldn't connect to the server.";
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        let botResponseText;

        if (apiKey) {
            botResponseText = await fetchGeminiResponse(userMsg.text);
        } else {
            await new Promise(r => setTimeout(r, 800));
            botResponseText = generateLocalResponse(userMsg.text);
        }

        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: botResponseText,
            sender: 'bot'
        }]);
        setIsThinking(false);
    };

    return (
        <div className="container" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '10px 0' }}>
                <BackButton />
            </div>

            <div className={styles.chatHeader} style={{ marginTop: '0', borderRadius: '12px 12px 0 0' }}>
                <h2>{t('ai_assistant')} <span style={{ fontSize: '0.7em', fontWeight: 'normal', opacity: 0.8 }}>{apiKey ? `(${t('online_mode')})` : `(${t('offline_mode')})`}</span></h2>
                <div className={styles.status} style={{ backgroundColor: apiKey ? '#10b981' : '#f59e0b', color: 'white', borderColor: 'transparent' }}>
                    {apiKey ? t('smart_ai_active') : t('offline_knowledge')}
                </div>
            </div>

            <div className={styles.chatWindow}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.user : styles.bot}`}>
                        {msg.sender === 'bot' && <div className={styles.avatar}><Bot size={20} /></div>}
                        <div className={styles.bubble}>
                            {msg.text}
                            {msg.sender === 'bot' && (
                                <button
                                    className={styles.speakBtn}
                                    onClick={() => handleSpeak(msg.text)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280' }}
                                    title="Listen"
                                >
                                    <Volume2 size={14} />
                                </button>
                            )}
                        </div>
                        {msg.sender === 'user' && <div className={styles.avatar}><User size={20} /></div>}
                    </div>
                ))}
                {isThinking && (
                    <div className={`${styles.message} ${styles.bot}`}>
                        <div className={styles.avatar}><Bot size={20} /></div>
                        <div className={styles.bubble} style={{ fontStyle: 'italic', color: '#6b7280' }}>
                            {t('thinking')}
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className={styles.inputArea} style={{ borderRadius: '0 0 12px 12px' }}>
                <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={handleVoiceInput}
                    style={{
                        border: 'none',
                        cursor: 'pointer',
                        color: isListening ? '#ef4444' : '#6b7280',
                        backgroundColor: isListening ? '#fee2e2' : 'var(--background)'
                    }}
                    title={isListening ? "Listening..." : "Voice Input"}
                >
                    <Mic size={20} className={isListening ? styles.pulse : ''} />
                </button>
                <input
                    type="text"
                    placeholder={t('type_question')}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={isThinking}
                />
                <button type="submit" className={styles.sendBtn} disabled={!input.trim() || isThinking} style={{ border: 'none', cursor: 'pointer' }}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default Chatbot;
