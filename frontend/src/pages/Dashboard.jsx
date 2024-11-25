import React from 'react';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import ProcessingMetrics from '../components/analytics/ProcessingMetrics';
import RecentDocuments from '../components/documents/RecentDocuments';
import AlertsPanel from '../components/dashboard/AlertsPanel';

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <div className="flex space-x-3">
                    <select className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="1d">Today</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700">
                        Export Report
                    </button>
                </div>
            </div>

            <AnalyticsDashboard />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProcessingMetrics />
                <AlertsPanel />
            </div>

            <RecentDocuments />
        </div>
    );
};

export default Dashboard;