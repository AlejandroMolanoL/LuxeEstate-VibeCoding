'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export interface PropertyItem {
  id: string;
  title: string;
  slug?: string;
  location?: string;
  address?: string;
  price: number;
  formatted_price?: string;
  price_period?: string;
  beds?: number;
  baths?: number;
  area?: string;
  images?: string[];
  listing_type: 'FOR SALE' | 'FOR RENT';
  category?: string;
  created_at?: string;
  [key: string]: unknown;
}

interface AdminPropertiesManagerProps {
  initialProperties: PropertyItem[];
}

export default function AdminPropertiesManager({
  initialProperties,
}: AdminPropertiesManagerProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'FOR SALE' | 'FOR RENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Compute stat totals
  const totalCount = initialProperties.length;
  const forSaleCount = useMemo(
    () => initialProperties.filter((p) => p.listing_type === 'FOR SALE').length,
    [initialProperties]
  );
  const forRentCount = useMemo(
    () => initialProperties.filter((p) => p.listing_type === 'FOR RENT').length,
    [initialProperties]
  );

  // Filter properties by tab and search query
  const filteredProperties = useMemo(() => {
    return initialProperties.filter((property) => {
      // Filter by quick tab
      if (filterType !== 'ALL' && property.listing_type !== filterType) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = property.title?.toLowerCase().includes(query);
        const locationMatch = (property.location || property.address)?.toLowerCase().includes(query);
        const categoryMatch = property.category?.toLowerCase().includes(query);
        return titleMatch || locationMatch || categoryMatch;
      }

      return true;
    });
  }, [initialProperties, filterType, searchQuery]);

  // Pagination calculations
  const totalResults = filteredProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProperties = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredProperties.slice(startIndex, startIndex + pageSize);
  }, [filteredProperties, safeCurrentPage, pageSize]);

  const startRecord = totalResults === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(safeCurrentPage * pageSize, totalResults);

  const handleFilterChange = (type: 'ALL' | 'FOR SALE' | 'FOR RENT') => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-nordic tracking-tight">
            Gestión de Propiedades
          </h1>
          <p className="text-nordic/60 text-sm mt-1">
            Administra el portafolio de inmuebles, filtra por disponibilidad y gestiona sus datos.
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
            className="bg-mosque hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
          >
            <span className="material-icons text-base">add</span>
            <span>Nueva Propiedad</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Buttons / Stats Overview matching attached design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Total Propiedades */}
        <button
          type="button"
          onClick={() => handleFilterChange('ALL')}
          className={`bg-white text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md ${
            filterType === 'ALL'
              ? 'ring-2 ring-mosque border-mosque shadow-md bg-mosque/[0.02]'
              : 'border-nordic/10 hover:border-mosque/40'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold text-nordic/60 uppercase tracking-wider">
                Total Propiedades
              </p>
              {filterType === 'ALL' && (
                <span className="bg-mosque text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  Activo
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-nordic mt-1">{totalCount}</p>
          </div>
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
              filterType === 'ALL'
                ? 'bg-mosque text-white shadow-soft'
                : 'bg-mosque/10 text-mosque'
            }`}
          >
            <span className="material-icons text-2xl">apartment</span>
          </div>
        </button>

        {/* En Venta */}
        <button
          type="button"
          onClick={() => handleFilterChange('FOR SALE')}
          className={`bg-white text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md ${
            filterType === 'FOR SALE'
              ? 'ring-2 ring-mosque border-mosque shadow-md bg-mosque/[0.02]'
              : 'border-nordic/10 hover:border-mosque/40'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold text-nordic/60 uppercase tracking-wider">
                En Venta
              </p>
              {filterType === 'FOR SALE' && (
                <span className="bg-mosque text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  Activo
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-nordic mt-1">{forSaleCount}</p>
          </div>
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
              filterType === 'FOR SALE'
                ? 'bg-mosque text-white shadow-soft'
                : 'bg-hint-green/60 text-mosque'
            }`}
          >
            <span className="material-icons text-2xl">sell</span>
          </div>
        </button>

        {/* En Alquiler */}
        <button
          type="button"
          onClick={() => handleFilterChange('FOR RENT')}
          className={`bg-white text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md ${
            filterType === 'FOR RENT'
              ? 'ring-2 ring-amber-600 border-amber-600 shadow-md bg-amber-50/30'
              : 'border-nordic/10 hover:border-amber-500/40'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold text-nordic/60 uppercase tracking-wider">
                En Alquiler
              </p>
              {filterType === 'FOR RENT' && (
                <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  Activo
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-nordic mt-1">{forRentCount}</p>
          </div>
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
              filterType === 'FOR RENT'
                ? 'bg-amber-600 text-white shadow-soft'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            <span className="material-icons text-2xl">key</span>
          </div>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-nordic/10 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-nordic/40 text-xl pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Filtrar por título, ubicación o categoría..."
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-nordic/15 text-nordic placeholder-nordic/40 text-sm focus:outline-none focus:ring-2 focus:ring-mosque focus:border-mosque transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-nordic/40 hover:text-nordic transition-colors p-0.5"
              title="Limpiar búsqueda"
            >
              <span className="material-icons text-base">close</span>
            </button>
          )}
        </div>

        {/* Filter State Indicators */}
        <div className="flex items-center gap-2 text-xs text-nordic/60 w-full sm:w-auto justify-between sm:justify-end">
          <span>
            {totalResults} {totalResults === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </span>
          {(filterType !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilterType('ALL');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-mosque hover:underline font-semibold ml-2 inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="material-icons text-xs">restart_alt</span>
              <span>Restablecer</span>
            </button>
          )}
        </div>
      </div>

      {/* Property List Table matching property_management_dashboard */}
      <div className="bg-white rounded-xl shadow-sm border border-nordic/10 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-nordic/60 uppercase tracking-wider">
          <div className="col-span-6">Detalles de la Propiedad</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Tipo / Estado</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* Property Rows */}
        {paginatedProperties.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {paginatedProperties.map((item) => {
              const imageSrc =
                Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={item.id}
                  className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-background-light/60 transition-colors items-center"
                >
                  {/* Property Details */}
                  <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                    <div className="relative h-18 w-26 sm:h-20 sm:w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        alt={item.title}
                        src={imageSrc}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-nordic truncate group-hover:text-mosque transition-colors">
                        <Link href={`/propiedades/${item.id}`}>
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-nordic/60 truncate mt-0.5">
                        {item.location || item.address}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-nordic/50">
                        {item.beds && (
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-[14px]">bed</span>
                            <span>{item.beds} Habs</span>
                          </span>
                        )}
                        {item.beds && item.baths && <span>•</span>}
                        {item.baths && (
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-[14px]">bathtub</span>
                            <span>{item.baths} Baños</span>
                          </span>
                        )}
                        {item.area && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span className="material-icons text-[14px]">straighten</span>
                              <span>{item.area}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-6 md:col-span-2">
                    <div className="text-base font-semibold text-nordic">
                      {item.formatted_price || `$${Number(item.price).toLocaleString()}`}
                    </div>
                    {item.price_period && (
                      <div className="text-xs text-nordic/50">{item.price_period}</div>
                    )}
                  </div>

                  {/* Status / Listing Type */}
                  <div className="col-span-6 md:col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.listing_type === 'FOR SALE'
                          ? 'bg-hint-green/60 text-mosque border border-mosque/15'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
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
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1.5">
                    <Link
                      href={`/propiedades/${item.id}`}
                      target="_blank"
                      className="p-2 rounded-lg text-nordic/50 hover:text-mosque hover:bg-mosque/10 transition-all cursor-pointer"
                      title="Ver Propiedad en Vivo"
                    >
                      <span className="material-icons text-lg">visibility</span>
                    </Link>
                    <button
                      type="button"
                      className="p-2 rounded-lg text-nordic/50 hover:text-mosque hover:bg-hint-green/40 transition-all cursor-pointer"
                      title="Editar Propiedad"
                    >
                      <span className="material-icons text-lg">edit</span>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-lg text-nordic/50 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      title="Eliminar Propiedad"
                    >
                      <span className="material-icons text-lg">delete_outline</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-nordic/5 text-nordic/40 mx-auto flex items-center justify-center mb-3">
              <span className="material-icons text-2xl">search_off</span>
            </div>
            <h3 className="text-base font-semibold text-nordic">No se encontraron propiedades</h3>
            <p className="text-xs text-nordic/60 mt-1 max-w-sm mx-auto">
              Prueba cambiando el término de búsqueda o seleccionando otra categoría de filtro.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterType('ALL');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-1.5 bg-mosque/10 text-mosque rounded-lg text-xs font-semibold hover:bg-mosque hover:text-white transition-colors"
            >
              Ver todas las propiedades
            </button>
          </div>
        )}

        {/* Pagination Footer matching code.html */}
        {totalResults > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <div className="text-sm text-nordic/70">
              Mostrando <span className="font-semibold text-nordic">{startRecord}</span> a{' '}
              <span className="font-semibold text-nordic">{endRecord}</span> de{' '}
              <span className="font-semibold text-nordic">{totalResults}</span> resultados
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage <= 1}
                className="px-3 py-1.5 text-xs font-medium border border-nordic/15 rounded-lg text-nordic/80 hover:bg-white hover:border-mosque disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
              >
                <span className="material-icons text-sm">chevron_left</span>
                <span>Anterior</span>
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === safeCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center ${
                        isActive
                          ? 'bg-mosque text-white shadow-sm'
                          : 'border border-nordic/15 text-nordic/70 hover:bg-white hover:border-mosque'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage >= totalPages}
                className="px-3 py-1.5 text-xs font-medium border border-nordic/15 rounded-lg text-nordic/80 hover:bg-white hover:border-mosque disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
              >
                <span>Siguiente</span>
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
