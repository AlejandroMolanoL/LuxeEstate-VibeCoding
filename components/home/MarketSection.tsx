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
  dictionary?: any;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function MarketSection({
  properties,
  currentPage,
  totalPages,
  filter,
  dictionary,
  searchParams,
}: MarketSectionProps) {
  function filterHref(tab: FilterType) {
    const params = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, val]) => {
        if (val !== undefined && key !== 'filter' && key !== 'page') {
          if (Array.isArray(val)) {
            val.forEach(v => params.append(key, v));
          } else {
            params.set(key, val);
          }
        }
      });
    }
    if (tab !== 'All') params.set('filter', tab);
    params.set('page', '1');
    return `/?${params.toString()}`;
  }

  const isSavedFilter = filter === 'Saved';
  const sectionTitle = isSavedFilter 
    ? (dictionary?.saved?.title || "Saved Homes")
    : (dictionary?.market?.title || "New in Market");
  const sectionSubtitle = isSavedFilter
    ? (dictionary?.saved?.subtitle || "Your favorite properties saved to review whenever you want.")
    : (dictionary?.market?.subtitle || "Fresh opportunities added this week.");

  return (
    <section id="propiedades">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">
            {sectionTitle}
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            {sectionSubtitle}
          </p>
        </div>

        {/* Filter tabs — Server-side navigation via Link */}
        <div className="hidden md:flex bg-white p-1 rounded-lg">
          {(['All', 'Buy', 'Rent', 'Saved'] as FilterType[]).map((tab) => {
            const isActive = filter === tab;
            return isActive ? (
              <span
                key={tab}
                className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm"
              >
                {dictionary?.market?.tabs?.[tab] || tab}
              </span>
            ) : (
              <Link
                key={tab}
                href={filterHref(tab)}
                className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark transition-all"
              >
                {dictionary?.market?.tabs?.[tab] || tab}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.length > 0 ? (
          properties.map((property) => (
            <PropertyCard key={property.id} property={property} dictionary={dictionary} />
          ))
        ) : isSavedFilter ? (
          <div className="col-span-full py-16 px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm max-w-lg mx-auto my-4">
            <div className="w-16 h-16 rounded-full bg-mosque/10 text-mosque mx-auto flex items-center justify-center mb-4">
              <span className="material-icons text-3xl">favorite_border</span>
            </div>
            <h3 className="text-xl font-semibold text-nordic-dark mb-2">
              {dictionary?.saved?.empty_title || "No tienes propiedades guardadas"}
            </h3>
            <p className="text-nordic-muted text-sm mb-6 max-w-sm mx-auto">
              {dictionary?.saved?.empty_description || "Haz clic en el icono de corazón en cualquier propiedad para guardarla en tus favoritos y consultarla aquí cuando desees."}
            </p>
            <Link
              href="/?filter=All"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-primary-dark transition-all shadow-sm"
            >
              <span className="material-icons text-base">explore</span>
              <span>{dictionary?.saved?.explore_button || "Explorar Propiedades"}</span>
            </Link>
          </div>
        ) : (
          <p className="col-span-full text-center text-nordic-muted py-16 text-sm">
            {dictionary?.market?.no_properties || "No properties found for this filter."}
          </p>
        )}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        filter={filter}
        dictionary={dictionary}
        searchParams={searchParams}
      />
    </section>
  );
}
