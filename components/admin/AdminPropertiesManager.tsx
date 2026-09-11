'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { deactivatePropertyAction, reactivatePropertyAction, updatePropertyListingStatusAction } from '@/app/admin/propiedades/actions';
import { PropertyListingType } from '@/types/property';
import PropertyPreviewModal from './PropertyPreviewModal';

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
  listing_type: PropertyListingType;
  category?: string;
  created_at?: string;
  parking?: number;
  year_built?: number;
  badge?: string;
  description?: string;
  amenities?: string[];
  is_featured?: boolean;
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

interface AdminPropertiesManagerProps {
  initialProperties: PropertyItem[];
  dictionary?: any;
  currentLocale?: string;
}

export default function AdminPropertiesManager({
  initialProperties,
  dictionary,
  currentLocale = 'es',
}: AdminPropertiesManagerProps) {
  const t = dictionary?.admin_properties;
  const [propertiesList, setPropertiesList] = useState<PropertyItem[]>(initialProperties);
  const [filterType, setFilterType] = useState<'ALL' | 'FOR SALE' | 'FOR RENT' | 'INACTIVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [previewProperty, setPreviewProperty] = useState<PropertyItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const pageSize = 6;

  useEffect(() => {
    setPropertiesList(initialProperties);
  }, [initialProperties]);

  const handleToggleActive = async (id: string, title: string, currentlyActive: boolean) => {
    const action = currentlyActive ? 'desactivar' : 'reactivar';
    const confirmText = `¿Estás seguro de ${action} la propiedad "${title}"?`;
    if (!window.confirm(confirmText)) {
      return;
    }

    setIsTogglingId(id);
    const res = currentlyActive
      ? await deactivatePropertyAction(id)
      : await reactivatePropertyAction(id);

    if (res.success) {
      setPropertiesList((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !currentlyActive } : p))
      );
    } else {
      alert(res.error || `No se pudo ${action} la propiedad`);
    }
    setIsTogglingId(null);
  };

  const handleUpdateListingType = async (id: string, title: string, newType: PropertyListingType) => {
    const res = await updatePropertyListingStatusAction(id, newType);
    if (res.success) {
      setPropertiesList((prev) =>
        prev.map((p) => (p.id === id ? { ...p, listing_type: newType } : p))
      );
    } else {
      alert(res.error || 'No se pudo actualizar el estado de la propiedad');
    }
  };

  // Compute stat totals
  const totalCount = propertiesList.filter((p) => p.is_active !== false).length;
  const forSaleCount = useMemo(
    () => propertiesList.filter((p) => p.listing_type === 'FOR SALE' && p.is_active !== false).length,
    [propertiesList]
  );
  const forRentCount = useMemo(
    () => propertiesList.filter((p) => p.listing_type === 'FOR RENT' && p.is_active !== false).length,
    [propertiesList]
  );
  const inactiveCount = useMemo(
    () => propertiesList.filter((p) => p.is_active === false).length,
    [propertiesList]
  );

  // Filter properties by tab and search query
  const filteredProperties = useMemo(() => {
    return propertiesList.filter((property) => {
      const isActive = property.is_active !== false;

      // Filter by quick tab
      if (filterType === 'INACTIVE') {
        if (isActive) return false;
      } else if (filterType === 'ALL') {
        // ALL shows only active properties
        if (!isActive) return false;
      } else {
        // FOR SALE / FOR RENT: only active
        if (!isActive) return false;
        if (property.listing_type !== filterType) return false;
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
  }, [propertiesList, filterType, searchQuery]);

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

  const handleFilterChange = (type: 'ALL' | 'FOR SALE' | 'FOR RENT' | 'INACTIVE') => {
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
            {t?.title || 'Gestión de Propiedades'}
          </h1>
          <p className="text-nordic/60 text-sm mt-1">
            {t?.subtitle ||
              'Administra el portafolio de inmuebles, filtra por disponibilidad y gestiona sus datos.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/usuarios"
            className="bg-white border border-nordic/15 text-nordic hover:bg-black/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <span className="material-icons text-base text-mosque">group</span>
            <span>{t?.view_users || 'Ver Usuarios'}</span>
          </Link>
          <Link
            href="/admin/propiedades/nueva"
            className="bg-mosque hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
          >
            <span className="material-icons text-base">add</span>
            <span>{t?.new_property || 'Nueva Propiedad'}</span>
          </Link>
        </div>
      </div>

      {/* Quick Filter Buttons / Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
        {/* Total Propiedades Activas */}
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
                {t?.total_properties || 'Total Activas'}
              </p>
              {filterType === 'ALL' && (
                <span className="bg-mosque text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  {t?.active || 'Activo'}
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
                {t?.for_sale || 'En Venta'}
              </p>
              {filterType === 'FOR SALE' && (
                <span className="bg-mosque text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  {t?.active || 'Activo'}
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
                {t?.for_rent || 'En Alquiler'}
              </p>
              {filterType === 'FOR RENT' && (
                <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  {t?.active || 'Activo'}
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

        {/* Inactivas */}
        <button
          type="button"
          onClick={() => handleFilterChange('INACTIVE')}
          className={`bg-white text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md ${
            filterType === 'INACTIVE'
              ? 'ring-2 ring-gray-500 border-gray-500 shadow-md bg-gray-50/50'
              : 'border-nordic/10 hover:border-gray-400/40'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold text-nordic/60 uppercase tracking-wider">
                Inactivas
              </p>
              {filterType === 'INACTIVE' && (
                <span className="bg-gray-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  Activo
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-nordic mt-1">{inactiveCount}</p>
          </div>
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
              filterType === 'INACTIVE'
                ? 'bg-gray-500 text-white shadow-soft'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <span className="material-icons text-2xl">visibility_off</span>
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
            placeholder={t?.search_placeholder || 'Filtrar por título, ubicación o categoría...'}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-nordic/15 text-nordic placeholder-nordic/40 text-sm focus:outline-none focus:ring-2 focus:ring-mosque focus:border-mosque transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-nordic/40 hover:text-nordic transition-colors p-0.5"
              title={t?.reset || 'Limpiar búsqueda'}
            >
              <span className="material-icons text-base">close</span>
            </button>
          )}
        </div>

        {/* Filter State Indicators */}
        <div className="flex items-center gap-2 text-xs text-nordic/60 w-full sm:w-auto justify-between sm:justify-end">
          <span>
            {totalResults} {totalResults === 1 ? (t?.found_singular || 'propiedad encontrada') : (t?.found_plural || 'propiedades encontradas')}
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
              <span>{t?.reset || 'Restablecer'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Property List Table matching property_management_dashboard */}
      <div className="bg-white rounded-xl shadow-sm border border-nordic/10 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-nordic/60 uppercase tracking-wider">
          <div className="col-span-6">{t?.table_property_details || 'Detalles de la Propiedad'}</div>
          <div className="col-span-2">{t?.table_price || 'Precio'}</div>
          <div className="col-span-2">{t?.table_status || 'Tipo / Estado'}</div>
          <div className="col-span-2 text-right">{t?.table_actions || 'Acciones'}</div>
        </div>

        {/* Property Rows */}
        {paginatedProperties.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {paginatedProperties.map((item) => {
              const imageSrc =
                Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';

              const statusLabel =
                item.listing_type === 'FOR SALE'
                  ? (t?.for_sale || 'En Venta')
                  : item.listing_type === 'SOLD'
                  ? (t?.sold || 'Vendida')
                  : (t?.for_rent || 'En Alquiler');

              const isActive = item.is_active !== false;

              return (
                <div
                  key={item.id}
                  className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 transition-colors items-center ${
                    isActive
                      ? 'hover:bg-background-light/60'
                      : 'bg-gray-50/80 opacity-70 hover:opacity-90'
                  }`}
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-base font-bold truncate transition-colors ${
                          isActive ? 'text-nordic group-hover:text-mosque' : 'text-gray-500'
                        }`}>
                          <Link href={`/propiedades/${item.id}`}>
                            {item.title}
                          </Link>
                        </h3>
                        {!isActive && (
                          <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0">
                            <span className="material-icons text-[10px]">visibility_off</span>
                            Inactiva
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-nordic/60 truncate mt-0.5">
                        {item.location || item.address}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-nordic/50">
                        {item.beds && (
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-[14px]">bed</span>
                            <span>{item.beds} {t?.beds_short || 'Habs'}</span>
                          </span>
                        )}
                        {item.beds && item.baths && <span>•</span>}
                        {item.baths && (
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-[14px]">bathtub</span>
                            <span>{item.baths} {t?.baths_short || 'Baños'}</span>
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

                  {/* Status / Listing Type Dropdown */}
                  <div className="col-span-6 md:col-span-2">
                    <select
                      value={item.listing_type}
                      onChange={(e) => handleUpdateListingType(item.id, item.title, e.target.value as PropertyListingType)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-all shadow-sm ${
                        item.listing_type === 'FOR SALE'
                          ? 'bg-hint-green/60 text-mosque border-mosque/20'
                          : item.listing_type === 'SOLD'
                          ? 'bg-gray-100 text-gray-700 border-gray-300'
                          : item.listing_type === 'RENTED'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <option value="FOR SALE">En Venta</option>
                      <option value="FOR RENT">En Alquiler</option>
                      <option value="SOLD">Vendida</option>
                      <option value="RENTED">Alquilada</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewProperty(item);
                        setIsPreviewOpen(true);
                      }}
                      className="p-2 rounded-lg text-nordic/50 hover:text-mosque hover:bg-mosque/10 transition-all cursor-pointer"
                      title={t?.preview_title || t?.view_live || 'Visual de la Propiedad'}
                    >
                      <span className="material-icons text-lg">visibility</span>
                    </button>
                    <Link
                      href={`/admin/propiedades/${item.id}/editar`}
                      className="p-2 rounded-lg text-nordic/50 hover:text-mosque hover:bg-hint-green/40 transition-all cursor-pointer inline-flex items-center justify-center"
                      title={t?.edit_property || 'Editar Propiedad'}
                    >
                      <span className="material-icons text-lg">edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item.id, item.title, isActive)}
                      disabled={isTogglingId === item.id}
                      className={`p-2 rounded-lg transition-all cursor-pointer disabled:opacity-40 ${
                        isActive
                          ? 'text-nordic/50 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      }`}
                      title={isActive ? 'Desactivar Propiedad' : 'Reactivar Propiedad'}
                    >
                      {isTogglingId === item.id ? (
                        <span className="material-icons text-lg animate-spin">refresh</span>
                      ) : (
                        <span className="material-icons text-lg">
                          {isActive ? 'toggle_on' : 'toggle_off'}
                        </span>
                      )}
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
            <h3 className="text-base font-semibold text-nordic">
              {t?.no_properties_title || 'No se encontraron propiedades'}
            </h3>
            <p className="text-xs text-nordic/60 mt-1 max-w-sm mx-auto">
              {t?.no_properties_desc ||
                'Prueba cambiando el término de búsqueda o seleccionando otra categoría de filtro.'}
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
              {t?.view_all || 'Ver todas las propiedades'}
            </button>
          </div>
        )}

        {/* Pagination Footer matching code.html */}
        {totalResults > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <div className="text-sm text-nordic/70">
              {t?.showing || 'Mostrando'} <span className="font-semibold text-nordic">{startRecord}</span> {t?.to || 'a'}{' '}
              <span className="font-semibold text-nordic">{endRecord}</span> {t?.of || 'de'}{' '}
              <span className="font-semibold text-nordic">{totalResults}</span> {t?.results || 'resultados'}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage <= 1}
                className="px-3 py-1.5 text-xs font-medium border border-nordic/15 rounded-lg text-nordic/80 hover:bg-white hover:border-mosque disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
              >
                <span className="material-icons text-sm">chevron_left</span>
                <span>{t?.previous || 'Anterior'}</span>
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
                <span>{t?.next || 'Siguiente'}</span>
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Property Visual Preview Modal */}
      <PropertyPreviewModal
        property={previewProperty}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        dictionary={dictionary}
      />
    </main>
  );
}
