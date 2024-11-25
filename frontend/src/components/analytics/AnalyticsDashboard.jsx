import React from 'react';
import { useQuery } from 'react-query';
import { Card } from '../common/Card';
import { analyticsAPI } from '../../services/api';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    FileText,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/format';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard = () => {
    const { data: analytics, isLoading } = useQuery('analytics', () =>
        analyticsAPI.getDashboard('1m')
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Claims"
                    value={analytics?.metrics.total_claims}
                    change={analytics?.metrics.claims_change}
                    icon={FileText}
                />
                <MetricCard
                    title="Success Rate"
                    value={formatPercentage(analytics?.metrics.success_rate)}
                    change={analytics?.metrics.success_rate_change}
                    icon={CheckCircle}
                />
                <MetricCard
                    title="Total Benefits"
                    value={formatCurrency(analytics?.metrics.total_benefits)}
                    change={analytics?.metrics.benefits_change}
                    icon={DollarSign}
                />
                <MetricCard
                    title="Processing Time"
                    value={`${analytics?.metrics.avg_processing_time}s`}
                    change={analytics?.metrics.processing_time_change}
                    icon={TrendingUp}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Claims Trend */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Claims Trend</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics?.trends.claims}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="drawback_claims"
                                        stroke="#8884d8"
                                        name="Drawback Claims"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="rodtep_claims"
                                        stroke="#82ca9d"
                                        name="RoDTEP Claims"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                {/* Benefits Distribution */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Benefits Distribution</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics?.distribution.benefits}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        label
                                    >
                                        {analytics?.distribution.benefits.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                {/* Processing Status */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Status</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.metrics.processing_status}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="status" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                {/* Compliance Overview */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Overview</h3>
                        <div className="space-y-4">
                            {analytics?.compliance_metrics.map((metric, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center">
                                        {metric.status === 'compliant' ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                                        )}
                                        <div>
                                            <div className="font-medium">{metric.name}</div>
                                            <div className="text-sm text-gray-500">{metric.description}</div>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-medium ${metric.status === 'compliant' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {formatPercentage(metric.value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, change, icon: Icon }) => {
    const isPositiveChange = change > 0;

    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <Icon className="h-6 w-6 text-gray-400" />
                    </div>
                </div>
                <div className="mt-4 flex items-center">
                    {isPositiveChange ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                        className={`text-sm font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'
                            }`}
                    >
                        {formatPercentage(Math.abs(change))}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
            </div>
        </Card>
    );
};

export default AnalyticsDashboard;