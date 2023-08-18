import { LatLng, LeafletMouseEvent } from 'leaflet';
import React, { useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import './map.css';
import { Location } from '../util/location';
import L from 'leaflet';

export function Map(props: {location?: Location, setLocation: Function}): JSX.Element {

    const handleMapClick = useCallback((event: LeafletMouseEvent, map: L.Map) => {
        props.setLocation(new Location(event.latlng.lat, event.latlng.lng));        
        const defaultZoom = 10;
        if (!props.location) {
            return null;
        }
        // const position = new LatLng(props.location.latitude, props.location.longitude);
        const position = event.latlng;
        map.setView(position, map.getZoom() > 10? map.getZoom() : defaultZoom);
    }, [props]) 

    // function MarkerOnClick() {
    //     useMapEvents({
    //         click(e: { latlng: { lat: number; lng: number; }; }) {
    //             props.setLocation(new Location(e.latlng.lat, e.latlng.lng))
    //         }
    //     });

        
    //     if (!props.location) {
    //         return null; 
    //     }

    //     const latLng = new LatLng(props.location.latitude, props.location.longitude);
        

    //     return (
    //         <Marker position={latLng} />
    //     );
    // }

    return (
        <MapContainer 
            className='map' 
            center={[53, -1]} 
            zoom={6.7} 
            minZoom={6.7} 
            maxBounds={[
                [ 48, -6 ],
                [ 56, 5 ]
            ]} 
            scrollWheelZoom={true}
        >
            <TileLayer 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onMapClick={handleMapClick} location={props.location} />
            {/* <MarkerOnClick /> */}
        </MapContainer>
    );
}

function ClickHandler(props: {onMapClick: (event: LeafletMouseEvent, map: L.Map) => void, location?: Location}) {
    const map = useMap();
    
    useMapEvents({
        click(event) {
            props.onMapClick(event, map);
        }
    });

    if (!props.location) {
        return null;
    }

    const latLng = new LatLng(props.location.latitude, props.location.longitude);
    
    return (
        <Marker position={latLng} />
    );
}