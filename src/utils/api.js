const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || '';

export const callApi = async (endpoint, data) => {
    if (endpoint === '/export_storyboard') {
        return new Promise(resolve => setTimeout(() => resolve({ zipFile: { name: "storyboard.zip", size: 1024 * 1024 } }), 1000));
    }

    if (endpoint === '/analyze_ref') {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
        const systemPrompt = "You are a professional photographer's assistant. Analyze the provided image in extreme detail. DO NOT describe the person's face, identity, or ethnicity. Focus ONLY on the visual elements. Provide the analysis as a valid JSON object with the following keys: 'outfit_description', 'fabric_texture', 'color_palette', 'lighting_style', 'camera_shot', 'composition', 'pose', and 'background'.";

        const payload = {
            contents: [{ parts: [{ text: systemPrompt }, { inlineData: { mimeType: "image/jpeg", data: data.image.split(',')[1] } }] }],
            generationConfig: { responseMimeType: "application/json" }
        };

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            return JSON.parse(text);
        } catch (error) {
            console.error("Fetch or JSON parse error:", error);
            return null;
        }
    }

    if (endpoint === '/parse_story') {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
        const systemPrompt = `You are a Master AI Cinematographer. Your task is to transform a written story into a detailed, professional cinematic blueprint in a structured JSON format. Analyze the narrative and emotional arcs to make expert cinematographic decisions. For each narrative beat, provide a sequence of specific shot recommendations. Each recommendation MUST include: 'shot_type', 'caption', 'lens_choice', 'aperture', and 'camera_movement'. The final output MUST be a single, valid JSON object with no markdown. The JSON structure should follow this schema: { "story_title": "...", "logline": "...", "cast_refs": { "[CHARACTER_NAME]": { "name": "...", "description": "..." } }, "scenes": [ { "scene_title": "...", "location": "...", "description": "...", "mood": "...", "lighting_setup": "...", "color_palette": "...", "beats": [ { "beat_title": "...", "description": "...", "shot_recommendations": [ { "shot_type": "...", "caption": "...", "lens_choice": "...", "aperture": "...", "camera_movement": "..." } ] } ] } ] }`;

        const payload = {
            contents: [{ parts: [{ text: systemPrompt }, { text: `Story to parse: ${data.story}` }] }],
            generationConfig: { responseMimeType: "application/json" }
        };

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const result = await response.json();
            let text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) return null;
            text = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
            return JSON.parse(text);
        } catch (error) {
            console.error("Fetch or JSON parse error:", error);
            return null;
        }
    }

    if (endpoint === '/generate_story') {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
        const systemPrompt = "You are a story architect and master narrator. Generate a complete, engaging, and cinematic story. Follow professional storytelling rules: create a protagonist with clear goals, build the plot around cause-and-effect, escalate stakes, introduce conflict, and tie it all to a universal theme. The story should be delivered in narrative prose, not an outline, and feel emotionally resonant.";

        const payload = {
            contents: [{ parts: [{ text: systemPrompt }] }]
        };

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const result = await response.json();
            return result?.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (error) {
            console.error("Fetch error:", error);
            return "A lone astronaut drifts in the silent void, tethered to her ship. A strange, glowing nebula appears ahead, pulsing with an unnatural light. She decides to investigate, her curiosity overriding her fear.";
        }
    }

    if (endpoint === '/generate_image') {
        const placeholderImage = "https://placehold.co/1280x720/1a1a1a/ffffff?text=Image+Generation+Failed";

        if (data.image) {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY}`;
            const parts = [{ text: data.prompt }];
            parts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: data.image.split(',')[1]
                }
            });

            if (data.styleImage) {
                 parts.push({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: data.styleImage.split(',')[1]
                    }
                });
            }

            const payload = {
                contents: [{ parts: parts }],
                generationConfig: {
                    responseModalities: ['IMAGE']
                },
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
                const result = await response.json();
                const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
                if (!base64Data) throw new Error("No image data found in response.");
                return `data:image/png;base64,${base64Data}`;
            } catch (error) {
                console.error("Fetch error with multimodal model:", error);
                return placeholderImage;
            }
        } else {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`;
            const payload = {
                instances: [{ prompt: data.prompt }],
                parameters: {
                    "sampleCount": 1,
                    "negativePrompt": "logo, watermark, text, branding, signature, poor quality"
                }
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
                const result = await response.json();
                if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
                    return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                } else {
                    console.error("Unexpected Imagen response structure:", result);
                    throw new Error("No image data found in imagen response.");
                }
            } catch (error) {
                console.error("Fetch error with Imagen:", error);
                return placeholderImage;
            }
        }
    }

    return null;
};
