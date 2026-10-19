"use client";

import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePriceGate } from "./price-gate";

/** Hero'daki birincil çağrı — kayıtlıysa doğrudan projelere yönlendirir. */
export function HeroUnlock() {
  const { unlocked, open } = usePriceGate();

  if (unlocked) {
    return (
      <Button href="/projeler" size="lg">
        Fiyat Listesini Gör <ArrowRight size={17} />
      </Button>
    );
  }

  return (
    <Button onClick={() => open()} size="lg">
      <Lock size={17} /> Fiyat Listesini Aç
    </Button>
  );
}
