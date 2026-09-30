'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AcmeLogo from '../ui/acme-logo';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push('/dashboard');
        router.refresh();
    };

    return (
        <div className="bg-gray-900 min-h-screen flex justify-center items-center p-8 text-gray-300">
            <div className="w-full flex flex-col gap-4 md:w-1/4 p-4 rounded-lg bg-gray-800">
                <div className='flex justify-center w-full mb-8'>
                    <AcmeLogo />
                </div>

                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <label htmlFor="email" className="block font-medium text-gray-300">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        id='email'
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />

                    <label htmlFor="password" className="block font-medium text-gray-300">
                        Password
                    </label>
                    <input
                        type="password"
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <a href='/forgot-password' className='text-sm text-right cursor-pointer hover:text-sky-600'>Forgot Password?</a>

                    {error && (
                        <p className="text-red-500">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading} className="mt-8 bg-sky-500 hover:bg-sky-400 cursor-pointer text-white font-medium px-6 py-2 rounded">
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                    <p className='mb-8'>Don't have an account? <a href='/register' className='cursor-pointer hover:text-sky-600'>Register Now!</a></p> 
                </form>
            </div>
        </div>
    );
}