import Navbar from '@/components/layout/Navbar';
import HeroSearch from '@/components/home/HeroSearch';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import MarketSection from '@/components/home/MarketSection';
import { getProperties, getFeaturedProperties, FilterType } from '@/lib/properties';

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { page: pageParam, filter: filterParam } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);

  const rawFilter = Array.isArray(filterParam) ? filterParam[0] : filterParam;
  const filter: FilterType =
    rawFilter === 'Buy' || rawFilter === 'Rent' ? rawFilter : 'All';

  const [featured, market] = await Promise.all([
    getFeaturedProperties(),
    getProperties(page, filter),
  ]);

  return (
    <div className="min-h-screen bg-background-light text-nordic-dark font-display antialiased">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <HeroSearch />
        <FeaturedCollections properties={featured} />
        <MarketSection
          properties={market.data}
          currentPage={page}
          totalPages={market.totalPages}
          filter={filter}
        />
      </main>
    </div>
  );
}
