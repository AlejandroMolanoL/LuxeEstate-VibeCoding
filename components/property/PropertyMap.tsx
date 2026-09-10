'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { LeafletMapInnerProps } from './LeafletMapInner';

// Dynamic import with ssr: false ensures that Leaflet and react-leaflet are loaded client-side only
const LeafletMapInner = dynamic<LeafletMapInnerProps>(
  () => import('./LeafletMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
        <span className="text-nordic/50 text-xs flex items-center gap-2">
          <span className="material-icons text-sm animate-spin">refresh</span>
          Cargando mapa...
        </span>
      </div>
    ),
  }
);

export interface PropertyMapProps {
  address?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  dictionary?: any;
  className?: string;
  heightClassName?: string;
  interactive?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  showGoogleMapsLink?: boolean;
}

export default function PropertyMap({
  address = '',
  lat = 37.4419,
  lng = -122.1430,
  zoom = 13,
  dictionary,
  className,
  heightClassName = 'aspect-[4/3]',
  interactive = false,
  onLocationChange,
  showGoogleMapsLink = true,
}: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerClass =
    className !== undefined
      ? className
      : 'bg-white p-2 rounded-xl shadow-sm border border-mosque/5 relative z-0';

  if (!mounted) {
    return (
      <div className={containerClass}>
        <div className={`relative w-full ${heightClassName} rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center`}>
          <span className="text-nordic/50 text-xs flex items-center gap-2">
            <span className="material-icons text-sm animate-spin">refresh</span>
            {dictionary?.map?.loading_map || 'Loading map...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <LeafletMapInner
        address={address}
        lat={lat}
        lng={lng}
        zoom={zoom}
        dictionary={dictionary}
        interactive={interactive}
        onLocationChange={onLocationChange}
        showGoogleMapsLink={showGoogleMapsLink}
        heightClassName={heightClassName}
      />
    </div>
  );
}
