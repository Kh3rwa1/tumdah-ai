import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Image as ImageIcon, Film, Sparkles, ArrowRight, Bot, PenTool, Wind, Settings, ArrowLeft, ZoomIn, Camera, User, Package, CheckCircle, ChevronDown } from 'lucide-react';

const AppContext = createContext();

// A simple loading spinner component
const LoadingSpinner = ({ className = '' }) => (
    <div className={`flex justify-center items-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-r-transparent"></div>
    </div>
);

/**
 * Handles all API calls for the application.
 * @param {string} endpoint - The API endpoint to call.
 * @param {object} data - The data to send in the API request.
 * @returns {Promise<any>} The API response data.
 */
const callApi = async (endpoint, data) => {
    // The API key is intentionally left empty. The environment will handle authentication.
    const apiKey = ""; 
    
    if (endpoint === '/export_storyboard') {
        return new Promise(resolve => setTimeout(() => resolve({ zipFile: { name: "storyboard.zip", size: 1024 * 1024 } }), 1000));
    }

    if (endpoint === '/analyze_ref') {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
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
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
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
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
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

        // If an image is provided (for face/product consistency), use the multimodal model.
        if (data.image) {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
            const parts = [{ text: data.prompt }];
            // Add the main subject image (face or product)
            parts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: data.image.split(',')[1]
                }
            });
            
            // If a second style reference image is provided, add it too.
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
            // Otherwise (for storyboard shots from text), use the dedicated text-to-image model.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
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
    <div className={`min-h-screen bg-black text-white font-sans ${className}`}>
        {children}
    </div>
);

const Button = ({ onClick, children, className = '', variant = 'primary', disabled = false, size = 'md' }) => {
    const baseClasses = 'font-semibold transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black rounded-lg';
    const variants = {
        primary: 'bg-green-500 hover:bg-green-600 text-black focus:ring-green-500',
        secondary: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 focus:ring-neutral-500',
        outline: 'bg-transparent border-2 border-neutral-700 hover:bg-neutral-800 text-neutral-300 focus:ring-neutral-600'
    };
    const sizes = {
        md: 'px-6 py-3',
        lg: 'px-8 py-4 text-lg'
    }
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
        <div className="relative border-2 border-dashed border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center h-full bg-neutral-900/50 hover:border-green-500 transition-colors duration-300 group">
            {imageUrl ? (
                <img src={imageUrl} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
            ) : (
                <div className="text-center text-neutral-600 group-hover:text-neutral-400 transition-colors">
                    <ImageIcon className="mx-auto h-10 w-10 mb-2" />
                    <p className="font-semibold">{label}</p>
                </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
    );
};

const Header = ({ onGoHome, onNavigate }) => (
    <header className="sticky top-0 z-50 backdrop-blur-sm bg-black/70 border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
            <h1 className="text-2xl font-bold cursor-pointer tracking-tighter" onClick={onGoHome}>Tumdah</h1>
            <nav className="hidden md:flex items-center space-x-8">
                <a href="#benefits" className="text-neutral-400 hover:text-white transition-colors">Benefits</a>
                <a href="#pricing" className="text-neutral-400 hover:text-white transition-colors">Pricing</a>
                <a href="#faq" className="text-neutral-400 hover:text-white transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center space-x-2">
                <Button onClick={() => alert('Coming soon!')} variant="secondary" size="md" className="px-4 py-2 text-sm">Login</Button>
                <Button onClick={() => onNavigate('dashboard')} size="md" className="px-4 py-2 text-sm">Get Started</Button>
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
    return [ref, `transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`];
};

const FeatureCard = ({ icon, title, children }) => {
    const [ref, animationClass] = useScrollAnimation();
    return (
        <div ref={ref} className={`bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl ${animationClass}`}>
            <div className="text-green-400 mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-neutral-400">{children}</p>
        </div>
    );
};

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-neutral-800">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-6">
                <span className="text-lg font-medium">{title}</span>
                <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                <p className="pb-6 text-neutral-400">{children}</p>
            </div>
        </div>
    );
};

const LandingPage = ({ onNavigate }) => {
    const [ctaRef, ctaAnimationClass] = useScrollAnimation();
    const partnerLogos = ['Google', 'Disney', 'Pixar', 'Netflix', 'A24', 'HBO'];

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            <Header onGoHome={() => onNavigate('/')} onNavigate={onNavigate} />
            <main>
                {/* Hero Section */}
                <section className="text-center px-4 pt-24 pb-32">
                    <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-6">
                        <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-500">
                            The Future of Visuals,
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                            Generated Instantly.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
                        Tumdah is the generative AI suite for creative professionals. Build dynamic storyboards and generate production-quality, consistent visuals with unparalleled speed and control.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => onNavigate('dashboard')} size="lg">
                            <span>Enter Creative Suite</span>
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </section>

                {/* Partners Logos */}
                <section className="py-12">
                     <p className="text-center text-neutral-500 mb-8 tracking-widest text-sm">TRUSTED BY INDUSTRY LEADERS</p>
                    <div className="max-w-5xl mx-auto flex justify-center items-center gap-x-12 gap-y-4 flex-wrap px-4">
                        {partnerLogos.map(logo => (
                            <span key={logo} className="text-neutral-600 font-bold text-2xl grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all">{logo}</span>
                        ))}
                    </div>
                </section>

                {/* Benefits Grid */}
                <section id="benefits" className="py-20 sm:py-32 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">A Radically New Creative Workflow</h2>
                            <p className="text-neutral-400 mb-16">Tumdah integrates into your process, automating the tedious so you can focus on what matters: the story.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard icon={<Bot size={32} />} title="AI Storyboarding">Automatically deconstruct scripts into scenes, beats, and shot lists in seconds.</FeatureCard>
                            <FeatureCard icon={<ImageIcon size={32} />} title="Consistent Characters">Maintain character appearance, wardrobe, and style across all generated visuals.</FeatureCard>
                            <FeatureCard icon={<Wind size={32} />} title="Lightning-Fast Ideation">Generate hundreds of high-quality visual concepts from a single prompt.</FeatureCard>
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-20 sm:py-32 px-4 bg-neutral-900/40">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">Get Production-Ready in 3 Steps</h2>
                            <p className="text-neutral-400 mb-20">Go from a simple idea to a full cinematic storyboard in minutes.</p>
                        </div>
                        <div className="relative grid md:grid-cols-3 gap-8">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-800 hidden md:block" aria-hidden="true"></div>
                             <div className="relative flex flex-col items-center text-center">
                                <div className="absolute -top-12 flex items-center justify-center w-16 h-16 bg-neutral-800 text-green-400 font-bold text-2xl rounded-full border-4 border-black">1</div>
                                <h3 className="text-xl font-bold mt-8 mb-2">Input Your Script</h3>
                                <p className="text-neutral-400">Paste your story or generate one with AI. Tumdah's engine analyzes the narrative structure.</p>
                            </div>
                            <div className="relative flex flex-col items-center text-center">
                                 <div className="absolute -top-12 flex items-center justify-center w-16 h-16 bg-neutral-800 text-green-400 font-bold text-2xl rounded-full border-4 border-black">2</div>
                                <h3 className="text-xl font-bold mt-8 mb-2">Define Your Vision</h3>
                                <p className="text-neutral-400">Set the visual style, define character looks, and refine the AI's cinematographic choices.</p>
                            </div>
                            <div className="relative flex flex-col items-center text-center">
                                 <div className="absolute -top-12 flex items-center justify-center w-16 h-16 bg-neutral-800 text-green-400 font-bold text-2xl rounded-full border-4 border-black">3</div>
                                <h3 className="text-xl font-bold mt-8 mb-2">Generate Your Storyboard</h3>
                                <p className="text-neutral-400">Instantly generate every shot for your entire script. Regenerate, edit, and export with one click.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Pricing Tiers */}
                <section id="pricing" className="py-20 sm:py-32 px-4">
                     <div className="max-w-6xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">Pricing That Scales With You</h2>
                            <p className="text-neutral-400 mb-16">Start for free, then upgrade as your creative needs grow. No hidden fees.</p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8 items-center">
                            {/* Tier 1: Free */}
                             <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl h-full flex flex-col">
                                <h3 className="text-2xl font-bold">Hobbyist</h3>
                                <p className="text-neutral-400 my-4">For individuals and students exploring ideas.</p>
                                <p className="text-5xl font-extrabold my-4">$0<span className="text-lg font-medium text-neutral-500">/mo</span></p>
                                <Button onClick={() => onNavigate('dashboard')} variant="outline" className="w-full">Get Started</Button>
                                <ul className="space-y-4 mt-8 text-neutral-300">
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> 1 Project</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> 50 Image Generations/mo</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> Standard Image Quality</li>
                                </ul>
                            </div>
                             {/* Tier 2: Pro (Featured) */}
                            <div className="bg-neutral-800 border-2 border-green-500 p-8 rounded-3xl h-full flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-green-500 text-black font-semibold text-xs px-4 py-1.5 transform translate-x-1/3 -translate-y-1/2 rotate-45">POPULAR</div>
                                <h3 className="text-2xl font-bold">Pro</h3>
                                <p className="text-neutral-400 my-4">For freelancers and small teams taking it to the next level.</p>
                                <p className="text-5xl font-extrabold my-4">$49<span className="text-lg font-medium text-neutral-500">/mo</span></p>
                                <Button onClick={() => onNavigate('dashboard')} variant="primary" className="w-full">Choose Pro</Button>
                                <ul className="space-y-4 mt-8 text-neutral-300">
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> Unlimited Projects</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> 1,000 Image Generations/mo</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> Production Quality Images</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> Character Consistency Tool</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> Priority Support</li>
                                </ul>
                            </div>
                            {/* Tier 3: Enterprise */}
                            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl h-full flex flex-col">
                                <h3 className="text-2xl font-bold">Enterprise</h3>
                                <p className="text-neutral-400 my-4">For studios and large teams requiring advanced features.</p>
                                <p className="text-5xl font-extrabold my-4">Custom</p>
                                <Button onClick={() => alert('Contacting sales!')} variant="outline" className="w-full">Contact Sales</Button>
                                 <ul className="space-y-4 mt-8 text-neutral-300">
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> Everything in Pro, plus:</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> Custom Generation Models</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> Team Collaboration Tools</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-green-500 h-5 w-5" /> Dedicated Account Manager</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
                
                 {/* Testimonials */}
                <section className="py-20 sm:py-32 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold mb-16">Loved By Creatives Worldwide</h2>
                        </div>
                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
                                <p className="text-neutral-300 mb-6">"Tumdah has revolutionized our pre-production pipeline. What used to take weeks now takes hours. The consistency tool is a game-changer."</p>
                                <div className="flex items-center gap-4">
                                    <img className="w-12 h-12 rounded-full" src="https://placehold.co/100x100/22c55e/000000?text=JS" alt="Jane Smith"/>
                                    <div>
                                        <p className="font-bold">Jane Smith</p>
                                        <p className="text-sm text-neutral-500">Director, Indie Films Co.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
                                <p className="text-neutral-300 mb-6">"As a solo creator, Tumdah is my secret weapon. I can visualize entire sequences with a level of quality I could only dream of before. Absolutely essential."</p>
                                <div className="flex items-center gap-4">
                                     <img className="w-12 h-12 rounded-full" src="https://placehold.co/100x100/eab308/000000?text=MA" alt="Marcus Aurelius"/>
                                     <div>
                                        <p className="font-bold">Marcus Aurelius</p>
                                        <p className="text-sm text-neutral-500">YouTuber & Filmmaker</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
                                <p className="text-neutral-300 mb-6">"The speed of ideation is insane. We can present clients with multiple, fully-realized visual directions in a single meeting. Tumdah paid for itself on day one."</p>
                                 <div className="flex items-center gap-4">
                                     <img className="w-12 h-12 rounded-full" src="https://placehold.co/100x100/3b82f6/000000?text=EC" alt="Emily Carter"/>
                                    <div>
                                        <p className="font-bold">Emily Carter</p>
                                        <p className="text-sm text-neutral-500">Creative Director, Ad Agency</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="py-20 sm:py-32 px-4">
                    <div className="max-w-3xl mx-auto">
                         <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
                         <AccordionItem title="Can I maintain a consistent character across multiple images?">
                            Yes! Our Pro and Enterprise plans include our advanced Character Consistency tool. You upload a reference photo, and our AI ensures the character's facial features and identity are preserved across all generated shots.
                        </AccordionItem>
                        <AccordionItem title="What happens if I run out of image generations?">
                            If you're on a monthly plan, you can purchase additional generation credits, or upgrade to a higher tier. Your credits reset at the start of each billing cycle.
                        </AccordionItem>
                        <AccordionItem title="Can I use the generated images for commercial projects?">
                            Absolutely. You own the rights to all images you generate on any of our paid plans. You are free to use them for any commercial purpose.
                        </AccordionItem>
                         <AccordionItem title="Do you offer a free trial for paid plans?">
                            We don't offer a traditional free trial, but our Hobbyist plan is completely free and allows you to test out the core features of Tumdah with a generous number of monthly image generations.
                        </AccordionItem>
                    </div>
                </section>

                {/* Final CTA */}
                <section ref={ctaRef} className={`py-20 sm:py-32 px-4 ${ctaAnimationClass}`}>
                    <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 p-12 rounded-3xl">
                        <h2 className="text-4xl font-bold mb-4">Ready to Create at the Speed of Thought?</h2>
                        <p className="text-neutral-400 mb-8">Stop imagining and start creating. Build your first storyboard in minutes.</p>
                        <Button onClick={() => onNavigate('dashboard')} size="lg">Get Started For Free</Button>
                    </div>
                </section>
            </main>
            <footer className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-8">
                     <div className="col-span-2">
                        <h3 className="text-xl font-bold mb-2">Tumdah</h3>
                        <p className="text-neutral-400">The future of visuals, generated instantly.</p>
                     </div>
                     <div>
                         <h4 className="font-semibold mb-3">Product</h4>
                         <ul className="space-y-2 text-neutral-400">
                             <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                             <li><a href="#" className="hover:text-white">Features</a></li>
                             <li><a href="#" className="hover:text-white">Updates</a></li>
                         </ul>
                     </div>
                     <div>
                         <h4 className="font-semibold mb-3">Company</h4>
                         <ul className="space-y-2 text-neutral-400">
                             <li><a href="#" className="hover:text-white">About</a></li>
                             <li><a href="#" className="hover:text-white">Careers</a></li>
                             <li><a href="#" className="hover:text-white">Contact</a></li>
                         </ul>
                     </div>
                     <div>
                         <h4 className="font-semibold mb-3">Resources</h4>
                         <ul className="space-y-2 text-neutral-400">
                             <li><a href="#" className="hover:text-white">Blog</a></li>
                             <li><a href="#" className="hover:text-white">Tutorials</a></li>
                             <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                         </ul>
                     </div>
                     <div>
                         <h4 className="font-semibold mb-3">Legal</h4>
                         <ul className="space-y-2 text-neutral-400">
                             <li><a href="#" className="hover:text-white">Privacy</a></li>
                             <li><a href="#" className="hover:text-white">Terms</a></li>
                         </ul>
                     </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center border-t border-neutral-800 pt-8">
                    <p className="text-neutral-500">&copy; {new Date().getFullYear()} Tumdah, Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const CreativeSuite = ({ onNavigate }) => {
    const [activeTool, setActiveTool] = useState('images');

    return (
        <Page className="p-0 sm:p-0">
             <div className="flex h-screen bg-black">
                <nav className="w-20 bg-neutral-900/50 border-r border-neutral-800 p-4 flex flex-col items-center justify-between">
                    <div>
                         <h1 className="text-2xl font-bold cursor-pointer tracking-tighter mb-12" onClick={() => onNavigate('/')}>T</h1>
                        <div className="space-y-4">
                            <button title="Storyboard Builder" onClick={() => setActiveTool('storyboard')} className={`p-3 rounded-lg ${activeTool === 'storyboard' ? 'bg-green-500 text-black' : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'}`}><Film/></button>
                            <button title="Image Studio" onClick={() => setActiveTool('images')} className={`p-3 rounded-lg ${activeTool === 'images' ? 'bg-green-500 text-black' : 'text-neutral-500 hover:bg-neutral-800 hover:text-white'}`}><ImageIcon/></button>
                        </div>
                    </div>
                    <button title="Settings" className="p-3 rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-white"><Settings/></button>
                </nav>
                <div className="flex-1 overflow-y-auto">
                    {activeTool === 'storyboard' && <StoryboardPage onNavigate={onNavigate}/>}
                    {activeTool === 'images' && <GenerateImagesPage onNavigate={onNavigate}/>}
                </div>
            </div>
        </Page>
    );
};

const GenerateImagesPage = ({ onNavigate }) => {
    const [mode, setMode] = useState('human'); // 'human' or 'product'

    // --- Human Mode State ---
    const [refImage, setRefImage] = useState(null);
    const [userFace, setUserFace] = useState(null);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [humanLoading, setHumanLoading] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState(null);

    // --- Product Mode State ---
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


    const handleGenerate = () => generateAndSetImages();
    const handleRegenerate = () => generateAndSetImages();
    
    const handleDownloadImage = (imageUrl, index) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `generated-image-${index + 1}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <header className="mb-8">
                <h2 className="text-3xl font-bold">Image Studio</h2>
                <p className="text-neutral-400">Generate production-quality visuals for characters or products.</p>
                <div className="mt-6 flex justify-center p-1 bg-neutral-900 rounded-lg space-x-1 max-w-md mx-auto">
                    <button onClick={() => setMode('human')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-1/2 flex items-center justify-center gap-2 ${mode === 'human' ? 'bg-green-500 text-black' : 'text-neutral-400 hover:bg-neutral-800'}`}>
                        <User size={16} /> Human Photography
                    </button>
                    <button onClick={() => setMode('product')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-1/2 flex items-center justify-center gap-2 ${mode === 'product' ? 'bg-green-500 text-black' : 'text-neutral-400 hover:bg-neutral-800'}`}>
                        <Package size={16} /> Product Photography
                    </button>
                </div>
            </header>

            {mode === 'human' && (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1 flex flex-col gap-6">
                        <Uploader label="1. Upload Style Reference" onUpload={setRefImage} imageUrl={refImage} />
                        <Uploader label="2. Upload Character Photo" onUpload={setUserFace} imageUrl={userFace} />
                        <Button onClick={handleGenerate} className="w-full mt-auto" disabled={humanLoading} size="lg">
                            {humanLoading ? <LoadingSpinner/> : <> <Sparkles className="h-5 w-5 -ml-2"/> Generate Images </>}
                        </Button>
                    </aside>
                    <main className="lg:col-span-3">
                         <div className="grid grid-cols-2 gap-6 h-full">
                            {humanLoading && [...Array(4)].map((_, i) => <div key={i} className="aspect-video bg-neutral-900 rounded-2xl flex items-center justify-center"><LoadingSpinner/></div>)}
                            
                            {!humanLoading && generatedImages.length > 0 && generatedImages.map((src, index) => (
                                <div key={index} className="relative group cursor-pointer" onClick={() => setFullscreenImage(src)}>
                                    <img src={src} alt={`Generated ${index + 1}`} className="w-full h-full object-cover rounded-2xl aspect-video" />
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setFullscreenImage(src); }}><ZoomIn className="h-5 w-5"/></Button>
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownloadImage(src, index); }}><Download className="h-5 w-5"/></Button>
                                    </div>
                                </div>
                            ))}

                            {!humanLoading && generatedImages.length === 0 && (
                                <div className="col-span-2 aspect-video bg-neutral-900 rounded-2xl flex flex-col items-center justify-center text-neutral-700">
                                    <ImageIcon className="h-24 w-24 mb-4"/>
                                    <p className="text-xl">Your generated images will appear here</p>
                                </div>
                            )}
                        </div>
                         {generatedImages.length > 0 && !humanLoading && (
                            <div className="flex justify-center mt-6">
                                <Button onClick={handleRegenerate} disabled={humanLoading} variant="secondary">Regenerate All</Button>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {mode === 'product' && (
                 <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1 flex flex-col gap-6">
                        <Uploader label="1. Upload Style Reference" onUpload={setProductStyleRef} imageUrl={productStyleRef} />
                        <Uploader label="2. Upload Product Photo" onUpload={setProductPhoto} imageUrl={productPhoto} />
                        <Button onClick={generateAndSetProductImages} className="w-full mt-auto" disabled={productLoading} size="lg">
                            {productLoading ? <LoadingSpinner/> : <> <Sparkles className="h-5 w-5 -ml-2"/> Generate Shots </>}
                        </Button>
                    </aside>
                    <main className="lg:col-span-3">
                         <div className="grid grid-cols-2 gap-6 h-full">
                            {productLoading && [...Array(4)].map((_, i) => <div key={i} className="aspect-video bg-neutral-900 rounded-2xl flex items-center justify-center"><LoadingSpinner/></div>)}
                            
                            {!productLoading && generatedProductImages.length > 0 && generatedProductImages.map((src, index) => (
                                <div key={index} className="relative group cursor-pointer" onClick={() => setFullscreenImage(src)}>
                                    <img src={src} alt={`Generated Product Shot ${index + 1}`} className="w-full h-full object-cover rounded-2xl aspect-video" />
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setFullscreenImage(src); }}><ZoomIn className="h-5 w-5"/></Button>
                                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownloadImage(src, index); }}><Download className="h-5 w-5"/></Button>
                                    </div>
                                </div>
                            ))}

                            {!productLoading && generatedProductImages.length === 0 && (
                                <div className="col-span-2 aspect-video bg-neutral-900 rounded-2xl flex flex-col items-center justify-center text-neutral-700">
                                    <Package className="h-24 w-24 mb-4"/>
                                    <p className="text-xl">Your generated product shots will appear here</p>
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

            {fullscreenImage && createPortal(<div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setFullscreenImage(null)}><img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" /></div>, document.body)}
        </div>
    );
};


const ShotCardV2 = ({ scene, shot, shotId, generationState, onRegenerate, onShotUpdate }) => {
    const { isLoading, url } = generationState || { isLoading: false, url: null };

    const shotTypes = ["Extreme Close-Up", "Close-Up", "Medium Shot", "Cowboy Shot", "Full Shot", "Wide Shot", "Establishing Shot", "Over-the-Shoulder"];
    const lensChoices = ["14mm Ultra-Wide", "24mm Wide-Angle", "35mm Wide", "50mm Standard", "85mm Prime", "135mm Telephoto"];
    const cameraMovements = ["Static", "Pan", "Tilt", "Dolly In", "Dolly Out", "Crane Shot", "Handheld", "Steadicam"];

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="w-full aspect-video bg-neutral-800 flex items-center justify-center relative group">
                {isLoading ? <LoadingSpinner /> : (url ? <img src={url} alt={shot.shot_type} className="w-full h-full object-cover" /> : <div className="text-neutral-700"><Camera size={48}/></div>)}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" onClick={() => onRegenerate(shotId, scene, shot)} disabled={isLoading} className="text-xs py-2 px-3">
                        {isLoading ? <LoadingSpinner className="h-4 w-4"/> : "Regenerate"}
                    </Button>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <p className="text-neutral-400 text-sm mb-4 flex-grow">{shot.caption}</p>
                <div className="space-y-3 text-sm border-t border-neutral-800 pt-3 mt-3">
                    <div className="grid grid-cols-3 items-center gap-2">
                        <label className="text-neutral-500 font-medium col-span-1">Shot</label>
                        <select value={shot.shot_type} onChange={(e) => onShotUpdate(shotId, { ...shot, shot_type: e.target.value })} className="bg-neutral-800 rounded px-2 py-1 col-span-2 outline-none focus:ring-1 focus:ring-green-500">
                            {shotTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                         <label className="text-neutral-500 font-medium col-span-1">Lens</label>
                        <select value={shot.lens_choice} onChange={(e) => onShotUpdate(shotId, { ...shot, lens_choice: e.target.value })} className="bg-neutral-800 rounded px-2 py-1 col-span-2 outline-none focus:ring-1 focus:ring-green-500">
                            {lensChoices.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                        <label className="text-neutral-500 font-medium col-span-1">Move</label>
                        <select value={shot.camera_movement} onChange={(e) => onShotUpdate(shotId, { ...shot, camera_movement: e.target.value })} className="bg-neutral-800 rounded px-2 py-1 col-span-2 outline-none focus:ring-1 focus:ring-green-500">
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
    const [workflowStage, setWorkflowStage] = useState('script'); // 'script', 'blueprint', 'board'
    const [loading, setLoading] = useState(false);
    const [isGeneratingShots, setIsGeneratingShots] = useState(false);
    const [shotGenerationState, setShotGenerationState] = useState({});
    
    // Blueprint State
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
        // Find the original shot in storyboardData and update it
        const newData = JSON.parse(JSON.stringify(storyboardData)); // Deep copy
        let found = false;
        for (const scene of newData.scenes) {
            for (const beat of scene.beats) {
                const shotIndex = beat.shot_recommendations.findIndex(shot => shot.caption === updatedShot.caption); // Simple check
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

    // Render Logic
    if (workflowStage === 'script') {
        return (
            <div className="p-8 h-full flex flex-col max-w-3xl mx-auto my-auto text-center">
                <header className="mb-12">
                    <h2 className="text-3xl font-bold">Storyboard Builder: Step 1</h2>
                    <p className="text-neutral-400">From script to screen. Paste your story to begin creating your cinematic blueprint.</p>
                </header>
                <textarea className="w-full h-80 bg-neutral-900 border border-neutral-800 text-white rounded-2xl p-4 focus:ring-2 focus:ring-green-500 outline-none" value={story} onChange={(e) => setStory(e.target.value)} placeholder="A lone astronaut..."></textarea>
                <div className="flex justify-center mt-6 space-x-4">
                    <Button onClick={handleParseStory} disabled={loading || story.trim() === ""}>Analyze Script</Button>
                    <Button onClick={handleGenerateStory} disabled={loading} variant="secondary">Generate a Story</Button>
                </div>
            </div>
        );
    }
    
    if (workflowStage === 'blueprint') {
        return (
            <div className="p-8 h-full flex flex-col max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <h2 className="text-3xl font-bold">Storyboard Builder: Step 2</h2>
                    <p className="text-neutral-400">Define the Cinematic DNA. Refine your visual style and characters before generating the board.</p>
                </header>
                <div className="space-y-8">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                        <h3 className="text-xl font-semibold mb-3">Visual Style</h3>
                        <p className="text-sm text-neutral-500 mb-3">Describe the overall look and feel. Mention genre, mood, color, film stock, etc.</p>
                        <input type="text" value={visualStyle} onChange={e => setVisualStyle(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                        <h3 className="text-xl font-semibold mb-3">Character Profiles</h3>
                        <div className="space-y-4">
                            {Object.values(characterProfiles).map(char => (
                                <div key={char.name}>
                                    <label className="font-bold">{char.name}</label>
                                    <textarea value={char.detailed_description} onChange={e => handleCharacterUpdate(char.name, e.target.value)} rows="3" className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-green-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-center gap-4">
                     <Button onClick={() => setWorkflowStage('script')} variant="secondary"><ArrowLeft className="h-5 w-5 mr-2" /> Back to Script</Button>
                     <Button onClick={handleFinalizeBlueprint} size="lg">Build Storyboard <ArrowRight className="h-5 w-5 ml-2" /></Button>
                </div>
            </div>
        )
    }

    if (workflowStage === 'board') {
        return (
            <div className="p-8 h-full">
                <main className="overflow-y-auto">
                     {storyboardData.scenes && storyboardData.scenes.map((scene, sceneIndex) => (
                        <div key={sceneIndex} className="mb-16">
                            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-8 sticky top-0 z-10 backdrop-blur-sm">
                              <h2 className="text-2xl font-bold mb-2">Scene {sceneIndex + 1}: {scene.scene_title}</h2>
                              <p className="text-neutral-400 mb-2"><strong>Location:</strong> {scene.location}</p>
                              <div className="text-sm text-neutral-500 border-t border-neutral-800 pt-3 mt-3 space-y-1">
                                  <p><strong>Mood:</strong> {scene.mood}</p>
                                  <p><strong>Lighting:</strong> {scene.lighting_setup}</p>
                                  <p><strong>Palette:</strong> {scene.color_palette}</p>
                              </div>
                            </div>
                            {scene.beats && scene.beats.map((beat, beatIndex) => (
                              <div key={beatIndex} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-green-400 pl-4">{beat.beat_title}</h3>
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
            <div className="bg-black font-sans antialiased text-white">
                {renderPage()}
            </div>
        </AppContext.Provider>
    );
};

export default App;

