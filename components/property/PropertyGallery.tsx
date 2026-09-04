'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  badge?: string;
  listingType: string;
  dictionary?: any;
}

export default function PropertyGallery({ images, title, badge, listingType, dictionary }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // If no images are provided, use a placeholder
  const displayImages = images && images.length > 0 ? images : ['/placeholder.jpg'];
  const mainImage = displayImages[activeIndex];
  
  // Translate listingType (FOR SALE, FOR RENT) using dictionary
  const isForSale = listingType?.toUpperCase() === 'FOR SALE' || listingType?.toLowerCase() === 'sale' || listingType?.toLowerCase() === 'buy';
  const isForRent = listingType?.toUpperCase() === 'FOR RENT' || listingType?.toLowerCase() === 'rent';
  const translatedListingType = isForSale 
    ? (dictionary?.property_card?.for_sale || 'FOR SALE') 
    : isForRent 
      ? (dictionary?.property_card?.for_rent || 'FOR RENT') 
      : (dictionary?.market?.tabs?.[listingType] || listingType);

  const badgeKey = badge ? `badge_${badge.toLowerCase().replace(/\s+/g, '_')}` : '';
  const translatedBadge = badge ? (dictionary?.property_details?.[badgeKey] || badge) : '';

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group">
        <Image
          src={mainImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {badge && (
            <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              {translatedBadge}
            </span>
          )}
          <span className="bg-white/90 backdrop-blur text-nordic text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            {translatedListingType}
          </span>
        </div>
        
        {displayImages.length > 1 && (
          <button className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-nordic px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2">
            <span className="material-icons text-sm">grid_view</span>
            {dictionary?.property_details?.view_all_photos || "View All Photos"} ({displayImages.length})
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
          {displayImages.map((img, index) => (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer transition-opacity snap-start ${
                activeIndex === index
                  ? 'ring-2 ring-mosque ring-offset-2 ring-offset-clear-day opacity-100'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${index + 1}`}
                width={192}
                height={144}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
