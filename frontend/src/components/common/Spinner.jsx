import React from 'react';

const Spinner = ({ size = 'default', className = '' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
    };

    return (
        <div className={`${className} flex items-center justify-center`}>
            <div
                className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-current border-t-transparent text-indigo-600`}
                role="status"
                aria-label="loading"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};

export default Spinner;
