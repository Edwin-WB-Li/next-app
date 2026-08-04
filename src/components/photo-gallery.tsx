"use client";

import type { TouchEvent } from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight } from "@/shared/components/icons";

interface PhotoGalleryProps {
  photos: string[];
  title?: string;
}

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);
  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : prev));
  }, [photos.length]);

  useEffect(() => {
    if (lightboxIndex !== null) {
      closeBtnRef.current?.focus();
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  const touchStartX = useRef(0);
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50) goPrev();
    if (diff < -50) goNext();
  };

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
            aria-label={`查看照片 ${index + 1}`}
            className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-lg border border-border bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={photo}
                alt={`照片 ${index + 1}`}
                fill
                className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 motion-safe:transition-colors group-hover:bg-black/10" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 关闭按钮 */}
          <button
            ref={closeBtnRef}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            onClick={closeLightbox}
            aria-label="关闭预览"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 上一张 */}
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="上一张"
            >
              <IconChevronLeft className="h-6 w-6" />
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
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="下一张"
            >
              <IconChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
