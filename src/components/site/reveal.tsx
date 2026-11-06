"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "up" | "down" | "left" | "right" | "zoom" | "blur" | "wipe";

/**
 * Görünür olunca beliren sarmalayıcı.
 *
 * threshold 0 kullanılır: viewport'tan uzun bölümlerde oran tabanlı eşik
 * asla dolmaz ve içerik görünmez kalırdı.
 */
export function Reveal({
  children,
  delay = 0,
  variant = "up",
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  variant?: Variant;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -64px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal", `reveal-${variant}`, shown && "in", className)}
    >
      {children}
    </div>
  );
}

/** Çocuklarını sırayla açar — liste ve ızgaralar için. */
export function RevealGroup({
  children,
  step = 80,
  variant = "up",
  className,
}: {
  children: ReactNode[];
  step?: number;
  variant?: Variant;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * step} variant={variant}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

/** Başlığı kelime kelime yükseltir. */
export function WordRise({
  text,
  className,
  step = 55,
}: {
  text: string;
  className?: string;
  step?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -48px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <span ref={ref} className={cn("word-rise", shown && "in", className)}>
      {words.map((w, i) => (
        <span key={i} style={{ transitionDelay: `${i * step}ms` }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

/** Görünür olunca hedefe doğru sayan rakam. */
export function CountUp({
  to,
  suffix = "",
  duration = 1600,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(to);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          // easeOutExpo
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setValue(Math.round(to * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={cn("num", className)}>
      {new Intl.NumberFormat("tr-TR").format(value)}
      {suffix}
    </span>
  );
}

/** Kesintisiz kayan şerit. */
export function Marquee({
  children,
  className,
  speed = 42,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="flex w-max anim-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Scroll ile hafifçe kayan katman (parallax). */
export function Parallax({
  children,
  amount = 60,
  className,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -200 || r.top > vh + 200) return;
      // -1 … 1 aralığı
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      el.style.transform = `translate3d(0, ${(-p * amount).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [amount]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
