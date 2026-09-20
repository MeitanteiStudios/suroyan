'use client';

import { createPortal } from 'react-dom';
import { ChangeEvent, useRef, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useDebouncedCallback } from 'use-debounce';

import { Place } from './PlaceFields';
import {
    PlaceResult,
    searchPlace,
} from '@/lib/supabase/maps/actions';

export default function PlaceInput({
    place,
    index,
    onRemove,
}: {
    place: Place;
    index: number;
    onRemove: (id: number) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [showDropdown, setShowDropdown] = useState(false);

    const [options, setOptions] = useState<
        Record<string, PlaceResult>
    >({});

    const [placeId, setPlaceId] = useState<number | undefined>(
        undefined
    );

    const [latitude, setLatitude] = useState<string | undefined>(
        undefined
    );

    const [longtitude, setLongtitude] = useState<
        string | undefined
    >(undefined);

    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
    });

    const updateDropdownPosition = () => {
        if (!inputRef.current) return;

        const rect = inputRef.current.getBoundingClientRect();

        setDropdownPosition({
            top: rect.bottom,
            left: rect.left,
            width: rect.width,
        });
    };

    const handleSearch = useDebouncedCallback(
        async (value: string) => {
            if (!value.trim()) return;

            try {
                const data = await searchPlace(value);

                if (data) {
                    const places = Object.fromEntries(
                        (data as PlaceResult[]).map((place) => [
                            place.place_id,
                            place,
                        ])
                    );

                    setOptions(places);
                    updateDropdownPosition();
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error(
                    'Place search failed:',
                    error
                );
            }
        },
        500
    );

    const handleOnChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        handleSearch(e.target.value);
    };

    const choosePlace = (placeId: string) => {
        const searchPlace = options[placeId];

        if (!searchPlace) return;

        place.address = searchPlace.display_name;
        place.name = searchPlace.name;

        setLatitude(searchPlace.lat);
        setLongtitude(searchPlace.lon);
        setPlaceId(searchPlace.place_id);
    };

    return (
        <>
            <input type="hidden" name={`place[${index}][placeId]`} id={`placePlaceId${place.id}`} value={placeId} />
            <input type="hidden" name={`place[${index}][latitude]`} id={`placeLatitude${place.id}`} value={latitude} />
            <input type="hidden" name={`place[${index}][longtitude]`} id={`placeLongtitude${place.id}`} value={longtitude} />
            <div className="flex items-center gap-2">
                <div className="w-1/2">
                    <input
                        ref={inputRef}
                        type="text"
                        name={`place[${index}][address]`}
                        id={`placeAddress${place.id}`}
                        value={place.address}
                        onChange={(e) => {
                            place.address = e.target.value;

                            updateDropdownPosition();
                            handleOnChange(e);
                            setShowDropdown(true);
                        }}
                        onBlur={() => {
                            setTimeout(() => {
                                setShowDropdown(false);
                            }, 1000);
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="w-1/2">
                    <input
                        type="text"
                        name={`place[${index}][name]`}
                        id={`placeName${place.id}`}
                        value={place.name}
                        onChange={(e) => {
                            place.name = e.target.value;
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(place.id)}
                >
                    <TrashIcon className="h-4 w-4 text-red-500 hover:text-red-700" />
                </button>
            </div>

            {showDropdown &&
                createPortal(
                    <ul
                        className="fixed z-[9999] mt-1 rounded-md border border-gray-300 bg-white p-2 shadow-lg"
                        style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                            width: dropdownPosition.width,
                        }}
                    >
                        {Object.entries(options).map(
                            ([placeId, place]) => (
                                <li
                                    key={placeId}
                                    className="cursor-pointer p-2 hover:bg-sky-100"
                                    onClick={() =>
                                        choosePlace(placeId)
                                    }
                                >
                                    {place.display_name}
                                </li>
                            )
                        )}
                    </ul>,
                    document.body
                )}
        </>
    );
}