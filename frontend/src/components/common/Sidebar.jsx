import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    FileText,
    DollarSign,
    TrendingUp,
    Settings,
    AlertTriangle,
} from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/documents', icon: FileText, label: 'Documents' },
        { path: '/drawback', icon: DollarSign, label: 'Duty Drawback' },
        { path: '/rodtep', icon: TrendingUp, label: 'RoDTEP' },
        { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <nav className="mt-8">
                <div className="px-2 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `group flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`
                            }
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;