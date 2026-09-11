import { supabase } from './supabase';
import { Property, PropertyListingType, PropertyCategory } from '@/types/property';

export const PAGE_SIZE = 8;

export type FilterType = 'All' | 'Buy' | 'Rent' | 'Saved' | 'Sell';

export interface AdvancedFilters {
  filter: FilterType;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  amenities?: string[];
  type?: string;
  location?: string;
  title?: string;
  favoriteIds?: string[];
}

interface PropertiesResult {
  data: Property[];
  count: number;
  totalPages: number;
}

// Maps a raw Supabase row to our Property type
function mapRow(row: Record<string, unknown>): Property {
  return {
    id: row.id as string,
    title: row.title as string,
    location: row.location as string | undefined,
    address: row.address as string | undefined,
    price: Number(row.price),
    formattedPrice: row.formatted_price as string | undefined,
    pricePeriod: row.price_period as string | undefined,
    beds: Number(row.beds),
    baths: Number(row.baths),
    parking: row.parking ? Number(row.parking) : undefined,
    area: row.area as string,
    yearBuilt: row.year_built ? Number(row.year_built) : undefined,
    images: (Array.isArray(row.images) && row.images.length > 0)
      ? (row.images as string[])
      : ['/placeholder.jpg'],
    imageAlt: row.image_alt as string | undefined,
    badge: row.badge as string | undefined,
    listingType: row.listing_type as PropertyListingType,
    category: row.category as PropertyCategory,
    isFeatured: Boolean(row.is_featured),
    isActive: row.is_active !== false,
    slug: (row.slug as string | undefined) || (row.id as string),
    description: row.description as string | undefined,
    amenities: row.amenities as string[] | undefined,
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
  };
}

export async function getProperties(
  page: number = 1,
  filters: AdvancedFilters = { filter: 'All' },
  pageSize: number = PAGE_SIZE,
): Promise<PropertiesResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (filters.filter === 'Saved') {
    if (!filters.favoriteIds || filters.favoriteIds.length === 0) {
      return { data: [], count: 0, totalPages: 0 };
    }
  }

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (filters.filter === 'Saved') {
    query = query.in('id', filters.favoriteIds!);
  } else if (filters.filter === 'Buy' || filters.filter === 'Sell') {
    query = query.eq('listing_type', 'FOR SALE');
  } else if (filters.filter === 'Rent') {
    query = query.eq('listing_type', 'FOR RENT');
  }

  if (filters.minPrice) query = query.gte('price', filters.minPrice);
  if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
  if (filters.beds) query = query.gte('beds', filters.beds);
  if (filters.baths) query = query.gte('baths', filters.baths);
  if (filters.type && filters.type !== 'Any Type') query = query.eq('category', filters.type);
  if (filters.amenities && filters.amenities.length > 0) {
    query = query.contains('amenities', filters.amenities);
  }
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters.title && filters.title.trim()) {
    query = query.ilike('title', `%${filters.title.trim()}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error('Error fetching properties:', error.message);
    return { data: [], count: 0, totalPages: 0 };
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: (data ?? []).map(mapRow),
    count: total,
    totalPages,
  };
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching featured properties:', error.message);
    return [];
  }

  return (data ?? []).map(mapRow);
}

export async function getPropertyBySlug(slugOrId: string): Promise<Property | null> {
  const decoded = decodeURIComponent(slugOrId);

  // 1. Try fetching by slug first
  const { data: slugData, error: slugError } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', decoded)
    .maybeSingle();

  if (slugData) {
    return mapRow(slugData);
  }

  // 2. If not found by slug, fallback to fetching by id
  const { data: idData, error: idError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', decoded)
    .maybeSingle();

  if (idData) {
    return mapRow(idData);
  }

  if (slugError && slugError.code !== 'PGRST116' && slugError.code !== '42703') {
    console.error('Error fetching property by slug:', slugError.message);
  }
  if (idError && idError.code !== 'PGRST116') {
    console.error('Error fetching property by id:', idError.message);
  }

  return null;
}
