import Link from "next/link";
import { Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] grid place-items-center bg-bg px-5 pt-24">
      <div className="text-center max-w-md">
        <p className="font-display font-extrabold text-7xl text-brand/20 num">404</p>
        <h1 className="t-h2 text-ink mt-3">Sayfa bulunamadı</h1>
        <p className="t-lead mt-3">
          Aradığınız sayfa taşınmış ya da kaldırılmış olabilir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button href="/">
            <Home size={16} /> Ana Sayfa
          </Button>
          <Button href="/projeler" variant="outline">
            <Building2 size={16} /> Projeler
          </Button>
        </div>
      </div>
    </section>
  );
}
