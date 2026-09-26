'use client';

import { useState } from 'react';
import { ChevronDownIcon, HomeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Day } from '@/app/ui/components/trips/DayColumn';
import { Place } from '@/app/ui/components/trips/PlaceCard';
import { PlaceId, PlaceMap } from '@/app/dashboard/[id]/page';

export type Accomodation = {
    id: string,
    name: string;
    start: number;
    end: number;
};

type DayDropdownProps = {
    day: Day;
    places: PlaceMap;
    route: PlaceId[];
    accomodation?: Accomodation;

    onHoverDay: () => void;
    onLeaveDay: () => void;

    onHoverMarker: (id: string) => void;
    onLeaveMarker: () => void;
};

export default function DayDropdown({
    day,
    places,
    route,
    accomodation,
    onHoverDay,
    onLeaveDay,
    onHoverMarker,
    onLeaveMarker,
}: DayDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <div
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={onHoverDay}
                onMouseLeave={onLeaveDay}
                className="flex gap-4 items-center cursor-pointer select-none"
            >
                <ChevronDownIcon
                    className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-0' : 'rotate-[-90deg]'
                        }`}
                />

                <h3 className="font-semibold text-lg">
                    {day.name}
                </h3>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ${
                    isOpen
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                }`}
            >
                <div className="mt-2 space-y-2">
                    {accomodation && (
                        <div
                            className="flex gap-4 items-center"
                            onMouseEnter={() =>
                                onHoverMarker(`${accomodation.id}`)
                            }
                            onMouseLeave={onLeaveMarker}
                        >
                            <HomeIcon className="h-5 w-5" />
                            <p>{accomodation.name}</p>
                        </div>
                    )}
                    {route.length > 0 ? (
                        <>
                            {route.map((id) => {
                                const place = places[String(id)];

                                return (
                                    <div
                                        key={'place-route-'+id}
                                        className="flex gap-4 items-center"
                                        onMouseEnter={() => onHoverMarker(`${place.id}`)}
                                        onMouseLeave={onLeaveMarker}
                                    >
                                        <MapPinIcon className="h-5 w-5" />
                                        <p>{place.name}</p>
                                    </div>
                                );
                            })}

                            {accomodation && (
                                <div
                                    className="flex gap-4 items-center"
                                    onMouseEnter={() =>
                                        onHoverMarker(`${accomodation.id}`)
                                    }
                                    onMouseLeave={onLeaveMarker}
                                >
                                    <HomeIcon className="h-5 w-5" />
                                    <p>{accomodation.name}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-400">
                            No places added for this day.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}