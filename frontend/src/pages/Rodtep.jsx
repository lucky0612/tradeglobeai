import React, { useState } from 'react';
import RodtepForm from '../components/rodtep/RodtepForm';
import { Card } from '../components/common/Card';
import { useQuery } from 'react-query';
import { rodtepAPI } from '../services/api';
import { PlusCircle, Filter, Download, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

const Rodtep = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        dateRange: '30d'
    });

    const { data: claims, isLoading } = useQuery(
        ['rodtep-claims', filters],
        () => rodtepAPI.listClaims(filters)
    );

    const handleGenerateScrip = async (claimId) => {
        try {
            await rodtepAPI.generateScrip(claimId);
            // Refresh claims list
        } catch (error) {
            console.error('Failed to generate scrip:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">RoDTEP Claims</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        New Claim
                    </button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="scrip_generated">Scrip Generated</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date Range</label>
                        <select
                            value={filters.dateRange}
                            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ status: 'all', dateRange: '30d' })}
                            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </Card>

            {/* Claims List */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Claim ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Shipping Bill
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Benefit Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {claims?.map((claim) => (
                                <tr key={claim.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {claim.claim_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {claim.export_details.shipping_bill_no}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(claim.export_details.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(claim.calculated_amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${claim.status === 'approved'
                                                ? 'bg-green-100 text-green-800'
                                                : claim.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : claim.status === 'scrip_generated'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-3">
                                            <button className="text-indigo-600 hover:text-indigo-900">
                                                View
                                            </button>
                                            {claim.status === 'approved' && (
                                                <button
                                                    onClick={() => handleGenerateScrip(claim.claim_id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Generate Scrip
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* New Claim Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">New RoDTEP Claim</h2>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <RodtepForm
                            onSubmitSuccess={() => {
                                setIsFormOpen(false);
                                // Refresh claims list
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rodtep;