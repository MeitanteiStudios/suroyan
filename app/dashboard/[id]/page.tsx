'use client';

import { Day } from '@/app/ui/components/trips/DayColumn';
import AddPlace from '../../ui/components/trips/AddPlace';
import EditTrip from '../../ui/components/trips/EditTrip';
import { useEffect, useState } from 'react';
import { getTrip, savePlaces } from '@/lib/supabase/trips/actions';
import { Place } from '../../ui/components/trips/PlaceCard';
import { optimizeTrip } from '@/lib/supabase/maps/actions';
import { ArrowPathIcon, ListBulletIcon, MapIcon } from '@heroicons/react/24/outline';
import ListView from '@/app/ui/components/ListView';
import MapView from '@/app/ui/components/MapView';
import { MarkerData, Route } from '@/app/ui/components/trips/RouteMap';

export type Accomodation = {
    id: string,
    name: string;
    start: number;
    end: number;
};

export type PlaceId = string | number;
export type PlaceIds = Record<string, PlaceId[]>;
export type PlaceMap = Record<string, Place>;

export default function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [tripId, setTripId] = useState('');

    const [days, setDays] = useState<Day[]>([]);
    const [places, setPlaces] = useState<PlaceMap>({});
    const [placeIds, setPlaceIds] = useState<PlaceIds>({});
    const [trip, setTrip] = useState<any>(null);
    const [accomodations, setAccomodations] = useState<Accomodation[]>([]);
    const [accoms, setAccoms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState<'list' | 'map'>('list');
    const [routes, setRoutes] = useState<Route[]>([]);
    const [markers, setMarkers] = useState<MarkerData[]>([]);

    const loadTrip = async () => {
        const { id } = await params;
        if (!id) {
            setLoading(false);
            return;
        }

        setTripId(id);
        setLoading(true);

        try {
            const result = await getTrip(id);
            console.log(result)
            setTrip(result.trip);
            setDays(result.days);
            setPlaces(result.placeMap);
            setAccomodations(result.formattedAccommodations);
            setAccoms(result.accommodations);
            setPlaceIds(result.placeIds);
            setRoutes(result.routes);
            setMarkers(result.markers);
        } catch (error) {
            console.error('Failed to load trip: ', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOtimizeTrip = async () => {
        setLoading(true);
        const optimizedTrip = await optimizeTrip(tripId);
        console.log(optimizedTrip);
        loadTrip();
    };

    useEffect(() => {
        loadTrip();
    }, []);

    const dayCount = days.length;

    const threshold = 10;
    const columnWidth: number = Number((100 / dayCount).toFixed(2));
    const width =
        dayCount > threshold
            ? '13rem'
            : `${columnWidth}%`;

    return (
        <div className="w-full h-full flex flex-col gap-4">
            {/* Trip Header */}
            {trip && (
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <EditTrip trip={trip} accomodations={accoms} />
                    <div className="flex gap-2 items-center">
                        {saving && <ArrowPathIcon className="h-6 w-6 animate-spin" />}
                        <button
                            type="button"
                            onClick={() => setView(view === 'list' ? 'map' : 'list')}
                            className="flex h-9 w-9 items-center justify-center rounded bg-gray-700 hover:bg-gray-800"
                            title={view === 'list' ? 'Toggle to Map View' : 'Toggle to List View'}
                        >
                            {view === 'list' ? (
                                <MapIcon className="h-6 w-6" />
                            ) : (
                                <ListBulletIcon className="h-6 w-6" />
                            )}
                        </button>
                        <button onClick={handleOtimizeTrip} className="bg-gray-700 hover:bg-gray-800 cursor-pointer font-medium px-6 py-2 rounded disabled:opacity-50">
                            Optimize Your Trip
                        </button>
                        <AddPlace tripId={trip?.id} />
                    </div>
                </div>
            )}

            {/* Trip Content */}
            {view === 'list' ? (
                <ListView
                    loading={loading}
                    days={days}
                    places={places}
                    placeIds={placeIds}
                    accomodations={accomodations}
                    tripId={tripId}
                    dayCount={dayCount}
                    threshold={threshold}
                    columnWidth={columnWidth}
                    width={width}
                    setPlaces={setPlaces}
                    setSaving={setSaving}
                    setPlaceIds={setPlaceIds}
                />
            ) : (
                <MapView
                    routes={routes}
                    markers={markers}
                    days={days}
                    places={places}
                    placeIds={placeIds}
                    accomodations={accomodations}
                />
            )}
        </div>
    );
}