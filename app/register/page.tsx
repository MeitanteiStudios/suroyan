'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AcmeLogo from '../ui/acme-logo';

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // If email confirmation is enabled in Supabase
        if (data.user && !data.session) {
            router.push('/login');
            setLoading(false);
            return;
        }

        router.push('/dashboard');
        router.refresh();
    };

    return (
        <div className="bg-gray-900 min-h-screen flex justify-center items-center p-8 text-gray-300">
            <div className="w-full flex flex-col gap-4 md:w-1/4 p-4 rounded-lg bg-gray-800">
                <div className="flex justify-center w-full mb-8">
                    <AcmeLogo />
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="block font-medium text-gray-300"
                        >
                            Email Address
                        </label>

                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block font-medium text-gray-300"
                        >
                            Password
                        </label>

                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                            minLength={6}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block font-medium text-gray-300"
                        >
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            required
                            minLength={6}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-8 bg-sky-500 hover:bg-sky-400 cursor-pointer text-white font-medium px-6 py-2 rounded disabled:opacity-50"
                    >
                        {loading
                            ? 'Creating account...'
                            : 'Create account'}
                    </button>

                    <p className="mb-8">
                        Already have an account?{' '}
                        <a
                            href="/login"
                            className="cursor-pointer text-sky-500 hover:text-sky-400"
                        >
                            Login Now!
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}