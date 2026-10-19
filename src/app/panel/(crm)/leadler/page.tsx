import { Users, Plus } from "lucide-react";
import { LeadsView } from "@/components/admin/leads-view";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const metadata = { title: "Lead'ler" };

type SP = Promise<{ status?: string; q?: string; view?: string; assigned?: string }>;

export default async function LeadsPage({ searchParams }: { searchParams: SP }) {
  const user = await requireSession();
  const sp = await searchParams;

  const [leads, users, projects] = await Promise.all([
    prisma.lead.findMany({
      where: {
        deletedAt: null,
        ...(user.role === "AGENT" ? { assignedToId: user.uid } : {}),
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        _count: { select: { activities: true, appointments: true, views: true } },
      },
      orderBy: [{ lastActivityAt: "desc" }],
    }),
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="t-h2 text-ink flex items-center gap-2.5">
            <Users size={26} className="text-brand" /> Lead&apos;ler
          </h1>
          <p className="text-muted mt-1 text-sm">
            {leads.length} kayıt · {leads.filter((l) => l.status === "NEW").length} yeni
          </p>
        </div>
        <Button href="/panel/leadler/yeni">
          <Plus size={16} /> Yeni Lead
        </Button>
      </div>

      <LeadsView
        leads={leads.map((l) => ({
          id: l.id,
          refNo: l.refNo,
          name: l.name,
          phone: l.phone,
          email: l.email,
          country: l.country,
          source: l.source,
          status: l.status,
          temp: l.temp,
          score: l.score,
          budgetMin: l.budgetMin,
          budgetMax: l.budgetMax,
          purpose: l.purpose,
          createdAt: l.createdAt.toISOString(),
          lastActivityAt: l.lastActivityAt.toISOString(),
          projectName: l.project?.name ?? null,
          assignedToId: l.assignedToId,
          assignedToName: l.assignedTo?.name ?? null,
          activityCount: l._count.activities,
          appointmentCount: l._count.appointments,
          viewCount: l._count.views,
        }))}
        users={users}
        projects={projects}
        initialStatus={sp.status}
        initialQuery={sp.q}
        initialView={sp.view === "kanban" ? "kanban" : "list"}
        canAssign={user.role !== "AGENT"}
      />
    </div>
  );
}
