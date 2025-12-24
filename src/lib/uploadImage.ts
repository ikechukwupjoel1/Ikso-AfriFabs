import { supabase } from './supabase';

export interface UploadImageOptions {
    file: File;
    bucket?: string;
    folder?: string;
    maxSizeMB?: number;
}

export interface UploadImageResult {
    url: string;
    path: string;
    error?: string;
}

/**
 * Upload an image to Supabase Storage
 * @param options Upload configuration
 * @returns Public URL and storage path
 */
export async function uploadImage({
    file,
    bucket = 'fabric-images',
    folder = '',
    maxSizeMB = 5,
}: UploadImageOptions): Promise<UploadImageResult> {
    try {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return {
                url: '',
                path: '',
                error: 'Invalid file type. Please upload JPG, PNG, or WebP images.',
            };
        }

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            return {
                url: '',
                path: '',
                error: `File size exceeds ${maxSizeMB}MB limit.`,
            };
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}-${randomString}.${fileExt}`;

        // Construct storage path
        const path = folder ? `${folder}/${fileName}` : fileName;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            return {
                url: '',
                path: '',
                error: error.message || 'Failed to upload image',
            };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return {
            url: urlData.publicUrl,
            path: data.path,
        };
    } catch (err) {
        console.error('Upload exception:', err);
        return {
            url: '',
            path: '',
            error: 'An unexpected error occurred during upload',
        };
    }
}

/**
 * Delete an image from Supabase Storage
 * @param path Storage path of the image
 * @param bucket Storage bucket name
 */
export async function deleteImage(
    path: string,
    bucket: string = 'fabric-images'
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path]);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Delete exception:', err);
        return { success: false, error: 'Failed to delete image' };
    }
}

/**
 * Get public URL for an image
 * @param path Storage path
 * @param bucket Storage bucket name
 */
export function getImageUrl(
    path: string,
    bucket: string = 'fabric-images'
): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}
