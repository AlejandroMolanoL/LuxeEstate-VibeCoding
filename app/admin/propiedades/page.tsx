import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export default async function AdminPropertiesPage() {
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  const totalListings = properties?.length || 0;
  const forSaleCount = properties?.filter(p => p.listing_type === 'FOR SALE').length || 0;
  const forRentCount = properties?.filter(p => p.listing_type === 'FOR RENT').length || 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-nordic tracking-tight">
            Gestión de Propiedades
          </h1>
          <p className="text-nordic/60 text-sm mt-1">
            Administra el portafolio de inmuebles y su disponibilidad.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/usuarios"
            className="bg-white border border-nordic/15 text-nordic hover:bg-black/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <span className="material-icons text-base text-mosque">group</span>
            <span>Ver Usuarios</span>
          </Link>
          <button
            type="button"
            className="bg-mosque hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span className="material-icons text-base">add</span>
            <span>Nueva Propiedad</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl border border-nordic/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-nordic/60 uppercase tracking-wider">Total Propiedades</p>
            <p className="text-2xl font-bold text-nordic mt-1">{totalListings}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-mosque/10 flex items-center justify-center text-mosque">
            <span className="material-icons text-xl">apartment</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nordic/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-nordic/60 uppercase tracking-wider">En Venta</p>
            <p className="text-2xl font-bold text-nordic mt-1">{forSaleCount}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-hint-green/40 flex items-center justify-center text-mosque">
            <span className="material-icons text-xl">sell</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nordic/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-nordic/60 uppercase tracking-wider">En Alquiler</p>
            <p className="text-2xl font-bold text-nordic mt-1">{forRentCount}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <span className="material-icons text-xl">key</span>
          </div>
        </div>
      </div>

      {/* Property List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-nordic/10 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-nordic/60 uppercase tracking-wider">
          <div className="col-span-6">Detalles de la Propiedad</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Tipo / Estado</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* Rows */}
        {properties && properties.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {properties.map((item) => {
              const imageSrc =
                Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors items-center"
                >
                  {/* Property Details */}
                  <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                    <div className="relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        alt={item.title}
                        src={imageSrc}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-nordic truncate hover:text-mosque transition-colors">
                        <Link href={`/propiedades/${item.id}`}>
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-nordic/60 truncate mt-0.5">
                        {item.location || item.address}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-nordic/50">
                        {item.beds && <span>{item.beds} hab</span>}
                        {item.beds && item.baths && <span>•</span>}
                        {item.baths && <span>{item.baths} baños</span>}
                        {item.area && <span>•</span>}
                        {item.area && <span>{item.area}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-6 md:col-span-2">
                    <div className="text-sm font-semibold text-nordic">
                      {item.formatted_price || `$${Number(item.price).toLocaleString()}`}
                    </div>
                    {item.price_period && (
                      <div className="text-[11px] text-nordic/50">{item.price_period}</div>
                    )}
                  </div>

                  {/* Status / Type */}
                  <div className="col-span-6 md:col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.listing_type === 'FOR SALE'
                          ? 'bg-hint-green/50 text-mosque'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          item.listing_type === 'FOR SALE' ? 'bg-mosque' : 'bg-amber-600'
                        }`}
                      />
                      {item.listing_type === 'FOR SALE' ? 'En Venta' : 'En Alquiler'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1">
                    <Link
                      href={`/propiedades/${item.id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-nordic/50 hover:text-mosque hover:bg-mosque/10 transition-colors"
                      title="Ver Propiedad"
                    >
                      <span className="material-icons text-lg">visibility</span>
                    </Link>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-nordic/50 hover:text-mosque hover:bg-mosque/10 transition-colors cursor-pointer"
                      title="Editar Propiedad"
                    >
                      <span className="material-icons text-lg">edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-nordic/60 text-sm">
            No se encontraron propiedades registradas.
          </div>
        )}
      </div>
    </main>
  );
}
