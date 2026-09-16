'use client';

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

type Accomodation = {
    id: string;
    accomodation_id: number;
    address: string;
    check_in: string;
    check_out: string;
};

type AccomodationFieldsProps = {
    accoms: any[] | null;
};

export default function AccomodationFields({accoms}: AccomodationFieldsProps) {
    const [accomodations, setAccomodations] = useState<Accomodation[]>([
        {
            id: '',
            accomodation_id: 0,
            address: '',
            check_in: '',
            check_out: '',
        }
    ]);

    useEffect(() => {
        if (accoms && accoms.length > 0) {
            setAccomodations(accoms);
        }
    }, []);

    const addAccomodation = () => {
        setAccomodations((current) => [
            ...current, {
                id: '',
                accomodation_id: current.length + 1,
                address: '',
                check_in: '',
                check_out: '',
            }
        ]);
    };

    const removeAccomodation = (id: number) => {
        setAccomodations((current) => 
            current.filter((accomodation) => accomodation.accomodation_id !== id)
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
                </div>

                {accomodations.map((accomodation, index) => (
                    <div key={'accom_' + index} className="flex gap-2 items-center">
                        <input 
                            type="hidden"
                            name={`accomodation[${index}][accomodation_id]`}
                            id={`accomodationAccomodation_id${index}`}
                            defaultValue={accomodation.id}
                        />
                        <div className="w-1/3">
                            <input
                                type="text"
                                name={`accomodation[${index}][address]`}
                                id={`accomodationAddress${index}`}
                                defaultValue={accomodation.address}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-1/3">
                            <input
                                type="date"
                                name={`accomodation[${index}][check_in]`}
                                id={`accomodationCheckIn${index}`}
                                defaultValue={accomodation.check_in}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-1/3">
                            <input
                                type="date"
                                name={`accomodation[${index}][check_out]`}
                                id={`accomodationCheckOut${index}`}
                                defaultValue={accomodation.check_out}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <button type="button" className="flex items-center justify-center w-6 h-6 rounded-full" onClick={() => removeAccomodation(accomodation.accomodation_id)}>
                            <TrashIcon className="w-4 h-4 text-red-500 hover:text-red-700" />
                        </button>
                    </div>
                ))}
                
                <button type="button" className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-700 mt-2" onClick={addAccomodation}>
                    <PlusIcon className="w-4 h-4 text-blue-500 hover:text-blue-700" />
                    Add Accomodation
                </button>
            </div>
        </div>
    );
};