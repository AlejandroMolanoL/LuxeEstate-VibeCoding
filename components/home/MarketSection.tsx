'use client';

import { useState } from 'react';
import { Property } from '@/types/property';
import PropertyCard from './PropertyCard';

interface MarketSectionProps {
  properties: Property[];
}

export default function MarketSection({ properties }: MarketSectionProps) {
  const [filter, setFilter] = useState<'All' | 'Buy' | 'Rent'>('All');

  const filteredProperties = properties.filter((prop) => {
    if (filter === 'Buy') return prop.listingType === 'FOR SALE';
    if (filter === 'Rent') return prop.listingType === 'FOR RENT';
    return true;
  });

  return (
    <section>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">
            New in Market
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            Fresh opportunities added this week.
          </p>
        </div>
        <div className="hidden md:flex bg-white p-1 rounded-lg">
          {(['All', 'Buy', 'Rent'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={
                  isActive
                    ? 'px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm cursor-pointer transition-all'
                    : 'px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark cursor-pointer transition-all'
                }
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <button
          type="button"
          className="px-8 py-3 bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark font-medium rounded-lg transition-all hover:shadow-md cursor-pointer"
        >
          Load more properties
        </button>
      </div>
    </section>
  );
}
