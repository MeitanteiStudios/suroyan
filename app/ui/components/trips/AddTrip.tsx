'use client';

import { useState, useTransition } from 'react';
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from '../modal';
import PlaceFields from './PlaceFields';
import AccomodationFields from './AccomodationFields';
import TripFields from './TripFields';
import { createTrip } from '@/lib/supabase/trips/actions';
import { useRouter } from 'next/navigation';

export default function AddTrip() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState('');
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState({
        'success': false,
        'message': '',
    })

    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const response = await createTrip(formData);
            setResult(response);

            if (result.success) {
                // close modal
                setIsModalOpen(false);

                // refresh server-rendered data
                router.refresh();   
            }

            // show notification
            setNotification(result.message);

            // hide notification after 3 seconds
            setTimeout(() => {
                setNotification('');
            }, 3000);
        });
    };

    return (
        <div>
            <a
                key="Add a Trip"
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setIsModalOpen(true);
                }}
                className="flex h-[48px] items-center gap-2 rounded-md text-sm font-medium hover:bg-sky-100 hover:text-blue-600 flex-none justify-start p-2 px-3"
            >
                <PlusIcon className="w-4" />
                <p className="text-md">Add A Trip</p>
            </a>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} width="max-w-7xl" title="Add a New Trip">
                <form onSubmit={handleSubmit} id='addTripForm'>
                    <div className="flex gap-8 mt-8">
                        <div className="w-1/2 flex flex-col gap-4">
                            <TripFields trip={null} />
                            <AccomodationFields accoms={null} />
                        </div>
                        <div className='w-1/2'>
                            <PlaceFields />
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-16">
                        <button type="submit" disabled={isPending} className="bg-sky-500 hover:bg-sky-400 cursor-pointer text-white font-medium px-6 py-2 rounded">
                            { isPending ? 'Saving...' : 'Save' }
                        </button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sky-500 font-medium px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            </Modal>

           {/* Notification */}
            {notification && (
                <div className={`fixed w-full md:w-1/4 top-5 right-5 z-50 rounded-md ${result.success ? 'bg-green-500' : 'bg-red-500'} px-5 py-3 text-white shadow-lg`}>
                    {notification}
                </div>
            )}

        </div>
    );
}