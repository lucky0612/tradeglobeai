import React from 'react';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    {
        variants: {
            variant: {
                default: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
                destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
                outline: 'bg-transparent border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
                ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500',
                link: 'bg-transparent underline-offset-4 hover:underline text-indigo-600 hover:text-indigo-700',
            },
            size: {
                default: 'h-10 py-2 px-4',
                sm: 'h-9 px-3',
                lg: 'h-11 px-8',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

const Button = React.forwardRef(({
    className,
    variant,
    size,
    children,
    ...props
}, ref) => {
    return (
        <button
            className={buttonVariants({ variant, size, className })}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;