import React from 'react';
import { Card } from '../common/Card';
import { useQuery } from 'react-query';
import { analyticsAPI } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ProcessingMetrics = () => {
    const { data: metrics, isLoading } = useQuery('processing-metrics',
        analyticsAPI.getProcessingMetrics
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">Processing Metrics</h2>
                <div className="mt-4 h-72">
                    <LineChart
                        width={600}
                        height={250}
                        data={metrics?.trends}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="success_rate"
                            stroke="#8884d8"
                            name="Success Rate"
                        />
                        <Line
                            type="monotone"
                            dataKey="processing_time"
                            stroke="#82ca9d"
                            name="Processing Time"
                        />
                    </LineChart>
                </div>
            </div>
        </Card>
    );
};

export default ProcessingMetrics;