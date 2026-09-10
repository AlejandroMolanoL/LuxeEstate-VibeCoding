'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in Next.js client-side execution
if (typeof window !== 'undefined') {
  // @ts-expect-error - Leaflet icon private prototype cleanup
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

function MapController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center[0], center[1], zoom, map]);

  return null;
}

function MapClickHandler({
  interactive,
  onLocationChange,
}: {
  interactive?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (interactive && onLocationChange && e.latlng) {
        onLocationChange(
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6))
        );
      }
    },
  });

  return null;
}

export interface LeafletMapInnerProps {
  address?: string;
  lat: number;
  lng: number;
  zoom?: number;
  dictionary?: any;
  interactive?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  showGoogleMapsLink?: boolean;
  heightClassName?: string;
}

export default function LeafletMapInner({
  address,
  lat,
  lng,
  zoom = 13,
  dictionary,
  interactive = false,
  onLocationChange,
  showGoogleMapsLink = true,
  heightClassName = 'aspect-[4/3]',
}: LeafletMapInnerProps) {
  return (
    <div className={`relative w-full ${heightClassName} overflow-hidden rounded-lg bg-slate-100 z-0`}>
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapController center={[lat, lng]} zoom={zoom} />
        <MapClickHandler interactive={interactive} onLocationChange={onLocationChange} />
        <Marker
          position={[lat, lng]}
          draggable={Boolean(interactive && onLocationChange)}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              if (marker && onLocationChange) {
                const pos = marker.getLatLng();
                onLocationChange(
                  Number(pos.lat.toFixed(6)),
                  Number(pos.lng.toFixed(6))
                );
              }
            },
          }}
        >
          {address && (
            <Popup>
              <div className="text-xs font-sans">
                <p className="font-semibold text-nordic">{address}</p>
                {interactive && onLocationChange && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    {dictionary?.map?.drag_instruction || 'Arrastra el pin o haz clic en el mapa para moverlo.'}
                  </p>
                )}
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>

      {showGoogleMapsLink && (
        <a
          className="absolute bottom-2 right-2 bg-white/90 text-[11px] font-medium px-2.5 py-1 rounded shadow-sm text-nordic hover:text-mosque z-[1000] backdrop-blur-xs transition-colors"
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
        >
          {dictionary?.map?.view_on_maps || 'View on Google Maps'}
        </a>
      )}
    </div>
  );
}
