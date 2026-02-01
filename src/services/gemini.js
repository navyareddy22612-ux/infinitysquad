const languageNameMap = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    kn: 'Kannada',
    ml: 'Malayalam',
    mr: 'Marathi',
    gu: 'Gujarati',
    bn: 'Bengali',
    pa: 'Punjabi',
    ur: 'Urdu',
    or: 'Odia'
};

export const analyzeDiseaseImages = async (images, crop, symptoms, language = 'en') => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    const targetLanguage = languageNameMap[language] || 'English';

    const prompt = `
        Identify the disease in this ${crop} plant.
        User symptoms: ${symptoms || 'None'}.
        Provide a JSON response with these keys: disease, confidence, symptoms (array), treatments (array), preventiveMeasures (array).
        The values for disease, symptoms, treatments, and preventiveMeasures MUST be in ${targetLanguage}.
        Reply ONLY with valid JSON.
    `;

    try {
        const imageParts = images.map(img => {
            const base64Data = img.split(',')[1];
            const mimeType = img.split(',')[0].split(':')[1].split(';')[0];
            return {
                inline_data: {
                    data: base64Data,
                    mime_type: mimeType
                }
            };
        });

        // Use the confirmed working model
        let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        ...imageParts
                    ]
                }]
            })
        });

        // Fallback to gemini-flash-latest if 2.5-flash hits a limit
        if (!response.ok) {
            console.warn('Primary model failed, trying fallback...');
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            ...imageParts
                        ]
                    }]
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('No analysis result was returned by the AI.');
        }

        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const result = JSON.parse(jsonMatch ? jsonMatch[0] : text);

        return result;
    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        throw error;
    }
};
