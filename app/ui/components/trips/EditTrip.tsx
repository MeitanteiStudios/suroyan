'use client';

import { useState, useTransition } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import Modal from '../modal';
import AccomodationFields from './AccomodationFields';
import TripFields from './TripFields';
import { updateTrip } from '@/lib/supabase/trips/actions';

export type EditTripProps = {
    trip: any | null;
    accomodations: any[] | null;
};

export default function EditTrip({
    trip,
    accomodations,
}: EditTripProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const response = await updateTrip(formData);

            if (response.success) {
                setIsModalOpen(false);

                window.location.reload();
            } else {
                console.error(response.message);
            }
        });
    };

    return (
        <div>
            <button
                type="button"
                className="flex items-center gap-2 hover:mb-1"
                title="Edit Trip"
                onClick={() => setIsModalOpen(true)}
            >
                <h1 className="text-2xl font-semibold">
                    {trip.name}
                </h1>

                <PencilSquareIcon className="h-5 w-5" />
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                width="max-w-5xl"
                title="Edit Trip"
            >
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4">
                        <TripFields trip={trip} />

                        <AccomodationFields
                            accoms={accomodations}
                        />

                        <div className="sticky bottom-0 flex items-center justify-center gap-4 bg-white py-4">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-sky-500 hover:bg-sky-400 cursor-pointer text-white font-medium px-6 py-2 rounded disabled:opacity-50"
                            >
                                {isPending ? 'Saving...' : 'Save'}
                            </button>

                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sky-500 font-medium px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}