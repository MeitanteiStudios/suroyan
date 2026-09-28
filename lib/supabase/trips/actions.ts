'use server';

import { createClient } from '@/lib/supabase/server';
import { getRoutes, optimizeTrip } from '../maps/actions';
import { marker } from 'leaflet';
import { FormErrors } from '@/app/ui/components/trips/AddTrip';

const user_id = '550e8400-e29b-41d4-a716-446655440000';

export async function createTrip(formData: FormData) {
    const supabase = await createClient();

    try {
        const tripErrors = validateTripForm(formData);
        const placeErrors = validatePlaces(formData);
        const errors = {
            ...tripErrors,
            ...placeErrors,
        };

        if (Object.keys(errors).length > 0) {
            return {
                success: false,
                errors,
                message: 'You have errors in your form.',
            };
        }
        const data = Object.fromEntries(formData);

        // throw new Error('Test Error');
        // Get currently logged-in user
        // const {
        //     data: { user },
        // } = await supabase.auth.getUser();

        // if (!user) {
        //     throw new Error('You must be logged in.');
        // }

        // PUT THE FOREIGN KEY BACK
        const { data: trip, error } = await supabase
            .from('trips')
            .insert({
                user_id: user_id,
                name: data['trip_name'],
                start_date: data['start_date'],
                start_time: data['start_time'] || null,
                end_date: data['end_date'],
                end_time: data['end_time'] || null,
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        for (let i = 0; ; i++) {
            const accommodationAddress = data[`accomodation[${i}][address]`];
            const placeAddress = data[`place[${i}][address]`];

            if (!accommodationAddress && !placeAddress) {
                break;
            }

            if (accommodationAddress) {
                const checkIn = data[`accomodation[${i}][check_in]`];
                const checkOut = data[`accomodation[${i}][check_out]`];

                let { error } = await supabase
                    .from('accommodations')
                    .insert({
                        trip_id: trip.id,
                        name: accommodationAddress,
                        address: accommodationAddress,
                        check_in: checkIn,
                        check_out: checkOut,
                    });

                if (error) {
                    throw new Error(error.message);
                }
            }

            if (placeAddress) {
                const name = data[`place[${i}][name]`];
                const latitude = data[`place[${i}][latitude]`];
                const longitude = data[`place[${i}][longitude]`];
                const placeId = data[`place[${i}][place_id]`];

                let { error } = await supabase
                    .from('trip_places')
                    .insert({
                        trip_id: trip.id,
                        name: name,
                        address: placeAddress,
                        latitude: latitude,
                        longitude: longitude,
                        place_id: placeId,
                    });

                if (error) {
                    throw new Error(error.message);
                }
            }
        }

        return {
            success: true,
            message: 'Trip created successfully!',
            errors: {},
            tripId: trip.id,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error
                ? error.message
                : 'Something went wrong.',
            errors: {},
        };
    }
}

export async function updateTrip(formData: FormData) {
    const supabase = await createClient();

    try {
        const errors = validateTripForm(formData);
        if (Object.keys(errors).length > 0) {
            return {
                success: false,
                errors,
                message: 'You have errors in your form.',
            };
        }

        const data = Object.fromEntries(formData);

        const tripId = data['trip_id'] as string;

        if (!tripId) {
            throw new Error('Trip ID is required.');
        }

        /*
         * 1. Update Trip
         */
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .update({
                name: data['trip_name'],
                start_date: data['start_date'],
                start_time: data['start_time'] || null,
                end_date: data['end_date'],
                end_time: data['end_time'] || null,
            })
            .eq('id', tripId)
            .select()
            .single();

        if (tripError) {
            throw new Error(tripError.message);
        }

        /*
         * 2. Get existing accommodations
         */
        const { data: existingAccomodations, error: existingError } =
            await supabase
                .from('accommodations')
                .select('id')
                .eq('trip_id', tripId);

        if (existingError) {
            throw new Error(existingError.message);
        }

        /*
         * 3. Get accommodations submitted by the form
         */
        const submittedAccomodationIds: string[] = [];

        for (let i = 0; ; i++) {
            const accomodationId = data[`accomodation[${i}][accomodation_id]`];
            const address = data[`accomodation[${i}][address]`];
            const checkIn = data[`accomodation[${i}][check_in]`];
            const checkOut = data[`accomodation[${i}][check_out]`];
            const latitude = data[`accomodation[${i}][latitude]`];
            const longitude = data[`accomodation[${i}][longitude]`];
            const placeId = data[`accomodation[${i}][place_id]`];

            // No more accommodation fields
            if (
                accomodationId === undefined &&
                address === undefined
            ) {
                break;
            }

            /*
             * Existing accommodation
             */
            if (accomodationId) {
                submittedAccomodationIds.push(
                    accomodationId as string
                );

                const { error } = await supabase
                    .from('accommodations')
                    .update({
                        address: address || null,
                        name: address || null,
                        check_in: checkIn || null,
                        check_out: checkOut || null,
                        place_id: placeId || null,
                        latitude: latitude,
                        longitude: longitude,
                    })
                    .eq('id', accomodationId)
                    .eq('trip_id', tripId);

                if (error) {
                    throw new Error(error.message);
                }
            }

            /*
             * New accommodation
             */
            else if (address) {
                const { error } = await supabase
                    .from('accommodations')
                    .insert({
                        trip_id: tripId,
                        name: address,
                        address: address,
                        check_in: checkIn || null,
                        check_out: checkOut || null,
                        place_id: placeId || null,
                        latitude: latitude,
                        longitude: longitude,
                    });

                if (error) {
                    throw new Error(error.message);
                }
            }
        }

        /*
         * 4. Delete accommodations that were removed
         */
        const existingIds =
            existingAccomodations?.map(
                (accomodation) => accomodation.id
            ) ?? [];

        const idsToDelete = existingIds.filter(
            (id) => !submittedAccomodationIds.includes(id)
        );

        if (idsToDelete.length > 0) {
            const { error } = await supabase
                .from('accommodations')
                .delete()
                .in('id', idsToDelete)
                .eq('trip_id', tripId);

            if (error) {
                throw new Error(error.message);
            }
        }

        return {
            success: true,
            message: 'Trip updated successfully!',
            trip,
            errors: {}
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Something went wrong.',
            errors: {}
        };
    }
}

export async function getTrips() {
    const supabase = await createClient();

    // const {
    //     data: { user },
    // } = await supabase.auth.getUser();

    // if (!user) {
    //     throw new Error('User is not authenticated');
    // }

    const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user_id)
        .order('start_date', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function getTrip(tripId: string) {
    const supabase = await createClient();

    const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .eq('user_id', user_id)
        .single();

    if (tripError) {
        throw new Error(tripError.message);
    }

    const dates = getDatesBetween(trip.start_date, trip.end_date);

    // Days only contain day information
    const days = dates.map((date, index) => {
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

        return {
            id: `day-${index + 1}`,
            name: `Day ${index + 1} - ${formattedDate}`,
            date,
        };
    });

    // Places are kept as a separate array.
    // places[0] = places for Day 1
    // places[1] = places for Day 2
    // etc.
    const places = await Promise.all(
        dates.map((_, index) => getPlaces(tripId, index))
    );

    const placeIds = Object.fromEntries(
        places.map((dayPlaces, index) => [
            String(index),
            (dayPlaces ?? []).map((place) => place.id),
        ])
    );

    const placeMap = Object.fromEntries(
        places
            .flat()
            .map((place) => [place.id, place])
    );

    const { data: accommodations, error: accommodationError } =
        await supabase
            .from('accommodations')
            .select('*')
            .eq('trip_id', tripId)
            .order('check_in', { ascending: true });

    if (accommodationError) {
        throw new Error(accommodationError.message);
    }

    const accomodationWithIndex = accommodations.map(
        (accommodation, index) => ({
            ...accommodation,
            accomodation_id: accommodation.id,
        })
    );

    const formattedAccommodations = await Promise.all(
        accommodations.map(async (accommodation) => ({
            id: accommodation.id,
            name: accommodation.name,
            start: await getDayNumber(
                accommodation.check_in,
                trip.start_date
            ),
            end: await getDayNumber(
                accommodation.check_out,
                trip.start_date
            ),
        }))
    );

    const {routes, markers} = await getRoutes(tripId, placeIds, placeMap, accommodations);

    return {
        name: trip.name,
        trip,
        days,
        placeIds,
        placeMap,
        formattedAccommodations,
        accommodations: accomodationWithIndex,
        routes,
        markers
    };
}

export async function getDayNumber (date: string, tripStartDate: string) {
    const start = new Date(tripStartDate);
    const current = new Date(date);

    return (
        Math.floor(
            (current.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
    );
};


export async function getPlaces(tripId: string, day?: number): Promise<any[]> {
    const supabase = await createClient();

    let query = supabase
        .from('trip_places')
        .select('*')
        .eq('trip_id', tripId);

    if (day !== undefined) {
        query = query.eq('day', day);
    }

    let { data: places, error: placesError } = await query
        .order('sort_order', { ascending: true });

    if (placesError) {
        throw new Error(placesError.message);
    }

    return places ?? [];
}

export async function getAccomodations(tripId: string) {
    const supabase = await createClient();

    const { data: accomodations, error: error } =
            await supabase
                .from('accommodations')
                .select('*')
                .eq('trip_id', tripId);

    if (error) {
        throw new Error(error.message);
    }

    return accomodations;
}

export async function addPlaces(formData: FormData) {
    const supabase = await createClient();

    try {
        const errors = validatePlaces(formData);
        if (Object.keys(errors).length > 0) {
            return {
                success: false,
                errors,
                message: 'You have errors in your form.',
            };
        }

        const data = Object.fromEntries(formData);

        const tripId = data['trip_id'] as string;

        if (!tripId) {
            throw new Error('Trip ID is required.');
        }

        const places = [];

        for (let i = 0; ; i++) {
            const name = data[`place[${i}][name]`];
            const address = data[`place[${i}][address]`];

            if (name === undefined && address === undefined) {
                break;
            }

            if (!name && !address) {
                continue;
            }

            places.push({
                trip_id: tripId,
                name: name || '',
                address: address || null,
                place_id:
                    data[`place[${i}][place_id]`] || null,
                latitude:
                    data[`place[${i}][latitude]`]
                        ? Number(data[`place[${i}][latitude]`])
                        : null,
                longitude:
                    data[`place[${i}][longitude]`]
                        ? Number(data[`place[${i}][longitude]`])
                        : null,
                category:
                    data[`place[${i}][category]`] || null,
                distance: 0,
                time: 0,

                // New places can initially be assigned
                // to Day 1.
                day: 0,

                // Put them after existing places.
                sort_order: i,
            });
        }

        if (places.length === 0) {
            throw new Error('No places were provided.');
        }

        const { data: insertedPlaces, error } = await supabase
            .from('trip_places')
            .insert(places)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        await optimizeTrip(tripId);

        return {
            success: true,
            message: 'Places added successfully!',
            places: insertedPlaces,
            errors: {},
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Something went wrong.',
            errors: {},
        };
    }
}

export async function savePlaces(
    tripId: string,
    placeIds: Record<string, (string | number)[]>
) {
    const supabase = await createClient();

    // Verify trip belongs to the current user
    const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .eq('user_id', user_id)
        .single();

    if (tripError) {
        throw new Error(tripError.message);
    }

    const places = await getPlaces(tripId);
    const accomodations = await getAccomodations(tripId);

    /*
     * OSRM matrix layout:
     *
     * 0                 = accommodation[0]
     * 1                 = accommodation[1]
     * ...
     * accomodations.length
     *                    = places[0]
     * accomodations.length + 1
     *                    = places[1]
     * ...
     */

    const locations = [
        ...accomodations,
        ...places,
    ];

    const coordinates = locations
        .map(
            (location) =>
                `${location.longitude},${location.latitude}`
        )
        .join(';');

    const url =
        `https://router.project-osrm.org/table/v1/driving/${coordinates}` +
        `?annotations=duration,distance`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `OSRM request failed: ${response.status}`
        );
    }

    const matrix = await response.json();

    const durationsMatrix = matrix.durations;
    const distancesMatrix = matrix.distances;

    /*
     * Create maps so we can quickly find the OSRM matrix index
     * for a particular accommodation/place.
     */

    const accommodationIndex = Object.fromEntries(
        accomodations.map((accommodation, index) => [
            accommodation.id,
            index,
        ])
    );

    const placeIndex = Object.fromEntries(
        places.map((place, index) => [
            place.id,
            accomodations.length + index,
        ])
    );

    /*
     * Update each place.
     */
    for (const [column, ids] of Object.entries(placeIds)) {
        const day = Number(column);

        for (const [sortOrder, id] of ids.entries()) {
            const placeId = String(id);

            const toIndex = placeIndex[placeId];

            if (toIndex === undefined) {
                throw new Error(
                    `Could not find OSRM index for place ${placeId}`
                );
            }

            let fromIndex: number;

            if (sortOrder === 0) {
                /*
                 * First place of the day:
                 *
                 * Accommodation → Place
                 */
                const accommodation = await getAccommodationForDay(trip, day, accomodations);

                if (!accommodation) {
                    throw new Error(
                        `Could not find accommodation for day ${day}` 
                    );
                }

                fromIndex =
                    accommodationIndex[accommodation.id];

                if (fromIndex === undefined) {
                    throw new Error(
                        `Could not find OSRM index for accommodation ${accommodation.id}`
                    );
                }
            } else {
                /*
                 * Subsequent place:
                 *
                 * Previous Place → Current Place
                 */
                const previousPlaceId = String(
                    ids[sortOrder - 1]
                );

                fromIndex =
                    placeIndex[previousPlaceId];

                if (fromIndex === undefined) {
                    throw new Error(
                        `Could not find OSRM index for previous place ${previousPlaceId}`
                    );
                }
            }

            const distance =
                distancesMatrix[fromIndex][toIndex];

            const duration =
                durationsMatrix[fromIndex][toIndex];

            console.log({
                day,
                sortOrder,
                fromIndex,
                toIndex,
                from: locations[fromIndex]?.name,
                to: locations[toIndex]?.name,
                distance,
                duration,
            });

            const { error } = await supabase
                .from('trip_places')
                .update({
                    day,
                    sort_order: sortOrder,
                    distance,
                    time: duration,
                })
                .eq('id', placeId)
                .eq('trip_id', tripId);

            if (error) {
                throw new Error(error.message);
            }
        }
    }

    /*
     * Fetch the updated places.
     *
     * getPlaces() uses day numbers starting at 1,
     * so use index + 1 here.
     */
    const dates = getDatesBetween(
        trip.start_date,
        trip.end_date
    );

    const updatedPlaces = await Promise.all(
        dates.map((_, index) =>
            getPlaces(tripId, index + 1)
        )
    );

    const placeMap = Object.fromEntries(
        updatedPlaces
            .flat()
            .map((place) => [place.id, place])
    );

    return {
        placeMap,
    };
}


export async function deletePlace(placeId: String) {
    const supabase = await createClient();

    const { data: place, error: placeError } = await supabase
        .from('trip_places')
        .select('*')
        .eq('id', placeId)
        .single();

    if (placeError) {
        throw new Error(placeError.message);
    }

    // Update the next place's time, distance, and sort order
    const { data: nextPlace, error: nextPlaceError } = await supabase
        .from('trip_places')
        .select('*')
        .eq('day', place.day)
        .eq('sort_order', place.sort_order + 1)
        .eq('trip_id', place.trip_id)
        .single();

    if (nextPlaceError) {
        throw new Error(nextPlaceError.message);
    }

    const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', place.trip_id)
        .eq('user_id', user_id)
        .single();

    if (tripError) {
        throw new Error(tripError.message);
    }

    if (nextPlace) {
        // Get the place before the current place
        let prevPlace = null
        if (place.sort_order > 0) {
            const { data: prev, error: prevPlaceError } = await supabase
                .from('trip_places')
                .select('*')
                .eq('day', place.day)
                .eq('sort_order', place.sort_order + 1)
                .eq('trip_id', place.trip_id)
                .single();

            if (prevPlaceError) {
                throw new Error(prevPlaceError.message);
            }
            prevPlace = prev;
        } else {
            const accomodations = await getAccomodations(place.trip_id);
            const prev = await getAccommodationForDay(trip, place.day, accomodations);
            prevPlace = prev;
        }

        if (prevPlace) {
            const coordinates = `${prevPlace.longitude},${prevPlace.latitude};${nextPlace.longitude},${nextPlace.latitude}`;
            const url =
                `https://router.project-osrm.org/table/v1/driving/${coordinates}` +
                `?annotations=duration,distance`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(
                    `OSRM request failed: ${response.status}`
                );
            }

            const matrix = await response.json();

            const durationsMatrix = matrix.durations;
            const distancesMatrix = matrix.distances;

            const { error } = await supabase
                .from('trip_places')
                .update({
                    sort_order: place.sort_order,
                    distance: distancesMatrix[0][1],
                    time: durationsMatrix[0][1],
                })
                .eq('id', nextPlace.id)
                .eq('trip_id', nextPlace.trip_id);

            if (error) {
                throw new Error(error.message);
            }
        }
    }

    // Delete the current place
    const { error } = await supabase
        .from('trip_places')
        .delete()
        .eq('id', placeId)
        .eq('trip_id', place.trip_id);

    if (error) {
        throw new Error(error.message);
    }

    const dates = getDatesBetween(trip.start_date, trip.end_date);
    const places = await Promise.all(
        dates.map((_, index) => getPlaces(trip.id, index))
    );

    const placeIds = Object.fromEntries(
        places.map((dayPlaces, index) => [
            String(index),
            (dayPlaces ?? []).map((place) => place.id),
        ])
    );

    const placeMap = Object.fromEntries(
        places
            .flat()
            .map((place) => [place.id, place])
    );

    return {
        placeIds,
        placeMap
    };
}

function getDatesBetween(startDate: string, endDate: string) {
    const dates: string[] = [];

    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);

        current.setDate(current.getDate() + 1);
    }

    return dates;
}

export async function getAccommodationForDay(trip: any, day: number, accomodations: any[])  {
    const accommodationRanges = await Promise.all(
        accomodations.map(async (accommodation) => ({
            accommodation,
            startDay: await getDayNumber(
                accommodation.check_in,
                trip.start_date
            ),
            endDay: await getDayNumber(
                accommodation.check_out,
                trip.start_date
            ),
        }))
    );

    const lastDay = await getDayNumber(
        trip.end_date,
        trip.start_date
    );

    return accommodationRanges.find(
        ({ startDay, endDay }) =>
            day >= (startDay - 1) &&
            (
                day < (endDay - 1) ||
                day === lastDay - 1
            )
    )?.accommodation;
};

type AccommodationInput = {
    index: number;
    address: string;
    checkIn: string;
    checkOut: string;
};

function validateTripForm(formData: FormData): FormErrors {
    const errors: FormErrors = {};

    const addError = (field: string, message: string) => {
        if (!errors[field]) {
            errors[field] = [];
        }

        errors[field].push(message);
    };

    const tripName = String(formData.get('trip_name') ?? '').trim();
    const startDate = String(formData.get('start_date') ?? '').trim();
    const endDate = String(formData.get('end_date') ?? '').trim();

    // Trip validation
    if (!tripName) {
        addError('trip_name', 'Trip name is required.');
    }

    if (!startDate) {
        addError('start_date', 'Start date is required.');
    }

    if (!endDate) {
        addError('end_date', 'End date is required.');
    }

    if (startDate && endDate && startDate > endDate) {
        addError('end_date', 'End date cannot be before start date.');
    }

    // Accommodation validation
    const accommodations: AccommodationInput[] = [];

    for (let i = 0; ; i++) {
        const address = String(
            formData.get(`accomodation[${i}][address]`) ?? ''
        ).trim();

        const placeId = String(
            formData.get(`accomodation[${i}][place_id]`) ?? ''
        ).trim();

        const latitude = String(
            formData.get(`accomodation[${i}][latitude]`) ?? ''
        ).trim();

        const longitude = String(
            formData.get(`accomodation[${i}][longitude]`) ?? ''
        ).trim();

        const checkIn = String(
            formData.get(`accomodation[${i}][check_in]`) ?? ''
        ).trim();

        const checkOut = String(
            formData.get(`accomodation[${i}][check_out]`) ?? ''
        ).trim();

        // Stop when there is no accommodation at this index
        if (!address && !checkIn && !checkOut) {
            break;
        }

        // Individual field validation
        if (!address || !placeId || !latitude || !longitude) {
            addError(
                `accomodation[${i}][address]`,
                'Accommodation is required.'
            );
        }

        if (!checkIn) {
            addError(
                `accomodation[${i}][check_in]`,
                'Check-in date is required.'
            );
        }

        if (!checkOut) {
            addError(
                `accomodation[${i}][check_out]`,
                'Check-out date is required.'
            );
        }

        // Only perform date comparisons when both dates exist
        if (checkIn && checkOut) {
            if (checkIn >= checkOut) {
                addError(
                    `accomodation[${i}][check_out]`,
                    'Check-out date must be after check-in date.'
                );
            }

            if (startDate && checkIn < startDate) {
                addError(
                    `accomodation[${i}][check_in]`,
                    'Check-in date cannot be before the trip start date.'
                );
            }

            if (endDate && checkOut > endDate) {
                addError(
                    `accomodation[${i}][check_out]`,
                    'Check-out date cannot be after the trip end date.'
                );
            }
        }

        accommodations.push({
            index: i,
            address,
            checkIn,
            checkOut,
        });
    }

    // Check accommodation overlaps
    for (let i = 0; i < accommodations.length; i++) {
        for (let j = i + 1; j < accommodations.length; j++) {
            const a = accommodations[i];
            const b = accommodations[j];

            // Skip if either accommodation is missing dates
            if (!a.checkIn || !a.checkOut || !b.checkIn || !b.checkOut) {
                continue;
            }

            const overlaps =
                a.checkIn < b.checkOut &&
                b.checkIn < a.checkOut;

            if (overlaps) {
                addError(
                    `accomodation[${a.index}][address]`,
                    `This accommodation overlaps with Accommodation ${b.index + 1}.`
                );

                addError(
                    `accomodation[${b.index}][address]`,
                    `This accommodation overlaps with Accommodation ${a.index + 1}.`
                );
            }
        }
    }

    return errors;
}

function validatePlaces(formData: FormData): FormErrors {
    const errors: FormErrors = {};

    const addError = (field: string, message: string) => {
        if (!errors[field]) {
            errors[field] = [];
        }

        errors[field].push(message);
    };

    for (let i = 0; ; i++) {
        const name = String(
            formData.get(`place[${i}][name]`) ?? ''
        ).trim();

        const address = String(
            formData.get(`place[${i}][address]`) ?? ''
        ).trim();

        const latitude = String(
            formData.get(`place[${i}][latitude]`) ?? ''
        ).trim();

        const longitude = String(
            formData.get(`place[${i}][longitude]`) ?? ''
        ).trim();

        const placeId = String(
            formData.get(`place[${i}][place_id]`) ?? ''
        ).trim();

        // No place at this index
        if (
            !name &&
            !address &&
            !latitude &&
            !longitude &&
            !placeId
        ) {
            break;
        }

        if (!name) {
            addError(
                `place[${i}][name]`,
                'Place name is required.'
            );
        }

        if (!address || !latitude || !longitude || !placeId) {
            addError(
                `place[${i}][address]`,
                'Place address is required.'
            );
        }
    }

    return errors;
}