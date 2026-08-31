import { supabase } from './supabase';
import { Property, PropertyListingType, PropertyCategory } from '@/types/property';

export const PAGE_SIZE = 8;

export type FilterType = 'All' | 'Buy' | 'Rent';

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
    area: row.area as string,
    image: row.image as string,
    imageAlt: row.image_alt as string | undefined,
    badge: row.badge as string | undefined,
    listingType: row.listing_type as PropertyListingType,
    category: row.category as PropertyCategory,
    isFeatured: Boolean(row.is_featured),
    slug: (row.slug as string | undefined) || (row.id as string),
    images: row.images as string[] | undefined,
    description: row.description as string | undefined,
    amenities: row.amenities as string[] | undefined,
  };
}

export async function getProperties(
  page: number = 1,
  filter: FilterType = 'All',
  pageSize: number = PAGE_SIZE,
): Promise<PropertiesResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: true });

  if (filter === 'Buy') {
    query = query.eq('listing_type', 'FOR SALE');
  } else if (filter === 'Rent') {
    query = query.eq('listing_type', 'FOR RENT');
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
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching featured properties:', error.message);
    return [];
  }

  return (data ?? []).map(mapRow);
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    // 42703: column does not exist (meaning migration hasn't run yet)
    if (error.code === '42703') {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', slug)
        .single();
        
      if (!fallbackError && fallbackData) {
        return mapRow(fallbackData);
      }
      return null;
    }
    
    if (error.code !== 'PGRST116') { // PGRST116 is "Results contain 0 rows"
      console.error('Error fetching property by slug:', error.message);
    }
    return null;
  }

  if (!data) return null;

  return mapRow(data);
}
