'use client';

import { useState, useTransition } from 'react';
import Modal from '../modal';
import PlaceFields from './PlaceFields';
import { addPlaces } from '@/lib/supabase/trips/actions';
import { PlusIcon } from '@heroicons/react/24/outline';

export type AddPlaceProps = {
    tripId: string;
};

export default function AddPlace({ tripId }: AddPlaceProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const response = await addPlaces(formData);

            if (response.success) {
                setIsModalOpen(false);

                // Reload the dashboard data
                window.location.reload();
            } else {
                console.error(response.message);
            }
        });
    };

    return (
        <div>
            <button
                type='button'
                className="rounded-full h-9 w-9 flex items-center justify-center bg-gray-700 hover:bg-gray-800"
                title="Add a Place to Visit"
                onClick={() => setIsModalOpen(true)}
            >
                <PlusIcon className="h-6 w-6" />
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                width="max-w-7xl"
                title="Add Places"
            >
                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-col"
                >
                    {/* Scrollable content */}
                    <div className="min-h-0 max-h-[70vh] overflow-auto">
                        <input
                            type="hidden"
                            name="trip_id"
                            value={tripId}
                        />

                        <PlaceFields />
                    </div>

                    {/* Sticky buttons */}
                    <div className="sticky bottom-0 flex shrink-0 items-center justify-center gap-4 bg-gray-800 py-4">
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
                            className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sky-500 font-medium px-4 py-2 rounded disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}