'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { PropertyListingType, PropertyCategory } from '@/types/property';
import { createNotification } from '@/lib/notifications';

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
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      is_featured: false,
    };

    const { error: insertError } = await supabase
      .from('properties')
      .insert([insertPayload]);

    if (insertError) {
      console.error('Error inserting property:', insertError.message);
      return { success: false, error: insertError.message };
    }

    // Emit notification for administrators
    await createNotification({
      property_id: newId,
      title: 'Nueva propiedad creada',
      message: `Se ha añadido la propiedad "${data.title.trim()}" al catálogo.`,
      type: 'NEW_PROPERTY',
      target_role: 'admin',
      new_price: data.price,
    });

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

    // Fetch previous values for comparing changes (price drops, sold/rented status)
    const { data: existingProperty } = await supabase
      .from('properties')
      .select('price, listing_type, title')
      .eq('id', id)
      .maybeSingle();

    const oldPrice = existingProperty ? Number(existingProperty.price) : null;
    const oldListingType = existingProperty?.listing_type;

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

    // 1. Price drop notification for users who favorited
    if (oldPrice !== null && data.price < oldPrice) {
      await createNotification({
        property_id: id,
        title: '¡Bajada de precio!',
        message: `La propiedad "${data.title}" en tus favoritos ha bajado de ${formatPrice(oldPrice)} a ${formatPrice(data.price)}.`,
        type: 'PRICE_DROP',
        target_role: 'user',
        old_price: oldPrice,
        new_price: data.price,
      });
    }

    // 2. Sold notification
    if (data.listingType === 'SOLD' && oldListingType !== 'SOLD') {
      await createNotification({
        property_id: id,
        title: 'Propiedad vendida',
        message: `La propiedad "${data.title}" ha sido marcada como vendida.`,
        type: 'PROPERTY_SOLD',
        target_role: 'admin',
      });
      await createNotification({
        property_id: id,
        title: 'Propiedad no disponible',
        message: `La propiedad "${data.title}" en tus favoritos ha sido vendida y ya no está disponible.`,
        type: 'PROPERTY_SOLD',
        target_role: 'user',
      });
    }

    // 3. Rented notification
    if (data.listingType === 'RENTED' && oldListingType !== 'RENTED') {
      await createNotification({
        property_id: id,
        title: 'Propiedad alquilada',
        message: `La propiedad "${data.title}" ha sido marcada como alquilada.`,
        type: 'PROPERTY_RENTED',
        target_role: 'admin',
      });
      await createNotification({
        property_id: id,
        title: 'Propiedad no disponible',
        message: `La propiedad "${data.title}" en tus favoritos ha sido alquilada y ya no está disponible.`,
        type: 'PROPERTY_RENTED',
        target_role: 'user',
      });
    }

    // 4. General modification notification for admin (if not sold or rented)
    if (data.listingType !== 'SOLD' && data.listingType !== 'RENTED') {
      await createNotification({
        property_id: id,
        title: 'Propiedad modificada',
        message: `Se han actualizado los datos de la propiedad "${data.title}".`,
        type: 'PROPERTY_UPDATED',
        target_role: 'admin',
      });
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
 * Updates a property's listing status (e.g. mark as SOLD, RENTED, FOR SALE, FOR RENT)
 * and triggers notifications for admins and users with this property in favorites.
 */
export async function updatePropertyListingStatusAction(id: string, newListingType: PropertyListingType) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Debes iniciar sesión para cambiar el estado.' };
    }

    const { data: existingProperty } = await supabase
      .from('properties')
      .select('title, listing_type, price')
      .eq('id', id)
      .maybeSingle();

    if (!existingProperty) {
      return { success: false, error: 'Propiedad no encontrada' };
    }

    const title = existingProperty.title;
    const oldListingType = existingProperty.listing_type;

    const { error: updateError } = await supabase
      .from('properties')
      .update({ listing_type: newListingType })
      .eq('id', id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    if (newListingType === 'SOLD' && oldListingType !== 'SOLD') {
      await createNotification({
        property_id: id,
        title: 'Propiedad vendida',
        message: `La propiedad "${title}" ha sido marcada como vendida.`,
        type: 'PROPERTY_SOLD',
        target_role: 'admin',
      });
      await createNotification({
        property_id: id,
        title: 'Propiedad no disponible',
        message: `La propiedad "${title}" en tus favoritos ha sido vendida y ya no está disponible.`,
        type: 'PROPERTY_SOLD',
        target_role: 'user',
      });
    } else if (newListingType === 'RENTED' && oldListingType !== 'RENTED') {
      await createNotification({
        property_id: id,
        title: 'Propiedad alquilada',
        message: `La propiedad "${title}" ha sido marcada como alquilada.`,
        type: 'PROPERTY_RENTED',
        target_role: 'admin',
      });
      await createNotification({
        property_id: id,
        title: 'Propiedad no disponible',
        message: `La propiedad "${title}" en tus favoritos ha sido alquilada y ya no está disponible.`,
        type: 'PROPERTY_RENTED',
        target_role: 'user',
      });
    } else {
      await createNotification({
        property_id: id,
        title: 'Estado de propiedad actualizado',
        message: `La propiedad "${title}" ahora está en estado "${newListingType}".`,
        type: 'PROPERTY_UPDATED',
        target_role: 'admin',
      });
    }

    revalidatePath('/admin/propiedades');
    revalidatePath('/propiedades');
    revalidatePath(`/propiedades/${id}`);
    revalidatePath('/');

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al cambiar estado';
    return { success: false, error: message };
  }
}

/**
 * Deactivates a property (soft delete) by setting is_active = false.
 * The property remains in the database and visible in the admin panel.
 */
export async function deactivatePropertyAction(id: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Debes iniciar sesión para desactivar propiedades.' };
    }

    const { error: updateError } = await supabase
      .from('properties')
      .update({ is_active: false })
      .eq('id', id);

    if (updateError) {
      console.error('Error deactivating property:', updateError.message);
      return { success: false, error: updateError.message };
    }

    revalidatePath('/admin/propiedades');
    revalidatePath('/propiedades');
    revalidatePath('/');

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al desactivar la propiedad';
    console.error('Exception deactivating property:', message);
    return { success: false, error: message };
  }
}

/**
 * Reactivates a previously deactivated property by setting is_active = true.
 */
export async function reactivatePropertyAction(id: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Debes iniciar sesión para reactivar propiedades.' };
    }

    const { error: updateError } = await supabase
      .from('properties')
      .update({ is_active: true })
      .eq('id', id);

    if (updateError) {
      console.error('Error reactivating property:', updateError.message);
      return { success: false, error: updateError.message };
    }

    revalidatePath('/admin/propiedades');
    revalidatePath('/propiedades');
    revalidatePath('/');

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al reactivar la propiedad';
    console.error('Exception reactivating property:', message);
    return { success: false, error: message };
  }
}
