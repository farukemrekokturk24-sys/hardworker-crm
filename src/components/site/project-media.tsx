"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Proje kartı görseli — varsa videoyu oynatır, yoksa kapak fotoğrafına düşer.
 *
 * Video yalnızca kart görünür olduğunda oynar; mobilde veri harcamamak için
 * kullanıcı "az veri" modundaysa poster ile yetinilir.
 */
export function ProjectMedia({
  video,
  poster,
  image,
  alt,
  priority,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className,
}: {
  video?: string | null;
  poster?: string | null;
  image?: string | null;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const still = poster ?? image ?? null;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Tarayıcı veri tasarrufu bildiriyorsa videoyu hiç başlatma
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduced || conn?.saveData) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-surface-2", className)}>
      {still && (
        <Image
          src={still}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(
            "object-cover transition-opacity duration-700",
            playing ? "opacity-0" : "opacity-100"
          )}
        />
      )}

      {video && (
        <video
          ref={ref}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            playing ? "opacity-100" : "opacity-0"
          )}
          poster={still ?? undefined}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={video} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
