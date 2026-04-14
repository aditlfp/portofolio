'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import AppIcon from '@/components/ui/AppIcon';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
}

export default function ImageUploader({ label, value, onChange, aspectRatio = 'aspect-video' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-label text-on-surface-variant mb-2 uppercase tracking-widest font-bold">{label}</label>
      <div className={`relative ${aspectRatio} bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/20 overflow-hidden group cursor-pointer border-2 border-dashed border-transparent hover:border-primary/40 transition-all`}>
        {value ? (
          <>
            <Image src={value} alt={label} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  type="button"
                  onClick={() => onChange('')}
                  className="p-3 bg-error-container text-on-error-container rounded-full hover:scale-110 transition-transform"
                >
                  <AppIcon name="trash" />
                </button>
                <label className="p-3 bg-primary-container text-on-primary-container rounded-full cursor-pointer hover:scale-110 transition-transform">
                  <AppIcon name="upload" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
            </div>
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
            {uploading ? (
              <span className="loading loading-spinner text-primary"></span>
            ) : (
              <>
                <AppIcon name="photoPlus" className="text-4xl text-on-surface-variant" />
                <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest font-bold">Upload {label}</span>
              </>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  );
}
