import Link from 'next/link';
import { Property } from '@/types/property';
import { FilterType } from '@/lib/properties';
import PropertyCard from './PropertyCard';
import PaginationControls from './PaginationControls';

interface MarketSectionProps {
  properties: Property[];
  currentPage: number;
  totalPages: number;
  filter: FilterType;
}

export default function MarketSection({
  properties,
  currentPage,
  totalPages,
  filter,
}: MarketSectionProps) {
  function filterHref(tab: FilterType) {
    const params = new URLSearchParams();
    if (tab !== 'All') params.set('filter', tab);
    params.set('page', '1');
    return `/?${params.toString()}`;
  }

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

        {/* Filter tabs — Server-side navigation via Link */}
        <div className="hidden md:flex bg-white p-1 rounded-lg">
          {(['All', 'Buy', 'Rent'] as FilterType[]).map((tab) => {
            const isActive = filter === tab;
            return isActive ? (
              <span
                key={tab}
                className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm"
              >
                {tab}
              </span>
            ) : (
              <Link
                key={tab}
                href={filterHref(tab)}
                className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark transition-all"
              >
                {tab}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.length > 0 ? (
          properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        ) : (
          <p className="col-span-full text-center text-nordic-muted py-16 text-sm">
            No properties found for this filter.
          </p>
        )}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        filter={filter}
      />
    </section>
  );
}
