import { CheckSquare } from "lucide-react";
import { TasksManager } from "@/components/admin/tasks-manager";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export const metadata = { title: "Görevler" };

export default async function TasksPage() {
  const user = await requireSession();

  const [tasks, users, leads] = await Promise.all([
    prisma.task.findMany({
      include: {
        lead: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: [{ done: "asc" }, { dueDate: "asc" }],
    }),
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.lead.findMany({
      where: { deletedAt: null, status: { notIn: ["WON", "LOST"] } },
      select: { id: true, name: true },
      orderBy: { lastActivityAt: "desc" },
      take: 60,
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <CheckSquare size={26} className="text-brand" /> Görevler
        </h1>
        <p className="text-muted mt-1 text-sm">
          {tasks.filter((t) => !t.done).length} açık ·{" "}
          {tasks.filter((t) => !t.done && t.dueDate && t.dueDate < new Date()).length} gecikmiş
        </p>
      </div>

      <TasksManager
        tasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          detail: t.detail,
          dueDate: t.dueDate?.toISOString() ?? null,
          priority: t.priority,
          done: t.done,
          leadId: t.lead?.id ?? null,
          leadName: t.lead?.name ?? null,
          assignedToId: t.assignedToId,
          assignedToName: t.assignedTo?.name ?? null,
        }))}
        users={users}
        leads={leads}
        currentUserId={user.uid}
      />
    </div>
  );
}
