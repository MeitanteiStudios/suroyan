'use client';

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type Accomodation = {
    id: number;
    address: string;
    checkInDate: string;
    checkOutDate: string;
};

export default function AccomodationFields() {
    const [accomodations, setAccomodations] = useState<Accomodation[]>([
        {
            id: 0,
            address: '',
            checkInDate: '',
            checkOutDate: '',
        }
    ]);

    const addAccomodation = () => {
        setAccomodations((current) => [
            ...current, {
                id: Date.now(),
                address: '',
                checkInDate: '',
                checkOutDate: '',
            }
        ]);
    };

    const removeAccomodation = (id: number) => {
        setAccomodations((current) => 
            current.filter((accomodation) => accomodation.id !== id)
        );
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <p className="block font-medium text-gray-700 mt-8">
                Accommodations
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
                </div>

                {accomodations.map((accomodation, index) => (
                    <div key={accomodation.id} className="flex gap-2 items-center">
                        <div className="w-1/3">
                            <input
                                type="text"
                                name={`accommodation[${index}][address]`}
                                id={`accomodationAddress${index}`}
                                defaultValue={accomodation.address}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-1/3">
                            <input
                                type="datetime-local"
                                name={`accommodation[${index}][check_in]`}
                                id={`accommodationCheckIn${index}`}
                                defaultValue={accomodation.checkInDate}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-1/3">
                            <input
                                type="datetime-local"
                                name={`accommodation[${index}][check_out]`}
                                id={`accommodationCheckOut${index}`}
                                defaultValue={accomodation.checkOutDate}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <button className="flex items-center justify-center w-6 h-6 rounded-full" onClick={() => removeAccomodation(accomodation.id)}>
                            <TrashIcon className="w-4 h-4 text-red-500 hover:text-red-700" />
                        </button>
                    </div>
                ))}
                
                <button className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-700 mt-2" onClick={addAccomodation}>
                    <PlusIcon className="w-4 h-4 text-blue-500 hover:text-blue-700" />
                    Add Accommodation
                </button>
            </div>
        </div>
    );
};