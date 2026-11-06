"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Hero arka plan videosu.
 *
 * - Poster görsel hemen boyanır, video arkadan yüklenir (CLS yok).
 * - Sekme/bölüm görünmezken duraklatılır — boşuna pil ve CPU harcamaz.
 * - prefers-reduced-motion açıkken video hiç oynatılmaz, poster kalır.
 */
export function HeroVideo({
  src = "/video/hero.mp4",
  poster = "/video/hero.jpg",
  className,
}: {
  src?: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const play = () => el.play().catch(() => {});

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? play() : el.pause()),
      { threshold: 0.01 }
    );
    io.observe(el);

    const onVisibility = () => (document.hidden ? el.pause() : play());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
        ready ? "opacity-100" : "opacity-0",
        className
      )}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      onCanPlay={() => setReady(true)}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
