import { supabase } from '@/lib/supabase';
import AdminPropertiesManager, { PropertyItem } from '@/components/admin/AdminPropertiesManager';

export const revalidate = 0;

export default async function AdminPropertiesPage() {
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
  }));

  return <AdminPropertiesManager initialProperties={initialProperties} />;
}
