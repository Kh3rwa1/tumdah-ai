import React from 'react';

export const Button = ({ onClick, children, className = '', variant = 'primary', disabled = false, size = 'md' }) => {
    const baseClasses = 'font-semibold transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-gradient-to-r from-[#3CB371] to-[#2a9d5f] hover:from-[#329960] hover:to-[#248950] text-white focus:ring-[#3CB371] shadow-sm hover:shadow-md',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-gray-500 border border-gray-600',
        outline: 'bg-transparent border-2 border-gray-600 hover:border-[#3CB371] hover:bg-gray-800 text-gray-200 focus:ring-[#3CB371]'
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
