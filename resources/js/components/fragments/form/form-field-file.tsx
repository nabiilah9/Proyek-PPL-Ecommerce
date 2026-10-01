import type React from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/elements/button';

interface ImagePreviewInputProps {
  htmlFor: string;
  label: string;
  currentImageUrl?: string | null;
  onChange: (file: File | null) => void;
  error?: string;
  className?: string;
}

export function ImagePreviewInput({
  htmlFor,
  label,
  currentImageUrl,
  onChange,
  error,
  className,
}: ImagePreviewInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial preview if there's a current image
  useEffect(() => {
    if (currentImageUrl) {
      setPreview(currentImageUrl);
    }
  }, [currentImageUrl]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    } else {
      setPreview(currentImageUrl || null);
      onChange(null);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);

      // Update the file input value for form submission
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  // Clear the selected image
  const clearImage = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>

      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border',
          error ? 'border-destructive' : '',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-full">
            <div className="relative mx-auto max-h-64 max-w-full overflow-hidden rounded-md">
              <img
                src={preview || '/placeholder.svg'}
                alt="Preview"
                className="h-auto max-h-64 w-auto max-w-full object-contain"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerFileInput}
              >
                Change Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="bg-muted mb-3 rounded-full p-3">
              <ImageIcon className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="mb-1 text-sm font-medium">
              Drag and drop your image here or click to browse
            </p>
            <p className="text-muted-foreground text-xs">
              Supports JPG, PNG, GIF up to 5MB
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={triggerFileInput}
            >
              Select Image
            </Button>
          </div>
        )}

        <input
          id={htmlFor}
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}