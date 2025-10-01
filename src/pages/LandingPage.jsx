import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, CircleCheck as CheckCircle, ChevronDown, Zap, Layers, Globe, Bot, PenTool, Film } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

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
        <div ref={ref} className={`bg-gray-800/50 border border-gray-700 p-8 rounded-2xl hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 ${animationClass}`}>
            <div className="text-emerald-400 mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-gray-300 leading-relaxed">{children}</p>
        </div>
    );
};

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-5 hover:text-emerald-400 transition-colors text-white">
                <span className="text-lg font-semibold">{title}</span>
                <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-gray-400`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <p className="pb-5 text-gray-300 leading-relaxed">{children}</p>
            </div>
        </div>
    );
};

export const LandingPage = ({ onNavigate }) => {
    const [ctaRef, ctaAnimationClass] = useScrollAnimation();
    const partnerLogos = ['OpenAI', 'Google', 'Anthropic', 'Microsoft', 'Meta', 'Amazon'];

    return (
        <div className="min-h-screen bg-gray-900 overflow-x-hidden">
            <Header onGoHome={() => onNavigate('/')} onNavigate={onNavigate} />
            <main>
                <section className="text-center px-4 pt-20 pb-24 max-w-6xl mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8 text-sm font-medium text-emerald-400">
                            <Sparkles className="h-4 w-4" />
                            <span>Powered by Google AI Studio</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                            <span className="text-white">
                                Create Studio-Quality
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                Visuals in Minutes
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                            Tumdah is the AI-powered creative suite for professionals. Build dynamic storyboards and generate production-quality visuals with unprecedented speed and consistency.
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <Button onClick={() => onNavigate('dashboard')} size="lg" className="shadow-lg shadow-emerald-500/25">
                                <span>Start Creating Free</span>
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button variant="outline" size="lg">
                                <span>Watch Demo</span>
                            </Button>
                        </div>
                        <div className="mt-16 bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
                            <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=600&fit=crop" alt="Product Screenshot" className="rounded-xl shadow-2xl border border-gray-700" />
                        </div>
                        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">50K+</div>
                                <div className="text-sm text-gray-400 mt-1">Active Creators</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">2M+</div>
                                <div className="text-sm text-gray-400 mt-1">Images Generated</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">99.9%</div>
                                <div className="text-sm text-gray-400 mt-1">Uptime</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 bg-gray-800/30 border-y border-gray-700">
                     <p className="text-center text-gray-400 mb-8 tracking-wider text-xs font-semibold uppercase">Trusted by Leading Organizations</p>
                    <div className="max-w-5xl mx-auto flex justify-center items-center gap-x-12 gap-y-4 flex-wrap px-4">
                        {partnerLogos.map(logo => (
                            <span key={logo} className="text-gray-500 font-bold text-xl opacity-60 hover:opacity-100 transition-opacity">{logo}</span>
                        ))}
                    </div>
                </section>

                <section id="features" className="py-24 px-4 bg-gray-900">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Everything You Need to Create</h2>
                            <p className="text-gray-300 text-lg">Powerful features designed for modern creative workflows</p>
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

                <section className="py-24 px-4 bg-gray-800/30">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">How It Works</h2>
                            <p className="text-gray-300 text-lg">From concept to completion in three simple steps</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="relative flex flex-col items-center text-center">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold text-2xl rounded-2xl mb-6 shadow-lg shadow-emerald-500/25">1</div>
                                <h3 className="text-xl font-bold mb-3 text-white">Input Your Vision</h3>
                                <p className="text-gray-300">Write your script or use AI to generate one. Tumdah analyzes the narrative structure automatically.</p>
                            </div>
                            <div className="relative flex flex-col items-center text-center">
                                 <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold text-2xl rounded-2xl mb-6 shadow-lg shadow-emerald-500/25">2</div>
                                <h3 className="text-xl font-bold mb-3 text-white">Define Your Style</h3>
                                <p className="text-gray-300">Set visual parameters, character details, and cinematographic preferences with precision.</p>
                            </div>
                            <div className="relative flex flex-col items-center text-center">
                                 <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold text-2xl rounded-2xl mb-6 shadow-lg shadow-emerald-500/25">3</div>
                                <h3 className="text-xl font-bold mb-3 text-white">Generate & Export</h3>
                                <p className="text-gray-300">Create your entire storyboard instantly. Refine, regenerate, and export high-res images.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="py-24 px-4 bg-gray-900">
                     <div className="max-w-6xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Simple, Transparent Pricing</h2>
                            <p className="text-gray-300 text-lg">Start free, scale as you grow. No surprises.</p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                            <div className="bg-gray-800/50 border-2 border-gray-700 p-8 rounded-2xl flex flex-col hover:shadow-xl hover:shadow-emerald-500/10 transition-all hover:border-emerald-500/50">
                                <h3 className="text-2xl font-bold text-white">Starter</h3>
                                <p className="text-gray-400 my-4">Perfect for exploring and testing ideas</p>
                                <p className="text-5xl font-extrabold my-6 text-white">$0<span className="text-lg font-medium text-gray-400">/mo</span></p>
                                <Button onClick={() => onNavigate('dashboard')} variant="outline" className="w-full">Start Free</Button>
                                <ul className="space-y-4 mt-8 text-gray-300">
                                    <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0" /> 1 Active Project</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0" /> 50 Image Generations/mo</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0" /> Standard Quality (1280x720)</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0" /> Community Support</li>
                                </ul>
                            </div>
                             <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-8 rounded-2xl flex flex-col relative overflow-hidden shadow-2xl shadow-emerald-500/25 transform hover:scale-105 transition-transform">
                                <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 font-bold text-xs px-3 py-1.5 rounded-full">POPULAR</div>
                                <h3 className="text-2xl font-bold text-white">Professional</h3>
                                <p className="text-emerald-50 my-4">For serious creators and teams</p>
                                <p className="text-5xl font-extrabold my-6 text-white">$49<span className="text-lg font-medium text-emerald-50">/mo</span></p>
                                <Button onClick={() => onNavigate('dashboard')} className="w-full bg-white text-emerald-600 hover:bg-gray-100">Start 14-Day Trial</Button>
                                <ul className="space-y-4 mt-8 text-white">
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 flex-shrink-0" /> Unlimited Projects</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 flex-shrink-0" /> 1,000 Image Generations/mo</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 flex-shrink-0" /> HD Quality (1920x1080)</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 flex-shrink-0" /> Character Consistency</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 flex-shrink-0" /> Priority Support</li>
                                </ul>
                            </div>
                            <div className="bg-gray-800/50 border-2 border-gray-700 p-8 rounded-2xl flex flex-col hover:shadow-xl hover:shadow-emerald-500/10 transition-all hover:border-emerald-500/50">
                                <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                                <p className="text-gray-400 my-4">For studios and large organizations</p>
                                <p className="text-5xl font-extrabold my-6 text-white">Custom</p>
                                <Button onClick={() => alert('Contact sales!')} variant="outline" className="w-full">Contact Sales</Button>
                                 <ul className="space-y-4 mt-8 text-gray-300">
                                    <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0" /> Everything in Pro</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0" /> Unlimited Generations</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0" /> 4K Quality</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0" /> Custom AI Training</li>
                                    <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0" /> Dedicated Support</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 px-4 bg-gray-800/30">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-white">Trusted by Creators Worldwide</h2>
                        </div>
                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
                                <p className="text-gray-300 mb-6 leading-relaxed">"Tumdah transformed our pre-production workflow. What took weeks now takes hours. The quality is incredible."</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold">JS</div>
                                    <div>
                                        <p className="font-bold text-white">Jane Smith</p>
                                        <p className="text-sm text-gray-400">Director, Indie Films Co.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
                                <p className="text-gray-300 mb-6 leading-relaxed">"As a solo creator, this is my secret weapon. I can visualize entire sequences with quality I never imagined possible."</p>
                                <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">MA</div>
                                     <div>
                                        <p className="font-bold text-white">Marcus Chen</p>
                                        <p className="text-sm text-gray-400">Content Creator</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
                                <p className="text-gray-300 mb-6 leading-relaxed">"The speed is incredible. We present multiple visual directions to clients in a single meeting. Game changer."</p>
                                 <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white font-bold">EC</div>
                                    <div>
                                        <p className="font-bold text-white">Emily Carter</p>
                                        <p className="text-sm text-gray-400">Creative Director</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faq" className="py-24 px-4 bg-gray-900">
                    <div className="max-w-3xl mx-auto">
                         <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-white">Frequently Asked Questions</h2>
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

                <section ref={ctaRef} className={`py-24 px-4 bg-gray-900 ${ctaAnimationClass}`}>
                    <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-emerald-500 to-teal-500 p-16 rounded-3xl shadow-2xl shadow-emerald-500/25">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Ready to Transform Your Creative Process?</h2>
                        <p className="text-emerald-50 mb-8 text-lg">Join thousands of creators building the future of visual content</p>
                        <Button onClick={() => onNavigate('dashboard')} size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 shadow-lg">
                            Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </section>
            </main>
            <footer className="bg-gray-950 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-8">
                         <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                                <img src="/icon.png" alt="Tumdah" className="h-8 w-8" />
                                <h3 className="text-xl font-bold text-white">Tumdah</h3>
                            </div>
                            <p className="text-gray-400 text-sm">AI-powered creative suite for visual storytelling</p>
                         </div>
                         <div>
                             <h4 className="font-semibold mb-3 text-white">Product</h4>
                             <ul className="space-y-2 text-sm text-gray-400">
                                 <li><a href="#pricing" className="hover:text-emerald-400">Pricing</a></li>
                                 <li><a href="#features" className="hover:text-emerald-400">Features</a></li>
                                 <li><a href="#" className="hover:text-emerald-400">Updates</a></li>
                             </ul>
                         </div>
                         <div>
                             <h4 className="font-semibold mb-3 text-white">Company</h4>
                             <ul className="space-y-2 text-sm text-gray-400">
                                 <li><a href="#" className="hover:text-emerald-400">About</a></li>
                                 <li><a href="#" className="hover:text-emerald-400">Careers</a></li>
                                 <li><a href="#" className="hover:text-emerald-400">Contact</a></li>
                             </ul>
                         </div>
                         <div>
                             <h4 className="font-semibold mb-3 text-white">Resources</h4>
                             <ul className="space-y-2 text-sm text-gray-400">
                                 <li><a href="#" className="hover:text-emerald-400">Blog</a></li>
                                 <li><a href="#" className="hover:text-emerald-400">Docs</a></li>
                                 <li><a href="#faq" className="hover:text-emerald-400">FAQ</a></li>
                             </ul>
                         </div>
                         <div>
                             <h4 className="font-semibold mb-3 text-white">Legal</h4>
                             <ul className="space-y-2 text-sm text-gray-400">
                                 <li><a href="#" className="hover:text-emerald-400">Privacy</a></li>
                                 <li><a href="#" className="hover:text-emerald-400">Terms</a></li>
                             </ul>
                         </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-800 pt-8">
                        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Tumdah, Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
