'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { PropertyListingType, PropertyCategory } from '@/types/property';

export interface PropertyFormData {
  title: string;
  price: number;
  listingType: PropertyListingType;
  category: PropertyCategory;
  description?: string;
  address?: string;
  location?: string;
  area: string;
  yearBuilt?: number;
  beds: number;
  baths: number;
  parking?: number;
  amenities: string[];
  images: string[];
  latitude?: number;
  longitude?: number;
}

function generateSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'property'}-${id.slice(-6)}`;
}

function formatPrice(price: number): string {
  return `$${Math.round(price).toLocaleString('en-US')}`;
}

/**
 * Creates a new property in the database.
 */
export async function createPropertyAction(data: PropertyFormData) {
  try {
    const supabase = await createClient();

    // Verify session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Debes iniciar sesión para crear propiedades.' };
    }

    const newId = `prop-${Date.now()}`;
    const slug = generateSlug(data.title, newId);
    const formattedPrice = formatPrice(data.price);
    const location = data.address || data.location || 'Ubicación no especificada';

    const insertPayload = {
      id: newId,
      title: data.title.trim(),
      slug,
      price: data.price,
      formatted_price: formattedPrice,
      price_period: data.listingType === 'FOR RENT' ? '/mo' : null,
      listing_type: data.listingType,
      category: data.category,
      description: data.description?.trim() || null,
      address: data.address?.trim() || null,
      location,
      area: data.area.trim() || '100 m²',
      year_built: data.yearBuilt ? Number(data.yearBuilt) : null,
      beds: Number(data.beds) || 1,
      baths: Number(data.baths) || 1,
      parking: Number(data.parking) || 0,
      amenities: data.amenities || [],
      images: data.images && data.images.length > 0 ? data.images : ['/placeholder.jpg'],
      latitude: data.latitude !== undefined && data.latitude !== null ? Number(data.latitude) : null,
      longitude: data.longitude !== undefined && data.longitude !== null ? Number(data.longitude) : null,
      is_featured: false,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    };

    const { error: insertError } = await supabase
      .from('properties')
      .insert([insertPayload]);

    if (insertError) {
      console.error('Error inserting property:', insertError.message);
      return { success: false, error: insertError.message };
    }

    revalidatePath('/admin/propiedades');
    revalidatePath('/propiedades');
    revalidatePath('/');

    return { success: true, id: newId, slug };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear la propiedad';
    console.error('Exception creating property:', message);
    return { success: false, error: message };
  }
}

/**
 * Updates an existing property by its ID.
 */
export async function updatePropertyAction(id: string, data: PropertyFormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Debes iniciar sesión para editar propiedades.' };
    }

    const formattedPrice = formatPrice(data.price);
    const location = data.address || data.location || 'Ubicación no especificada';

    const updatePayload = {
      title: data.title.trim(),
      price: data.price,
      formatted_price: formattedPrice,
      price_period: data.listingType === 'FOR RENT' ? '/mo' : null,
      listing_type: data.listingType,
      category: data.category,
      description: data.description?.trim() || null,
      address: data.address?.trim() || null,
      location,
      area: data.area.trim() || '100 m²',
      year_built: data.yearBuilt ? Number(data.yearBuilt) : null,
      beds: Number(data.beds) || 1,
      baths: Number(data.baths) || 1,
      parking: Number(data.parking) || 0,
      amenities: data.amenities || [],
      images: data.images && data.images.length > 0 ? data.images : ['/placeholder.jpg'],
    };

    const { error: updateError } = await supabase
      .from('properties')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating property:', updateError.message);
      return { success: false, error: updateError.message };
    }

    revalidatePath('/admin/propiedades');
    revalidatePath('/propiedades');
    revalidatePath(`/propiedades/${id}`);
    revalidatePath('/');

    return { success: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar la propiedad';
    console.error('Exception updating property:', message);
    return { success: false, error: message };
  }
}

/**
 * Deletes a property by its ID.
 */
export async function deletePropertyAction(id: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Debes iniciar sesión para eliminar propiedades.' };
    }

    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting property:', deleteError.message);
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/admin/propiedades');
    revalidatePath('/propiedades');
    revalidatePath('/');

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al eliminar la propiedad';
    console.error('Exception deleting property:', message);
    return { success: false, error: message };
  }
}
