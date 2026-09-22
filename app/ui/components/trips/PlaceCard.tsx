'use client';

import { useSortable } from '@dnd-kit/react/sortable';

export type Place = {
    id: number;
    name: string;
    url?: string;
    distance?: string;
    disabled?: boolean;
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

    return (
        <div
            ref={ref}
            data-dragging={isDragging}
            className={`w-full rounded-md bg-sky-200 p-4 transition-opacity ${
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
                    <p className="text-sm text-gray-600">
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

                {place.distance && (
                    <p className="text-xs text-gray-600">
                        Distance: {place.distance}
                    </p>
                )}
            </div>
        </div>
    );
}