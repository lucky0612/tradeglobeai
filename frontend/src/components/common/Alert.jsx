import React from 'react';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';

const alertVariants = cva(
    'relative w-full rounded-lg border p-4',
    {
        variants: {
            variant: {
                default: 'bg-white text-gray-900 border-gray-200',
                destructive: 'border-red-500 text-red-900 bg-red-50',
                success: 'border-green-500 text-green-900 bg-green-50',
                warning: 'border-yellow-500 text-yellow-900 bg-yellow-50',
                info: 'border-blue-500 text-blue-900 bg-blue-50',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const Alert = React.forwardRef(({
    className,
    variant,
    title,
    children,
    onDismiss,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            role="alert"
            className={alertVariants({ variant, className })}
            {...props}
        >
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute right-2 top-2 rounded-md p-1 hover:bg-gray-100"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
            {title && (
                <div className="mb-1 font-medium leading-none tracking-tight">
                    {title}
                </div>
            )}
            {children && (
                <div className="text-sm opacity-90">
                    {children}
                </div>
            )}
        </div>
    );
});

Alert.displayName = 'Alert';

export default Alert;