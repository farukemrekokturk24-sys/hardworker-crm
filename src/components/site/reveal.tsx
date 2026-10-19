"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Görünür olunca yumuşakça beliren sarmalayıcı. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** @deprecated düzen için dıştaki elemanı kullanın */
  as?: string;
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
          io.disconnect();
        }
      },
      // threshold 0: uzun bölümlerde (viewport'tan yüksek) oran asla
      // dolmayacağı için yalnızca kesişme anına bakılır.
      { threshold: 0, rootMargin: "0px 0px -64px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal", shown && "in", className)}
    >
      {children}
    </div>
  );
}
