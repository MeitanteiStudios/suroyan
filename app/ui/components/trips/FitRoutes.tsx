import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Route } from './RouteMap';

type FitRoutesProps = {
    routes: Route[] | undefined;
};

export default function FitRoutes({ routes }: FitRoutesProps) {
    const map = useMap();

    useEffect(() => {
        if (!routes || routes.length === 0) {
            return;
        }

        const coordinates = routes.flatMap(
            (route) => route.coordinates
        );

        if (coordinates.length === 0) {
            return;
        }

        const bounds = L.latLngBounds(coordinates);

        map.fitBounds(bounds, {
            padding: [40, 40],
        });
    }, [routes, map]);

    return null;
}