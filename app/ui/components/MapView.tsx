'use client';

import { Day } from '@/app/ui/components/trips/DayColumn';
import { Place } from '@/app/ui/components/trips/PlaceCard';
import DayDropdown from './trips/DayDropdown';
import RouteMap, { MarkerData, Route } from './trips/RouteMap';
import { useEffect, useState } from 'react';
import { Accomodation, PlaceIds, PlaceMap } from '@/app/dashboard/[id]/page';

type MapViewProps = {
    days: Day[];
    places: PlaceMap;
    placeIds: PlaceIds;
    accomodations: Accomodation[];
    routes: Route[] | undefined;
    markers: MarkerData[];
};

export default function MapView({
    days,
    places,
    placeIds,
    accomodations,
    routes,
    markers
}: MapViewProps) {
    const [hoveredDay, setHoveredDay] = useState<number | null>(null);
    const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

    const getAccommodationForDay = (day: number) => {
        return accomodations.find(
            ({ start, end }) =>
                day >= start - 1 &&
                (
                    day < end - 1 ||
                    (day === days.length - 1 && day <= end - 1)
                )
        );
    };

    return (
        <div className="w-full flex gap-4 bg-gray-800 grow rounded-md p-4">

            <div className="w-1/3 p-2 flex flex-col gap-4">
                {Object.entries(placeIds).map(([column, ids]) => {
                    const dayIndex = Number(column);

                    const accomodation =
                        getAccommodationForDay(dayIndex);

                    return (
                        <DayDropdown
                            key={'daydopdown_'+column}
                            day={days[dayIndex]}
                            places={places}
                            route={ids}
                            accomodation={accomodation}
                            onHoverDay={() => setHoveredDay(dayIndex)}
                            onLeaveDay={() => setHoveredDay(null)}
                            onHoverMarker={(id) => setHoveredMarker(id)}
                            onLeaveMarker={() => setHoveredMarker(null)}
                        />
                    );
                })}
            </div>

            <div className="w-2/3 max-h-[600px]">
                <RouteMap
                    routes={routes}
                    markers={markers}
                    hoveredDay={hoveredDay}
                    hoveredMarker={hoveredMarker}
                />
            </div>

        </div>
    );
}