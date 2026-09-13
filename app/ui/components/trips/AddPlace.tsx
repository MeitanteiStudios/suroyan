'use client';

import { useState } from 'react';
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "../modal";
import PlaceFields from './PlaceFields';

export default function AddPlace() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <button
                className="rounded-full h-9 w-9 flex items-center justify-center bg-sky-200 hover:bg-sky-300"
                title="Add a Place to Visit"
                onClick={() => setIsModalOpen(true)}
            >
                <PlusIcon className="h-6 w-6" />
            </button>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} width="max-w-7xl" title="Add Places">
                <PlaceFields />
                <div className="flex items-center justify-center gap-4 mt-16">
                    <input type="submit" value="Save" className="bg-sky-500 hover:bg-sky-400 cursor-pointer text-white font-medium px-6 py-2 rounded" />
                    <button type="button" className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sky-500 font-medium px-4 py-2 rounded">Cancel</button>
                </div>
            </Modal>
        </div>
    );
}