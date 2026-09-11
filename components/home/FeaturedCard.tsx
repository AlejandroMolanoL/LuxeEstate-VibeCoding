'use client';

import Link from 'next/link';
import { Property } from '@/types/property';
import { useFavorites } from '@/context/FavoritesContext';

interface FeaturedCardProps {
  property: Property;
  dictionary?: any;
}

export default function FeaturedCard({ property, dictionary }: FeaturedCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  const badgeKey = property.badge ? `badge_${property.badge.toLowerCase().replace(/\s+/g, '_')}` : '';
  const translatedBadge = property.badge ? (dictionary?.property_details?.[badgeKey] || property.badge) : '';

  return (
    <Link href={property.slug ? `/propiedades/${property.slug}` : '#'} className="group relative rounded-xl overflow-hidden shadow-soft bg-white cursor-pointer block">
      <div className="aspect-[4/3] w-full overflow-hidden relative">
        <img
          alt={property.imageAlt || property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={property.images?.[0] || '/placeholder.jpg'}
        />
        {property.badge && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-nordic-dark">
            {translatedBadge}
          </div>
        )}
        <button
          onClick={handleFavoriteClick}
          aria-label={favorited ? "Remove from saved homes" : "Add to saved homes"}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-110 active:scale-95 z-10 ${
            favorited
              ? 'bg-mosque text-white'
              : 'bg-white/90 text-nordic-dark hover:bg-mosque hover:text-white'
          }`}
        >
          <span className="material-icons text-xl">
            {favorited ? 'favorite' : 'favorite_border'}
          </span>
        </button>
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
      </div>
      <div className="p-6 relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-medium text-nordic-dark group-hover:text-mosque transition-colors">
              {property.title}
            </h3>
            {property.location && (
              <p className="text-nordic-muted text-sm flex items-center gap-1 mt-1">
                <span className="material-icons text-sm">place</span> {property.location}
              </p>
            )}
          </div>
          <span className="text-xl font-semibold text-mosque">
            {property.formattedPrice || `$${property.price.toLocaleString()}`}
          </span>
        </div>
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-nordic-dark/5">
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">king_bed</span> {property.beds} {dictionary?.property_card?.beds || "Beds"}
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">bathtub</span> {property.baths} {dictionary?.property_card?.baths || "Baths"}
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">square_foot</span> {property.area}
          </div>
        </div>
      </div>
    </Link>
  );
}
