import Navbar from '@/components/layout/Navbar';
import HeroSearch from '@/components/home/HeroSearch';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import MarketSection from '@/components/home/MarketSection';
import { getProperties, getFeaturedProperties, FilterType, AdvancedFilters } from '@/lib/properties';
import { getLocale, getDictionary } from '@/lib/i18n';

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { page: pageParam, filter: filterParam } = await searchParams;

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  const page = Math.max(1, Number(pageParam) || 1);

  const rawFilter = Array.isArray(filterParam) ? filterParam[0] : filterParam;
  const filterType: FilterType =
    rawFilter === 'Buy' || rawFilter === 'Rent' ? rawFilter : 'All';

  const { minPrice, maxPrice, beds, baths, type, location, amenities } = await searchParams;

  const filters: AdvancedFilters = {
    filter: filterType,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    beds: beds ? Number(beds) : undefined,
    baths: baths ? Number(baths) : undefined,
    type: typeof type === 'string' ? type : undefined,
    location: typeof location === 'string' ? location : undefined,
    amenities: typeof amenities === 'string' ? amenities.split(',') : undefined,
  };

  const [featured, market] = await Promise.all([
    getFeaturedProperties(),
    getProperties(page, filters),
  ]);

  const hasActiveFilters = 
    Boolean(filters.minPrice) || 
    Boolean(filters.maxPrice) || 
    Boolean(filters.beds) || 
    Boolean(filters.baths) || 
    (filters.type && filters.type !== 'Any Type' && filters.type !== 'All') || 
    Boolean(filters.location) || 
    (filters.amenities && filters.amenities.length > 0) ||
    filters.filter !== 'All';

  const displayFeatured = hasActiveFilters ? [] : featured.slice(0, 2);

  return (
    <div className="min-h-screen bg-background-light text-nordic-dark font-display antialiased">
      <Navbar dictionary={dictionary.navbar} currentLocale={locale} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <HeroSearch dictionary={dictionary} />
        {displayFeatured.length > 0 && <FeaturedCollections properties={displayFeatured} dictionary={dictionary} />}
        <MarketSection
          properties={market.data}
          currentPage={page}
          totalPages={market.totalPages}
          filter={filterType}
          dictionary={dictionary}
        />
      </main>
    </div>
  );
}
