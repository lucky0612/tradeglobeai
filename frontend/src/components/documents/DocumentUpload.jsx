import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { Card } from '../common/Card';
import { DOCUMENT_TYPES } from '../../utils/constants';

const DocumentUpload = ({ onUploadComplete }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [docType, setDocType] = useState('');
    const { processDocument } = useApi();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg'],
        },
        onDrop: (acceptedFiles) => {
            setFiles([...files, ...acceptedFiles]);
        },
    });

    const handleRemoveFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    const handleUpload = async () => {
        try {
            setUploading(true);

            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', docType);

                await processDocument(formData);
            }

            onUploadComplete?.();
            setFiles([]);
            setDocType('');
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Upload Documents
                </h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Type
                    </label>
                    <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="">Select document type</option>
                        {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                            <option key={key} value={value}>
                                {key.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                        }`}
                >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        {isDragActive
                            ? 'Drop the files here'
                            : 'Drag and drop files here, or click to select files'}
                    </p>
                </div>

                {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                                <span className="text-sm text-gray-600">{file.name}</span>
                                <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={handleUpload}
                            disabled={uploading || !docType}
                            className={`mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${uploading || !docType
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {uploading ? 'Uploading...' : 'Upload Files'}
                        </button>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default DocumentUpload;