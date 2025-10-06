import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, CircleCheck as CheckCircle, ChevronDown, Zap, Layers, Globe, Bot, PenTool, Film, Play, Star } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';

const useScrollAnimation = (threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold });
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, [threshold]);
    return [ref, `transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`];
};

const FeatureCard = ({ icon, title, children }) => {
    const [ref, animationClass] = useScrollAnimation();
    return (
        <div ref={ref} className={`group relative bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 hover:shadow-xl hover:border-primary-300 transition-all duration-300 hover:-translate-y-2 ${animationClass}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-5 text-white shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">{title}</h3>
                <p className="text-neutral-600 leading-relaxed">{children}</p>
            </div>
        </div>
    );
};

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-neutral-200 last:border-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-6 hover:text-primary-600 transition-colors text-neutral-900 group">
                <span className="text-lg font-semibold">{title}</span>
                <ChevronDown className={`transform transition-all duration-300 ${isOpen ? 'rotate-180 text-primary-600' : 'text-neutral-400'} group-hover:text-primary-600`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mb-6' : 'max-h-0'}`}>
                <p className="text-neutral-600 leading-relaxed">{children}</p>
            </div>
        </div>
    );
};

export const LandingPage = ({ onNavigate }) => {
    const [ctaRef, ctaAnimationClass] = useScrollAnimation();
    const partnerLogos = ['OpenAI', 'Google', 'Anthropic', 'Microsoft', 'Meta', 'Amazon'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
            <Header onGoHome={() => onNavigate('/')} onNavigate={onNavigate} />

            <main>
                <section className="relative px-4 pt-24 pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.08),transparent_50%)] pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />

                    <div className="max-w-7xl mx-auto text-center relative">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-full mb-8 shadow-sm hover:shadow-md transition-shadow">
                            <Sparkles className="h-4 w-4 text-primary-600" />
                            <span className="text-sm font-semibold text-neutral-700">Powered by Google AI Studio</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-tight">
                            <span className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 bg-clip-text text-transparent">
                                Create Stunning
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
                                Visuals with AI
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                            Transform your creative vision into production-ready storyboards and studio-quality images in minutes, not days
                        </p>

                        <div className="flex justify-center gap-4 flex-wrap mb-20">
                            <Button onClick={() => onNavigate('dashboard')} size="lg" className="shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/30 group">
                                <span>Start Creating Free</span>
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button variant="outline" size="lg" className="group">
                                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                <span>Watch Demo</span>
                            </Button>
                        </div>

                        <div className="relative max-w-6xl mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none z-10" />
                            <div className="rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 bg-white p-3">
                                <img
                                    src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1400&h=700&fit=crop&q=80"
                                    alt="Product Screenshot"
                                    className="rounded-2xl w-full"
                                />
                            </div>
                        </div>

                        <div className="mt-24 grid grid-cols-3 gap-12 max-w-3xl mx-auto">
                            <div className="text-center group">
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary-600 to-primary-500 bg-clip-text text-transparent mb-2">50K+</div>
                                <div className="text-sm text-neutral-600 font-medium">Active Creators</div>
                            </div>
                            <div className="text-center group">
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-accent-600 to-accent-500 bg-clip-text text-transparent mb-2">2M+</div>
                                <div className="text-sm text-neutral-600 font-medium">Images Generated</div>
                            </div>
                            <div className="text-center group">
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary-600 to-accent-600 bg-clip-text text-transparent mb-2">99.9%</div>
                                <div className="text-sm text-neutral-600 font-medium">Uptime</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16 bg-white border-y border-neutral-200">
                    <p className="text-center text-neutral-500 mb-10 tracking-wider text-xs font-bold uppercase">Trusted by Leading Organizations</p>
                    <div className="max-w-6xl mx-auto flex justify-center items-center gap-x-16 gap-y-6 flex-wrap px-4">
                        {partnerLogos.map(logo => (
                            <span key={logo} className="text-neutral-400 font-bold text-2xl opacity-70 hover:opacity-100 hover:text-neutral-700 transition-all cursor-pointer">{logo}</span>
                        ))}
                    </div>
                </section>

                <section id="features" className="py-32 px-4 bg-gradient-to-b from-white to-neutral-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <div className="inline-block mb-4">
                                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">FEATURES</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-neutral-900">Everything You Need</h2>
                            <p className="text-neutral-600 text-xl">Powerful features designed for modern creative workflows</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard icon={<Zap size={28} />} title="Lightning Fast">
                                Generate production-quality visuals in seconds. No more waiting for renders or expensive photoshoots.
                            </FeatureCard>
                            <FeatureCard icon={<Layers size={28} />} title="Perfect Consistency">
                                Maintain character appearance and style across hundreds of shots with AI-powered consistency.
                            </FeatureCard>
                            <FeatureCard icon={<Globe size={28} />} title="AI Intelligence">
                                Advanced AI understands your creative vision and brings it to life with photorealistic precision.
                            </FeatureCard>
                            <FeatureCard icon={<Bot size={28} />} title="Smart Storyboarding">
                                Automatically break down scripts into scenes, beats, and cinematographic shots.
                            </FeatureCard>
                            <FeatureCard icon={<PenTool size={28} />} title="Full Control">
                                Fine-tune every aspect from camera angles to lighting with professional-grade controls.
                            </FeatureCard>
                            <FeatureCard icon={<Film size={28} />} title="Export Ready">
                                Download high-resolution images ready for presentations or production use.
                            </FeatureCard>
                        </div>
                    </div>
                </section>

                <section className="py-32 px-4 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <div className="inline-block mb-4">
                                <span className="px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-bold">HOW IT WORKS</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-neutral-900">From Concept to Creation</h2>
                            <p className="text-neutral-600 text-xl">Three simple steps to stunning visuals</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                {
                                    step: '01',
                                    title: 'Input Your Vision',
                                    description: 'Write your script or use AI to generate one. Our platform analyzes the narrative structure automatically.',
                                    gradient: 'from-primary-500 to-primary-600'
                                },
                                {
                                    step: '02',
                                    title: 'Define Your Style',
                                    description: 'Set visual parameters, character details, and cinematographic preferences with precision controls.',
                                    gradient: 'from-accent-500 to-accent-600'
                                },
                                {
                                    step: '03',
                                    title: 'Generate & Export',
                                    description: 'Create your entire storyboard instantly. Refine individual shots and export high-resolution images.',
                                    gradient: 'from-primary-600 to-accent-500'
                                }
                            ].map((item, index) => (
                                <div key={index} className="relative text-center group">
                                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${item.gradient} text-white font-bold text-3xl rounded-2xl mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                                        {item.step}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-neutral-900">{item.title}</h3>
                                    <p className="text-neutral-600 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="pricing" className="py-32 px-4 bg-gradient-to-b from-neutral-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <div className="inline-block mb-4">
                                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">PRICING</span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-neutral-900">Simple Pricing</h2>
                            <p className="text-neutral-600 text-xl">Start free, scale as you grow</p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="bg-white border-2 border-neutral-200 p-10 rounded-3xl flex flex-col hover:shadow-2xl hover:border-primary-300 transition-all duration-300">
                                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Starter</h3>
                                <p className="text-neutral-600 mb-6">Perfect for exploring</p>
                                <div className="mb-8">
                                    <span className="text-6xl font-bold text-neutral-900">$0</span>
                                    <span className="text-neutral-500 text-lg">/month</span>
                                </div>
                                <Button onClick={() => onNavigate('dashboard')} variant="outline" className="w-full mb-8">
                                    Get Started
                                </Button>
                                <ul className="space-y-4 text-neutral-700">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-500 h-6 w-6 flex-shrink-0 mt-0.5" />
                                        <span>1 Active Project</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-500 h-6 w-6 flex-shrink-0 mt-0.5" />
                                        <span>50 Image Generations/mo</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-500 h-6 w-6 flex-shrink-0 mt-0.5" />
                                        <span>Standard Quality (1280x720)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-500 h-6 w-6 flex-shrink-0 mt-0.5" />
                                        <span>Community Support</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 p-10 rounded-3xl flex flex-col shadow-2xl transform hover:scale-105 transition-transform duration-300">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-neutral-900 font-bold text-sm rounded-full shadow-lg flex items-center gap-2">
                                    <Star className="h-4 w-4" fill="currentColor" />
                                    MOST POPULAR
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                                <p className="text-primary-50 mb-6">For serious creators</p>
                                <div className="mb-8">
                                    <span className="text-6xl font-bold text-white">$49</span>
                                    <span className="text-primary-100 text-lg">/month</span>
                                </div>
                                <Button onClick={() => onNavigate('dashboard')} className="w-full mb-8 bg-white text-primary-600 hover:bg-primary-50 shadow-xl">
                                    Start 14-Day Trial
                                </Button>
                                <ul className="space-y-4 text-white">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" fill="white" />
                                        <span>Unlimited Projects</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" fill="white" />
                                        <span>1,000 Generations/mo</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" fill="white" />
                                        <span>HD Quality (1920x1080)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" fill="white" />
                                        <span>Character Consistency</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" fill="white" />
                                        <span>Priority Support</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white border-2 border-neutral-200 p-10 rounded-3xl flex flex-col hover:shadow-2xl hover:border-primary-300 transition-all duration-300">
                                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Enterprise</h3>
                                <p className="text-neutral-600 mb-6">For studios & teams</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-bold text-neutral-900">Custom</span>
                                </div>
                                <Button onClick={() => alert('Contact sales!')} variant="outline" className="w-full mb-8">
                                    Contact Sales
                                </Button>
                                <ul className="space-y-4 text-neutral-700">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-500 h-6 w-6 flex-shrink-0 mt-0.5" />
                                        <span>Everything in Pro</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-500 h-6 w-6 flex-shrink-0 mt-0.5" />
                                        <span>Unlimited Generations</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-500 h-6 w-6 flex-shrink-0 mt-0.5" />
                                        <span>4K Quality</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-500 h-6 w-6 flex-shrink-0 mt-0.5" />
                                        <span>Custom AI Training</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="text-primary-500 h-6 w-6 flex-shrink-0 mt-0.5" />
                                        <span>Dedicated Support</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-32 px-4 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-5xl font-bold text-neutral-900 mb-6">Loved by Creators</h2>
                            <p className="text-neutral-600 text-xl">See what our community has to say</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    quote: "Tumdah transformed our pre-production workflow. What took weeks now takes hours. The quality is absolutely incredible.",
                                    author: "Jane Smith",
                                    role: "Director, Indie Films Co.",
                                    avatar: "JS",
                                    gradient: "from-primary-500 to-primary-600"
                                },
                                {
                                    quote: "As a solo creator, this is my secret weapon. I can visualize entire sequences with quality I never imagined possible.",
                                    author: "Marcus Chen",
                                    role: "Content Creator",
                                    avatar: "MC",
                                    gradient: "from-accent-500 to-accent-600"
                                },
                                {
                                    quote: "The speed is incredible. We present multiple visual directions to clients in a single meeting. Absolute game changer.",
                                    author: "Emily Carter",
                                    role: "Creative Director",
                                    avatar: "EC",
                                    gradient: "from-primary-600 to-accent-500"
                                }
                            ].map((testimonial, index) => (
                                <div key={index} className="bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="flex mb-4 gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                                        ))}
                                    </div>
                                    <p className="text-neutral-700 mb-6 leading-relaxed">{testimonial.quote}</p>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold shadow-lg`}>
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-900">{testimonial.author}</p>
                                            <p className="text-sm text-neutral-600">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="faq" className="py-32 px-4 bg-gradient-to-b from-neutral-50 to-white">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-block mb-4">
                                <span className="px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-bold">FAQ</span>
                            </div>
                            <h2 className="text-5xl font-bold text-neutral-900 mb-6">Common Questions</h2>
                            <p className="text-neutral-600 text-xl">Everything you need to know</p>
                        </div>
                        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
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
                    </div>
                </section>

                <section ref={ctaRef} className={`py-32 px-4 bg-white ${ctaAnimationClass}`}>
                    <div className="max-w-5xl mx-auto">
                        <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 rounded-3xl p-16 text-center shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
                            <div className="relative">
                                <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">Ready to Create?</h2>
                                <p className="text-primary-50 mb-10 text-xl max-w-2xl mx-auto">Join thousands of creators building the future of visual content</p>
                                <Button
                                    onClick={() => onNavigate('dashboard')}
                                    size="lg"
                                    className="bg-white text-primary-600 hover:bg-primary-50 shadow-2xl hover:scale-105 transition-transform group"
                                >
                                    Start Creating Free
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-neutral-900 border-t border-neutral-800">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-12">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/icon.png" alt="Tumdah" className="h-10 w-10" />
                                <h3 className="text-2xl font-bold text-white">Tumdah</h3>
                            </div>
                            <p className="text-neutral-400 leading-relaxed max-w-sm">AI-powered creative suite for visual storytelling and content creation</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-white">Product</h4>
                            <ul className="space-y-3 text-sm text-neutral-400">
                                <li><a href="#pricing" className="hover:text-primary-400 transition-colors">Pricing</a></li>
                                <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Updates</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-white">Company</h4>
                            <ul className="space-y-3 text-sm text-neutral-400">
                                <li><a href="#" className="hover:text-primary-400 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-white">Resources</h4>
                            <ul className="space-y-3 text-sm text-neutral-400">
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Docs</a></li>
                                <li><a href="#faq" className="hover:text-primary-400 transition-colors">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-white">Legal</h4>
                            <ul className="space-y-3 text-sm text-neutral-400">
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center border-t border-neutral-800 pt-8">
                        <p className="text-neutral-500 text-sm">&copy; {new Date().getFullYear()} Tumdah, Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
