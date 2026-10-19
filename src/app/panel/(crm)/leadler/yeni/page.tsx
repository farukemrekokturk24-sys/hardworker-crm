import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/primitives";
import { NewLeadForm } from "@/components/admin/new-lead-form";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Yeni Lead" };

export default async function NewLeadPage() {
  const [users, projects] = await Promise.all([
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-5">
      <Link
        href="/panel/leadler"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={15} /> Lead listesine dön
      </Link>

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2.5">
              <UserPlus size={20} className="text-brand" /> Yeni Lead
            </span>
          }
          subtitle="Telefon, WhatsApp veya ofis ziyaretinden gelen müşteriyi kaydedin."
        />
        <div className="p-5">
          <NewLeadForm users={users} projects={projects} />
        </div>
      </Card>
    </div>
  );
}
