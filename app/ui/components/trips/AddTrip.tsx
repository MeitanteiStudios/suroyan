'use client';

import { useState } from 'react';
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from '../modal';
import PlaceFields from './PlaceFields';
import AccomodationFields from './AccomodationFields';
import TripFields from './TripFields';

export default function AddTrip() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    return (
        <div>
            <a
                key="Add a Trip"
                href="#"
                onClick={() => setIsModalOpen(true)}
                className="flex h-[48px] items-center gap-2 rounded-md text-sm font-medium hover:bg-sky-100 hover:text-blue-600 flex-none justify-start p-2 px-3"
            >
                <PlusIcon className="w-4" />
                <p className="text-md">Add A Trip</p>
          </a>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} width="max-w-7xl" title="Add a New Trip">
            <div className="flex gap-8 mt-8">
                <div className="w-1/2 flex flex-col gap-4">
                    <TripFields />
                    <AccomodationFields />
                </div>
                <div className='w-1/2'>
                    <PlaceFields />
                </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-16">
                <input type="submit" value="Save" className="bg-sky-500 hover:bg-sky-400 cursor-pointer text-white font-medium px-6 py-2 rounded" />
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sky-500 font-medium px-4 py-2 rounded">Cancel</button>
            </div>
          </Modal>
        </div>
    );
}