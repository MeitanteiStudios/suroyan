'use server';

import { Accomodation, PlaceIds, PlaceMap } from "@/app/dashboard/[id]/page";
import { get } from "../api";
import { getAccommodationForDay, getAccomodations, getPlaces, getTrip } from "../trips/actions";
import { createClient } from '@/lib/supabase/server';
import { Coordinate, MarkerData, Route } from "@/app/ui/components/trips/RouteMap";

export type PlaceResult = {
    place_id: number;
    display_name: string;
    name: string;
    lat: string;
    lon: string;
    type: string;
    osm_type: string;
    osm_id: number;
};

const colors = [
    '#dc2626', // red-600
    '#ea580c', // orange-600
    '#ca8a04', // yellow-600
    '#16a34a', // green-600
    '#0891b2', // cyan-600
    '#2563eb', // blue-600
    '#7c3aed', // violet-600
    '#c026d3', // fuchsia-600
    '#db2777', // pink-600
    '#0d9488', // teal-600
];

export async function searchPlace(query: string): Promise<PlaceResult[]> {
    return get('https://nominatim.openstreetmap.org/search', {
        q: query,
        format: 'jsonv2',
        limit: 10,
        polygon_geojson: 1,
    });
}

export async function optimizeTrip(tripId: string) {
    const supabase = await createClient();
    const places = await getPlaces(tripId);
    const accomodations = await getAccomodations(tripId);

    if (accomodations.length == 0 || places?.length == 0) {
        return;
    }

    const locations = [
        ...(accomodations ?? []),
        ...(places ?? []),
    ];
    const startIndexOfPlace = accomodations.length;
    const coordinates = locations.map(
        (location) =>
            `${location.longitude},${location.latitude}`
        )
        .join(';');

    let sourceStr = '0';
    let destinationStr = String(startIndexOfPlace);
    for (let index = Number(sourceStr) + 1; index < startIndexOfPlace; index++) {
        sourceStr += ';' + index;
    }
    for (let index = startIndexOfPlace + 1; index < locations.length; index++) {
        destinationStr += ';' + index;
    }
    let url =
        `https://router.project-osrm.org/table/v1/driving/${coordinates}` +
        `?sources=` + sourceStr +
        `&destinations=`  + destinationStr +
        `&annotations=duration`;
    let response = await fetch(url);
    let matrix = await response.json();
    const durations = matrix.durations;
    //                 Places
    //            A    B    C    D    E
    // Hotel A    ?    ?    ?    ?    ?
    // Hotel B    ?    ?    ?    ?    ?

    const groupPlacesPerAccomodation: number[][] = accomodations.map(() => []);
    // Hotel A (index 0 of accomodations) => [Place 1 (index 0 of places), Place 3 (index 2 of places)]
    // Hotel B (index 1 of accomodations) => [Place 4 (index 3 of places), Place 2 (index 1 of places)]
    for (let col = 0; col < durations[0].length; col++) {
        let rowIndex = 0;
        for (let row = 0; row < durations.length; row++) {
            if (durations[rowIndex][col] > durations[row][col]) {
                rowIndex = row;
            }
        }

        let colIdx = 0
        for (colIdx = 0;  durations[rowIndex][colIdx] < durations[rowIndex][col] && colIdx < groupPlacesPerAccomodation[rowIndex].length; colIdx++) {}
        groupPlacesPerAccomodation[rowIndex].splice(colIdx, 0, col);
    }

    // Get the durations of ALL places and accomodations
    const url2 =
        `https://router.project-osrm.org/table/v1/driving/${coordinates}` +
        `?annotations=duration,distance`;
    const response2 = await fetch(url2);
    const matrix2 = await response2.json();
    const durationsMatrix = matrix2.durations;
    const distancesMatrix = matrix2.distances;

    // Greedy Insertion
    const routes: number[][] = [];
    for (let row = 0; row < groupPlacesPerAccomodation.length; row++) {
        const accomodation = accomodations[row];
        const checkIn = new Date(accomodation.check_in);
        const checkOut = new Date(accomodation.check_out);
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) + (row === groupPlacesPerAccomodation.length - 1 ? 1 : 0);
        const route: number[][] = [];
        // initialize the routes to have an array per day
        for (let day = 0; day < days; day++) {
            route.push([]);
            if (day > 0) {
                route[day].push(groupPlacesPerAccomodation[row][day - 1]);
            } 
        }

        for (let col = days - 1; col < groupPlacesPerAccomodation[row].length; col++) {
            let change = Number.MAX_SAFE_INTEGER;
            let indices: number[] = [0, 0]; // [dayIndex, sortOrderIndex]
            for (let day = 0; day < days; day++) {
                const currentDuration: number = getDuration(route[day], row, durationsMatrix);
                for (let sortOrder = 0; sortOrder <= route[day].length; sortOrder++) {
                    const tempDayRoute = [...route[day]];
                    tempDayRoute.splice(sortOrder, 0, groupPlacesPerAccomodation[row][col]);
                    // calculate the total duration
                    const newDuration = getDuration(tempDayRoute, row, durationsMatrix);
                    if (newDuration - currentDuration < change) {
                        change = newDuration - currentDuration;
                        indices = [day, sortOrder];
                    }
                }
            }
            // Final indices determines where to insert the place
            route[indices[0]].splice(indices[1], 0, groupPlacesPerAccomodation[row][col]);
        }

        // combined the routes
        routes.push(...route);
    }

    // Save the routes in the database
    for (let day = 0; day < routes.length; day++) {
        for (let sortOrder = 0; sortOrder < routes[day].length; sortOrder++) {
            const placeIndex = routes[day][sortOrder] + accomodations.length;
            const place = places && places[routes[day][sortOrder]];
            let distance = 0;
            let time = 0;
            if (sortOrder > 0) {
                distance = distancesMatrix[placeIndex][(routes[day][sortOrder - 1] + accomodations.length)];
                time = durationsMatrix[placeIndex][(routes[day][sortOrder - 1] + accomodations.length)];
            } else if (sortOrder == 0) {
                let accomIndex = -1;
                for (let i = 0; i < groupPlacesPerAccomodation.length; i++) {
                    if (!groupPlacesPerAccomodation[i].includes(routes[day][sortOrder])) {
                        continue;
                    }
                    accomIndex = i;
                    break;
                }

                if (accomIndex >= 0) {
                    distance = distancesMatrix[accomIndex][placeIndex];
                    time = durationsMatrix[accomIndex][placeIndex];
                }
            }
            if (place) {
                const { error } = await supabase
                    .from('trip_places')
                    .update({
                        day: day,
                        sort_order: sortOrder,
                        distance: distance,
                        time: time,
                    })
                    .eq('id', String(place.id))
                    .eq('trip_id', tripId);

                if (error) {
                    throw new Error(error.message);
                }
            }
        }
    }

    return {
        places,
        accomodations,
        locations,
        startIndexOfPlace,
        coordinates,
        matrix,
        sourceStr,
        destinationStr,
        durations,
        groupPlacesPerAccomodation,
        routes
    };
}

function getDuration(route: number[], accomodationIndex: number, durationMatrix: number[][]): number {
    // Duration will start with the hotel to the first index
    let duration = durationMatrix[accomodationIndex][route[0]];
    for(let index = 1; index < route.length; index++) {
        duration += durationMatrix[route[index - 1]][route[index]];
    }

    // Duration will end with last index back to the hotel
    duration += durationMatrix[accomodationIndex][route[route.length - 1]];

    return duration;
}

export async function getRoutes(
    tripId: string,
    placeIds: PlaceIds,
    placeMap: PlaceMap,
    accomodations: Accomodation[]
): Promise<{
    routes: Route[];
    markers: MarkerData[];
}> {
    const supabase = await createClient();

    const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        // .eq('user_id', user_id)
        .single();

    if (tripError) {
        throw new Error(tripError.message);
    }

    if (accomodations.length == 0 || Object.keys(placeIds).length == 0) {
        return {
            routes: [],
            markers: [],
        };
    }

    const routes: Route[] = [];
    const markers: MarkerData[] = [];
    for (const [day, ids] of Object.entries(placeIds)) {
        const accomodation = await getAccommodationForDay(
            trip,
            Number(day),
            accomodations
        );

        if (!accomodation) {
            continue;
        }

        const color = colors[Number(day) % colors.length];
        // Accommodation marker
        markers.push({
            id: accomodation.id+day+'1',
            position: [
                accomodation.latitude,
                accomodation.longitude,
            ],
            color: color,
            name: accomodation.name,
            type: 'accomodation',
        });

        const locations = [];

        // Starting point
        locations.push([
            accomodation.longitude,
            accomodation.latitude,
        ]);

        // Places
        for (const id of ids) {
            const place = placeMap[String(id)];

            locations.push([
                place.longitude,
                place.latitude,
            ]);

            markers.push({
                id: String(place.id)+'day',
                position: [
                    Number(place.latitude),
                    Number(place.longitude),
                ],
                color: color,
                name: place.name,
                type: 'place',
            });
        }

        // Return to accommodation
        locations.push([
            accomodation.longitude,
            accomodation.latitude,
        ]);

        // Accommodation marker
        markers.push({
            id: accomodation.id+day+'2',
            position: [
                accomodation.latitude,
                accomodation.longitude,
            ],
            color: color,
            name: accomodation.name,
            type: 'accomodation',
        });

        const coordinates = locations
            .map(([longitude, latitude]) => `${longitude},${latitude}`)
            .join(';');

        const url =
            `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
            `?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const matrix = await response.json();

        if (!matrix.routes?.length) {
            continue;
        }

        const routeCoordinates: Coordinate[] =
            matrix.routes[0].geometry.coordinates.map(
                ([longitude, latitude]: [number, number]) => [
                    latitude,
                    longitude,
                ]
            );

        routes.push({
            day: Number(day),
            color: color,
            coordinates: routeCoordinates,
        });
    }

    return {
        routes,
        markers
    };
}