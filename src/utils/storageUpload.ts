import { supabase } from '../supabase';

/**
 * Upload an image file to Supabase Storage bucket 'blog-images' (or 'public'/'images').
 * If bucket or permissions fail, falls back to DataURL (base64) so user flow never breaks.
 */
export async function uploadImageToSupabase(file: File, folder: string = 'articles'): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // Try primary bucket 'blog-images'
    let { data, error } = await supabase.storage.from('blog-images').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      // Try alternate bucket 'images' or 'public'
      const retry = await supabase.storage.from('images').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (!retry.error) {
        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) return publicUrlData.publicUrl;
      }
    } else if (data) {
      const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      if (publicUrlData?.publicUrl) return publicUrlData.publicUrl;
    }
  } catch (err) {
    console.warn('Supabase storage upload error, falling back to base64:', err);
  }

  // Fallback: Read as base64 Data URL if Supabase bucket is not set up yet
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to convert image to data URL'));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
