const getApiKey = async () => {
    try {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'google_ai_api_key')
            .maybeSingle();

        if (!error && data?.value?.api_key) {
            return data.value.api_key;
        }
    } catch (e) {
        console.error('Failed to load API key from Supabase:', e);
    }

    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            if (settings.googleAiApiKey) {
                return settings.googleAiApiKey;
            }
        } catch (e) {
            console.error('Failed to load settings from localStorage:', e);
        }
    }
    return import.meta.env.VITE_GOOGLE_AI_API_KEY || '';
};

const getOpenRouterApiKey = async () => {
    try {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'openrouter_api_key')
            .maybeSingle();

        if (!error && data?.value?.api_key) {
            return data.value.api_key;
        }
    } catch (e) {
        console.error('Failed to load OpenRouter API key from Supabase:', e);
    }

    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            if (settings.openrouterApiKey) {
                return settings.openrouterApiKey;
            }
        } catch (e) {
            console.error('Failed to load settings from localStorage:', e);
        }
    }
    return import.meta.env.VITE_OPENROUTER_API_KEY || '';
};

export const callApi = async (endpoint, data) => {
    const API_KEY = await getApiKey();

    if (endpoint === '/generate_image') {
        console.log('API Key status:', API_KEY ? `Present (${API_KEY.substring(0, 10)}...)` : 'Missing');
    }
    if (endpoint === '/export_storyboard') {
        return new Promise(resolve => setTimeout(() => resolve({ zipFile: { name: "storyboard.zip", size: 1024 * 1024 } }), 1000));
    }

    if (endpoint === '/analyze_ref') {
        if (!API_KEY || API_KEY === 'your-api-key-here') {
            console.error('Google AI API key is not configured');
            throw new Error('API key not configured. Please add VITE_GOOGLE_AI_API_KEY to your .env file.');
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;
        const systemPrompt = "You are a professional photographer's assistant. Analyze the provided image in extreme detail. DO NOT describe the person's face, identity, or ethnicity. Focus ONLY on the visual elements. Provide the analysis as a valid JSON object with the following keys: 'outfit_description', 'fabric_texture', 'color_palette', 'lighting_style', 'camera_shot', 'composition', 'pose', and 'background'.";

        const payload = {
            contents: [{ parts: [{ text: systemPrompt }, { inlineData: { mimeType: "image/jpeg", data: data.image.split(',')[1] } }] }],
            generationConfig: { responseMimeType: "application/json" }
        };

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("API error response:", errorData);
                const errorMessage = errorData?.error?.message || `API call failed with status: ${response.status}`;
                throw new Error(errorMessage);
            }
            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error('No response from API');
            }
            return JSON.parse(text);
        } catch (error) {
            console.error("Analyze ref error:", error);
            throw error;
        }
    }

    if (endpoint === '/parse_story') {
        const OPENROUTER_KEY = await getOpenRouterApiKey();

        if (!OPENROUTER_KEY) {
            console.error('OpenRouter API key is not configured for story parsing');
            throw new Error('OpenRouter API key not configured');
        }

        const systemPrompt = `You are a Master AI Cinematographer. Your task is to transform a written story into a detailed, professional cinematic blueprint in a structured JSON format. Analyze the narrative and emotional arcs to make expert cinematographic decisions. For each narrative beat, provide a sequence of specific shot recommendations. Each recommendation MUST include: 'shot_type', 'caption', 'lens_choice', 'aperture', and 'camera_movement'. The final output MUST be a single, valid JSON object with no markdown. The JSON structure should follow this schema: { "story_title": "...", "logline": "...", "cast_refs": { "[CHARACTER_NAME]": { "name": "...", "description": "..." } }, "scenes": [ { "scene_title": "...", "location": "...", "description": "...", "mood": "...", "lighting_setup": "...", "color_palette": "...", "beats": [ { "beat_title": "...", "description": "...", "shot_recommendations": [ { "shot_type": "...", "caption": "...", "lens_choice": "...", "aperture": "...", "camera_movement": "..." } ] } ] } ] }`;

        const payload = {
            model: 'tngtech/deepseek-r1t2-chimera:free',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Story to parse: ${data.story}` }
            ],
            response_format: { type: 'json_object' }
        };

        try {
            console.log('Parsing story with OpenRouter (DeepSeek)...');
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Tumdah'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Story parsing failed:', errorData?.error?.message || response.status);
                throw new Error(`API call failed: ${response.status}`);
            }

            const result = await response.json();
            let text = result?.choices?.[0]?.message?.content;

            if (!text) {
                console.error('No text in response:', result);
                return null;
            }

            text = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
            console.log('Story parsed successfully with OpenRouter');
            return JSON.parse(text);
        } catch (error) {
            console.error("Story parsing error:", error);
            return null;
        }
    }

    if (endpoint === '/generate_story') {
        const OPENROUTER_KEY = await getOpenRouterApiKey();

        if (!OPENROUTER_KEY) {
            console.error('OpenRouter API key is not configured for story generation');
            return "A lone astronaut drifts in the silent void, tethered to her ship. A strange, glowing nebula appears ahead, pulsing with an unnatural light. She decides to investigate, her curiosity overriding her fear.";
        }

        const userIdea = (data.storyIdea || '').trim();

        let expansionPrompt = null;
        let enhancementPrompt = null;

        try {
            const { supabase } = await import('./supabase');
            const { data: templates } = await supabase
                .from('prompt_templates')
                .select('prompt, name')
                .eq('category', 'story_expansion')
                .eq('is_active', true);

            if (templates && templates.length > 0) {
                expansionPrompt = templates.find(t => t.name === 'story_expansion_default')?.prompt;
                enhancementPrompt = templates.find(t => t.name === 'story_enhancement_default')?.prompt;
            }
        } catch (error) {
            console.warn('Could not load story prompts from database, using defaults');
        }

        if (!expansionPrompt) {
            expansionPrompt = 'You are a story architect and master narrator. Expand this idea into a complete, engaging, and cinematic story. Follow professional storytelling rules: create a protagonist with clear goals, build the plot around cause-and-effect, escalate stakes, introduce conflict, and tie it all to a universal theme. The story should be delivered in narrative prose (not an outline), feel emotionally resonant, and be approximately 800-1500 words. Stay true to the original concept while enriching it with vivid details, compelling characters, and dramatic tension.';
        }

        if (!enhancementPrompt) {
            enhancementPrompt = 'You are a story architect and master narrator. Rewrite and enhance this story. Improve the pacing, add more vivid details and sensory descriptions, deepen character development, heighten dramatic tension, and ensure a compelling narrative arc. Keep the core concept and plot but elevate the prose to professional, cinematic quality. Output approximately 1000-1500 words.';
        }

        let systemPrompt;
        if (userIdea) {
            const isLongStory = userIdea.length > 500;

            if (isLongStory) {
                systemPrompt = `${enhancementPrompt}\n\nHere is the story to enhance:\n\n"${userIdea.substring(0, 3000)}"`;
            } else {
                systemPrompt = `${expansionPrompt}\n\nUser's story idea:\n\n"${userIdea}"`;
            }
        } else {
            systemPrompt = expansionPrompt;
        }

        const payload = {
            model: 'tngtech/deepseek-r1t2-chimera:free',
            messages: [{ role: 'user', content: systemPrompt }],
            max_tokens: 4000
        };

        try {
            console.log('Generating story with OpenRouter (DeepSeek)...', userIdea ? `Input length: ${userIdea.length} chars` : 'Random story');
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Tumdah'
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(60000)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Story generation failed:', errorData?.error?.message || response.status, errorData);
                throw new Error(errorData?.error?.message || `API call failed: ${response.status}`);
            }

            const result = await response.json();
            const storyText = result?.choices?.[0]?.message?.content;

            if (storyText) {
                console.log('Story generated successfully with OpenRouter, length:', storyText.length);
                return storyText;
            }

            console.error('No text in story response:', result);
            throw new Error('No story text in API response');
        } catch (error) {
            console.error("Story generation error:", error.message, error);

            if (error.message && error.message.includes('quota')) {
                return `❌ ERROR: OpenRouter API quota exceeded.\n\n${error.message}\n\nPlease wait a few minutes and try again.`;
            }

            if (error.message && error.message.includes('API key')) {
                return `❌ ERROR: Invalid API key.\n\n${error.message}\n\nPlease check your OpenRouter API key in the Admin panel.`;
            }

            return `❌ ERROR: Story generation failed.\n\n${error.message}\n\nPlease check the browser console (F12) for more details, or verify your OpenRouter API key in the Admin panel.`;
        }
    }

    if (endpoint === '/generate_image') {
        if (!API_KEY || API_KEY === 'your-api-key-here') {
            console.warn('Google AI API key not configured - image generation will use fallback');
            throw new Error('API key not configured');
        }

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

            const parts = [];

            if (data.image) {
                parts.push({
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: data.image.split(',')[1]
                    }
                });
            }

            if (data.styleImage) {
                parts.push({
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: data.styleImage.split(',')[1]
                    }
                });
            }

            const enhancedPrompt = `${data.prompt}

CRITICAL INSTRUCTIONS:
- You MUST generate and return an actual image, not text
- This is an image generation task, not a text response task
- Analyze the provided images and create a new photorealistic image following the prompt
- Output format: Return the generated image as base64 encoded data
- DO NOT describe what you would do - GENERATE THE ACTUAL IMAGE`;

            parts.push({ text: enhancedPrompt });

            const payload = {
                contents: [{ parts }]
            };

            console.log(`Attempting Gemini image generation with prompt length: ${data.prompt.length}`);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(45000)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.warn('Gemini API failed:', errorData?.error?.message || response.status, errorData);
                throw new Error(errorData?.error?.message || 'Generation failed');
            }

            const result = await response.json();
            console.log('Gemini response structure:', JSON.stringify(result).substring(0, 500));

            const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inline_data)?.inline_data?.data;

            if (base64Data) {
                console.log('Successfully generated image with Gemini');
                return `data:image/png;base64,${base64Data}`;
            }

            console.warn('No image data in response, likely text-only model response');
            throw new Error('Model returned text instead of image');

        } catch (error) {
            console.warn('Image generation error:', error.message);
            throw error;
        }
    }

    return null;
};
