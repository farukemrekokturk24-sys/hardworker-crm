import { redirect } from "next/navigation";
import { Shell } from "@/components/admin/shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: { default: "CRM Paneli", template: "%s | Hardworker CRM" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/panel/giris");

  const [newLeads, todayAppointments, openTasks, unreadMessages] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW", deletedAt: null } }),
    prisma.appointment.count({
      where: {
        startsAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
    }),
    prisma.task.count({ where: { done: false, assignedToId: user.uid } }),
    prisma.contactMessage.count({ where: { handled: false } }),
  ]);

  return (
    <Shell
      user={user}
      counts={{
        "/panel/leadler": newLeads,
        "/panel/randevular": todayAppointments,
        "/panel/gorevler": openTasks,
        "/panel/mesajlar": unreadMessages,
      }}
    >
      {children}
    </Shell>
  );
}
