import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, CircleCheck as CheckCircle, ChevronDown, Zap, Layers, Globe, Bot, PenTool, Film, Play, Star, Shield, TrendingUp, Users } from 'lucide-react';
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

const FeatureCard = ({ icon, title, children, gradient }) => {
    const [ref, animationClass] = useScrollAnimation();
    return (
        <div ref={ref} className={`group relative bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${animationClass}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            <div className="relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl mb-6 text-white shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">{title}</h3>
                <p className="text-neutral-600 leading-relaxed text-[15px]">{children}</p>
            </div>
        </div>
    );
};

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-neutral-100 last:border-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-7 hover:text-blue-600 transition-colors text-neutral-900 group">
                <span className="text-lg font-semibold">{title}</span>
                <ChevronDown className={`transform transition-all duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-neutral-400'} group-hover:text-blue-600`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mb-6' : 'max-h-0'}`}>
                <p className="text-neutral-600 leading-relaxed text-[15px]">{children}</p>
            </div>
        </div>
    );
};

export const LandingPage = ({ onNavigate }) => {
    const [heroRef, heroAnimation] = useScrollAnimation(0.2);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
            <Header onGoHome={() => window.location.reload()} onNavigate={onNavigate} />

            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-emerald-50">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

                <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
                    <div ref={heroRef} className={heroAnimation}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8 shadow-sm">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700">AI-Powered Creative Studio</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-neutral-900 mb-8 leading-[1.1] tracking-tight">
                            Create Stunning
                            <span className="block mt-3 bg-gradient-to-r from-blue-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                Visual Stories
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                            Transform your ideas into professional-grade visuals with AI. Create storyboards, generate images, and bring your creative vision to life in minutes.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                            <Button onClick={() => onNavigate('dashboard')} size="lg" className="px-10 py-5 text-lg shadow-2xl hover:shadow-blue-500/30 transition-all duration-300">
                                Start Creating Free
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                            <Button variant="outline" size="lg" className="px-10 py-5 text-lg border-2">
                                <Play className="w-5 h-5" />
                                Watch Demo
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <span>Free forever plan</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 md:p-16 aspect-video flex items-center justify-center">
                                <div className="text-center">
                                    <Sparkles className="w-20 h-20 text-blue-500 mx-auto mb-4 animate-pulse" />
                                    <p className="text-white text-2xl font-semibold">Your Creative Journey Starts Here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold text-neutral-900 mb-6">Trusted by Creators Worldwide</h2>
                        <p className="text-xl text-neutral-600 max-w-3xl mx-auto">Join thousands of professionals using Tumdah to bring their creative visions to life</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl border border-neutral-100">
                            <div className="text-5xl font-bold text-neutral-900 mb-2">50K+</div>
                            <div className="text-neutral-600 font-medium">Active Users</div>
                        </div>
                        <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl border border-neutral-100">
                            <div className="text-5xl font-bold text-neutral-900 mb-2">2M+</div>
                            <div className="text-neutral-600 font-medium">Images Generated</div>
                        </div>
                        <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl border border-neutral-100">
                            <div className="text-5xl font-bold text-neutral-900 mb-2">99.9%</div>
                            <div className="text-neutral-600 font-medium">Uptime</div>
                        </div>
                        <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl border border-neutral-100">
                            <div className="text-5xl font-bold text-neutral-900 mb-2">4.9★</div>
                            <div className="text-neutral-600 font-medium">User Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="py-24 bg-gradient-to-b from-neutral-50 to-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">Powerful Features</h2>
                        <p className="text-xl text-neutral-600 max-w-3xl mx-auto">Everything you need to create professional visual content</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={<Bot className="w-8 h-8" />} title="AI-Powered Generation" gradient="from-blue-500 to-blue-600">
                            Generate high-quality images using advanced AI models with natural language prompts
                        </FeatureCard>
                        <FeatureCard icon={<Film className="w-8 h-8" />} title="Smart Storyboards" gradient="from-emerald-500 to-emerald-600">
                            Create professional storyboards automatically with scene-by-scene visualization
                        </FeatureCard>
                        <FeatureCard icon={<PenTool className="w-8 h-8" />} title="Style Transfer" gradient="from-violet-500 to-violet-600">
                            Apply artistic styles from reference images to create unique visual aesthetics
                        </FeatureCard>
                        <FeatureCard icon={<Layers className="w-8 h-8" />} title="Batch Processing" gradient="from-orange-500 to-orange-600">
                            Generate multiple variations simultaneously to explore creative possibilities
                        </FeatureCard>
                        <FeatureCard icon={<Shield className="w-8 h-8" />} title="Enterprise Security" gradient="from-pink-500 to-pink-600">
                            Bank-level encryption and security for your creative assets and data
                        </FeatureCard>
                        <FeatureCard icon={<Globe className="w-8 h-8" />} title="Cloud Integration" gradient="from-cyan-500 to-cyan-600">
                            Access your work anywhere with seamless cloud synchronization
                        </FeatureCard>
                    </div>
                </div>
            </section>

            <section id="pricing" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">Simple, Transparent Pricing</h2>
                        <p className="text-xl text-neutral-600 max-w-3xl mx-auto">Choose the plan that works for you</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-3xl p-10 border-2 border-neutral-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                            <h3 className="text-2xl font-bold mb-2 text-neutral-900">Starter</h3>
                            <p className="text-neutral-600 mb-6">Perfect for individuals</p>
                            <div className="mb-8">
                                <span className="text-5xl font-bold text-neutral-900">$0</span>
                                <span className="text-neutral-600">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-neutral-700">50 image generations/month</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-neutral-700">Basic storyboards</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-neutral-700">Community support</span>
                                </li>
                            </ul>
                            <Button variant="outline" className="w-full py-4 border-2">Get Started</Button>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-emerald-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300">
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full text-sm font-semibold">Most Popular</div>
                            <h3 className="text-2xl font-bold mb-2">Professional</h3>
                            <p className="text-blue-100 mb-6">For creators and teams</p>
                            <div className="mb-8">
                                <span className="text-5xl font-bold">$29</span>
                                <span className="text-blue-100">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                                    <span>Unlimited image generations</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                                    <span>Advanced storyboards</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                                    <span>Priority support</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                                    <span>Custom style training</span>
                                </li>
                            </ul>
                            <Button className="w-full py-4 bg-white text-blue-600 hover:bg-blue-50">Start Free Trial</Button>
                        </div>

                        <div className="bg-white rounded-3xl p-10 border-2 border-neutral-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                            <h3 className="text-2xl font-bold mb-2 text-neutral-900">Enterprise</h3>
                            <p className="text-neutral-600 mb-6">For large organizations</p>
                            <div className="mb-8">
                                <span className="text-5xl font-bold text-neutral-900">Custom</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-neutral-700">Everything in Professional</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-neutral-700">Dedicated account manager</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-neutral-700">Custom integrations</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-neutral-700">SLA guarantee</span>
                                </li>
                            </ul>
                            <Button variant="outline" className="w-full py-4 border-2">Contact Sales</Button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="faq" className="py-24 bg-gradient-to-b from-neutral-50 to-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold text-neutral-900 mb-6">Frequently Asked Questions</h2>
                        <p className="text-xl text-neutral-600">Everything you need to know about Tumdah</p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8">
                        <AccordionItem title="What is Tumdah?">
                            Tumdah is an AI-powered creative platform that helps you generate professional-quality images and storyboards using advanced machine learning models. Simply describe what you want, and our AI brings your vision to life.
                        </AccordionItem>
                        <AccordionItem title="How does the AI image generation work?">
                            Our platform uses state-of-the-art AI models from Google to generate images based on your text descriptions. You can also provide reference images for style transfer and character consistency.
                        </AccordionItem>
                        <AccordionItem title="Can I use generated images commercially?">
                            Yes! All images generated with a paid plan come with commercial usage rights. Free plan images are for personal use only. Please review our terms of service for detailed information.
                        </AccordionItem>
                        <AccordionItem title="What file formats are supported?">
                            We support PNG and JPEG formats for both input and output. Generated images are high-resolution and optimized for various use cases including web, print, and social media.
                        </AccordionItem>
                        <AccordionItem title="Is my data secure?">
                            Absolutely. We use enterprise-grade encryption and follow industry best practices to protect your data. Your images and prompts are private and never used to train our models without explicit permission.
                        </AccordionItem>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-gradient-to-br from-blue-600 via-emerald-600 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Ready to Create Something Amazing?</h2>
                    <p className="text-xl text-blue-50 mb-12 max-w-2xl mx-auto">Join thousands of creators who are already using Tumdah to bring their ideas to life</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={() => onNavigate('dashboard')} size="lg" className="px-10 py-5 text-lg bg-white text-blue-600 hover:bg-blue-50">
                            Start Free Today
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" size="lg" className="px-10 py-5 text-lg border-2 border-white text-white hover:bg-white/10">
                            Schedule Demo
                        </Button>
                    </div>
                </div>
            </section>

            <footer className="bg-neutral-900 text-neutral-400 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/icon.png" alt="Tumdah" className="h-8 w-8" />
                                <span className="text-2xl font-bold text-white">Tumdah</span>
                            </div>
                            <p className="text-sm leading-relaxed">AI-powered creative studio for generating stunning visual content</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-neutral-800 text-center text-sm">
                        <p>© 2025 Tumdah. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
