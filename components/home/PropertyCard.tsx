'use client';

import { useState } from 'react';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export default function PropertyCard({ property, className = '' }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const isForSale = property.listingType === 'FOR SALE';

  return (
    <article
      className={`bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          alt={property.imageAlt || property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={property.image}
        />
        <button
          onClick={toggleFavorite}
          aria-label="Add to saved homes"
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors cursor-pointer ${
            isFavorite
              ? 'bg-mosque text-white'
              : 'bg-white/90 text-nordic-dark hover:bg-mosque hover:text-white'
          }`}
        >
          <span className="material-icons text-lg">
            {isFavorite ? 'favorite' : 'favorite_border'}
          </span>
        </button>
        <div
          className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded ${
            isForSale ? 'bg-nordic-dark/90' : 'bg-mosque/90'
          }`}
        >
          {property.listingType}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-bold text-lg text-nordic-dark">
            {property.formattedPrice || `$${property.price.toLocaleString()}`}
            {property.pricePeriod && (
              <span className="text-sm font-normal text-nordic-muted">
                {property.pricePeriod}
              </span>
            )}
          </h3>
        </div>
        <h4 className="text-nordic-dark font-medium truncate mb-1">
          {property.title}
        </h4>
        <p className="text-nordic-muted text-xs mb-4">
          {property.address || property.location}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">king_bed</span>{' '}
            {property.beds}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">bathtub</span>{' '}
            {property.baths}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">square_foot</span>{' '}
            {property.area}
          </div>
        </div>
      </div>
    </article>
  );
}
