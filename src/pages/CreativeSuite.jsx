import React, { useState } from 'react';
import { Film, Image as ImageIcon, Settings } from 'lucide-react';
import { StoryboardPage } from './StoryboardPage';
import { GenerateImagesPage } from './GenerateImagesPage';

export const CreativeSuite = ({ onNavigate }) => {
    const [activeTool, setActiveTool] = useState('images');

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
             <div className="flex flex-col md:flex-row h-screen">
                <nav className="md:w-24 bg-white border-b md:border-b-0 md:border-r border-neutral-200 p-3 md:p-6 flex flex-row md:flex-col items-center justify-between shadow-sm">
                    <div className="flex flex-row md:flex-col items-center md:items-start w-full md:w-auto">
                         <h1 className="text-2xl md:text-3xl font-bold cursor-pointer tracking-tight md:mb-16 bg-gradient-to-br from-primary-600 to-accent-600 bg-clip-text text-transparent hover:scale-110 transition-transform" onClick={() => onNavigate('/')}>T</h1>
                        <div className="flex flex-row md:flex-col md:space-y-5 space-x-3 md:space-x-0 ml-auto md:ml-0">
                            <button title="Storyboard Builder" onClick={() => setActiveTool('storyboard')} className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all ${activeTool === 'storyboard' ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl scale-110' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 hover:scale-105'}`}><Film size={20} className="md:w-6 md:h-6"/></button>
                            <button title="Image Studio" onClick={() => setActiveTool('images')} className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all ${activeTool === 'images' ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl scale-110' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 hover:scale-105'}`}><ImageIcon size={20} className="md:w-6 md:h-6"/></button>
                            <button title="Settings" onClick={() => onNavigate('admin')} className="p-3 md:p-4 rounded-xl md:rounded-2xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-all hover:scale-105 md:hidden"><Settings size={20}/></button>
                        </div>
                    </div>
                    <button title="Settings" onClick={() => onNavigate('admin')} className="hidden md:block p-4 rounded-2xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-all hover:scale-105"><Settings size={24}/></button>
                </nav>
                <div className="flex-1 overflow-y-auto bg-gradient-to-br from-neutral-50 to-white">
                    {activeTool === 'storyboard' && <StoryboardPage onNavigate={onNavigate}/>}
                    {activeTool === 'images' && <GenerateImagesPage onNavigate={onNavigate}/>}
                </div>
            </div>
        </div>
    );
};
