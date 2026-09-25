'use client';

import { Suspense } from 'react';
import { getTrips } from '@/lib/supabase/trips/actions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        const loadTrips = async () => {
            const data = await getTrips();

            if (data.length > 0) {
                router.replace(`/dashboard/${data[0].id}`);
            }
        }

        loadTrips();
    }, []);

    return (
        <Suspense fallback={<div>Loading...</div>}>
        </Suspense>
    );
}