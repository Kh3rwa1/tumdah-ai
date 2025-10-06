import React from 'react';
import { Button } from './Button';

export const Header = ({ onGoHome, onNavigate }) => (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-18">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={onGoHome}>
                <img src="/icon.png" alt="Tumdah" className="h-9 w-9" />
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-primary-600 transition-colors">Tumdah</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-10">
                <a href="#features" className="text-neutral-600 hover:text-primary-600 transition-colors text-sm font-semibold">Features</a>
                <a href="#pricing" className="text-neutral-600 hover:text-primary-600 transition-colors text-sm font-semibold">Pricing</a>
                <a href="#faq" className="text-neutral-600 hover:text-primary-600 transition-colors text-sm font-semibold">FAQ</a>
            </nav>
            <div className="flex items-center space-x-3">
                <Button onClick={() => alert('Coming soon!')} variant="ghost" size="sm" className="px-5 py-2.5 text-sm">Login</Button>
                <Button onClick={() => onNavigate('dashboard')} size="sm" className="px-5 py-2.5 text-sm shadow-md">Get Started</Button>
            </div>
        </div>
    </header>
);
