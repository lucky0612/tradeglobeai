import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
    FileText,
    Download,
    Eye,
    MoreVertical,
    Check,
    AlertTriangle
} from 'lucide-react';
import { formatDate, formatFileSize } from '../../utils/format';
import { useApi } from '../../hooks/useApi';
import { Card } from '../common/Card';

const DocumentList = () => {
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        dateRange: 'all'
    });

    const { data: documents, isLoading } = useQuery(
        ['documents', filters],
        () => useApi().fetchDocuments(filters)
    );

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: {
                icon: <Check className="w-4 h-4" />,
                class: 'bg-green-100 text-green-800',
            },
            processing: {
                icon: null,
                class: 'bg-yellow-100 text-yellow-800',
            },
            failed: {
                icon: <AlertTriangle className="w-4 h-4" />,
                class: 'bg-red-100 text-red-800',
            },
        };

        const config = statusConfig[status] || statusConfig.processing;

        return (
            <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
                {config.icon && <span className="mr-1">{config.icon}</span>}
                {status}
            </span>
        );
    };

    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                    <div className="flex space-x-4">
                        {/* Filters */}
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="processing">Processing</option>
                            <option value="failed">Failed</option>
                        </select>

                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">All Types</option>
                            <option value="shipping_bill">Shipping Bill</option>
                            <option value="duty_drawback">Duty Drawback</option>
                            <option value="rodtep">RoDTEP</option>
                        </select>

                        <select
                            value={filters.dateRange}
                            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>

                {/* Document List */}
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                    Document
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Type
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Status
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Uploaded
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Size
                                </th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {documents?.map((doc) => (
                                <tr key={doc.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                                        <div className="flex items-center">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                            <span className="ml-2 truncate">{doc.filename}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {doc.type}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        {getStatusBadge(doc.status)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {formatDate(doc.created_at)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {formatFileSize(doc.size)}
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button className="text-gray-400 hover:text-gray-500">
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-500">
                                                <Download className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-500">
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Empty State */}
                    {documents?.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by uploading a new document.
                            </p>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading documents...</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default DocumentList;
