import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {items.map((item, index) => (
                    <li key={item.href}>
                        <div className="flex items-center">
                            {index > 0 && (
                                <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
                            )}
                            {index === items.length - 1 ? (
                                <span className="ml-2 text-sm font-medium text-gray-500">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.href}
                                    className="ml-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;