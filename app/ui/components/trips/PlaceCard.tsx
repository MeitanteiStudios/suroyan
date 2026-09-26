'use client';

import { useSortable } from '@dnd-kit/react/sortable';

export type Place = {
    id: number;
    name: string;
    url?: string;
    distance?: string;
    time?: string;
    disabled?: boolean;
    longitude?: number;
    latitude?: number;
};

type PlaceCardProps = {
    place: Place;
    index: number;
    column: any;
};

export default function PlaceCard({
    place,
    index,
    column,
}: PlaceCardProps) {
    const { ref, handleRef, isDragging } = useSortable({
        id: place.id,
        index,
        disabled: place.disabled ? { draggable: true } : false,
        type: 'item',
        accept: 'item',
        group: column,
    });

    function formatDuration(seconds: number): string {
        const minutes = Math.round(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours === 0) {
            return `${remainingMinutes} mins`;
        }

        if (remainingMinutes === 0) {
            return `${hours} hr`;
        }

        return `${hours} hr ${remainingMinutes} mins`;
    }

    return (
        <div
            ref={ref}
            data-dragging={isDragging}
            className={`w-full rounded-md bg-sky-500 p-4 transition-opacity ${
                isDragging ? 'opacity-50' : ''
            } ${place.disabled ? 'opacity-60' : ''}`}
        >
            <div
                ref={place.disabled ? undefined : handleRef}
                className={place.disabled ? 'cursor-default' : 'cursor-move'}
            >
                <input type="hidden" name="place_cards[][]" value={place.name} />
                <h3 className="text-lg font-semibold">
                    {place.name}
                </h3>

                {place.url && (
                    <p className="text-sm text-gray-200">
                        <a
                            href={place.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                            onClick={(event) => event.stopPropagation()}
                        >
                            View Details
                        </a>
                    </p>
                )}

                {Number(place.distance) > 0 && (
                    <p className="text-xs text-gray-200">
                        Distance: {(Number(place.distance) / 1000).toFixed(1)} km
                        {' '}
                        (Approx. {formatDuration(Number(place.time))})
                    </p>
                )}
            </div>
        </div>
    );
}