import * as yup from 'yup';

export const documentSchema = yup.object().shape({
    type: yup.string().required('Document type is required'),
    file: yup.mixed().required('File is required'),
});

export const drawbackClaimSchema = yup.object().shape({
    shipping_bill_no: yup.string().required('Shipping bill number is required'),
    date: yup.date().required('Date is required'),
    exporter_details: yup.object().shape({
        name: yup.string().required('Exporter name is required'),
        iec: yup.string().required('IEC is required'),
    }),
    items: yup.array().of(
        yup.object().shape({
            description: yup.string().required('Item description is required'),
            quantity: yup.number().positive().required('Quantity is required'),
            value: yup.number().positive().required('Value is required'),
            drawback_rate: yup.number().positive().required('Drawback rate is required'),
        })
    ),
});

export const rodtepClaimSchema = yup.object().shape({
    export_details: yup.object().shape({
        shipping_bill_no: yup.string().required('Shipping bill number is required'),
        date: yup.date().required('Date is required'),
        port: yup.string().required('Port is required'),
    }),
    product_details: yup.array().of(
        yup.object().shape({
            hs_code: yup.string().required('HS Code is required'),
            description: yup.string().required('Product description is required'),
            quantity: yup.number().positive().required('Quantity is required'),
            value: yup.number().positive().required('Value is required'),
        })
    ),
});