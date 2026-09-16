'use client';

import PlaceCard, { Place } from './PlaceCard';
import { useDroppable } from '@dnd-kit/react';
import { DragDropProvider } from '@dnd-kit/react';

export type Day = {
    id: string | number;
    name: string;
    date: string;
    places: any[];
};

type DayColumnProps = {
    day: Day;
    width: string;
    index: number;
};

export default function DayColumn({
    day,
    width,
    index,
}: DayColumnProps) {
    const { ref } = useDroppable({
        id: 'day_' + index
    });

    return (
        <div
            ref={ref}
            id={'day_' + index.toString()}
            className="w-[var(--col-width)] mt-2 flex flex-col gap-2 shrink-0 min-h-[500px]"
            style={
                {
                    '--col-width': width,
                } as React.CSSProperties
            }
        >

            {/* Places */}
            {day.places.map((place, index) => (
                <PlaceCard
                    key={place.id}
                    place={place}
                    index={index}
                />
            ))}
        </div>
    );
}