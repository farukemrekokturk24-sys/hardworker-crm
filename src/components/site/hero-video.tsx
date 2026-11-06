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

    // Video önbellekten gelirse "canplay" React dinlemeye başlamadan tetiklenir;
    // bu durumda poster/video görünmez kalırdı.
    if (el.readyState >= 2) setReady(true);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      return;
    }

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
        "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
        ready ? "opacity-100" : "opacity-0",
        className
      )}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      onLoadedData={() => setReady(true)}
      onCanPlay={() => setReady(true)}
    >
      {/* Mobilde küçük dosya; masaüstünde keskin sürüm */}
      <source src="/video/hero-sm.mp4" type="video/mp4" media="(max-width: 767px)" />
      <source src={src} type="video/mp4" />
    </video>
  );
}
