'use server';

import { get } from "../api";
import { getAccomodations, getPlaces, getTrip } from "../trips/actions";
import { createClient } from '@/lib/supabase/server';

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
    let sample = '';
    // Hotel A (index 0 of accomodations) => [Place 1 (index 0 of places), Place 3 (index 2 of places)]
    // Hotel B (index 1 of accomodations) => [Place 4 (index 3 of places), Place 2 (index 1 of places)]
    for (let col = 0; col < durations[0].length; col++) {
        let rowIndex = 0;
        for (let row = 0; row < durations.length; row++) {
            if (durations[rowIndex][col] > durations[row][col]) {
                rowIndex = row;
            }
            sample += durations[row][col] + ' ';
        }

        let colIdx = 0
        for (colIdx = 0;  durations[rowIndex][colIdx] < durations[rowIndex][col] && colIdx < groupPlacesPerAccomodation[rowIndex].length; colIdx++) {}
        groupPlacesPerAccomodation[rowIndex].splice(colIdx, 0, col);
        sample += 'rowIndex: ' + rowIndex + ' -- next --';
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
        sample,
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
