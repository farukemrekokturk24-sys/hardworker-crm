import { Layers } from "lucide-react";
import { UnitsManager } from "@/components/admin/units-manager";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const metadata = { title: "Daire Envanteri" };

export default async function UnitsPage() {
  const user = await requireSession();

  const [units, projects] = await Promise.all([
    prisma.unit.findMany({
      include: {
        project: { select: { id: true, name: true } },
        block: { select: { name: true } },
        deals: {
          where: { status: { not: "CANCELLED" } },
          select: { id: true, refNo: true, lead: { select: { id: true, name: true } } },
          take: 1,
        },
      },
      orderBy: [{ project: { order: "asc" } }, { order: "asc" }],
    }),
    prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <Layers size={26} className="text-brand" /> Daire Envanteri
        </h1>
        <p className="text-muted mt-1 text-sm">
          {units.length} daire ·{" "}
          {units.filter((u) => u.status === "AVAILABLE").length} satışta ·{" "}
          {units.filter((u) => u.status === "RESERVED").length} rezerve ·{" "}
          {units.filter((u) => u.status === "SOLD").length} satıldı
        </p>
      </div>

      <UnitsManager
        units={units.map((u) => ({
          id: u.id,
          projectId: u.projectId,
          projectName: u.project.name,
          blockName: u.block?.name ?? null,
          unitNo: u.unitNo,
          type: u.type,
          definition: u.definition,
          floor: u.floor,
          grossArea: u.grossArea,
          terraceArea: u.terraceArea,
          gardenArea: u.gardenArea,
          facing: u.facing,
          price: u.price,
          currency: u.currency,
          status: u.status,
          notes: u.notes,
          dealRef: u.deals[0]?.refNo ?? null,
          dealLeadId: u.deals[0]?.lead.id ?? null,
          dealLeadName: u.deals[0]?.lead.name ?? null,
        }))}
        projects={projects}
        canEdit={can(user.role, "units.edit")}
      />
    </div>
  );
}
