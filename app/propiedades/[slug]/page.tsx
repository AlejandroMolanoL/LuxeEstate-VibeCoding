import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPropertyBySlug } from '@/lib/properties';
import Navbar from '@/components/layout/Navbar';
import PropertyGallery from '@/components/property/PropertyGallery';
import PropertyContact from '@/components/property/PropertyContact';
import PropertyMap from '@/components/property/PropertyMap';
import MortgageCalculator from '@/components/property/MortgageCalculator';
import { getLocale, getDictionary } from '@/lib/i18n';

interface PropertyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: 'Propiedad no encontrada | LuxeEstate',
    };
  }

  const title = `${property.category} en ${property.location || property.address} | ${property.formattedPrice} - LuxeEstate`;
  const description = property.description || `Exclusiva propiedad en ${property.location}. Cuenta con ${property.beds} recámaras y ${property.baths} baños.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: property.images?.[0] || '/placeholder.jpg' }],
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  const galleryImages = property.images && property.images.length > 0 
    ? property.images 
    : ['/placeholder.jpg'];

  // Real coordinates with graceful fallback if not set
  const lat = property.latitude ?? 37.4419;
  const lng = property.longitude ?? -122.1430;

  // Ensure default amenities
  const amenities = property.amenities || [
    'Smart Home System', 'Swimming Pool', 'Central Heating & Cooling',
    'Electric Vehicle Charging', 'Private Gym', 'Wine Cellar'
  ];

  return (
    <div className="min-h-screen bg-clear-day text-nordic selection:bg-mosque/20">
      <Navbar activeTab="Buy" dictionary={dictionary.navbar} currentLocale={locale} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            <PropertyGallery 
              images={galleryImages} 
              title={property.title}
              badge={property.badge}
              listingType={property.listingType}
              dictionary={dictionary}
            />

            {/* Desktop Only Details placed here in reference layout */}
            <div className="hidden lg:block lg:col-span-8 lg:row-start-2 -mt-8 space-y-8">
              {/* Features */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
                <h2 className="text-lg font-semibold mb-6 text-nordic">{dictionary?.property_details?.features_title || "Property Features"}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                    <span className="material-icons text-mosque text-2xl mb-2">square_foot</span>
                    <span className="text-xl font-bold text-nordic">{property.area}</span>
                    <span className="text-xs uppercase tracking-wider text-nordic/50">{dictionary?.property_details?.square_area || "Square Area"}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                    <span className="material-icons text-mosque text-2xl mb-2">bed</span>
                    <span className="text-xl font-bold text-nordic">{property.beds}</span>
                    <span className="text-xs uppercase tracking-wider text-nordic/50">{dictionary?.property_details?.bedrooms || "Bedrooms"}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                    <span className="material-icons text-mosque text-2xl mb-2">shower</span>
                    <span className="text-xl font-bold text-nordic">{property.baths}</span>
                    <span className="text-xs uppercase tracking-wider text-nordic/50">{dictionary?.property_details?.bathrooms || "Bathrooms"}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                    <span className="material-icons text-mosque text-2xl mb-2">directions_car</span>
                    <span className="text-xl font-bold text-nordic">2</span>
                    <span className="text-xs uppercase tracking-wider text-nordic/50">{dictionary?.property_details?.garage || "Garage"}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
                <h2 className="text-lg font-semibold mb-4 text-nordic">{dictionary?.property_details?.about_title || "About this home"}</h2>
                <div className="prose prose-slate max-w-none text-nordic/70 leading-relaxed">
                  <p className="mb-4">
                    {property.description || (dictionary?.property_details?.default_description || `Experience modern luxury in this architecturally stunning home located in ${property.location}.`).replace('{location}', property.location || '')}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
                <h2 className="text-lg font-semibold mb-6 text-nordic">{dictionary?.property_details?.amenities_title || "Amenities"}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 text-nordic/70">
                      <span className="material-icons text-mosque/60 text-sm">check_circle</span>
                      <span>{(dictionary?.detail_amenities as Record<string, string> | undefined)?.[amenity] || amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <MortgageCalculator price={property.price} dictionary={dictionary} />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              <PropertyContact 
                price={property.formattedPrice || `$${property.price.toLocaleString('en-US')}`}
                address={property.address || property.location}
                propertyTitle={property.title}
                propertyId={property.id}
                dictionary={dictionary}
              />
              <PropertyMap 
                address={property.address || property.location || 'Dirección de la propiedad'}
                lat={lat}
                lng={lng}
                dictionary={dictionary}
              />
            </div>
          </div>

          {/* Mobile Only Details */}
          <div className="block lg:hidden space-y-8">
              {/* Features */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
                <h2 className="text-lg font-semibold mb-6 text-nordic">{dictionary?.property_details?.features_title || "Property Features"}</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                    <span className="material-icons text-mosque text-2xl mb-2">square_foot</span>
                    <span className="text-xl font-bold text-nordic">{property.area}</span>
                    <span className="text-xs uppercase tracking-wider text-nordic/50">{dictionary?.property_details?.square_area || "Area"}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                    <span className="material-icons text-mosque text-2xl mb-2">bed</span>
                    <span className="text-xl font-bold text-nordic">{property.beds}</span>
                    <span className="text-xs uppercase tracking-wider text-nordic/50">{dictionary?.property_details?.bedrooms || "Beds"}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                    <span className="material-icons text-mosque text-2xl mb-2">shower</span>
                    <span className="text-xl font-bold text-nordic">{property.baths}</span>
                    <span className="text-xs uppercase tracking-wider text-nordic/50">{dictionary?.property_details?.bathrooms || "Baths"}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                    <span className="material-icons text-mosque text-2xl mb-2">directions_car</span>
                    <span className="text-xl font-bold text-nordic">2</span>
                    <span className="text-xs uppercase tracking-wider text-nordic/50">{dictionary?.property_details?.garage || "Garage"}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
                <h2 className="text-lg font-semibold mb-4 text-nordic">{dictionary?.property_details?.about_title || "About this home"}</h2>
                <div className="prose prose-slate max-w-none text-nordic/70 leading-relaxed">
                  <p className="mb-4">
                    {property.description || (dictionary?.property_details?.default_description || `Experience modern luxury in this architecturally stunning home located in ${property.location}.`).replace('{location}', property.location || '')}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
                <h2 className="text-lg font-semibold mb-6 text-nordic">{dictionary?.property_details?.amenities_title || "Amenities"}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 text-nordic/70">
                      <span className="material-icons text-mosque/60 text-sm">check_circle</span>
                      <span>{(dictionary?.detail_amenities as Record<string, string> | undefined)?.[amenity] || amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <MortgageCalculator price={property.price} dictionary={dictionary} />
          </div>

        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-nordic/50">
            {dictionary?.property_details?.footer_rights || "© 2023 LuxeEstate Inc. All rights reserved."}
          </div>
        </div>
      </footer>
    </div>
  );
}
