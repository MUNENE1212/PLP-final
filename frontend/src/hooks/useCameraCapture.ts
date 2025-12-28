import { useState, useRef, useCallback } from 'react';

interface UseCameraCaptureOptions {
  onCapture?: (imageUrl: string) => void;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
}

export const useCameraCapture = (options: UseCameraCaptureOptions = {}) => {
  const {
    onCapture,
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
  } = options;

  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCapture = useCallback(() => {
    setError(null);
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      const errorMsg = `Invalid file type. Accepted types: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`;
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    // Check file size
    if (file.size > maxFileSize) {
      const errorMsg = `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`;
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setPreviewUrl(url);
        setIsCapturing(false);

        if (onCapture) {
          onCapture(url);
        }
      };
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Error capturing image:', err);
      const errorMsg = 'Failed to capture image. Please try again.';
      setError(errorMsg);
      setIsCapturing(false);
      alert(errorMsg);
    }
  }, [maxFileSize, acceptedTypes, onCapture]);

  const clearPreview = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return {
    isCapturing,
    previewUrl,
    error,
    startCapture,
    clearPreview,
    fileInputRef
  };
};
