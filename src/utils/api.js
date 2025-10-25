const getApiKey = async () => {
    console.log('[API Key] Loading Google AI API key...');

    try {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'google_ai_api_key')
            .maybeSingle();

        console.log('[API Key] Supabase query result:', {
            hasData: !!data,
            hasError: !!error,
            hasApiKey: !!data?.value?.api_key,
            error: error?.message
        });

        if (!error && data?.value?.api_key) {
            console.log('[API Key] Found in Supabase:', data.value.api_key.substring(0, 10) + '...');
            return data.value.api_key;
        }
    } catch (e) {
        console.error('[API Key] Failed to load from Supabase:', e);
    }

    // Check localStorage with the key used by AdminPanel
    const directKey = localStorage.getItem('VITE_GOOGLE_AI_API_KEY');
    console.log('[API Key] Checking localStorage (VITE_GOOGLE_AI_API_KEY):', !!directKey);

    if (directKey) {
        console.log('[API Key] Found in localStorage:', directKey.substring(0, 10) + '...');
        return directKey;
    }

    // Fallback to old adminSettings format
    const savedSettings = localStorage.getItem('adminSettings');
    console.log('[API Key] Checking localStorage (adminSettings):', !!savedSettings);

    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            if (settings.googleAiApiKey) {
                console.log('[API Key] Found in adminSettings:', settings.googleAiApiKey.substring(0, 10) + '...');
                return settings.googleAiApiKey;
            }
        } catch (e) {
            console.error('[API Key] Failed to load from localStorage:', e);
        }
    }

    console.log('[API Key] No Google AI API key found');
    return null;
};

const getFalApiKey = async () => {
    console.log('[FAL API Key] Loading fal.ai API key...');

    try {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'fal_ai_api_key')
            .maybeSingle();

        if (!error && data?.value?.api_key) {
            console.log('[FAL API Key] Found in Supabase:', data.value.api_key.substring(0, 10) + '...');
            return data.value.api_key;
        }
    } catch (e) {
        console.error('[FAL API Key] Failed to load from Supabase:', e);
    }

    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            if (settings.falAiApiKey) {
                console.log('[FAL API Key] Found in localStorage:', settings.falAiApiKey.substring(0, 10) + '...');
                return settings.falAiApiKey;
            }
        } catch (e) {
            console.error('[FAL API Key] Failed to load from localStorage:', e);
        }
    }

    console.log('[FAL API Key] No fal.ai API key found');
    return null;
};

const getOpenRouterApiKey = async () => {
    console.log('[OpenRouter Key] Loading API key...');

    try {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'openrouter_api_key')
            .maybeSingle();

        console.log('[OpenRouter Key] Supabase query result:', {
            hasData: !!data,
            hasError: !!error,
            hasApiKey: !!data?.value?.api_key
        });

        if (!error && data?.value?.api_key) {
            console.log('[OpenRouter Key] Found in Supabase:', data.value.api_key.substring(0, 10) + '...');
            return data.value.api_key;
        }
    } catch (e) {
        console.error('[OpenRouter Key] Failed to load from Supabase:', e);
    }

    // Check localStorage with the key used by AdminPanel
    const directKey = localStorage.getItem('VITE_OPENROUTER_API_KEY');
    console.log('[OpenRouter Key] Checking localStorage (VITE_OPENROUTER_API_KEY):', !!directKey);

    if (directKey) {
        console.log('[OpenRouter Key] Found in localStorage:', directKey.substring(0, 10) + '...');
        return directKey;
    }

    // Fallback to old adminSettings format
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            if (settings.openrouterApiKey) {
                console.log('[OpenRouter Key] Found in adminSettings:', settings.openrouterApiKey.substring(0, 10) + '...');
                return settings.openrouterApiKey;
            }
        } catch (e) {
            console.error('[OpenRouter Key] Failed to load from localStorage:', e);
        }
    }

    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    console.log('[OpenRouter Key] Using env var:', envKey ? envKey.substring(0, 10) + '...' : 'None');
    return envKey;
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

        console.log('[Story Parse] OpenRouter key status:', OPENROUTER_KEY ? `Present (${OPENROUTER_KEY.substring(0, 10)}...)` : 'Missing');

        if (!OPENROUTER_KEY) {
            console.error('OpenRouter API key is not configured for story parsing');
            throw new Error('OpenRouter API key not configured. Please add it in Admin Panel → Settings.');
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
            console.log('[Story Parse] Parsing with OpenRouter (DeepSeek)...');
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_KEY.trim()}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Tumdah'
                },
                body: JSON.stringify(payload)
            });

            console.log('[Story Parse] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[Story Parse] Failed:', errorData?.error?.message || response.status);
                throw new Error(`API call failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('[Story Parse] Response received:', {
                hasChoices: !!result?.choices,
                hasContent: !!result?.choices?.[0]?.message?.content
            });

            let text = result?.choices?.[0]?.message?.content;

            if (!text) {
                console.error('[Story Parse] No text in response:', result);
                return null;
            }

            text = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
            console.log('[Story Parse] Success! Parsed JSON length:', text.length);
            return JSON.parse(text);
        } catch (error) {
            console.error("Story parsing error:", error);
            return null;
        }
    }

    if (endpoint === '/generate_story') {
        const OPENROUTER_KEY = await getOpenRouterApiKey();

        console.log('[Story Gen] OpenRouter key status:', OPENROUTER_KEY ? `Present (${OPENROUTER_KEY.substring(0, 10)}...)` : 'Missing');

        if (!OPENROUTER_KEY) {
            console.error('OpenRouter API key is not configured for story generation');
            return "❌ ERROR: OpenRouter API key not configured.\n\nPlease add your OpenRouter API key in the Admin Panel → Settings → OpenRouter AI Configuration.\n\nGet your key from: https://openrouter.ai/keys";
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
            console.log('[Story Gen] Generating with OpenRouter (DeepSeek)...', userIdea ? `Input length: ${userIdea.length} chars` : 'Random story');
            console.log('[Story Gen] Using prompt length:', systemPrompt.length);

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_KEY.trim()}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Tumdah'
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(90000)
            });

            console.log('[Story Gen] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[Story Gen] Failed:', errorData?.error?.message || response.status, errorData);
                throw new Error(errorData?.error?.message || `API call failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('[Story Gen] Response received:', {
                hasChoices: !!result?.choices,
                choicesLength: result?.choices?.length,
                hasMessage: !!result?.choices?.[0]?.message,
                hasContent: !!result?.choices?.[0]?.message?.content
            });

            const storyText = result?.choices?.[0]?.message?.content;

            if (storyText) {
                console.log('[Story Gen] Success! Story length:', storyText.length);
                return storyText;
            }

            console.error('[Story Gen] No text in response:', result);
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
        console.log('[Image Gen] API Key status:', API_KEY ? `Present (${API_KEY.substring(0, 10)}...)` : 'Missing');

        if (!API_KEY || API_KEY === 'your-api-key-here') {
            console.warn('[Image Gen] Google AI API key not configured - will use placeholder images');
            throw new Error('API key not configured');
        }

        try {
            // Use Gemini 2.5 Flash Image (Nanobanana) for actual image generation
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`;

            const parts = [];

            // Add input images if provided (for image-to-image)
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

            // Add the text prompt
            parts.push({ text: data.prompt });

            const payload = {
                contents: [{ parts }],
                generationConfig: {
                    responseModalities: ['Image'],
                    temperature: 1.0,
                    topP: 0.95,
                    topK: 40
                }
            };

            console.log(`[Image Gen] Using Nanobanana (gemini-2.5-flash-image) with prompt length: ${data.prompt.length}`);
            console.log('[Image Gen] Has input image:', !!data.image);
            console.log('[Image Gen] Has style image:', !!data.styleImage);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': API_KEY
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(60000)
            });

            console.log('[Image Gen] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[Image Gen] API failed:', errorData?.error?.message || response.status, errorData);

                const errorMsg = errorData?.error?.message || '';

                // Check for quota/billing issues
                if (errorMsg.includes('quota') || errorMsg.includes('free_tier') || errorMsg.includes('limit: 0')) {
                    throw new Error('BILLING_REQUIRED: Gemini 2.5 Flash Image (Nanobanana) requires a Google Cloud project with billing enabled. Free tier might not support image generation yet. Please enable billing at https://console.cloud.google.com/billing');
                }

                throw new Error(errorMsg || `Generation failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('[Image Gen] Response structure:', {
                hasCandidates: !!result?.candidates,
                candidatesLength: result?.candidates?.length,
                firstCandidateKeys: result?.candidates?.[0] ? Object.keys(result.candidates[0]) : []
            });

            // Extract the generated image
            const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inline_data)?.inline_data?.data;

            if (base64Data) {
                console.log('[Image Gen] Success! Generated image with Nanobanana, size:', base64Data.length);
                return `data:image/png;base64,${base64Data}`;
            }

            // Check if we got text instead
            const textResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textResponse) {
                console.error('[Image Gen] Received text instead of image:', textResponse?.substring(0, 200));
            }

            console.error('[Image Gen] No image data in response. Full response:', JSON.stringify(result).substring(0, 500));
            throw new Error('No image data in API response. Your API key may not have access to Gemini 2.5 Flash Image (Nanobanana).');

        } catch (error) {
            console.error('[Image Gen] Error:', error.message);
            throw error;
        }
    }

    return null;
};
