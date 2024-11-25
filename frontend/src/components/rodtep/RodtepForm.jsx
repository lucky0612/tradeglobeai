import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { rodtepClaimSchema } from '../../utils/validation';
import { Card } from '../common/Card';
import { Plus, Minus } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const RodtepForm = ({ onSuccess }) => {
    const { register, control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(rodtepClaimSchema),
        defaultValues: {
            product_details: [{ hs_code: '', description: '', quantity: '', value: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "product_details"
    });

    const { submitRodtepClaim } = useApi();

    const onSubmit = async (data) => {
        try {
            await submitRodtepClaim(data);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to submit RoDTEP claim:', error);
        }
    };

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Submit RoDTEP Claim
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Export Details */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Shipping Bill Number
                            </label>
                            <input
                                type="text"
                                {...register('export_details.shipping_bill_no')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.export_details?.shipping_bill_no && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.export_details.shipping_bill_no.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Date
                            </label>
                            <input
                                type="date"
                                {...register('export_details.date')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.export_details?.date && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.export_details.date.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Port
                            </label>
                            <input
                                type="text"
                                {...register('export_details.port')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.export_details?.port && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.export_details.port.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Products
                            </label>
                            <button
                                type="button"
                                onClick={() => append({ hs_code: '', description: '', quantity: '', value: '' })}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Product
                            </button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                HS Code
                                            </label>
                                            <input
                                                type="text"
                                                {...register(`product_details.${index}.hs_code`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.product_details?.[index]?.hs_code && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.product_details[index].hs_code.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <input
                                                type="text"
                                                {...register(`product_details.${index}.description`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.product_details?.[index]?.description && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.product_details[index].description.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                {...register(`product_details.${index}.quantity`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.product_details?.[index]?.quantity && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.product_details[index].quantity.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Value
                                            </label>
                                            <input
                                                type="number"
                                                {...register(`product_details.${index}.value`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.product_details?.[index]?.value && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.product_details[index].value.message}
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
                                            Remove Product
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

export default RodtepForm;