'use client';

import { useState, useEffect } from 'react';
import FilterModal from './FilterModal';
import { useRouter, useSearchParams } from 'next/navigation';

interface HeroSearchProps {
  onSearch?: (query: string) => void;
  onSelectCategory?: (category: string) => void;
}

export default function HeroSearch({ onSearch, onSelectCategory }: HeroSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(searchParams.get('location') || '');
    setSelectedCategory(searchParams.get('type') || 'All');
  }, [searchParams]);

  const categories = ['All', 'House', 'Apartment', 'Villa', 'Penthouse'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('location', searchQuery);
    } else {
      params.delete('location');
    }
    params.set('page', '1');
    router.push(`/?${params.toString()}`);

    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('type');
    } else {
      params.set('type', cat);
    }
    params.set('page', '1');
    router.push(`/?${params.toString()}`);

    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-nordic-dark leading-tight">
          Find your{' '}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium">sanctuary</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/20 -rotate-1 z-0"></span>
          </span>
          .
        </h1>

        <form onSubmit={handleSearchSubmit} className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-icons text-nordic-muted text-2xl group-focus-within:text-mosque transition-colors">
              search
            </span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, neighborhood, or address..."
            className="block w-full pl-12 pr-28 py-4 rounded-xl border-none bg-white text-nordic-dark shadow-soft placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-lg outline-none"
          />
          <button
            type="submit"
            className="absolute inset-y-2 right-2 px-6 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20 cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={
                  isSelected
                    ? 'whitespace-nowrap px-5 py-2 rounded-full bg-nordic-dark text-white text-sm font-medium shadow-lg shadow-nordic-dark/10 transition-transform hover:-translate-y-0.5 cursor-pointer'
                    : 'whitespace-nowrap px-5 py-2 rounded-full bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 text-sm font-medium transition-all hover:bg-mosque/5 cursor-pointer'
                }
              >
                {cat}
              </button>
            );
          })}
          <div className="w-px h-6 bg-nordic-dark/10 mx-2 hidden sm:block"></div>
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full text-nordic-dark font-medium text-sm hover:bg-black/5 transition-colors cursor-pointer"
          >
            <span className="material-icons text-base">tune</span> Filters
          </button>
        </div>
      </div>
      
      <FilterModal isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />
    </section>
  );
}
