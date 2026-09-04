import { Property } from '@/types/property';
import FeaturedCard from './FeaturedCard';

interface FeaturedCollectionsProps {
  properties: Property[];
  dictionary?: any;
}

export default function FeaturedCollections({ properties, dictionary }: FeaturedCollectionsProps) {
  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">
            {dictionary?.featured?.title || "Featured Collections"}
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            {dictionary?.featured?.subtitle || "Curated properties for the discerning eye."}
          </p>
        </div>
        <a
          href="#"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
        >
          {dictionary?.featured?.view_all || "View all"} <span className="material-icons text-sm">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {properties.map((property) => (
          <FeaturedCard key={property.id} property={property} dictionary={dictionary} />
        ))}
      </div>
    </section>
  );
}
