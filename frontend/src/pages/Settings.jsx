import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { useAuth } from '../hooks/useAuth';
import { Settings as SettingsIcon, User, Bell, Lock, Globe } from 'lucide-react';

const Settings = () => {
    const { user, dispatch } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Lock },
        { id: 'preferences', name: 'Preferences', icon: Globe }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Sidebar */}
                <div className="col-span-12 lg:col-span-3">
                    <Card>
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center px-4 py-2 w-full text-sm font-medium rounded-md ${activeTab === tab.id
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5 mr-3" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="col-span-12 lg:col-span-9">
                    <Card>
                        <div className="p-6">
                            {activeTab === 'profile' && <ProfileSettings user={user} />}
                            {activeTab === 'notifications' && <NotificationSettings />}
                            {activeTab === 'security' && <SecuritySettings />}
                            {activeTab === 'preferences' && <PreferenceSettings />}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const ProfileSettings = ({ user }) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Update your profile information and preferences.
                </p>
            </div>

            <form className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                            First name
                        </label>
                        <input
                            type="text"
                            defaultValue={user?.firstName}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Last name
                        </label>
                        <input
                            type="text"
                            defaultValue={user?.lastName}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="sm:col-span-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            type="email"
                            defaultValue={user?.email}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Company
                        </label>
                        <input
                            type="text"
                            defaultValue={user?.company}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                            IEC Number
                        </label>
                        <input
                            type="text"
                            defaultValue={user?.iecNumber}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

const NotificationSettings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Notification Preferences
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Manage how you receive notifications.
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="email_alerts"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            defaultChecked
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="email_alerts" className="font-medium text-gray-700">
                            Email Alerts
                        </label>
                        <p className="text-gray-500">Get notified via email for important updates</p>
                    </div>
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="processing_updates"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            defaultChecked
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="processing_updates" className="font-medium text-gray-700">
                            Processing Updates
                        </label>
                        <p className="text-gray-500">Receive notifications about document processing status</p>
                    </div>
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="claim_status"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            defaultChecked
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="claim_status" className="font-medium text-gray-700">
                            Claim Status Updates
                        </label>
                        <p className="text-gray-500">Get notifications about claim status changes</p>
                    </div>
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="system_alerts"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="system_alerts" className="font-medium text-gray-700">
                            System Alerts
                        </label>
                        <p className="text-gray-500">Receive system maintenance and downtime notifications</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save Preferences
                </button>
            </div>
        </div>
    );
};

const SecuritySettings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Security Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your account security and authentication preferences.
                </p>
            </div>

            <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Update your password to keep your account secure.</p>
                        </div>
                        <form className="mt-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Two-Factor Authentication
                        </h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Add an extra layer of security to your account.</p>
                        </div>
                        <div className="mt-5">
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Enable 2FA
                            </button>
                        </div>
                    </div>
                </div>

                {/* API Key Management */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">API Keys</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Manage API keys for integration with external systems.</p>
                        </div>
                        <div className="mt-5">
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Generate New API Key
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PreferenceSettings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Preferences</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Customize your application experience.
                </p>
            </div>

            <div className="space-y-6">
                {/* Language Preference */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Language</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Select your preferred language for the interface.</p>
                        </div>
                        <div className="mt-5">
                            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="es">Spanish</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Date Format */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Date Format</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Choose your preferred date format.</p>
                        </div>
                        <div className="mt-5">
                            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                <option value="yyyy/mm/dd">YYYY/MM/DD</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Theme Selection */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Theme</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Choose your preferred application theme.</p>
                        </div>
                        <div className="mt-5">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        id="theme-light"
                                        name="theme"
                                        type="radio"
                                        defaultChecked
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="theme-light" className="ml-3 block text-sm font-medium text-gray-700">
                                        Light
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="theme-dark"
                                        name="theme"
                                        type="radio"
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="theme-dark" className="ml-3 block text-sm font-medium text-gray-700">
                                        Dark
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="theme-system"
                                        name="theme"
                                        type="radio"
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="theme-system" className="ml-3 block text-sm font-medium text-gray-700">
                                        System Default
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save Preferences
                </button>
            </div>
        </div>
    );
};

export default Settings;