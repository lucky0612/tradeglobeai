import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
    const { user, dispatch } = useAuth();

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-xl font-bold text-indigo-600">
                                TradeGlobe.AI
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button className="p-2 rounded-md text-gray-400 hover:text-gray-500">
                            <Bell className="h-6 w-6" />
                        </button>
                        <div className="ml-3 relative">
                            <div className="flex items-center">
                                <button className="p-2 rounded-md text-gray-400 hover:text-gray-500">
                                    <User className="h-6 w-6" />
                                </button>
                                <span className="ml-2 text-sm font-medium text-gray-700">
                                    {user?.name}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-4 p-2 rounded-md text-gray-400 hover:text-gray-500"
                        >
                            <LogOut className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;