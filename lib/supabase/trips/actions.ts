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
            let address = data[`accomodation[${i}][address]`];
            if (address) {
                const checkIn = data[`accomodation[${i}][check_in]`];
                const checkOut = data[`accomodation[${i}][check_out]`];

                let { error } = await supabase
                    .from('accommodations')
                    .insert({
                        trip_id: trip.id,
                        name: address,
                        address: address,
                        check_in: checkIn,
                        check_out: checkOut,
                    });

                if (error) {
                    throw new Error(error.message);
                }
            }

            address = data[`place[${i}][address]`];
            if (address) {
                const name = data[`place[${i}][name]`];

                let { error } = await supabase
                    .from('trip_places')
                    .insert({
                        trip_id: trip.id,
                        name: name,
                        address: address,
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
    const placesPerDay = await Promise.all(
        dates.map(async (date, index) => {
            const id = tripId;
            const places = await getPlaces(tripId, index);
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });

            return {
                id,
                name: `Day ${index + 1} - ${formattedDate}`,
                date, 
                places
            }
        })
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

    const accomodationWithIndex = accommodations?.map((accommodation, index) => ({
        ...accommodation,
        accomodation_id: index + 1,
    }));

    const getDayNumber = (date: string, tripStartDate: string) => {
        const start = new Date(tripStartDate);
        const current = new Date(date);

        return Math.floor(
            (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
    };

    const formattedAccommodations = accommodations.map((accommodation) => ({
        name: accommodation.name,
        start: getDayNumber(accommodation.check_in, trip.start_date),
        end: getDayNumber(accommodation.check_out, trip.start_date),
    }));

    return {
        name: trip.name,
        trip: trip,
        formattedAccommodations,
        placesPerDay,
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

    const { data: places, error: placesError } = await query
        .order('sort_order', { ascending: true });

    if (placesError) {
        throw new Error(placesError.message);
    }

    return places;
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