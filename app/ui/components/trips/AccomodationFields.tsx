'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AccomodationInput from './AccomodationInput';


export type Accomodation = {
    id: string;
    accomodation_id: number | null;
    address: string;
    check_in: string;
    check_out: string;
    place_id: number | null;
    latitude: string | null;
    longitude: string | null;
};

type AccomodationFieldsProps = {
    accoms: Accomodation[] | null;
};

export default function AccomodationFields({
    accoms,
}: AccomodationFieldsProps) {
    const [accomodations, setAccomodations] = useState<Accomodation[]>(
        accoms && accoms.length > 0
            ? accoms
            : [
                  {
                      id: crypto.randomUUID(),
                      accomodation_id: null,
                      address: '',
                      check_in: '',
                      check_out: '',
                      place_id: null,
                      latitude: null,
                      longitude: null,
                  },
              ]
    );

    const addAccomodation = () => {
        setAccomodations((current) => [
            ...current,
            {
                id: crypto.randomUUID(),
                accomodation_id: null,
                address: '',
                check_in: '',
                check_out: '',
                place_id: null,
                latitude: null,
                longitude: null,
            },
        ]);
    };

    const removeAccomodation = (id: string) => {
        setAccomodations((current) =>
            current.filter(
                (accomodation) => accomodation.id !== id
            )
        );
    };

    const updateAccomodation = (
        id: string,
        updates: Partial<Accomodation>
    ) => {
        setAccomodations((current) =>
            current.map((accomodation) =>
                accomodation.id === id
                    ? { ...accomodation, ...updates }
                    : accomodation
            )
        );
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <p className="block font-medium text-gray-700 mt-8">
                Accomodations
            </p>

            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <div className="w-1/3">
                        <p className="block font-medium text-gray-700">
                            Address
                        </p>
                    </div>

                    <div className="w-1/3">
                        <p className="block font-medium text-gray-700">
                            Check-in
                        </p>
                    </div>

                    <div className="w-1/3">
                        <p className="block font-medium text-gray-700">
                            Check-out
                        </p>
                    </div>

                    <div className="w-6" />
                </div>

                {accomodations.map((accomodation, index) => (
                    <AccomodationInput
                        key={accomodation.id}
                        accomodation={accomodation}
                        index={index}
                        onRemove={removeAccomodation}
                        onChange={updateAccomodation}
                    />
                ))}

                <button
                    type="button"
                    className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-700 mt-2"
                    onClick={addAccomodation}
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Accomodation
                </button>
            </div>
        </div>
    );
}