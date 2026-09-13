'use client';

import { PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import DayColumn, { Day } from '@/app/ui/components/trips/DayColumn';
import AddPlace from '../ui/components/trips/AddPlace';
import EditTrip from '../ui/components/trips/EditTrip';

export default function Page() {
    const dates: Day[] = [
    {
        id: 1,
        name: 'Day 1 - Arrival & Tokyo',
        places: [
            {
                id: 1,
                name: 'Tokyo Tower',
                url: 'https://example.com/tokyo-tower',
                distance: '1.2 km',
            },
            {
                id: 2,
                name: 'Shibuya Crossing',
                url: 'https://example.com/shibuya-crossing',
                distance: '2.4 km',
            },
            {
                id: 3,
                name: 'Meiji Shrine',
                url: 'https://example.com/meiji-shrine',
                distance: '1.8 km',
            },
            {
                id: 4,
                name: 'Harajuku Takeshita Street',
                distance: '0.7 km',
            },
        ],
    },
    {
        id: 2,
        name: 'Day 2 - Asakusa',
        places: [
            {
                id: 5,
                name: 'Senso-ji Temple',
                url: 'https://example.com/sensoji',
                distance: '1.1 km',
            },
            {
                id: 6,
                name: 'Nakamise Shopping Street',
                distance: '0.2 km',
            },
            {
                id: 7,
                name: 'Tokyo Skytree',
                url: 'https://example.com/skytree',
                distance: '2.0 km',
            },
            {
                id: 8,
                name: 'Sumida Park',
                distance: '0.5 km',
            },
        ],
    },
    {
        id: 3,
        name: 'Day 3 - Shinjuku',
        places: [
            {
                id: 9,
                name: 'Shinjuku Gyoen National Garden',
                distance: '1.3 km',
            },
            {
                id: 10,
                name: 'Tokyo Metropolitan Government Building',
                distance: '1.7 km',
            },
            {
                id: 11,
                name: 'Omoide Yokocho',
                distance: '0.8 km',
            },
            {
                id: 12,
                name: 'Kabukicho',
                distance: '0.6 km',
            },
            {
                id: 13,
                name: 'Godzilla Head',
                distance: '0.3 km',
            },
        ],
    },
    {
        id: 4,
        name: 'Day 4 - Odaiba',
        places: [
            {
                id: 14,
                name: 'teamLab Borderless',
                url: 'https://example.com/teamlab',
                distance: '1.5 km',
            },
            {
                id: 15,
                name: 'DiverCity Tokyo Plaza',
                distance: '0.9 km',
            },
            {
                id: 16,
                name: 'Gundam Statue',
                distance: '0.1 km',
            },
            {
                id: 17,
                name: 'Odaiba Seaside Park',
                distance: '1.2 km',
            },
        ],
    },
    {
        id: 5,
        name: 'Day 5 - Ueno',
        places: [
            {
                id: 18,
                name: 'Ueno Park',
                distance: '0.5 km',
            },
            {
                id: 19,
                name: 'Tokyo National Museum',
                distance: '0.8 km',
            },
            {
                id: 20,
                name: 'Ameya-Yokocho',
                distance: '0.4 km',
            },
            {
                id: 21,
                name: 'Ueno Zoo',
                distance: '0.7 km',
            },
        ],
    },
    {
        id: 6,
        name: 'Day 6 - Ginza',
        places: [
            {
                id: 22,
                name: 'Tsukiji Outer Market',
                distance: '1.1 km',
            },
            {
                id: 23,
                name: 'Ginza Six',
                distance: '0.9 km',
            },
            {
                id: 24,
                name: 'Kabuki-za Theatre',
                distance: '0.4 km',
            },
            {
                id: 25,
                name: 'Tokyo Station',
                distance: '1.3 km',
            },
        ],
    },
    {
        id: 7,
        name: 'Day 7 - Final Day',
        places: [
            {
                id: 26,
                name: 'Imperial Palace',
                distance: '1.2 km',
            },
            {
                id: 27,
                name: 'Tokyo Station',
                distance: '1.5 km',
            },
            {
                id: 28,
                name: 'Akihabara',
                distance: '2.0 km',
            },
            {
                id: 29,
                name: 'Don Quijote Akihabara',
                distance: '0.3 km',
            },
            {
                id: 30,
                name: 'Haneda Airport',
                distance: '18.5 km',
            },
        ],
    },
];
    const dayCount = dates.length;
    const threshold = 10;
    const accommodations = [
        {
            name: 'Hotel A',
            start: 1,
            end: 3,
        },
        {
            name: 'Hotel B',
            start: 3,
            end: 5,
        },
        {
            name: 'Hotel C',
            start: 5,
            end: 7,
        },
    ];
    const days = Array.from(
        { length: dayCount },
        (_, i) => `Day ${i + 1}`
    );
    const columnWidth: number = Number((100 / dayCount).toFixed(2));

    return (
        <div className="w-full h-full flex flex-col gap-4">
            {/* Trip Header */}
            <div className="flex justify-between">
                <EditTrip />
                <AddPlace />
            </div>

            {/* Trip Content */}
            <div className="w-full bg-sky-100 grow rounded-md p-4 pt-0 overflow-auto">
                <div className="min-w-max">
                    
                    {/* Accommodations */}
                    <div className="sticky top-0 z-30 bg-sky-100 py-1 pt-4">
                        <div className="flex gap-2 mb-2">
                            {accommodations.map((accommodation, index) => {
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
                            {dates.map((day) => {
                                const isWide = dayCount > threshold;

                                return (
                                    <span
                                        key={day.id}
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
                    <div className="flex gap-2">
                        {dates.map((day) => {
                            const width =
                                dayCount > threshold
                                    ? '13rem'
                                    : `${columnWidth}%`;

                            return (
                                <DayColumn
                                    key={day.id}
                                    day={day}
                                    width={width}
                                />
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
    );
}