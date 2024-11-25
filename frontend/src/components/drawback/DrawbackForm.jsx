import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { drawbackClaimSchema } from '../../utils/validation';
import { Card } from '../common/Card';
import { Plus, Minus } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const DrawbackForm = ({ onSuccess }) => {
    const { register, control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(drawbackClaimSchema),
        defaultValues: {
            items: [{ description: '', quantity: '', value: '', drawback_rate: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const { submitDrawbackClaim } = useApi();

    const onSubmit = async (data) => {
        try {
            await submitDrawbackClaim(data);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to submit drawback claim:', error);
        }
    };

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Submit Duty Drawback Claim
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Shipping Bill Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Shipping Bill Number
                            </label>
                            <input
                                type="text"
                                {...register('shipping_bill_no')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.shipping_bill_no && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.shipping_bill_no.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Date
                            </label>
                            <input
                                type="date"
                                {...register('date')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.date.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Exporter Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Exporter Name
                            </label>
                            <input
                                type="text"
                                {...register('exporter_details.name')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.exporter_details?.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.exporter_details.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                IEC Number
                            </label>
                            <input
                                type="text"
                                {...register('exporter_details.iec')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.exporter_details?.iec && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.exporter_details.iec.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Items
                            </label>
                            <button
                                type="button"
                                onClick={() => append({ description: '', quantity: '', value: '', drawback_rate: '' })}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <input
                                                type="text"
                                                {...register(`items.${index}.description`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.items?.[index]?.description && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.items[index].description.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                {...register(`items.${index}.quantity`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.items?.[index]?.quantity && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.items[index].quantity.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Value
                                            </label>
                                            <input
                                                type="number"
                                                {...register(`items.${index}.value`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.items?.[index]?.value && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.items[index].value.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Drawback Rate (%)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`items.${index}.drawback_rate`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.items?.[index]?.drawback_rate && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.items[index].drawback_rate.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200"
                                        >
                                            <Minus className="h-4 w-4 mr-1" />
                                            Remove Item
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Submit Claim
                        </button>
                    </div>
                </form>
            </div>
        </Card>
    );
};

export default DrawbackForm;