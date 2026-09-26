import { supabase, isSupabaseConfigured } from './supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export async function uploadBusinessImage(
  file: File | Blob,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  if (file.size > MAX_FILE_SIZE) {
    return { url: null, error: 'File size exceeds maximum limit of 5MB.' };
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: 'Invalid file type. Please upload JPEG, PNG, WebP, or SVG images.' };
  }

  // If Supabase is configured, upload to Supabase Storage bucket 'custo-assets'
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const ownerFolder = userData?.user?.id ? `${userData.user.id}/` : '';
      const ext = file.type ? file.type.split('/')[1] : 'png';
      const fileName = `${ownerFolder}${path}_${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('custo-assets')
        .upload(fileName, file, { upsert: true, contentType: file.type || 'image/png' });

      if (error) {
        console.error('[Supabase Storage Error] Upload failed:', error);
        return { url: null, error: `Image upload failed: ${error.message}` };
      }

      const { data: publicUrlData } = supabase.storage
        .from('custo-assets')
        .getPublicUrl(data.path);

      return { url: publicUrlData.publicUrl, error: null };
    } catch (err: any) {
      console.error('[Supabase Storage Exception]:', err);
      return { url: null, error: `Image upload exception: ${err.message || 'Unknown error'}` };
    }
  }

  // Fallback: Convert to Data URL for instant preview & storage
  const dataUrl = await blobToDataUrl(file);
  return { url: dataUrl, error: null };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
