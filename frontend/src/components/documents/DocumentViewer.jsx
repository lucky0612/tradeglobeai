import React from 'react';
import { useQuery } from 'react-query';
import { Card } from '../common/Card';
import { useApi } from '../../hooks/useApi';

const DocumentViewer = ({ documentId }) => {
    const { data: document, isLoading } = useQuery(
        ['document', documentId],
        () => useApi().fetchDocument(documentId)
    );

    const renderContent = () => {
        if (!document?.content) return null;

        switch (document.type) {
            case 'pdf':
                return (
                    <iframe
                        src={`data:application/pdf;base64,${document.content}`}
                        className="w-full h-full"
                        title="PDF Viewer"
                    />
                );
            case 'image':
                return (
                    <img
                        src={`data:image/jpeg;base64,${document.content}`}
                        alt="Document Preview"
                        className="max-w-full h-auto"
                    />
                );
            default:
                return (
                    <div className="p-4 bg-gray-50 rounded">
                        <pre className="whitespace-pre-wrap">{document.content}</pre>
                    </div>
                );
        }
    };

    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Document Viewer
                    </h2>
                    {document && (
                        <div className="flex space-x-2">
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                Download
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700">
                                Process
                            </button>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="h-96 overflow-auto border rounded-lg">
                        {renderContent()}
                    </div>
                )}

                {document?.metadata && (
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900">Metadata</h3>
                        <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                            {Object.entries(document.metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between sm:block">
                                    <dt className="text-sm font-medium text-gray-500">{key}</dt>
                                    <dd className="text-sm text-gray-900">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default DocumentViewer;