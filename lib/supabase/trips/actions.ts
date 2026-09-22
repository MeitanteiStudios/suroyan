'use server';

import { createClient } from '@/lib/supabase/server';

const user_id = '550e8400-e29b-41d4-a716-446655440000';

export async function createTrip(formData: FormData) {
    const supabase = await createClient();

    try {
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
                const longtitude = data[`place[${i}][longtitude]`];
                const placeId = data[`place[${i}][place_id]`];

                let { error } = await supabase
                    .from('trip_places')
                    .insert({
                        trip_id: trip.id,
                        name: name,
                        address: placeAddress,
                        latitude: latitude,
                        longtitude: longtitude,
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
            tripId: trip.id,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error
                ? error.message
                : 'Something went wrong.',
        };
    }
}

export async function updateTrip(formData: FormData) {
    const supabase = await createClient();

    try {
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
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Something went wrong.',
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

    const getDayNumber = (date: string, tripStartDate: string) => {
        const start = new Date(tripStartDate);
        const current = new Date(date);

        return (
            Math.floor(
                (current.getTime() - start.getTime()) /
                    (1000 * 60 * 60 * 24)
            ) + 1
        );
    };

    const formattedAccommodations = accommodations.map((accommodation) => ({
        name: accommodation.name,
        start: getDayNumber(
            accommodation.check_in,
            trip.start_date
        ),
        end: getDayNumber(
            accommodation.check_out,
            trip.start_date
        ),
    }));

    return {
        name: trip.name,
        trip,
        days,
        placeIds,
        placeMap,
        formattedAccommodations,
        accommodations: accomodationWithIndex,
    };
}


export async function getPlaces(tripId: string, day?: number) {
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

    return places;
}

export async function addPlaces(formData: FormData) {
    const supabase = await createClient();

    try {
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

        return {
            success: true,
            message: 'Places added successfully!',
            places: insertedPlaces,
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Something went wrong.',
        };
    }
}

export async function savePlaces(
    tripId: string,
    placeIds: Record<string, (string | number)[]>
) {
    const supabase = await createClient();

    for (const [column, ids] of Object.entries(placeIds)) {
        for (const [sortOrder, id] of ids.entries()) {
            const { error } = await supabase
                .from('trip_places')
                .update({
                    day: Number(column),
                    sort_order: sortOrder,
                })
                .eq('id', String(id))
                .eq('trip_id', tripId);

            if (error) {
                throw new Error(error.message);
            }
        }
    }
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