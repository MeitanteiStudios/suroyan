'use client';

import DayColumn, { Day } from '@/app/ui/components/trips/DayColumn';
import AddPlace from '../../ui/components/trips/AddPlace';
import EditTrip from '../../ui/components/trips/EditTrip';
import { useEffect, useState } from 'react';
import { getTrip, savePlaces } from '@/lib/supabase/trips/actions';
import { DragDropProvider } from '@dnd-kit/react';
import PlaceCard, { Place } from '../../ui/components/trips/PlaceCard';
import { move } from '@dnd-kit/helpers';

export type Accomodation = {
    name: string;
    start: number;
    end: number;
};

type PlaceId = string | number;
type PlaceIds = Record<string, PlaceId[]>;
type PlaceMap = Record<string, Place>;

export default function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [tripId, setTripId] = useState('');

    const [days, setDays] = useState<Day[]>([]);
    const [places, setPlaces] = useState<PlaceMap>({});
    const [placeIds, setPlaceIds] = useState<PlaceIds>({});
    const [trip, setTrip] = useState<any>(null);
    const [accomodations, setAccomodations] = useState<Accomodation[]>([]);
    const [accoms, setAccoms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTrip = async () => {
            const { id } = await params;
            if (!id) {
                setLoading(false);
                return;
            }

            setTripId(id);
            setLoading(true);

            try {
                const result = await getTrip(id);
                setTrip(result.trip);
                setDays(result.days);
                setPlaces(result.placeMap);
                setAccomodations(result.formattedAccommodations);
                setAccoms(result.accommodations);
                setPlaceIds(result.placeIds);
            } catch (error) {
                console.error('Failed to load trip: ', error);
            } finally {
                setLoading(false);
            }
        };

        loadTrip();
    }, [tripId]);

    const dayCount = days.length;

    const threshold = 10;
    const columnWidth: number = Number((100 / dayCount).toFixed(2));
    const width =
        dayCount > threshold
            ? '13rem'
            : `${columnWidth}%`;

    return (
        <div className="w-full h-full flex flex-col gap-4">
            {/* Trip Header */}
            {trip && (
                <div className="flex justify-between">
                    <EditTrip trip={trip} accomodations={accoms} />
                    <AddPlace tripId={trip?.id} />
                </div>
            )}

            {/* Trip Content */}
            <div className="w-full bg-sky-100 grow rounded-md p-4 pt-0 overflow-auto">
                {loading && <div className="w-full h-full flex items-center justify-center">
                    <h3 className="text-lg font-medium">Fetching your trip...</h3>
                </div>}
                <div className="min-w-max">
                    {/* Accommodations */}
                    <div className="sticky top-0 z-30 bg-sky-100 py-1 pt-4">
                        <div className="flex gap-2 mb-2">
                            {accomodations.map((accommodation, index) => {
                                let width;
                                let marginLeft: number|string  = 0;
                                let dateLength: number  = accommodation.end - accommodation.start;

                                if (dayCount > threshold) {
                                    width = `${(dateLength) * 208}px`;
                                    if (index == 0) {
                                        marginLeft = '104px';
                                    }
                                } else {
                                width = `calc(${(
                                        (dateLength) * columnWidth
                                    ).toFixed(2)}% + ${dateLength * 8}px)`;

                                    if (index == 0) {
                                        marginLeft = `${columnWidth / 2}%`;
                                    }
                                }

                                return (
                                    <div
                                        key={accommodation.name}
                                        className="shrink-0 bg-white p-2 rounded-md text-center font-semibold"
                                        style={{
                                            width,
                                            marginLeft
                                        }}
                                    >
                                        {accommodation.name}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Day Header */}
                    <div className="sticky top-[68px] z-20 bg-sky-100 py-1">
                        <div className="flex gap-2 mb-2">
                            {days.map((day, index) => {
                                const isWide = dayCount > threshold;

                                return (
                                    <span
                                        key={'dayHeader_' + index}
                                        className="shrink-0 bg-white p-2 rounded-md text-center font-semibold"
                                        style={{
                                            width: isWide
                                                ? '13rem'
                                                : `${columnWidth}%`,
                                        }}
                                    >
                                        {day.name}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Day Row */}
                    <DragDropProvider
                        onDragOver={(event) => {
                            setPlaceIds((placeIds) => move(placeIds, event));
                        }}
                        onDragEnd={(event) => {
                            setTimeout(async () => {
                                await savePlaces(tripId, placeIds);
                            }, 2000);
                        }}
                    >
                        <form id="placeCardForm" className="flex gap-2">
                            {Object.entries(placeIds).map(([column, ids]) => (
                                <DayColumn
                                    key={column}
                                    width={width}
                                    id={column}
                                >
                                    {ids.map((id, index) => (
                                        <PlaceCard
                                            key={id}
                                            place={places[String(id)]}
                                            index={index}
                                            column={column}
                                        />
                                    ))}
                                </DayColumn>
                            ))}
                        </form>
                    </DragDropProvider>
                </div>
            </div>
        </div>
    );
}