import React, { useState } from 'react';
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentList from '../components/documents/DocumentList';
import DocumentViewer from '../components/documents/DocumentViewer';
import { PlusCircle } from 'lucide-react';

const Documents = () => {
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleDocumentSelect = (doc) => {
        setSelectedDocument(doc);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Upload Document
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DocumentList onDocumentSelect={handleDocumentSelect} />
                </div>
                <div>
                    {selectedDocument ? (
                        <DocumentViewer document={selectedDocument} />
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <div className="flex flex-col items-center">
                                <FileText className="h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No document selected</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Select a document from the list to view its details
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Upload Document</h2>
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <DocumentUpload
                            onUploadComplete={() => {
                                setIsUploadModalOpen(false);
                                // Refresh document list
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;