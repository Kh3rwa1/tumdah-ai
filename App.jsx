import React, { useState, useEffect, useCallback, createContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Image as ImageIcon, Film, Sparkles, ArrowRight, Bot, PenTool, Wind, Settings, ArrowLeft, ZoomIn, Camera, User, Package, CircleCheck as CheckCircle, ChevronDown, Zap, Layers, Globe } from 'lucide-react';

const AppContext = createContext();

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || '';

const LoadingSpinner = ({ className = '' }) => (
    <div className={`flex justify-center items-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-r-transparent"></div>
    </div>
);

const callApi = async (endpoint, data) => {
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

const Page = ({ children, className = '' }) => (
    <div className={`min-h-screen bg-white text-gray-900 font-sans ${className}`}>
        {children}
    </div>
);

const Button = ({ onClick, children, className = '', variant = 'primary', disabled = false, size = 'md' }) => {
    const baseClasses = 'font-semibold transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-400 border border-gray-300',
        outline: 'bg-transparent border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 focus:ring-gray-400'
    };
    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3',
        lg: 'px-8 py-4 text-lg'
    }
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </button>
    );
};

const Uploader = ({ label, onUpload, imageUrl }) => {
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => onUpload(reader.result, file.name);
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center h-full bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group cursor-pointer">
            {imageUrl ? (
                <img src={imageUrl} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
            ) : (
                <div className="text-center text-gray-500 group-hover:text-blue-600 transition-colors">
                    <ImageIcon className="mx-auto h-10 w-10 mb-2" />
                    <p className="font-semibold text-sm">{label}</p>
                </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
    );
};

const Header = ({ onGoHome, onNavigate }) => (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold cursor-pointer tracking-tight text-gray-900 hover:text-blue-600 transition-colors" onClick={onGoHome}>Tumdah</h1>
            <nav className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Pricing</a>
                <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">FAQ</a>
            </nav>
            <div className="flex items-center space-x-3">
                <Button onClick={() => alert('Coming soon!')} variant="secondary" size="sm" className="px-4 py-2 text-sm">Login</Button>
                <Button onClick={() => onNavigate('dashboard')} size="sm" className="px-4 py-2 text-sm">Get Started</Button>
            </div>
        </div>
    </header>
);

const useScrollAnimation = (threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); }}, { threshold });
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, [threshold]);
    return [ref, `transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`];
};

const FeatureCard = ({ icon, title, children }) => {
    const [ref, animationClass] = useScrollAnimation();
    return (
        <div ref={ref} className={`bg-white border border-gray-200 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${animationClass}`}>
            <div className="text-blue-600 mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{children}</p>
        </div>
    );
};

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-5 hover:text-blue-600 transition-colors">
                <span className="text-lg font-semibold">{title}</span>
                <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-gray-400`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <p className="pb-5 text-gray-600 leading-relaxed">{children}</p>
            </div>
        </div>
    );
};

const LandingPage = ({ onNavigate }) => {
    const [ctaRef, ctaAnimationClass] = useScrollAnimation();
    const partnerLogos = ['OpenAI', 'Google', 'Anthropic', 'Microsoft', 'Meta', 'Amazon'];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white overflow-x-hidden">
            <Header onGoHome={() => onNavigate('/')} onNavigate={onNavigate} />
            <main>
                <section className="text-center px-4 pt-20 pb-24 max-w-6xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8 text-sm font-medium text-blue-700">
                        <Sparkles className="h-4 w-4" />
                        <span>Backed by $1B+ in venture funding</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                        <span className="text-gray-900">
                            Create Studio-Quality
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            Visuals in Minutes
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Tumdah is the AI-powered creative suite for professionals. Build dynamic storyboards and generate production-quality visuals with unprecedented speed and consistency.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Button onClick={() => onNavigate('dashboard')} size="lg" className="shadow-lg">
                            <span>Start Creating Free</span>
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="lg">
                            <span>Watch Demo</span>
                        </Button>
                    </div>
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">50K+</div>
                            <div className="text-sm text-gray-600 mt-1">Active Creators</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">2M+</div>
                            <div className="text-sm text-gray-600 mt-1">Images Generated</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">99.9%</div>
                            <div className="text-sm text-gray-600 mt-1">Uptime</div>
                        </div>
                    </div>
                </section>

                <section className="py-12 bg-white border-y border-gray-200">
                     <p className="text-center text-gray-500 mb-8 tracking-wider text-xs font-semibold uppercase">Trusted by Leading Organizations</p>
                    <div className="max-w-5xl mx-auto flex justify-center items-center gap-x-12 gap-y-4 flex-wrap px-4">
                        {partnerLogos.map(logo => (
                            <span key={logo} className="text-gray-400 font-bold text-xl opacity-60 hover:opacity-100 transition-opacity">{logo}</span>
                        ))}
                    </div>
                </section>

                <section id="features" className="py-24 px-4 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Everything You Need to Create</h2>
                            <p className="text-gray-600 text-lg">Powerful features designed for modern creative workflows</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard icon={<Zap size={32} />} title="Lightning Fast">Generate production-quality visuals in seconds, not hours. No more waiting for renders.</FeatureCard>
                            <FeatureCard icon={<Layers size={32} />} title="Perfect Consistency">Maintain character appearance and style across hundreds of shots automatically.</FeatureCard>
                            <FeatureCard icon={<Globe size={32} />} title="AI-Powered Intelligence">Advanced AI understands your creative vision and brings it to life with precision.</FeatureCard>
                            <FeatureCard icon={<Bot size={32} />} title="Smart Storyboarding">Automatically break down scripts into scenes, beats, and cinematographic shots.</FeatureCard>
                            <FeatureCard icon={<PenTool size={32} />} title="Full Creative Control">Fine-tune every aspect from camera angles to lighting with intuitive controls.</FeatureCard>
                            <FeatureCard icon={<Film size={32} />} title="Export Ready">Download high-resolution images ready for client presentations or production.</FeatureCard>
                        </div>
                    </div>
                </section>

                <section className="py-24 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">How It Works</h2>
                            <p className="text-gray-600 text-lg">From concept to completion in three simple steps</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="relative flex flex-col items-center text-center">
                                <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white font-bold text-2xl rounded-2xl mb-6 shadow-lg">1</div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">Input Your Vision</h3>
                                <p className="text-gray-600">Write your script or use AI to generate one. Tumdah analyzes the narrative structure automatically.</p>
                            </div>
                            <div className="relative flex flex-col items-center text-center">
                                 <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white font-bold text-2xl rounded-2xl mb-6 shadow-lg">2</div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">Define Your Style</h3>
                                <p className="text-gray-600">Set visual parameters, character details, and cinematographic preferences with precision.</p>
                            </div>
                            <div className="relative flex flex-col items-center text-center">
                                 <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white font-bold text-2xl rounded-2xl mb-6 shadow-lg">3</div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">Generate & Export</h3>
                                <p className="text-gray-600">Create your entire storyboard instantly. Refine, regenerate, and export high-res images.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="py-24 px-4 bg-white">
                     <div className="max-w-6xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Simple, Transparent Pricing</h2>
                            <p className="text-gray-600 text-lg">Start free, scale as you grow. No surprises.</p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                            <div className="bg-white border-2 border-gray-200 p-8 rounded-2xl flex flex-col hover:shadow-xl transition-shadow">
                                <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                                <p className="text-gray-600 my-4">Perfect for exploring and testing ideas</p>
                                <p className="text-5xl font-extrabold my-6 text-gray-900">$0<span className="text-lg font-medium text-gray-500">/mo</span></p>
                                <Button onClick={() => onNavigate('dashboard')} variant="outline" className="w-full">Start Free</Button>
                                <ul className="space-y-4 mt-8 text-gray-700">
                                    <li className="flex items-center gap-3"><CheckCircle className="text-blue-600 h-5 w-5 flex-shrink-0" /> 1 Active Project</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-blue-600 h-5 w-5 flex-shrink-0" /> 50 Image Generations/mo</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-blue-600 h-5 w-5 flex-shrink-0" /> Standard Quality (1280x720)</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-blue-600 h-5 w-5 flex-shrink-0" /> Community Support</li>
                                </ul>
                            </div>
                             <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-8 rounded-2xl flex flex-col relative overflow-hidden shadow-2xl transform hover:scale-105 transition-transform">
                                <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 font-bold text-xs px-3 py-1.5 rounded-full">POPULAR</div>
                                <h3 className="text-2xl font-bold text-white">Professional</h3>
                                <p className="text-blue-100 my-4">For serious creators and teams</p>
                                <p className="text-5xl font-extrabold my-6 text-white">$49<span className="text-lg font-medium text-blue-100">/mo</span></p>
                                <Button onClick={() => onNavigate('dashboard')} className="w-full bg-white text-blue-600 hover:bg-gray-100">Start 14-Day Trial</Button>
                                <ul className="space-y-4 mt-8 text-white">
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 flex-shrink-0" /> Unlimited Projects</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 flex-shrink-0" /> 1,000 Image Generations/mo</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 flex-shrink-0" /> HD Quality (1920x1080)</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 flex-shrink-0" /> Character Consistency</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 flex-shrink-0" /> Priority Support</li>
                                </ul>
                            </div>
                            <div className="bg-white border-2 border-gray-200 p-8 rounded-2xl flex flex-col hover:shadow-xl transition-shadow">
                                <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
                                <p className="text-gray-600 my-4">For studios and large organizations</p>
                                <p className="text-5xl font-extrabold my-6 text-gray-900">Custom</p>
                                <Button onClick={() => alert('Contact sales!')} variant="outline" className="w-full">Contact Sales</Button>
                                 <ul className="space-y-4 mt-8 text-gray-700">
                                    <li className="flex items-center gap-3"><CheckCircle className="text-blue-600 h-5 w-5 flex-shrink-0" /> Everything in Pro</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-blue-600 h-5 w-5 flex-shrink-0" /> Unlimited Generations</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-blue-600 h-5 w-5 flex-shrink-0" /> 4K Quality</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-blue-600 h-5 w-5 flex-shrink-0" /> Custom AI Training</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-blue-600 h-5 w-5 flex-shrink-0" /> Dedicated Support</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 px-4 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Trusted by Creators Worldwide</h2>
                        </div>
                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-gray-700 mb-6 leading-relaxed">"Tumdah transformed our pre-production workflow. What took weeks now takes hours. The quality is incredible."</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">JS</div>
                                    <div>
                                        <p className="font-bold text-gray-900">Jane Smith</p>
                                        <p className="text-sm text-gray-600">Director, Indie Films Co.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-gray-700 mb-6 leading-relaxed">"As a solo creator, this is my secret weapon. I can visualize entire sequences with quality I never imagined possible."</p>
                                <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">MA</div>
                                     <div>
                                        <p className="font-bold text-gray-900">Marcus Chen</p>
                                        <p className="text-sm text-gray-600">Content Creator</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-gray-700 mb-6 leading-relaxed">"The speed is incredible. We present multiple visual directions to clients in a single meeting. Game changer."</p>
                                 <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white font-bold">EC</div>
                                    <div>
                                        <p className="font-bold text-gray-900">Emily Carter</p>
                                        <p className="text-sm text-gray-600">Creative Director</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faq" className="py-24 px-4 bg-white">
                    <div className="max-w-3xl mx-auto">
                         <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-gray-900">Frequently Asked Questions</h2>
                         <AccordionItem title="How do I get my Google AI Studio API key?">
                            Visit Google AI Studio at https://aistudio.google.com/app/apikey to generate your free API key. Copy it and paste it into the .env file as VITE_GOOGLE_AI_API_KEY. Restart the development server to apply changes.
                        </AccordionItem>
                         <AccordionItem title="Can I maintain consistent characters across images?">
                            Yes! Our Character Consistency feature (Pro plan) ensures facial features and identity remain consistent across all generated shots by using reference images.
                        </AccordionItem>
                        <AccordionItem title="What happens when I reach my generation limit?">
                            You can purchase additional credits or upgrade to a higher tier. Limits reset monthly on your billing date.
                        </AccordionItem>
                        <AccordionItem title="Can I use generated images commercially?">
                            Yes. All images generated on paid plans are yours to use for commercial purposes without restrictions.
                        </AccordionItem>
                         <AccordionItem title="Is there a free trial for Pro features?">
                            Yes! New Pro subscriptions include a 14-day free trial with full access to all features.
                        </AccordionItem>
                    </div>
                </section>

                <section ref={ctaRef} className={`py-24 px-4 ${ctaAnimationClass}`}>
                    <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-600 to-cyan-500 p-16 rounded-3xl shadow-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Ready to Transform Your Creative Process?</h2>
                        <p className="text-blue-100 mb-8 text-lg">Join thousands of creators building the future of visual content</p>
                        <Button onClick={() => onNavigate('dashboard')} size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
                            Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </section>
            </main>
            <footer className="bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-8">
                         <div className="col-span-2">
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Tumdah</h3>
                            <p className="text-gray-600 text-sm">AI-powered creative suite for visual storytelling</p>
                         </div>
                         <div>
                             <h4 className="font-semibold mb-3 text-gray-900">Product</h4>
                             <ul className="space-y-2 text-sm text-gray-600">
                                 <li><a href="#pricing" className="hover:text-blue-600">Pricing</a></li>
                                 <li><a href="#features" className="hover:text-blue-600">Features</a></li>
                                 <li><a href="#" className="hover:text-blue-600">Updates</a></li>
                             </ul>
                         </div>
                         <div>
                             <h4 className="font-semibold mb-3 text-gray-900">Company</h4>
                             <ul className="space-y-2 text-sm text-gray-600">
                                 <li><a href="#" className="hover:text-blue-600">About</a></li>
                                 <li><a href="#" className="hover:text-blue-600">Careers</a></li>
                                 <li><a href="#" className="hover:text-blue-600">Contact</a></li>
                             </ul>
                         </div>
                         <div>
                             <h4 className="font-semibold mb-3 text-gray-900">Resources</h4>
                             <ul className="space-y-2 text-sm text-gray-600">
                                 <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                                 <li><a href="#" className="hover:text-blue-600">Docs</a></li>
                                 <li><a href="#faq" className="hover:text-blue-600">FAQ</a></li>
                             </ul>
                         </div>
                         <div>
                             <h4 className="font-semibold mb-3 text-gray-900">Legal</h4>
                             <ul className="space-y-2 text-sm text-gray-600">
                                 <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
                                 <li><a href="#" className="hover:text-blue-600">Terms</a></li>
                             </ul>
                         </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 pt-8">
                        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Tumdah, Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const CreativeSuite = ({ onNavigate }) => {
    const [activeTool, setActiveTool] = useState('images');

    return (
        <Page className="p-0 sm:p-0 bg-gray-50">
             <div className="flex h-screen bg-gray-50">
                <nav className="w-20 bg-white border-r border-gray-200 p-4 flex flex-col items-center justify-between shadow-sm">
                    <div>
                         <h1 className="text-2xl font-bold cursor-pointer tracking-tight mb-12 text-blue-600" onClick={() => onNavigate('/')}>T</h1>
                        <div className="space-y-4">
                            <button title="Storyboard Builder" onClick={() => setActiveTool('storyboard')} className={`p-3 rounded-xl transition-all ${activeTool === 'storyboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}><Film/></button>
                            <button title="Image Studio" onClick={() => setActiveTool('images')} className={`p-3 rounded-xl transition-all ${activeTool === 'images' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}><ImageIcon/></button>
                        </div>
                    </div>
                    <button title="Settings" className="p-3 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"><Settings/></button>
                </nav>
                <div className="flex-1 overflow-y-auto bg-white">
                    {activeTool === 'storyboard' && <StoryboardPage onNavigate={onNavigate}/>}
                    {activeTool === 'images' && <GenerateImagesPage onNavigate={onNavigate}/>}
                </div>
            </div>
        </Page>
    );
};

const GenerateImagesPage = ({ onNavigate }) => {
    const [mode, setMode] = useState('human');
    const [refImage, setRefImage] = useState(null);
    const [userFace, setUserFace] = useState(null);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [humanLoading, setHumanLoading] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [productStyleRef, setProductStyleRef] = useState(null);
    const [productPhoto, setProductPhoto] = useState(null);
    const [generatedProductImages, setGeneratedProductImages] = useState([]);
    const [productLoading, setProductLoading] = useState(false);

    const generateAndSetImages = async () => {
        if (!refImage || !userFace) {
            alert("Please upload both a Style Reference and a Character Photo.");
            return;
        }
        setHumanLoading(true);
        setGeneratedImages([]);

        const analysisResultRef = await callApi('/analyze_ref', { image: refImage });

        if (analysisResultRef) {
            const { outfit_description: refOutfit, color_palette: refColorTone, lighting_style: refLighting, camera_shot: refShot, composition: refComposition, pose: refPose, background: refBackground } = analysisResultRef;

            const prompt1_2 = `Using the person from the provided image as the subject, create a new photorealistic image.
- **New Outfit:** The person should now be wearing: ${refOutfit}.
- **Artistic Style:** The overall artistic style is determined by these details: lighting is ${refLighting}, color palette is ${refColorTone}, composition is ${refComposition}, camera shot is a ${refShot}, and the background is ${refBackground}.
- **Pose:** The subject should hold this pose: ${refPose}.
Ensure the subject's face and identity are perfectly preserved from the source image.`;

            const prompt3 = `Using the person from the provided image as the subject, create a new photorealistic image.
- **Original Outfit:** The person should remain in their original clothes.
- **Artistic Style:** The overall artistic style is determined by these details: lighting is ${refLighting}, color palette is ${refColorTone}, composition is ${refComposition}, camera shot is a ${refShot}, and the background is ${refBackground}.
- **Pose:** The subject should hold this pose: ${refPose}.
Ensure the subject's face and identity are perfectly preserved from the source image.`;

            const prompt4 = `Using the person from the provided image as the subject, create a new photorealistic image.
- **New Outfit:** The person should now be wearing: ${refOutfit}.
- **Artistic Style:** The style is defined by: lighting is ${refLighting}, color palette is ${refColorTone}, composition is ${refComposition}, camera shot is a ${refShot}, and the background is ${refBackground}.
- **New Pose:** The subject should strike a new, powerful, and dynamic high-fashion editorial pose.
Ensure the subject's face and identity are perfectly preserved from the source image.`;

            const imagePromises = [
                callApi('/generate_image', { prompt: prompt1_2, image: userFace }),
                callApi('/generate_image', { prompt: prompt1_2, image: userFace }),
                callApi('/generate_image', { prompt: prompt3, image: userFace }),
                callApi('/generate_image', { prompt: prompt4, image: userFace })
            ];

            const images = await Promise.all(imagePromises);
            setGeneratedImages(images);
        } else {
            alert("Failed to analyze the style reference image. Please try a different image.");
        }
        setHumanLoading(false);
    };

    const generateAndSetProductImages = async () => {
        if (!productStyleRef || !productPhoto) {
            alert("Please upload both a Style Reference and a Product Photo.");
            return;
        }
        setProductLoading(true);
        setGeneratedProductImages([]);

        const basePrompt = `Task: Re-shoot the product from the first uploaded image (Product Photo) and place it seamlessly into the scene from the second uploaded image (Style Reference Photo).
- **Source Product:** The primary subject is the product in the first image. Preserve its geometry, color, texture, and identity perfectly. Do not alter the product.
- **Target Scene & Style:** The entire environment, lighting, camera angle, lens effects, and composition must be replicated from the second image.
- **Action:** The final image should look like a professional product photograph of the source product, as if it were originally shot in the target scene.`;

        const prompts = [
            `${basePrompt}\n- **Shot Angle:** Capture the product from a direct, front-on angle, matching the composition of the target scene.`,
            `${basePrompt}\n- **Shot Angle:** Capture the product from a 45-degree angled perspective, integrating it naturally into the target scene.`,
            `${basePrompt}\n- **Shot Angle:** Capture a detailed close-up (macro shot) of a key feature of the product, using the lighting and color palette from the target scene.`,
            `Task: Create a photorealistic product lifestyle shot.
- **Product:** Use the exact product from the first uploaded image (Product Photo), maintaining its shape, color, and texture perfectly.
- **Scene:** Place the product in a contextually relevant and aesthetically pleasing arrangement within the environment shown in the second uploaded image (Style Reference Photo).
- **Style:** The lighting, color palette, and overall mood must match the second image.`
        ];

        const imagePromises = prompts.map(prompt => callApi('/generate_image', { prompt, image: productPhoto, styleImage: productStyleRef }));

        const images = await Promise.all(imagePromises);
        setGeneratedProductImages(images);
        setProductLoading(false);
    };

    const handleDownloadImage = (imageUrl, index) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `tumdah-image-${index + 1}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8 h-full flex flex-col bg-gray-50">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Image Studio</h2>
                <p className="text-gray-600 mt-2">Generate studio-quality visuals for characters or products with AI</p>
                <div className="mt-6 flex justify-center p-1.5 bg-gray-200 rounded-xl space-x-2 max-w-md mx-auto">
                    <button onClick={() => setMode('human')} className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all w-1/2 flex items-center justify-center gap-2 ${mode === 'human' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                        <User size={18} /> Character
                    </button>
                    <button onClick={() => setMode('product')} className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all w-1/2 flex items-center justify-center gap-2 ${mode === 'product' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                        <Package size={18} /> Product
                    </button>
                </div>
            </header>

            {mode === 'human' && (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1 flex flex-col gap-6">
                        <Uploader label="1. Style Reference" onUpload={setRefImage} imageUrl={refImage} />
                        <Uploader label="2. Character Photo" onUpload={setUserFace} imageUrl={userFace} />
                        <Button onClick={generateAndSetImages} className="w-full mt-auto" disabled={humanLoading} size="lg">
                            {humanLoading ? <LoadingSpinner/> : <> <Sparkles className="h-5 w-5"/> Generate </>}
                        </Button>
                    </aside>
                    <main className="lg:col-span-3">
                         <div className="grid grid-cols-2 gap-6 h-full">
                            {humanLoading && [...Array(4)].map((_, i) => <div key={i} className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200"><LoadingSpinner/></div>)}

                            {!humanLoading && generatedImages.length > 0 && generatedImages.map((src, index) => (
                                <div key={index} className="relative group cursor-pointer" onClick={() => setFullscreenImage(src)}>
                                    <img src={src} alt={`Generated ${index + 1}`} className="w-full h-full object-cover rounded-xl aspect-video border border-gray-200" />
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setFullscreenImage(src); }} className="bg-white text-gray-900 hover:bg-gray-100"><ZoomIn className="h-5 w-5"/></Button>
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownloadImage(src, index); }} className="bg-white text-gray-900 hover:bg-gray-100"><Download className="h-5 w-5"/></Button>
                                    </div>
                                </div>
                            ))}

                            {!humanLoading && generatedImages.length === 0 && (
                                <div className="col-span-2 aspect-video bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                    <ImageIcon className="h-24 w-24 mb-4"/>
                                    <p className="text-xl font-medium">Generated images appear here</p>
                                </div>
                            )}
                        </div>
                         {generatedImages.length > 0 && !humanLoading && (
                            <div className="flex justify-center mt-6">
                                <Button onClick={generateAndSetImages} disabled={humanLoading} variant="secondary">Regenerate All</Button>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {mode === 'product' && (
                 <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1 flex flex-col gap-6">
                        <Uploader label="1. Style Reference" onUpload={setProductStyleRef} imageUrl={productStyleRef} />
                        <Uploader label="2. Product Photo" onUpload={setProductPhoto} imageUrl={productPhoto} />
                        <Button onClick={generateAndSetProductImages} className="w-full mt-auto" disabled={productLoading} size="lg">
                            {productLoading ? <LoadingSpinner/> : <> <Sparkles className="h-5 w-5"/> Generate </>}
                        </Button>
                    </aside>
                    <main className="lg:col-span-3">
                         <div className="grid grid-cols-2 gap-6 h-full">
                            {productLoading && [...Array(4)].map((_, i) => <div key={i} className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200"><LoadingSpinner/></div>)}

                            {!productLoading && generatedProductImages.length > 0 && generatedProductImages.map((src, index) => (
                                <div key={index} className="relative group cursor-pointer" onClick={() => setFullscreenImage(src)}>
                                    <img src={src} alt={`Product ${index + 1}`} className="w-full h-full object-cover rounded-xl aspect-video border border-gray-200" />
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setFullscreenImage(src); }} className="bg-white text-gray-900 hover:bg-gray-100"><ZoomIn className="h-5 w-5"/></Button>
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownloadImage(src, index); }} className="bg-white text-gray-900 hover:bg-gray-100"><Download className="h-5 w-5"/></Button>
                                    </div>
                                </div>
                            ))}

                            {!productLoading && generatedProductImages.length === 0 && (
                                <div className="col-span-2 aspect-video bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                    <Package className="h-24 w-24 mb-4"/>
                                    <p className="text-xl font-medium">Product shots appear here</p>
                                </div>
                            )}
                        </div>
                         {generatedProductImages.length > 0 && !productLoading && (
                            <div className="flex justify-center mt-6">
                                <Button onClick={generateAndSetProductImages} disabled={productLoading} variant="secondary">Regenerate All</Button>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {fullscreenImage && createPortal(<div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setFullscreenImage(null)}><button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setFullscreenImage(null)}><X size={32}/></button><img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" /></div>, document.body)}
        </div>
    );
};

const ShotCardV2 = ({ scene, shot, shotId, generationState, onRegenerate, onShotUpdate }) => {
    const { isLoading, url } = generationState || { isLoading: false, url: null };

    const shotTypes = ["Extreme Close-Up", "Close-Up", "Medium Shot", "Cowboy Shot", "Full Shot", "Wide Shot", "Establishing Shot", "Over-the-Shoulder"];
    const lensChoices = ["14mm Ultra-Wide", "24mm Wide-Angle", "35mm Wide", "50mm Standard", "85mm Prime", "135mm Telephoto"];
    const cameraMovements = ["Static", "Pan", "Tilt", "Dolly In", "Dolly Out", "Crane Shot", "Handheld", "Steadicam"];

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
            <div className="w-full aspect-video bg-gray-100 flex items-center justify-center relative group">
                {isLoading ? <LoadingSpinner /> : (url ? <img src={url} alt={shot.shot_type} className="w-full h-full object-cover" /> : <div className="text-gray-300"><Camera size={48}/></div>)}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" onClick={() => onRegenerate(shotId, scene, shot)} disabled={isLoading} className="text-xs py-2 px-4 bg-white text-gray-900">
                        {isLoading ? <LoadingSpinner className="h-4 w-4"/> : "Regenerate"}
                    </Button>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <p className="text-gray-600 text-sm mb-4 flex-grow leading-relaxed">{shot.caption}</p>
                <div className="space-y-3 text-sm border-t border-gray-200 pt-3 mt-3">
                    <div className="grid grid-cols-3 items-center gap-2">
                        <label className="text-gray-500 font-medium col-span-1 text-xs">Shot</label>
                        <select value={shot.shot_type} onChange={(e) => onShotUpdate(shotId, { ...shot, shot_type: e.target.value })} className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 col-span-2 outline-none focus:ring-2 focus:ring-blue-500 text-xs">
                            {shotTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                         <label className="text-gray-500 font-medium col-span-1 text-xs">Lens</label>
                        <select value={shot.lens_choice} onChange={(e) => onShotUpdate(shotId, { ...shot, lens_choice: e.target.value })} className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 col-span-2 outline-none focus:ring-2 focus:ring-blue-500 text-xs">
                            {lensChoices.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                        <label className="text-gray-500 font-medium col-span-1 text-xs">Move</label>
                        <select value={shot.camera_movement} onChange={(e) => onShotUpdate(shotId, { ...shot, camera_movement: e.target.value })} className="bg-gray-50 border border-gray-300 rounded px-2 py-1.5 col-span-2 outline-none focus:ring-2 focus:ring-blue-500 text-xs">
                            {cameraMovements.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StoryboardPage = ({ onNavigate }) => {
    const [story, setStory] = useState("");
    const [storyboardData, setStoryboardData] = useState(null);
    const [workflowStage, setWorkflowStage] = useState('script');
    const [loading, setLoading] = useState(false);
    const [isGeneratingShots, setIsGeneratingShots] = useState(false);
    const [shotGenerationState, setShotGenerationState] = useState({});
    const [visualStyle, setVisualStyle] = useState("Cinematic, photorealistic, high-budget film aesthetic.");
    const [characterProfiles, setCharacterProfiles] = useState({});

    const handleParseStory = async () => {
        if (story.trim() === "") return;
        setLoading(true);
        const data = await callApi('/parse_story', { story });
        if (data && data.cast_refs) {
            setStoryboardData(data);
            const initialProfiles = Object.entries(data.cast_refs).reduce((acc, [key, val]) => {
                acc[key] = { ...val, detailed_description: val.description };
                return acc;
            }, {});
            setCharacterProfiles(initialProfiles);
            setWorkflowStage('blueprint');
        } else {
            alert("Failed to parse the story. Please try again.");
        }
        setLoading(false);
    };

    const handleCharacterUpdate = (name, newDescription) => {
        setCharacterProfiles(prev => ({...prev, [name]: {...prev[name], detailed_description: newDescription }}));
    };

    const handleFinalizeBlueprint = () => {
        setWorkflowStage('board');
        generateAllShots();
    };

    const createCinematicPrompt = (scene, shot) => {
        const characterName = Object.keys(characterProfiles).find(name => new RegExp(`\\b${name}\\b`, 'i').test(shot.caption));
        const characterDescription = characterName ? characterProfiles[characterName].detailed_description : 'A person';

        return `Create a single, cinematic frame based on the following professional specifications.
- **GLOBAL STYLE:** ${visualStyle}.
- **SUBJECT & ACTION:** The subject is ${characterDescription}. They are performing this action: ${shot.caption}.
- **SCENE CONTEXT:** Location: ${scene.location}. Mood: ${scene.mood}. Key Elements: ${scene.description}.
- **CINEMATOGRAPHY:** Shot Type: ${shot.shot_type}. Lens: ${shot.lens_choice}. Aperture: ${shot.aperture}.
- **LIGHTING & COLOR:** Lighting Style: ${scene.lighting_setup}. Color Palette: ${scene.color_palette}.
The final image must be of impeccable, film-production quality.`;
    };

    const generateAllShots = async () => {
        if (!storyboardData) return;
        setIsGeneratingShots(true);

        const allShots = [];
        storyboardData.scenes.forEach(scene => {
            scene.beats.forEach(beat => {
                beat.shot_recommendations.forEach((shot, shotIndex) => {
                    const shotId = `${scene.scene_title}-${shotIndex}-${Math.random()}`;
                    allShots.push({ shotId, scene, shot });
                });
            });
        });

        const initialState = allShots.reduce((acc, { shotId }) => ({...acc, [shotId]: { isLoading: true, url: null }}), {});
        setShotGenerationState(initialState);

        const shotPromises = allShots.map(({ shotId, scene, shot }) =>
            callApi('/generate_image', { prompt: createCinematicPrompt(scene, shot) })
                .then(url => setShotGenerationState(prev => ({ ...prev, [shotId]: { isLoading: false, url } })))
                .catch(err => {
                    console.error(`Failed shot ${shotId}:`, err);
                    setShotGenerationState(prev => ({ ...prev, [shotId]: { isLoading: false, url: null } }));
                })
        );

        await Promise.all(shotPromises);
        setIsGeneratingShots(false);
    };

    const regenerateShot = async (shotId, scene, shot) => {
        setShotGenerationState(prev => ({ ...prev, [shotId]: { isLoading: true, url: prev[shotId]?.url } }));
        try {
            const imageUrl = await callApi('/generate_image', { prompt: createCinematicPrompt(scene, shot) });
            setShotGenerationState(prev => ({ ...prev, [shotId]: { isLoading: false, url: imageUrl } }));
        } catch (error) {
             console.error(`Failed to regenerate shot ${shotId}:`, error);
             setShotGenerationState(prev => ({ ...prev, [shotId]: { isLoading: false, url: prev[shotId]?.url } }));
        }
    };

    const handleShotUpdate = (shotId, updatedShot) => {
        const newData = JSON.parse(JSON.stringify(storyboardData));
        let found = false;
        for (const scene of newData.scenes) {
            for (const beat of scene.beats) {
                const shotIndex = beat.shot_recommendations.findIndex(shot => shot.caption === updatedShot.caption);
                if (shotIndex !== -1) {
                    beat.shot_recommendations[shotIndex] = updatedShot;
                    found = true;
                    regenerateShot(shotId, scene, updatedShot);
                    break;
                }
            }
            if (found) break;
        }
        setStoryboardData(newData);
    };

    const handleGenerateStory = async () => {
        setLoading(true);
        setStory("Generating a new story...");
        const newStory = await callApi('/generate_story', {});
        setStory(newStory);
        setLoading(false);
    };

    if (workflowStage === 'script') {
        return (
            <div className="p-8 h-full flex flex-col max-w-3xl mx-auto my-auto text-center bg-gray-50">
                <header className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Storyboard Builder</h2>
                    <p className="text-gray-600 mt-2">Transform your script into a cinematic blueprint</p>
                </header>
                <textarea className="w-full h-80 bg-white border-2 border-gray-300 text-gray-900 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" value={story} onChange={(e) => setStory(e.target.value)} placeholder="Paste your story here or generate one with AI..."></textarea>
                <div className="flex justify-center mt-6 space-x-4">
                    <Button onClick={handleParseStory} disabled={loading || story.trim() === ""}>Analyze Script</Button>
                    <Button onClick={handleGenerateStory} disabled={loading} variant="secondary">Generate Story</Button>
                </div>
            </div>
        );
    }

    if (workflowStage === 'blueprint') {
        return (
            <div className="p-8 h-full flex flex-col max-w-4xl mx-auto bg-gray-50">
                <header className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Define Visual Style</h2>
                    <p className="text-gray-600 mt-2">Set the creative direction for your storyboard</p>
                </header>
                <div className="space-y-8">
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Visual Style</h3>
                        <p className="text-sm text-gray-600 mb-3">Describe the overall aesthetic, mood, genre, and color palette</p>
                        <input type="text" value={visualStyle} onChange={e => setVisualStyle(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Character Profiles</h3>
                        <div className="space-y-4">
                            {Object.values(characterProfiles).map(char => (
                                <div key={char.name}>
                                    <label className="font-bold text-gray-900">{char.name}</label>
                                    <textarea value={char.detailed_description} onChange={e => handleCharacterUpdate(char.name, e.target.value)} rows="3" className="w-full mt-2 bg-gray-50 border-2 border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-center gap-4">
                     <Button onClick={() => setWorkflowStage('script')} variant="secondary"><ArrowLeft className="h-5 w-5 mr-2" /> Back</Button>
                     <Button onClick={handleFinalizeBlueprint} size="lg">Generate Storyboard <ArrowRight className="h-5 w-5 ml-2" /></Button>
                </div>
            </div>
        )
    }

    if (workflowStage === 'board') {
        return (
            <div className="p-8 h-full bg-gray-50">
                <main className="overflow-y-auto">
                     {storyboardData.scenes && storyboardData.scenes.map((scene, sceneIndex) => (
                        <div key={sceneIndex} className="mb-16">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                              <h2 className="text-2xl font-bold mb-2 text-gray-900">Scene {sceneIndex + 1}: {scene.scene_title}</h2>
                              <p className="text-gray-600 mb-2"><strong>Location:</strong> {scene.location}</p>
                              <div className="text-sm text-gray-600 border-t border-gray-200 pt-3 mt-3 space-y-1">
                                  <p><strong>Mood:</strong> {scene.mood}</p>
                                  <p><strong>Lighting:</strong> {scene.lighting_setup}</p>
                                  <p><strong>Palette:</strong> {scene.color_palette}</p>
                              </div>
                            </div>
                            {scene.beats && scene.beats.map((beat, beatIndex) => (
                              <div key={beatIndex} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-blue-600 pl-4">{beat.beat_title}</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {beat.shot_recommendations.map((shot, shotIndex) => {
                                        const shotId = `${scene.scene_title}-${shotIndex}-${beatIndex}-${Math.random()}`;
                                        return <ShotCardV2 key={shotId} scene={scene} shot={shot} shotId={shotId} generationState={shotGenerationState[shotId]} onRegenerate={regenerateShot} onShotUpdate={handleShotUpdate} />;
                                    })}
                                </div>
                              </div>
                            ))}
                        </div>
                    ))}
                </main>
            </div>
        );
    }
};

const App = () => {
    const [currentPage, setCurrentPage] = useState('/');

    const navigate = useCallback((path) => {
        setCurrentPage(path);
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case '/': return <LandingPage onNavigate={navigate} />;
            case 'dashboard': return <CreativeSuite onNavigate={navigate} />;
            default: return <LandingPage onNavigate={navigate} />;
        }
    };

    return (
        <AppContext.Provider value={{ navigate }}>
            <div className="bg-white font-sans antialiased text-gray-900">
                {renderPage()}
            </div>
        </AppContext.Provider>
    );
};

export default App;
