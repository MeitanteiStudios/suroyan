'use client';

import { useEffect } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
} from 'react-leaflet';
import CustomMarker from './CustomMarkert';
import FitRoutes from './FitRoutes';

export type Coordinate = [number, number];

export type Route = {
    day: number;
    coordinates: Coordinate[];
    color?: string;
};

export type MarkerData = {
    id: string;
    position: Coordinate;
    name: string;
    color?: string;
    type: 'place' | 'accomodation';
};

type RouteMapProps = {
    routes: Route[] | undefined;
    markers: MarkerData[];

    hoveredDay: number | null;
    hoveredMarker: string | null;
};

export default function RouteMap({
    routes,
    markers,
    hoveredDay,
    hoveredMarker,
}: RouteMapProps) {
    useEffect(() => {
        console.log(routes);
        console.log(markers);
        console.log(hoveredDay, hoveredMarker);
    }, [hoveredDay, hoveredMarker]);
    return (
        <MapContainer
            center={[10.3157, 123.8854]}
            zoom={13}
            className="w-full h-full"
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitRoutes routes={routes} />

            {routes?.map((route) => {
                const isHovered = hoveredDay === route.day;

                return (
                    <Polyline
                        key={'route-'+route.day}
                        positions={route.coordinates}
                        pathOptions={{
                            color: route.color,
                            weight: isHovered ? 6 : 5,
                            opacity: isHovered ? 1 : (hoveredDay ? 0 : 1),
                        }}
                    />
                );
            })}

            {markers.map((marker) => (
                <CustomMarker
                    key={'marker'+marker.id}
                    position={marker.position}
                    name={marker.name}
                    color={marker.color}
                    type={marker.type}
                    opacity={1}
                />
            ))}
        </MapContainer>
    );
}