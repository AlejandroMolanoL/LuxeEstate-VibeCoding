import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'properties';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Uploads a property image to Supabase Storage in the 'properties' bucket.
 * Returns the public URL and the relative file path.
 */
export async function uploadPropertyImage(file: File): Promise<UploadResult> {
  try {
    // Generate a unique, safe filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const filePath = `listings/${cleanBaseName}-${uniqueId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image to Supabase Storage:', uploadError.message);
      return { url: '', path: '', error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown upload error';
    console.error('Exception uploading property image:', message);
    return { url: '', path: '', error: message };
  }
}

/**
 * Deletes a property image from the 'properties' bucket if it resides there.
 */
export async function deletePropertyImage(pathOrUrl: string): Promise<boolean> {
  try {
    let filePath = pathOrUrl;

    // If a full public URL was provided, extract the path after the bucket name
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      const bucketUrlPrefix = `storage/v1/object/public/${BUCKET_NAME}/`;
      const idx = pathOrUrl.indexOf(bucketUrlPrefix);
      if (idx !== -1) {
        filePath = pathOrUrl.substring(idx + bucketUrlPrefix.length);
      } else {
        // External URL (e.g., unsplash or googleusercontent) - don't delete from bucket
        return true;
      }
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) {
      console.warn('Could not delete image from Supabase storage:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception deleting image from storage:', err);
    return false;
  }
}
