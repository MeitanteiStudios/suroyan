'use client';

import PlaceCard, { Place } from './PlaceCard';

export type Day = {
    id: number;
    name: string;
    places: Place[];
};

type DayColumnProps = {
    day: Day;
    width: string;
};

export default function DayColumn({
    day,
    width,
}: DayColumnProps) {
    return (
        <div
            className="w-[var(--col-width)] shrink-0 h-full"
            style={
                {
                    '--col-width': width,
                } as React.CSSProperties
            }
        >

            {/* Places */}
            <div className="mt-2 flex flex-col gap-2 h-full">
                {day.places.map((place, index) => (
                    <PlaceCard
                        key={place.id}
                        place={place}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}