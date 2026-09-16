'use client';

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type Place = {
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
            <p className="block font-medium text-lg text-gray-700 mb-2">
                Places to Visit
            </p>

            <div className="flex gap-2 items-center">
                <div className="w-1/2">
                    <label className="block font-medium text-gray-700">
                        Address
                    </label>
                </div>

                <div className="w-1/2">
                    <label className="block font-medium text-gray-700">
                        Name
                    </label>
                </div>

                <div className="w-6" />
            </div>

            {places.map((place, index) => (
                <div
                    key={place.id}
                    className="flex gap-2 items-center"
                >
                    <div className="w-1/2">
                        <input
                            type="text"
                            name={`place[${index}][address]`}
                            id={`placeAddress${index}`}
                            defaultValue={place.address}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="w-1/2">
                        <input
                            type="text"
                            name={`place[${index}][name]`}
                            id={`placeName${index}`}
                            defaultValue={place.name}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="button"
                        className="flex items-center justify-center w-6 h-6 rounded-full"
                        onClick={() => removePlace(place.id)}
                    >
                        <TrashIcon className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </button>
                </div>
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