import React from 'react';
import { cva } from 'class-variance-authority';

const tabsVariants = cva(
    'inline-flex items-center px-1 py-1 border-b-2 text-sm font-medium',
    {
        variants: {
            variant: {
                default: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                active: 'border-indigo-500 text-indigo-600',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const Tabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={tabsVariants({
                                variant: activeTab === tab.id ? 'active' : 'default',
                            })}
                        >
                            {tab.icon && <tab.icon className="h-5 w-5 mr-2" />}
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default Tabs;