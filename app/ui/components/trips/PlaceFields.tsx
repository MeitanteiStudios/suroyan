'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import PlaceInput from './PlaceInput';

export type Place = {
    id: number;
    address: string;
    name: string;
};

export default function PlaceFields() {
    const [places, setPlaces] = useState<Place[]>([
        {
            id: 0,
            address: '',
            name: '',
        },
    ]);

    const addPlace = () => {
        setPlaces((current) => [
            ...current,
            {
                id: current.length,
                address: '',
                name: '',
            },
        ]);
    };

    const removePlace = (id: number) => {
        setPlaces((current) =>
            current.filter((place) => place.id !== id)
        );
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <p className="block font-medium text-lg text-gray-300 mb-2">
                Places to Visit
            </p>

            <div className="flex gap-2 items-center">
                <div className="w-1/2">
                    <label className="block font-medium text-gray-300">
                        Address
                    </label>
                </div>

                <div className="w-1/2">
                    <label className="block font-medium text-gray-300">
                        Name
                    </label>
                </div>

                <div className="w-6" />
            </div>

            {places.map((place, index) => (
                <PlaceInput
                    key={place.id}
                    place={place}
                    index={index}
                    onRemove={removePlace}
                />
            ))}

            <button
                type="button"
                className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-700 mt-2"
                onClick={addPlace}
            >
                <PlusIcon className="w-4 h-4" />
                Add Places
            </button>
        </div>
    );
}