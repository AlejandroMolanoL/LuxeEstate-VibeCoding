'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PropertyItem } from './AdminPropertiesManager';

interface PropertyPreviewModalProps {
  property: PropertyItem | null;
  isOpen: boolean;
  onClose: () => void;
  dictionary?: any;
}

export default function PropertyPreviewModal({
  property,
  isOpen,
  onClose,
  dictionary,
}: PropertyPreviewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const t = dictionary?.admin_properties;
  const detailT = dictionary?.property_details;
  const amenitiesT = dictionary?.detail_amenities;

  // Reset image index when opened or property changes
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen, property?.id]);

  // Handle ESC key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !property) return null;

  const images: string[] = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : [];

  const mainImage = images[currentImageIndex] || '/placeholder.jpg';

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const isForSale = property.listing_type === 'FOR SALE';
  const isSold = property.listing_type === 'SOLD';
  const statusLabel = isForSale
    ? t?.for_sale || 'En Venta'
    : isSold
    ? t?.sold || 'Vendida'
    : t?.for_rent || 'En Alquiler';

  const publicUrl = `/propiedades/${property.slug || property.id}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-nordic/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-nordic/10 my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-nordic/10 bg-clear-day/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-mosque/10 text-mosque flex items-center justify-center">
              <span className="material-icons text-xl">visibility</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-nordic">
                  {t?.preview_title || 'Visual de la Propiedad'}
                </h2>
                {property.category && (
                  <span className="bg-nordic/5 text-nordic/70 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {property.category}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-nordic/50 font-mono">ID: {property.id}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-nordic/50 hover:text-nordic hover:bg-nordic/5 transition-colors cursor-pointer"
            title={t?.close || 'Cerrar'}
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="max-h-[calc(85vh-140px)] overflow-y-auto p-6 space-y-6">
          {/* Main Visual Image & Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] sm:aspect-[16/8] rounded-xl overflow-hidden bg-nordic/5 border border-nordic/10 group shadow-sm">
              {images.length > 0 ? (
                <img
                  src={mainImage}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-nordic/40 gap-2">
                  <span className="material-icons text-4xl">image_not_supported</span>
                  <span className="text-xs font-medium">{t?.no_images || 'Sin imágenes registradas'}</span>
                </div>
              )}

              {/* Status & Badge Overlays */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${
                    isForSale
                      ? 'bg-mosque text-white'
                      : isSold
                      ? 'bg-gray-700 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                  {statusLabel}
                </span>

                {property.badge && (
                  <span className="bg-white/95 text-nordic text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {property.badge}
                  </span>
                )}
              </div>

              {/* Counter Pill */}
              {images.length > 0 && (
                <div className="absolute bottom-3 right-3 bg-nordic/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span className="material-icons text-xs">photo_camera</span>
                  <span>
                    {currentImageIndex + 1} / {images.length}
                  </span>
                </div>
              )}

              {/* Carousel Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-nordic shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <span className="material-icons text-lg">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-nordic shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer"
                    aria-label="Next image"
                  >
                    <span className="material-icons text-lg">chevron_right</span>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      currentImageIndex === idx
                        ? 'border-mosque ring-2 ring-mosque/30 scale-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title, Price and Location */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-nordic/10">
            <div>
              <h3 className="text-2xl font-bold text-nordic tracking-tight">{property.title}</h3>
              <p className="text-sm text-nordic/60 flex items-center gap-1.5 mt-1">
                <span className="material-icons text-mosque text-base">location_on</span>
                <span>{property.address || property.location || 'Ubicación no especificada'}</span>
              </p>
            </div>

            <div className="sm:text-right">
              <div className="text-2xl font-bold text-nordic">
                {property.formatted_price || `$${Number(property.price).toLocaleString()}`}
              </div>
              {property.price_period && (
                <div className="text-xs text-nordic/50 font-medium">{property.price_period}</div>
              )}
            </div>
          </div>

          {/* Key Specs Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-nordic/50 mb-3">
              {detailT?.features_title || 'Características Principales'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Area */}
              <div className="bg-clear-day/80 border border-nordic/10 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-icons text-mosque text-xl mb-1">square_foot</span>
                <span className="text-sm font-bold text-nordic">{property.area || '-'}</span>
                <span className="text-[10px] text-nordic/50 uppercase font-semibold">
                  {detailT?.square_area || 'Área'}
                </span>
              </div>

              {/* Beds */}
              <div className="bg-clear-day/80 border border-nordic/10 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-icons text-mosque text-xl mb-1">bed</span>
                <span className="text-sm font-bold text-nordic">{property.beds ?? '-'}</span>
                <span className="text-[10px] text-nordic/50 uppercase font-semibold">
                  {detailT?.bedrooms || 'Habs'}
                </span>
              </div>

              {/* Baths */}
              <div className="bg-clear-day/80 border border-nordic/10 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-icons text-mosque text-xl mb-1">shower</span>
                <span className="text-sm font-bold text-nordic">{property.baths ?? '-'}</span>
                <span className="text-[10px] text-nordic/50 uppercase font-semibold">
                  {detailT?.bathrooms || 'Baños'}
                </span>
              </div>

              {/* Parking */}
              <div className="bg-clear-day/80 border border-nordic/10 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="material-icons text-mosque text-xl mb-1">directions_car</span>
                <span className="text-sm font-bold text-nordic">
                  {(property.parking as number) ?? '-'}
                </span>
                <span className="text-[10px] text-nordic/50 uppercase font-semibold">
                  {t?.parking || detailT?.garage || 'Garaje'}
                </span>
              </div>

              {/* Year Built */}
              <div className="bg-clear-day/80 border border-nordic/10 p-3 rounded-xl flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
                <span className="material-icons text-mosque text-xl mb-1">calendar_today</span>
                <span className="text-sm font-bold text-nordic">
                  {(property.year_built as number) ?? '-'}
                </span>
                <span className="text-[10px] text-nordic/50 uppercase font-semibold">
                  {t?.year_built || 'Año'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-nordic/50 mb-2">
              {detailT?.about_title || 'Descripción'}
            </h4>
            <div className="bg-clear-day/40 border border-nordic/10 p-4 rounded-xl text-sm text-nordic/80 leading-relaxed whitespace-pre-line">
              {property.description || t?.no_description || 'Sin descripción proporcionada.'}
            </div>
          </div>

          {/* Amenities */}
          {Array.isArray(property.amenities) && property.amenities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-nordic/50 mb-3">
                {detailT?.amenities_title || 'Comodidades y Amenidades'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, idx) => {
                  const translated =
                    (amenitiesT as Record<string, string> | undefined)?.[amenity] || amenity;
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mosque/5 border border-mosque/15 text-nordic text-xs font-medium"
                    >
                      <span className="material-icons text-mosque text-sm">check_circle</span>
                      <span>{translated}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-clear-day/80 border-t border-nordic/10">
          <Link
            href={`/admin/propiedades/${property.id}/editar`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-nordic/80 hover:text-mosque hover:bg-mosque/10 transition-colors border border-nordic/15 cursor-pointer"
          >
            <span className="material-icons text-base">edit</span>
            <span>{t?.edit_property || 'Editar Propiedad'}</span>
          </Link>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold text-nordic/60 hover:text-nordic hover:bg-nordic/5 transition-colors border border-transparent cursor-pointer"
            >
              {t?.close || 'Cerrar'}
            </button>

            <Link
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-mosque hover:bg-primary-dark text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md shadow-mosque/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>{t?.view_full_page || 'Ver página web completa'}</span>
              <span className="material-icons text-base">open_in_new</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
