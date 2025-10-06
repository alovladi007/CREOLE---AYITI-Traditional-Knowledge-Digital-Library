'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  latitude: number;
  longitude: number;
  location_name?: string;
  description?: string;
}

interface Props {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
}

export function RecordMap({ locations, center, zoom = 8 }: Props) {
  const defaultCenter: [number, number] = center || [18.5944, -72.3074]; // Port-au-Prince

  if (typeof window === 'undefined') {
    return <div>Loading map...</div>;
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={zoom}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location, index) => (
        <Marker
          key={index}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <div>
              <h4>{location.location_name || 'Location'}</h4>
              {location.description && <p>{location.description}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
