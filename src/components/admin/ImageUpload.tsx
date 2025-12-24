import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadImage, deleteImage } from '@/lib/uploadImage';
import { toast } from 'sonner';

interface ImageUploadProps {
    value?: string | string[];
    onChange: (urls: string | string[]) => void;
    multiple?: boolean;
    maxFiles?: number;
    folder?: string;
    disabled?: boolean;
}

export const ImageUpload = ({
    value,
    onChange,
    multiple = false,
    maxFiles = 5,
    folder = '',
    disabled = false,
}: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Normalize value to array for easier handling
    const images = Array.isArray(value) ? value : value ? [value] : [];

    const handleUpload = useCallback(
        async (files: FileList | null) => {
            if (!files || files.length === 0) return;

            const fileArray = Array.from(files);

            // Check max files limit
            if (multiple && images.length + fileArray.length > maxFiles) {
                toast.error(`Maximum ${maxFiles} images allowed`);
                return;
            }

            if (!multiple && fileArray.length > 1) {
                toast.error('Only one image allowed');
                return;
            }

            setUploading(true);

            try {
                const uploadPromises = fileArray.map((file) =>
                    uploadImage({ file, folder })
                );

                const results = await Promise.all(uploadPromises);

                // Check for errors
                const errors = results.filter((r) => r.error);
                if (errors.length > 0) {
                    toast.error(errors[0].error || 'Upload failed');
                    setUploading(false);
                    return;
                }

                // Get successful URLs
                const newUrls = results.map((r) => r.url);

                if (multiple) {
                    onChange([...images, ...newUrls]);
                } else {
                    onChange(newUrls[0]);
                }

                toast.success(`${newUrls.length} image(s) uploaded successfully`);
            } catch (err) {
                console.error('Upload error:', err);
                toast.error('Failed to upload images');
            } finally {
                setUploading(false);
            }
        },
        [images, multiple, maxFiles, folder, onChange]
    );

    const handleRemove = useCallback(
        async (urlToRemove: string) => {
            // Extract path from URL
            const urlParts = urlToRemove.split('/');
            const path = urlParts.slice(-2).join('/'); // Get last two parts (folder/filename)

            // Delete from storage
            const { success } = await deleteImage(path);

            if (success) {
                if (multiple) {
                    onChange(images.filter((url) => url !== urlToRemove));
                } else {
                    onChange('');
                }
                toast.success('Image removed');
            } else {
                toast.error('Failed to remove image');
            }
        },
        [images, multiple, onChange]
    );

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (disabled) return;

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleUpload(e.dataTransfer.files);
            }
        },
        [disabled, handleUpload]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                handleUpload(e.target.files);
            }
        },
        [handleUpload]
    );

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple={multiple}
                    onChange={handleFileInput}
                    disabled={disabled || uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">
                            {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG or WebP (max {multiple ? `${maxFiles} files, ` : ''}5MB each)
                        </p>
                    </div>
                </div>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((url, index) => (
                        <div key={url} className="relative group aspect-square">
                            <img
                                src={url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg border border-border"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleRemove(url)}
                                    disabled={disabled}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            {index === 0 && multiple && (
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                    Primary
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {images.length === 0 && !uploading && (
                <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No images uploaded yet</p>
                </div>
            )}
        </div>
    );
};
