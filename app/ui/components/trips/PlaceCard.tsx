'use client';

import { useSortable } from '@dnd-kit/react/sortable';

export type Place = {
    id: number;
    name: string;
    url?: string;
    distance?: string;
};

type PlaceCardProps = {
    place: Place;
    index: number;
};

// Some change
export default function PlaceCard({ place, index }: PlaceCardProps) {
    const { ref, handleRef, isDragging } = useSortable({
        id: place.id,
        index,
    });

    return (
        <div
            ref={ref}
            className={`w-full rounded-md bg-sky-200 p-4 transition-opacity ${
                isDragging ? 'opacity-50' : ''
            }`}
        >
            <div
                ref={handleRef}
                className="cursor-move"
            >
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