"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = { type: "video"; src: string; poster: string } | { type: "image"; src: string };

/**
 * Proje başlığındaki döner medya.
 * Varsa tanıtım videosuyla başlar, ardından öne çıkan fotoğraflar döner.
 */
export function ProjectHeroMedia({
  video,
  poster,
  images,
  alt,
}: {
  video?: string | null;
  poster?: string | null;
  images: string[];
  alt: string;
}) {
  const slides: Slide[] = [
    ...(video && poster ? [{ type: "video" as const, src: video, poster }] : []),
    ...images.slice(0, 5).map((src) => ({ type: "image" as const, src })),
  ];

  const [i, setI] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timer = useRef<number | null>(null);

  const go = (n: number) => setI((prev) => (n + slides.length) % slides.length);

  // Fotoğraflar 5 saniyede bir döner; video kendi süresince kalır
  useEffect(() => {
    if (slides.length < 2) return;
    const current = slides[i];
    if (current.type === "video") return;
    timer.current = window.setTimeout(() => go(i + 1), 5000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [i, slides.length]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (slides[i]?.type === "video") {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [i, slides]);

  if (!slides.length) return null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-dark">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            idx === i ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={idx !== i}
        >
          {s.type === "video" ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              poster={s.poster}
              muted
              playsInline
              preload="metadata"
              onEnded={() => go(i + 1)}
            >
              <source src={s.src} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={s.src}
              alt={alt}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover"
            />
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(i - 1)}
            aria-label="Önceki görsel"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full glass-dark text-white grid place-items-center hover:bg-white/20 transition-colors z-10"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => go(i + 1)}
            aria-label="Sonraki görsel"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full glass-dark text-white grid place-items-center hover:bg-white/20 transition-colors z-10"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => go(idx)}
                aria-label={`${idx + 1}. görsele git`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === i ? "w-7 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                )}
              >
                {s.type === "video" && idx === i && <span className="sr-only">video</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
