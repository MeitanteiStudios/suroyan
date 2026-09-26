'use client';

import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Marker, Popup } from 'react-leaflet';
import { HomeIcon, MapPinIcon } from '@heroicons/react/24/solid';

type CustomMarkerProps = {
    position: [number, number];
    name: string;
    color?: string;
    type: 'place' | 'accomodation';
    opacity?: number;
};

export default function CustomMarker({
    position,
    name,
    color = 'red',
    type,
    opacity = 0.5,
}: CustomMarkerProps) {
    const MarkerIcon =
        type === 'accomodation'
            ? HomeIcon
            : MapPinIcon;

    const icon = L.divIcon({
        className: '',
        html: renderToStaticMarkup(
            <div
                style={{
                    color,
                    opacity,
                }}
            >
                <MarkerIcon
                    style={{
                        width: '24px',
                        height: '24px',
                    }}
                />
            </div>
        ),
        iconSize: [24, 24],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    return (
        <Marker position={position} icon={icon}>
            <Popup>{name}</Popup>
        </Marker>
    );
}