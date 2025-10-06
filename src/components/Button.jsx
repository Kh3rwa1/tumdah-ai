import React from 'react';

export const Button = ({ onClick, children, className = '', variant = 'primary', disabled = false, size = 'md' }) => {
    const baseClasses = 'font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white focus:ring-primary-500 shadow-sm hover:shadow-lg active:scale-95',
        secondary: 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900 focus:ring-neutral-400',
        outline: 'bg-transparent border-2 border-neutral-300 hover:border-primary-500 hover:bg-primary-50 text-neutral-700 hover:text-primary-700 focus:ring-primary-500',
        ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900 focus:ring-neutral-400'
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
