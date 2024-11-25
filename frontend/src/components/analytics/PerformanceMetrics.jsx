import React from 'react';
import { useQuery } from 'react-query';
import { Card } from '../common/Card';
import { analyticsAPI } from '../../services/api';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const PerformanceMetrics = () => {
    const { data: metrics, isLoading } = useQuery('performance-metrics',
        analyticsAPI.getProcessingMetrics
    );

    if (isLoading) {
        return (
            <Card>
                <div className="p-6">
                    <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Average Processing Time</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                            {metrics?.avg_processing_time}s
                        </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Success Rate</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                            {metrics?.success_rate}%
                        </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total Processed</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                            {metrics?.total_processed}
                        </p>
                    </div>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics?.trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="processing_time"
                                stroke="#8884d8"
                                name="Processing Time"
                            />
                            <Line
                                type="monotone"
                                dataKey="success_rate"
                                stroke="#82ca9d"
                                name="Success Rate"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};

export default PerformanceMetrics;