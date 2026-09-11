import { createClient } from '@/lib/supabase/server';
import { getLocale, getDictionary } from '@/lib/i18n';
import AdminPropertiesManager, { PropertyItem } from '@/components/admin/AdminPropertiesManager';

export const revalidate = 0;

export default async function AdminPropertiesPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  const supabase = await createClient();
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  const initialProperties: PropertyItem[] = (properties || []).map((p) => ({
    id: p.id,
    title: p.title || 'Sin Título',
    slug: p.slug,
    location: p.location,
    address: p.address,
    price: Number(p.price) || 0,
    formatted_price: p.formatted_price,
    price_period: p.price_period,
    beds: p.beds,
    baths: p.baths,
    area: p.area,
    images: p.images,
    listing_type: p.listing_type || 'FOR SALE',
    category: p.category,
    created_at: p.created_at,
    description: p.description,
    amenities: p.amenities,
    parking: p.parking,
    year_built: p.year_built,
    badge: p.badge,
    is_featured: p.is_featured,
    is_active: p.is_active !== false,
    latitude: p.latitude ? Number(p.latitude) : undefined,
    longitude: p.longitude ? Number(p.longitude) : undefined,
  }));

  return (
    <AdminPropertiesManager
      initialProperties={initialProperties}
      dictionary={dictionary}
      currentLocale={locale}
    />
  );
}
