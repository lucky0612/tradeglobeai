import React from 'react';
import { Card } from '../common/Card';
import { FileText, Check, AlertTriangle } from 'lucide-react';
import { formatDate, formatFileSize } from '../../utils/format';

const getStatusIcon = (status) => {
    switch (status) {
        case 'completed':
            return <Check className="h-5 w-5 text-green-500" />;
        case 'failed':
            return <AlertTriangle className="h-5 w-5 text-red-500" />;
        default:
            return <FileText className="h-5 w-5 text-gray-500" />;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'completed':
            return 'bg-green-50 text-green-800';
        case 'failed':
            return 'bg-red-50 text-red-800';
        case 'processing':
            return 'bg-yellow-50 text-yellow-800';
        default:
            return 'bg-gray-50 text-gray-800';
    }
};

const RecentDocuments = ({ documents }) => {
    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Recent Documents
                    </h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800">
                        View All
                    </button>
                </div>
                <div className="space-y-4">
                    {documents?.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 bg-white border rounded-lg"
                        >
                            <div className="flex items-center">
                                <FileText className="h-8 w-8 text-gray-400" />
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {doc.filename}
                                    </h3>
                                    <div className="flex space-x-4 mt-1 text-sm text-gray-500">
                                        <span>{formatFileSize(doc.size)}</span>
                                        <span>{formatDate(doc.processed_at)}</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                    doc.status
                                )}`}
                            >
                                {doc.status}
                            </div>
                        </div>
                    ))}
                    {documents?.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                            No recent documents
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default RecentDocuments;
