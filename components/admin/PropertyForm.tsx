'use client';

import { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Property, PropertyListingType, PropertyCategory } from '@/types/property';
import { uploadPropertyImage } from '@/lib/supabase/storage';
import { createPropertyAction, updatePropertyAction } from '@/app/admin/propiedades/actions';

interface PropertyFormProps {
  mode: 'create' | 'edit';
  initialData?: Property | null;
  dictionary?: any;
  currentLocale?: string;
}

const AVAILABLE_AMENITIES = [
  'Swimming Pool',
  'Garden',
  'Air Conditioning',
  'Smart Home',
  'Gym',
  'Ocean View',
  'Private Terrace',
  'Wine Cellar',
];

export default function PropertyForm({
  mode,
  initialData,
  dictionary,
  currentLocale = 'es',
}: PropertyFormProps) {
  const t = dictionary?.admin_form;
  const amenitiesMap: Record<string, string> = dictionary?.detail_amenities || {};
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [price, setPrice] = useState<number | ''>(initialData?.price ?? '');
  const [status, setStatus] = useState<PropertyListingType>(initialData?.listingType || 'FOR SALE');
  const [category, setCategory] = useState<PropertyCategory>(initialData?.category || 'Apartment');
  const [description, setDescription] = useState(initialData?.description || '');
  const [address, setAddress] = useState(initialData?.address || initialData?.location || '');
  const [area, setArea] = useState(initialData?.area ? initialData.area.replace(/[^0-9.]/g, '') : '');
  const [yearBuilt, setYearBuilt] = useState<number | ''>(initialData?.yearBuilt ?? '');
  const [beds, setBeds] = useState<number>(initialData?.beds ?? 3);
  const [baths, setBaths] = useState<number>(initialData?.baths ?? 2);
  const [parking, setParking] = useState<number>(initialData?.parking ?? 1);
  const [amenities, setAmenities] = useState<string[]>(
    initialData?.amenities && initialData.amenities.length > 0
      ? initialData.amenities
      : ['Garden']
  );

  // Gallery State
  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images.filter((img) => img !== '/placeholder.jpg')
      : []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Error & Status Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Formatting Toolbar Helper
  const handleFormatText = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('description') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    const replacement = `${prefix}${selectedText || 'texto'}${suffix}`;

    const newDescription =
      description.substring(0, start) + replacement + description.substring(end);

    if (newDescription.length <= 2000) {
      setDescription(newDescription);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
      }, 50);
    }
  };

  // Amenities toggle
  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  // Handle Image Uploads to Supabase Storage
  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(
      currentLocale === 'es'
        ? `Subiendo 0 de ${files.length} imágenes...`
        : currentLocale === 'fr'
        ? `Téléchargement de 0 sur ${files.length} images...`
        : `Uploading 0 of ${files.length} images...`
    );
    setErrorMessage(null);

    const newUploadedUrls: string[] = [];
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMessage(
          currentLocale === 'es'
            ? `El archivo "${file.name}" no es una imagen válida.`
            : `File "${file.name}" is not a valid image.`
        );
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(
          currentLocale === 'es'
            ? `La imagen "${file.name}" excede el límite de 5MB.`
            : `Image "${file.name}" exceeds 5MB limit.`
        );
        return false;
      }
      return true;
    });

    for (let i = 0; i < validFiles.length; i++) {
      setUploadProgress(
        currentLocale === 'es'
          ? `Subiendo imagen ${i + 1} de ${validFiles.length}...`
          : currentLocale === 'fr'
          ? `Téléchargement image ${i + 1} sur ${validFiles.length}...`
          : `Uploading image ${i + 1} of ${validFiles.length}...`
      );
      const res = await uploadPropertyImage(validFiles[i]);
      if (res.url) {
        newUploadedUrls.push(res.url);
      } else if (res.error) {
        setErrorMessage(
          currentLocale === 'es'
            ? `Error al subir ${validFiles[i].name}: ${res.error}`
            : `Error uploading ${validFiles[i].name}: ${res.error}`
        );
      }
    }

    if (newUploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...newUploadedUrls]);
    }

    setIsUploading(false);
    setUploadProgress(null);
  };

  // Set image as main (move to first position)
  const setMainImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      copy.unshift(selected);
      return copy;
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage(
        currentLocale === 'es'
          ? 'El título de la propiedad es obligatorio.'
          : 'Property title is required.'
      );
      return;
    }

    if (price === '' || Number(price) <= 0) {
      setErrorMessage(
        currentLocale === 'es'
          ? 'Por favor especifica un precio válido mayor a 0.'
          : 'Please enter a valid price greater than 0.'
      );
      return;
    }

    const formattedArea = area ? `${area} m²` : '100 m²';

    const payload = {
      title: title.trim(),
      price: Number(price),
      listingType: status,
      category,
      description: description.trim(),
      address: address.trim(),
      location: address.trim() || 'Ubicación Premium',
      area: formattedArea,
      yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
      beds,
      baths,
      parking,
      amenities,
      images: images.length > 0 ? images : ['/placeholder.jpg'],
    };

    startTransition(async () => {
      if (mode === 'create') {
        const result = await createPropertyAction(payload);
        if (result.success) {
          setSuccessMessage(t?.success_create || '¡Propiedad creada exitosamente!');
          setTimeout(() => {
            router.push('/admin/propiedades');
            router.refresh();
          }, 800);
        } else {
          setErrorMessage(result.error || 'Error al crear la propiedad');
        }
      } else if (mode === 'edit' && initialData) {
        const result = await updatePropertyAction(initialData.id, payload);
        if (result.success) {
          setSuccessMessage(t?.success_update || '¡Propiedad actualizada correctamente!');
          setTimeout(() => {
            router.push('/admin/propiedades');
            router.refresh();
          }, 800);
        } else {
          setErrorMessage(result.error || 'Error al actualizar la propiedad');
        }
      }
    });
  };

  return (
    <div className="bg-clear-day text-nordic min-h-screen selection:bg-hint-green selection:text-nordic">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
          <div className="space-y-4">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="flex">
              <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
                <li>
                  <Link href="/admin/propiedades" className="hover:text-mosque transition-colors">
                    {t?.breadcrumb_properties || 'Properties'}
                  </Link>
                </li>
                <li>
                  <span className="material-icons text-xs text-gray-400">chevron_right</span>
                </li>
                <li aria-current="page" className="text-nordic font-semibold">
                  {mode === 'create'
                    ? t?.breadcrumb_add || 'Add New'
                    : t?.breadcrumb_edit || 'Edit Property'}
                </li>
              </ol>
            </nav>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-nordic tracking-tight mb-2">
                {mode === 'create'
                  ? t?.add_new_title || 'Add New Property'
                  : t?.edit_title || 'Edit Property'}
              </h1>
              <p className="text-base text-gray-500 max-w-2xl font-normal">
                {t?.subtitle ||
                  'Fill in the details below to create a new listing. Fields marked with * are mandatory.'}
              </p>
            </div>
          </div>

          {/* Action Buttons Top */}
          <div className="flex gap-3">
            <Link
              href="/admin/propiedades"
              className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-nordic hover:bg-gray-50 transition-colors font-medium text-sm inline-flex items-center justify-center"
            >
              {t?.cancel || 'Cancel'}
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || isUploading}
              className="px-5 py-2.5 rounded-lg bg-mosque hover:bg-nordic text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <span className="material-icons text-sm animate-spin">refresh</span>
                  <span>{t?.saving || 'Saving...'}</span>
                </>
              ) : (
                <>
                  <span className="material-icons text-sm">save</span>
                  <span>
                    {mode === 'create'
                      ? t?.save_property || 'Save Property'
                      : t?.save_changes || 'Save Changes'}
                  </span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <span className="material-icons text-red-500">error_outline</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-3">
            <span className="material-icons text-green-600">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Grid Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 Cols) */}
          <div className="xl:col-span-8 space-y-8">
            {/* Card 1: Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
                <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                  <span className="material-icons text-lg">info</span>
                </div>
                <h2 className="text-xl font-bold text-nordic">{t?.basic_info || 'Basic Information'}</h2>
              </div>
              <div className="p-8 space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-nordic mb-1.5" htmlFor="title">
                    {t?.property_title || 'Property Title'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t?.title_placeholder || 'e.g. Modern Penthouse with Ocean View'}
                    className="w-full text-base px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-nordic mb-1.5" htmlFor="price">
                      {t?.price || 'Price'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        $
                      </span>
                      <input
                        id="price"
                        type="number"
                        min="0"
                        step="any"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full pl-7 pr-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-medium"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-nordic mb-1.5" htmlFor="status">
                      {t?.status || 'Status'}
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as PropertyListingType)}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base cursor-pointer"
                    >
                      <option value="FOR SALE">{t?.status_for_sale || 'For Sale'}</option>
                      <option value="FOR RENT">{t?.status_for_rent || 'For Rent'}</option>
                      <option value="SOLD">{t?.status_sold || 'Sold'}</option>
                    </select>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-nordic mb-1.5" htmlFor="type">
                      {t?.property_type || 'Property Type'}
                    </label>
                    <select
                      id="type"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base cursor-pointer"
                    >
                      <option value="Apartment">{t?.type_apartment || 'Apartment'}</option>
                      <option value="House">{t?.type_house || 'House'}</option>
                      <option value="Villa">{t?.type_villa || 'Villa'}</option>
                      <option value="Penthouse">{t?.type_penthouse || 'Penthouse'}</option>
                      <option value="Commercial">{t?.type_commercial || 'Commercial'}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
                <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                  <span className="material-icons text-lg">description</span>
                </div>
                <h2 className="text-xl font-bold text-nordic">{t?.description || 'Description'}</h2>
              </div>
              <div className="p-8">
                <div className="mb-3 flex gap-2 border-b border-gray-100 pb-2">
                  <button
                    type="button"
                    onClick={() => handleFormatText('**', '**')}
                    className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors"
                    title="Bold"
                  >
                    <span className="material-icons text-lg">format_bold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatText('*', '*')}
                    className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors"
                    title="Italic"
                  >
                    <span className="material-icons text-lg">format_italic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormatText('\n• ')}
                    className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors"
                    title="Bullet List"
                  >
                    <span className="material-icons text-lg">format_list_bulleted</span>
                  </button>
                </div>
                <textarea
                  id="description"
                  rows={6}
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    t?.desc_placeholder ||
                    'Describe the property features, neighborhood, and unique selling points...'
                  }
                  className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base leading-relaxed resize-y min-h-[200px]"
                />
                <div className="mt-2 text-right text-xs text-gray-400">
                  {description.length} / 2000 {t?.characters || 'characters'}
                </div>
              </div>
            </div>

            {/* Card 3: Gallery */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-hint-green/30 flex justify-between items-center bg-gradient-to-r from-hint-green/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                    <span className="material-icons text-lg">image</span>
                  </div>
                  <h2 className="text-xl font-bold text-nordic">{t?.gallery || 'Gallery'}</h2>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {t?.formats || 'JPG, PNG, WEBP'}
                </span>
              </div>
              <div className="p-8">
                {/* Upload Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFilesUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer group ${
                    isDragging
                      ? 'bg-hint-green/20 border-mosque'
                      : 'border-gray-300 bg-gray-50/50 hover:bg-hint-green/10 hover:border-mosque/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={(e) => handleFilesUpload(e.target.files)}
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-mosque group-hover:scale-110 transition-transform duration-300">
                      {isUploading ? (
                        <span className="material-icons text-2xl animate-spin">refresh</span>
                      ) : (
                        <span className="material-icons text-2xl">cloud_upload</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-medium text-nordic">
                        {isUploading
                          ? uploadProgress || t?.uploading || 'Subiendo imágenes a Supabase...'
                          : t?.drag_drop || 'Click or drag images here'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t?.max_size || 'Max file size 5MB per image'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thumbnails Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {images.map((imgUrl, index) => (
                    <div
                      key={`${imgUrl}-${index}`}
                      className="aspect-square rounded-lg overflow-hidden relative group shadow-sm bg-gray-100 border border-gray-200"
                    >
                      <img
                        src={imgUrl}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Main Badge */}
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-mosque text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                          {t?.main_badge || 'Main'}
                        </span>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-nordic/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                          title={t?.delete_image || 'Eliminar imagen'}
                        >
                          <span className="material-icons text-sm">delete</span>
                        </button>
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => setMainImage(index)}
                            className="w-8 h-8 rounded-full bg-white text-nordic hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                            title={t?.set_main || 'Establecer como principal'}
                          >
                            <span className="material-icons text-sm">star_border</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add More Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-mosque hover:border-mosque hover:bg-hint-green/20 transition-all group cursor-pointer"
                  >
                    <span className="material-icons group-hover:scale-110 transition-transform">
                      add
                    </span>
                    <span className="text-xs mt-1 font-medium">{t?.add_more || 'Add More'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 Cols) */}
          <div className="xl:col-span-4 space-y-8">
            {/* Card 4: Location */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
                <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                  <span className="material-icons text-lg">place</span>
                </div>
                <h2 className="text-lg font-bold text-nordic">{t?.location || 'Location'}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-nordic mb-1.5" htmlFor="location">
                    {t?.address || 'Address'}
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t?.address_placeholder || 'Street Address, City, Zip'}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                  />
                </div>

                {/* Map Preview */}
                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                  <img
                    alt="Map view of city streets"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS55FY7gfArnlTpNsdabJk9nBO5uQJgOwIsl8beO34JRZ9dMmjLoIkTuTUO72Y9L5tUmQqTReQWebUWadAWwLusGmRQiIict5sqY--yRaOxuYpTzfR4vv4RKh1ex6oxY64e0kbSeMudNO6pv-gG0WzVWs-pDfvQm5IoTQ1mT-tAV49LDkXAHZl317M1-D7eZw3N8o2ExKWTgg6oMAXOFVnkApIqnb7TZHekwSw8pWQxpJV2EKI8EQKQbQXJaSbjN8gB1n8b-ueWj8"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 text-nordic px-3 py-1.5 rounded shadow-sm backdrop-blur-sm text-xs font-bold flex items-center gap-1">
                      <span className="material-icons text-sm text-mosque">map</span> {t?.preview || 'Preview'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Details (Sticky) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
                <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                  <span className="material-icons text-lg">straighten</span>
                </div>
                <h2 className="text-lg font-bold text-nordic">{t?.details || 'Details'}</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="text-xs text-gray-500 font-medium mb-1 block" htmlFor="area">
                      {t?.area || 'Area (m²)'}
                    </label>
                    <input
                      id="area"
                      type="number"
                      min="0"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="0"
                      className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic focus:bg-white focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                    />
                  </div>
                  <div className="group">
                    <label className="text-xs text-gray-500 font-medium mb-1 block" htmlFor="year">
                      {t?.year_built || 'Year Built'}
                    </label>
                    <input
                      id="year"
                      type="number"
                      min="1800"
                      max="2099"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="YYYY"
                      className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic focus:bg-white focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                    />
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Steppers */}
                <div className="space-y-4">
                  {/* Bedrooms */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-nordic flex items-center gap-2">
                      <span className="material-icons text-gray-400 text-sm">bed</span>{' '}
                      {t?.bedrooms || 'Bedrooms'}
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => setBeds((b) => Math.max(0, b - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={beds}
                        className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setBeds((b) => b + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-nordic flex items-center gap-2">
                      <span className="material-icons text-gray-400 text-sm">shower</span>{' '}
                      {t?.bathrooms || 'Bathrooms'}
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => setBaths((b) => Math.max(0, b - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={baths}
                        className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setBaths((b) => b + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Parking */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-nordic flex items-center gap-2">
                      <span className="material-icons text-gray-400 text-sm">directions_car</span>{' '}
                      {t?.parking || 'Parking'}
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => setParking((p) => Math.max(0, p - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={parking}
                        className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setParking((p) => p + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Amenities */}
                <div>
                  <h3 className="mb-3 uppercase tracking-wider text-xs font-bold text-gray-500">
                    {t?.amenities || 'Amenities'}
                  </h3>
                  <div className="space-y-2">
                    {AVAILABLE_AMENITIES.map((amenity) => {
                      const checked = amenities.includes(amenity);
                      const translatedAmenity = amenitiesMap[amenity] || amenity;
                      return (
                        <label
                          key={amenity}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAmenity(amenity)}
                            className="w-4 h-4 text-mosque border-gray-300 rounded focus:ring-mosque accent-mosque"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-nordic transition-colors">
                            {translatedAmenity}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Mobile Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl md:hidden z-40 flex gap-3">
            <Link
              href="/admin/propiedades"
              className="flex-1 py-3 rounded-lg border border-gray-300 bg-white text-nordic font-medium text-center"
            >
              {t?.cancel || 'Cancel'}
            </Link>
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="flex-1 py-3 rounded-lg bg-mosque text-white font-medium flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isPending
                ? t?.saving || 'Saving...'
                : mode === 'create'
                ? t?.save_property || 'Save'
                : t?.save_changes || 'Save'}
            </button>
          </div>
        </form>
      </main>

      {/* Footer matching code.html */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-12 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400">
          © 2024 Estates Real Estate Inc. All rights reserved. <br />
          <span className="mt-2 block text-gray-300">Designed for modern agencies.</span>
        </div>
      </footer>
    </div>
  );
}
