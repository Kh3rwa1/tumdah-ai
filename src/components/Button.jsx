import React from 'react';

export const Button = ({ onClick, children, className = '', variant = 'primary', disabled = false, size = 'md' }) => {
    const baseClasses = 'font-semibold transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-400 border border-gray-300',
        outline: 'bg-transparent border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 focus:ring-gray-400'
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
