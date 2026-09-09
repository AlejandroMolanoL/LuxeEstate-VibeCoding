import { Metadata } from 'next';
import { getLocale, getDictionary } from '@/lib/i18n';
import PropertyForm from '@/components/admin/PropertyForm';

export const metadata: Metadata = {
  title: 'Nueva Propiedad | Admin LuxeEstate',
  description: 'Crear una nueva propiedad en el portafolio de LuxeEstate.',
};

export default async function NewPropertyPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return <PropertyForm mode="create" dictionary={dictionary} currentLocale={locale} />;
}
