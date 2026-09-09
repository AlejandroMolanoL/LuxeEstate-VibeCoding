import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getLocale, getDictionary } from '@/lib/i18n';
import PropertyForm from '@/components/admin/PropertyForm';
import { Property, PropertyListingType, PropertyCategory } from '@/types/property';

export const revalidate = 0;

interface EditPropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  const { data: row, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !row) {
    notFound();
  }

  const property: Property = {
    id: row.id,
    title: row.title || '',
    slug: row.slug || row.id,
    location: row.location || '',
    address: row.address || row.location || '',
    price: Number(row.price) || 0,
    formattedPrice: row.formatted_price || undefined,
    pricePeriod: row.price_period || undefined,
    beds: Number(row.beds) || 1,
    baths: Number(row.baths) || 1,
    parking: row.parking ? Number(row.parking) : undefined,
    area: row.area || '',
    yearBuilt: row.year_built ? Number(row.year_built) : undefined,
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [],
    listingType: (row.listing_type || 'FOR SALE') as PropertyListingType,
    category: (row.category || 'Apartment') as PropertyCategory,
    description: row.description || '',
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
  };

  return (
    <PropertyForm
      mode="edit"
      initialData={property}
      dictionary={dictionary}
      currentLocale={locale}
    />
  );
}
