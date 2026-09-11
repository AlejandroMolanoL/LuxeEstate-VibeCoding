export type PropertyListingType = 'FOR SALE' | 'FOR RENT' | 'SOLD';
export type PropertyCategory = 'House' | 'Apartment' | 'Villa' | 'Penthouse' | 'Commercial';

export interface Property {
  id: string;
  title: string;
  slug?: string;
  location?: string;
  address?: string;
  price: number;
  formattedPrice?: string;
  pricePeriod?: string; // e.g. "/mo"
  beds: number;
  baths: number;
  parking?: number;
  area: string; // e.g. "4,200 m²" or "120m²"
  yearBuilt?: number;
  images: string[];
  imageAlt?: string;
  badge?: string; // e.g. "Exclusive", "New Arrival"
  listingType: PropertyListingType;
  category: PropertyCategory;
  isFeatured?: boolean;
  isActive?: boolean;
  description?: string;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
}
