import React, { useState } from 'react';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import PerformanceMetrics from '../components/analytics/PerformanceMetrics';
import { Card } from '../components/common/Card';
import { Download, Filter } from 'lucide-react';

const Analytics = () => {
    const [filters, setFilters] = useState({
        timeframe: '30d',
        type: 'all',
        status: 'all'
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
                <div className="flex items-center space-x-4">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Time Period</label>
                        <select
                            value={filters.timeframe}
                            onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Document Type</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="all">All Types</option>
                            <option value="drawback">Drawback</option>
                            <option value="rodtep">RoDTEP</option>
                            <option value="shipping_bill">Shipping Bill</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="processing">Processing</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ timeframe: '30d', type: 'all', status: 'all' })}
                            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </Card>

            <AnalyticsDashboard filters={filters} />
            <PerformanceMetrics filters={filters} />
        </div>
    );
};

export default Analytics;
