import React, { useState } from 'react';
import { Film, Image as ImageIcon, Settings } from 'lucide-react';
import { StoryboardPage } from './StoryboardPage';
import { GenerateImagesPage } from './GenerateImagesPage';

export const CreativeSuite = ({ onNavigate }) => {
    const [activeTool, setActiveTool] = useState('images');

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans p-0 sm:p-0 bg-gray-50">
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
        </div>
    );
};
