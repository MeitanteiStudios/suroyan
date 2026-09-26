'use client';

import { createPortal } from 'react-dom';
import { ChangeEvent, useRef, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useDebouncedCallback } from 'use-debounce';

import {
    PlaceResult,
    searchPlace,
} from '@/lib/supabase/maps/actions';

import { Accomodation } from './AccomodationFields';

type AccomodationInputProps = {
    accomodation: Accomodation;
    index: number;
    onRemove: (id: string) => void;
    onChange: (
        id: string,
        updates: Partial<Accomodation>
    ) => void;
};

export default function AccomodationInput({
    accomodation,
    index,
    onRemove,
    onChange,
}: AccomodationInputProps) {
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

    const [longitude, setLongitude] = useState<
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
            if (!value.trim()) {
                setOptions({});
                setShowDropdown(false);
                return;
            }

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
                    'Accommodation search failed:',
                    error
                );
            }
        },
        500
    );

    const handleAddressChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;

        onChange(accomodation.id, {
            address: value,
        });

        updateDropdownPosition();
        handleSearch(value);
        setShowDropdown(true);
    };

    const choosePlace = (placeId: string) => {
        const searchResult = options[placeId];

        if (!searchResult) return;

        onChange(accomodation.id, {
            address: searchResult.name,
            place_id: Number(searchResult.place_id),
            latitude: String(searchResult.lat),
            longitude: String(searchResult.lon),
        });
        setShowDropdown(false);
    };

    return (
        <>
            <input type="hidden" name={`accomodation[${index}][accomodation_id]`} value={accomodation.accomodation_id ?? ''} />
            <input type="hidden" name={`accomodation[${index}][place_id]`} value={accomodation.place_id ?? ''} />
            <input type="hidden" name={`accomodation[${index}][latitude]`} value={accomodation.latitude ?? ''} />
            <input type="hidden" name={`accomodation[${index}][longitude]`} value={accomodation.longitude ?? ''} />

            <div className="flex gap-2 items-center">
                {/* Address */}
                <div className="w-1/3">
                    <input
                        ref={inputRef}
                        type="text"
                        name={`accomodation[${index}][address]`}
                        id={`accomodationAddress${accomodation.id}`}
                        value={accomodation.address}
                        onChange={handleAddressChange}
                        onFocus={updateDropdownPosition}
                        onBlur={() => {
                            setTimeout(() => {
                                setShowDropdown(false);
                            }, 300);
                        }}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* Check-in */}
                <div className="w-1/3">
                    <input
                        type="date"
                        name={`accomodation[${index}][check_in]`}
                        id={`accomodationCheckIn${accomodation.id}`}
                        value={accomodation.check_in}
                        onChange={(e) =>
                            onChange(accomodation.id, {
                                check_in: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* Check-out */}
                <div className="w-1/3">
                    <input
                        type="date"
                        name={`accomodation[${index}][check_out]`}
                        id={`accomodationCheckOut${accomodation.id}`}
                        value={accomodation.check_out}
                        onChange={(e) =>
                            onChange(accomodation.id, {
                                check_out: e.target.value,
                            })
                        }
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {/* Remove */}
                <button
                    type="button"
                    className="flex items-center justify-center w-6 h-6 rounded-full"
                    onClick={() =>
                        onRemove(accomodation.id)
                    }
                >
                    <TrashIcon className="w-4 h-4 text-red-500 hover:text-red-700" />
                </button>
            </div>

            {/* Autocomplete dropdown */}
            {showDropdown &&
                createPortal(
                    <ul
                        className="fixed z-[9999] mt-1 rounded-md border bg-gray-700 border-gray-600 text-gray-300 p-2 shadow-lg overflow-auto max-h-80"
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
                                    className="cursor-pointer p-2 hover:bg-gray-500"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        choosePlace(placeId);
                                    }}
                                >
                                    {place.name}
                                </li>
                            )
                        )}
                    </ul>,
                    document.body
                )}
        </>
    );
}