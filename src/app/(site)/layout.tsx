import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { FloatingActions } from "@/components/site/floating-actions";
import { PriceGateProvider } from "@/components/site/price-gate";
import { canSeePrices } from "@/lib/visitor";
import { prisma } from "@/lib/prisma";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unlocked, projects] = await Promise.all([
    canSeePrices(),
    prisma.project.findMany({
      where: { published: true },
      select: { slug: true, name: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <PriceGateProvider unlocked={unlocked}>
      <div className="min-h-dvh flex flex-col">
        <Header overHero />
        <main className="flex-1">{children}</main>
        <Footer projects={projects} />
        <FloatingActions />
      </div>
    </PriceGateProvider>
  );
}
