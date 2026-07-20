"use client";

import { useState } from "react";
import Image from "next/image";

interface PhotoGalleryProps {
  photos: string[];
  title?: string;
}

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <div>
      {title && (
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          {title}
        </h3>
      )}

      {/* 瀑布流网格 */}
      <div className="columns-2 gap-3 sm:columns-3">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setLightboxIndex(index)}
            className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-lg border border-border bg-muted"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={photo}
                alt={`照片 ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          {/* 关闭按钮 */}
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
            onClick={() => setLightboxIndex(null)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 上一张 */}
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* 图片 */}
          <div
            className="flex max-h-[85vh] max-w-[90vw] items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightboxIndex]}
              alt={`照片 ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            />
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur">
              {lightboxIndex + 1} / {photos.length}
            </p>
          </div>

          {/* 下一张 */}
          {lightboxIndex < photos.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
