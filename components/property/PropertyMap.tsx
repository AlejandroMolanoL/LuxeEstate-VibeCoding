'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Leaflet's MapContainer needs to be dynamically imported with ssr: false
// because it relies on the window object
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface PropertyMapProps {
  address: string;
  // Fallback coordinates (e.g. Palo Alto)
  lat?: number;
  lng?: number;
}

export default function PropertyMap({ address, lat = 37.4419, lng = -122.1430 }: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fix leaflet marker icon issues in Next.js
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white p-2 rounded-xl shadow-sm border border-mosque/5">
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
          <span className="text-nordic/50">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-xl shadow-sm border border-mosque/5 relative z-0">
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
        <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={[lat, lng]}>
            <Popup>
              {address}
            </Popup>
          </Marker>
        </MapContainer>
        <a className="absolute bottom-2 right-2 bg-white/90 text-xs font-medium px-2 py-1 rounded shadow-sm text-nordic hover:text-mosque z-[1000]" href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noreferrer">
          View on Google Maps
        </a>
      </div>
    </div>
  );
}
