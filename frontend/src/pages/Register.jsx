import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';

const schema = yup.object().shape({
    name: yup
        .string()
        .required('Full name is required'),
    email: yup
        .string()
        .email('Must be a valid email')
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    companyName: yup
        .string()
        .required('Company name is required'),
    iecNumber: yup
        .string()
        .required('IEC number is required'),
});

const Register = () => {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();
    const [error, setError] = React.useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            setError(null);
            await registerUser(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to register');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </a>
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive">
                        {error}
                    </Alert>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <Input
                            label="Full Name"
                            {...register('name')}
                            error={errors.name?.message}
                            autoComplete="name"
                        />

                        <Input
                            label="Email address"
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            type="password"
                            {...register('password')}
                            error={errors.password?.message}
                            autoComplete="new-password"
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            {...register('confirmPassword')}
                            error={errors.confirmPassword?.message}
                            autoComplete="new-password"
                        />

                        <Input
                            label="Company Name"
                            {...register('companyName')}
                            error={errors.companyName?.message}
                        />

                        <Input
                            label="IEC Number"
                            {...register('iecNumber')}
                            error={errors.iecNumber?.message}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating account...' : 'Create account'}
                    </Button>

                    <p className="mt-2 text-center text-sm text-gray-600">
                        By creating an account, you agree to our{' '}
                        <a href="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Privacy Policy
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;