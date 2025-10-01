import React from 'react';
import { Button } from './Button';

export const Header = ({ onGoHome, onNavigate }) => (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-900/90 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={onGoHome}>
                <img src="/icon.png" alt="Tumdah" className="h-8 w-8" />
                <h1 className="text-2xl font-bold tracking-tight text-white group-hover:text-[#3CB371] transition-colors">Tumdah</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-300 hover:text-[#3CB371] transition-colors text-sm font-medium">Features</a>
                <a href="#pricing" className="text-gray-300 hover:text-[#3CB371] transition-colors text-sm font-medium">Pricing</a>
                <a href="#faq" className="text-gray-300 hover:text-[#3CB371] transition-colors text-sm font-medium">FAQ</a>
            </nav>
            <div className="flex items-center space-x-3">
                <Button onClick={() => alert('Coming soon!')} variant="secondary" size="sm" className="px-4 py-2 text-sm">Login</Button>
                <Button onClick={() => onNavigate('dashboard')} size="sm" className="px-4 py-2 text-sm">Get Started</Button>
            </div>
        </div>
    </header>
);
