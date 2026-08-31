export type PropertyListingType = 'FOR SALE' | 'FOR RENT';
export type PropertyCategory = 'House' | 'Apartment' | 'Villa' | 'Penthouse';

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
  area: string; // e.g. "4,200 m²" or "120m²"
  image: string;
  images?: string[];
  imageAlt?: string;
  badge?: string; // e.g. "Exclusive", "New Arrival"
  listingType: PropertyListingType;
  category: PropertyCategory;
  isFeatured?: boolean;
  description?: string;
  amenities?: string[];
}
