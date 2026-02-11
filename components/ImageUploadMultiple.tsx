'use client';

import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import Button from './ui/Button';
import { useToastStore } from '@/store/toast';
import Image from 'next/image';

interface ImageUploadMultipleProps {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
  maxImages?: number;
  label?: string;
}

export default function ImageUploadMultiple({
  images,
  onChange,
  folder = 'ecommerce',
  maxImages = 5,
  label = 'Images',
}: ImageUploadMultipleProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addToast = useToastStore((state) => state.addToast);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    if (files.length > remaining) {
      addToast(`You can only upload ${remaining} more image(s)`, 'error');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onChange([...images, ...result.data.urls]);
        addToast(`${files.length} image(s) uploaded successfully`, 'success');
      } else {
        addToast(result.message || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToast('Failed to upload images', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    if (files.length > remaining) {
      addToast(`You can only upload ${remaining} more image(s)`, 'error');
      return;
    }

    const input = fileInputRef.current;
    if (input) {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-300">
        {label} ({images.length}/{maxImages})
      </label>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                <Image
                  src={url}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-zinc-600 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
              <ImageIcon className="text-zinc-400" size={24} />
            </div>
            
            <div className="text-sm text-zinc-400">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Click to upload
              </button>
              {' '}or drag and drop
            </div>
            
            <p className="text-xs text-zinc-500">
              PNG, JPG, GIF up to 5MB (max {maxImages - images.length} more)
            </p>
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 text-sm text-zinc-400">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                Uploading...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
