'use client';

import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { DragDropProvider } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';

import DayColumn, {
    Day,
} from '@/app/ui/components/trips/DayColumn';

import PlaceCard, {
    Place,
} from '@/app/ui/components/trips/PlaceCard';

import { savePlaces } from '@/lib/supabase/trips/actions';
import { Accomodation, PlaceIds, PlaceMap } from '@/app/dashboard/[id]/page';

type ListViewProps = {
    loading: boolean;
    days: Day[];
    places: PlaceMap;
    placeIds: PlaceIds;
    accomodations: Accomodation[];
    tripId: string;
    dayCount: number;
    threshold: number;
    columnWidth: number;
    width: string;
    setPlaces: React.Dispatch<React.SetStateAction<PlaceMap>>;
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    setPlaceIds: React.Dispatch<React.SetStateAction<PlaceIds>>;
};

export default function ListView({
    loading,
    days,
    places,
    placeIds,
    accomodations,
    tripId,
    dayCount,
    threshold,
    columnWidth,
    width,
    setPlaces,
    setSaving,
    setPlaceIds,
}: ListViewProps) {
    return (
        <div className="w-full bg-gray-800 grow rounded-md p-4 pt-0 overflow-auto">
            {loading && (
                <div className="w-full h-full flex gap-4 items-center justify-center">
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    <h3 className="text-lg font-medium">
                        Fetching your trip...
                    </h3>
                </div>
            )}

            {!loading && (
                <div className="min-w-max">
                    {/* Accommodations */}
                    <div className="sticky top-0 z-30 bg-gray-800 py-1 pt-4">
                        <div className="flex gap-2 mb-2">
                            {accomodations.map(
                                (accommodation, index) => {
                                    let accommodationWidth:
                                        | number
                                        | string;

                                    let marginLeft:
                                        | number
                                        | string = 0;

                                    const dateLength =
                                        accommodation.end -
                                        accommodation.start;

                                    if (dayCount > threshold) {
                                        accommodationWidth =
                                            `${dateLength * 208}px`;

                                        if (index === 0) {
                                            marginLeft = '104px';
                                        }
                                    } else {
                                        accommodationWidth =
                                            `calc(${(
                                                dateLength *
                                                columnWidth
                                            ).toFixed(
                                                2
                                            )}% + ${dateLength * 8
                                            }px)`;

                                        if (index === 0) {
                                            marginLeft = `${columnWidth / 2
                                                }%`;
                                        }
                                    }

                                    return (
                                        <div
                                            key={'accom-'+accommodation.id}
                                            className="shrink-0 bg-gray-600 p-2 rounded-md text-center font-semibold"
                                            style={{
                                                width: accommodationWidth,
                                                marginLeft,
                                            }}
                                        >
                                            {accommodation.name}
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    {/* Day Header */}
                    <div className="sticky top-[68px] z-20 bg-gray-800 w-full py-1">
                        <div className="flex gap-2 mb-2">
                            {days.map((day, index) => {
                                const isWide =
                                    dayCount > threshold;

                                return (
                                    <span
                                        key={
                                            'dayHeader_' +
                                            index
                                        }
                                        className="shrink-0 bg-gray-600 p-2 rounded-md text-center font-semibold"
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

                    {/* Day Columns */}
                    <DragDropProvider
                        onDragOver={(event) => {
                            setPlaceIds((placeIds) => move(placeIds, event));
                        }}
                        onDragEnd={(event) => {
                            setSaving(true);
                            setTimeout(async () => {
                                const response = await savePlaces(tripId, placeIds);
                                setPlaces(response.placeMap);
                                setSaving(false);
                            }, 1000);
                        }}
                    >
                        <form
                            id="placeCardForm"
                            className="flex gap-2"
                        >
                            {Object.entries(placeIds).map(
                                ([column, ids]) => (
                                    <DayColumn
                                        key={'day_col'+column}
                                        width={width}
                                        id={column}
                                    >
                                        {ids.map(
                                            (id, index) => (
                                                <PlaceCard
                                                    key={'placecared-'+id}
                                                    place={places[String(id)]}
                                                    index={index}
                                                    column={column                                                }
                                                />
                                            )
                                        )}
                                    </DayColumn>
                                )
                            )}
                        </form>
                    </DragDropProvider>
                </div>
            )}
        </div>
    );
}