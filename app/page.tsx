import Navbar from '@/components/layout/Navbar';
import HeroSearch from '@/components/home/HeroSearch';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import MarketSection from '@/components/home/MarketSection';
import { FEATURED_PROPERTIES, MARKET_PROPERTIES } from '@/data/mockProperties';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-light text-nordic-dark font-display antialiased">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <HeroSearch />
        <FeaturedCollections properties={FEATURED_PROPERTIES} />
        <MarketSection properties={MARKET_PROPERTIES} />
      </main>
    </div>
  );
}
