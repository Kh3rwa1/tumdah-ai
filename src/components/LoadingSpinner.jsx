import React from 'react';

export const LoadingSpinner = ({ className = '' }) => (
    <div className={`flex justify-center items-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-r-transparent"></div>
    </div>
);
