import React from 'react';
import { Button } from './Button';
import { Settings } from 'lucide-react';

export const Header = ({ onGoHome, onNavigate }) => (
    <header className="bg-white/95 backdrop-blur-xl border-b border-neutral-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between py-5">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={onGoHome}>
                <img src="/icon.png" alt="Tumdah" className="h-10 w-10 rounded-xl shadow-md" />
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-blue-600 transition-colors">Tumdah</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-neutral-600 hover:text-blue-600 transition-colors text-sm font-semibold">Features</a>
                <a href="#pricing" className="text-neutral-600 hover:text-blue-600 transition-colors text-sm font-semibold">Pricing</a>
                <a href="#faq" className="text-neutral-600 hover:text-blue-600 transition-colors text-sm font-semibold">FAQ</a>
                <button
                    onClick={() => onNavigate('admin')}
                    className="text-neutral-600 hover:text-blue-600 transition-colors text-sm font-semibold flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 rounded-xl"
                >
                    <Settings className="w-4 h-4" />
                    Admin
                </button>
            </nav>
            <div className="flex items-center space-x-3">
                <Button onClick={() => alert('Coming soon!')} variant="ghost" size="sm" className="px-6 py-3 text-sm">Login</Button>
                <Button onClick={() => onNavigate('dashboard')} size="sm" className="px-6 py-3 text-sm shadow-lg hover:shadow-xl transition-all">Get Started</Button>
            </div>
        </div>
    </header>
);
