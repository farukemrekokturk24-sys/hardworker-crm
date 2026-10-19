import "server-only";
import { prisma } from "./prisma";

const startOfDay = (d = new Date()) => new Date(new Date(d).setHours(0, 0, 0, 0));
const daysAgo = (n: number) => startOfDay(new Date(Date.now() - n * 86400000));

export async function getDashboardData(userId: string, role: string) {
  const isAgent = role === "AGENT";
  const leadScope = isAgent ? { assignedToId: userId } : {};

  const [
    totalLeads, newLeads, hotLeads, wonLeads, lostLeads,
    leadsLast30, leadsPrev30,
    units, deals, todayAppointments, upcomingAppointments,
    myTasks, overdueTasks, recentLeads, bySource, byStatus,
  ] = await Promise.all([
    prisma.lead.count({ where: { deletedAt: null, ...leadScope } }),
    prisma.lead.count({ where: { deletedAt: null, status: "NEW", ...leadScope } }),
    prisma.lead.count({ where: { deletedAt: null, temp: "HOT", status: { notIn: ["WON", "LOST"] }, ...leadScope } }),
    prisma.lead.count({ where: { deletedAt: null, status: "WON", ...leadScope } }),
    prisma.lead.count({ where: { deletedAt: null, status: "LOST", ...leadScope } }),
    prisma.lead.count({ where: { deletedAt: null, createdAt: { gte: daysAgo(30) }, ...leadScope } }),
    prisma.lead.count({
      where: {
        deletedAt: null,
        createdAt: { gte: daysAgo(60), lt: daysAgo(30) },
        ...leadScope,
      },
    }),
    prisma.unit.groupBy({ by: ["status"], _count: true }),
    prisma.deal.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { agreedPrice: true, currency: true, status: true, completedAt: true, createdAt: true },
    }),
    prisma.appointment.findMany({
      where: {
        startsAt: { gte: startOfDay(), lt: new Date(startOfDay().getTime() + 86400000) },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        project: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { startsAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        startsAt: { gte: new Date() },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        project: { select: { name: true } },
      },
      orderBy: { startsAt: "asc" },
      take: 6,
    }),
    prisma.task.findMany({
      where: { done: false, assignedToId: userId },
      include: { lead: { select: { id: true, name: true } } },
      orderBy: [{ dueDate: "asc" }],
      take: 8,
    }),
    prisma.task.count({
      where: { done: false, assignedToId: userId, dueDate: { lt: new Date() } },
    }),
    prisma.lead.findMany({
      where: { deletedAt: null, ...leadScope },
      include: {
        project: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.lead.groupBy({
      by: ["source"],
      where: { deletedAt: null, ...leadScope },
      _count: true,
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { deletedAt: null, ...leadScope },
      _count: true,
    }),
  ]);

  // Son 12 haftanın lead grafiği
  const weekly: { label: string; leads: number }[] = [];
  const rawWeekly = await prisma.lead.findMany({
    where: { deletedAt: null, createdAt: { gte: daysAgo(84) }, ...leadScope },
    select: { createdAt: true },
  });
  for (let i = 11; i >= 0; i--) {
    const from = daysAgo((i + 1) * 7);
    const to = daysAgo(i * 7);
    weekly.push({
      label: new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" }).format(from),
      leads: rawWeekly.filter((l) => l.createdAt >= from && l.createdAt < to).length,
    });
  }

  const unitStats = {
    total: units.reduce((s, u) => s + u._count, 0),
    available: units.find((u) => u.status === "AVAILABLE")?._count ?? 0,
    reserved: units.find((u) => u.status === "RESERVED")?._count ?? 0,
    sold: units.find((u) => u.status === "SOLD")?._count ?? 0,
  };

  const pipelineValue = deals
    .filter((d) => d.status !== "COMPLETED")
    .reduce((s, d) => s + d.agreedPrice, 0);
  const closedValue = deals
    .filter((d) => d.status === "COMPLETED")
    .reduce((s, d) => s + d.agreedPrice, 0);

  const growth =
    leadsPrev30 > 0
      ? Math.round(((leadsLast30 - leadsPrev30) / leadsPrev30) * 100)
      : leadsLast30 > 0
        ? 100
        : 0;

  const conversion = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return {
    totalLeads, newLeads, hotLeads, wonLeads, lostLeads,
    leadsLast30, growth, conversion,
    unitStats, pipelineValue, closedValue,
    todayAppointments, upcomingAppointments,
    myTasks, overdueTasks, recentLeads,
    bySource: bySource.map((s) => ({ source: s.source, count: s._count })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
    weekly,
  };
}
