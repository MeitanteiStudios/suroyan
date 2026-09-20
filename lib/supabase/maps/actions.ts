'use server';

import { get } from "../api";

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