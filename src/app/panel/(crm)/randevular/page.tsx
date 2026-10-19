import Link from "next/link";
import { CalendarDays, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardHeader, Badge, EmptyState, Avatar } from "@/components/ui/primitives";
import { AppointmentStatusControl } from "@/components/admin/appointment-controls";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, prettyPhone, avatarTone, cn } from "@/lib/utils";

export const metadata = { title: "Randevular" };

const STATUS_TONE: Record<string, string> = {
  SCHEDULED: "bg-sky-50 text-sky-700 ring-sky-200",
  CONFIRMED: "bg-brand-50 text-brand ring-brand/20",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  NO_SHOW: "bg-amber-50 text-amber-700 ring-amber-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default async function AppointmentsPage() {
  const user = await requireSession();

  const appointments = await prisma.appointment.findMany({
    where: user.role === "AGENT" ? { userId: user.uid } : {},
    include: {
      lead: { select: { id: true, name: true, phone: true } },
      project: { select: { name: true } },
      unit: { select: { unitNo: true, type: true } },
      user: { select: { name: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  const now = new Date();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const groups = [
    {
      key: "today",
      title: "Bugün",
      items: appointments.filter((a) => a.startsAt >= todayStart && a.startsAt < todayEnd),
    },
    {
      key: "upcoming",
      title: "Yaklaşan",
      items: appointments.filter((a) => a.startsAt >= todayEnd),
    },
    {
      key: "past",
      title: "Geçmiş",
      items: appointments
        .filter((a) => a.startsAt < todayStart)
        .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime()),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <CalendarDays size={26} className="text-brand" /> Randevular
        </h1>
        <p className="text-muted mt-1 text-sm">
          {groups[0].items.length} bugün · {groups[1].items.length} yaklaşan
        </p>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarDays size={22} />}
            title="Randevu yok"
            description="Lead detay sayfasından randevu oluşturabilirsiniz."
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map((g) =>
            g.items.length === 0 ? null : (
              <Card key={g.key}>
                <CardHeader title={g.title} subtitle={`${g.items.length} randevu`} />
                <ul className="divide-y divide-border">
                  {g.items.map((a) => {
                    const past = a.startsAt < now;
                    return (
                      <li key={a.id} className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <Avatar name={a.lead.name} tone={avatarTone(a.lead.id)} />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/panel/leadler/${a.lead.id}`}
                                className="font-semibold text-ink hover:text-brand transition-colors"
                              >
                                {a.lead.name}
                              </Link>
                              <Badge tone={STATUS_TONE[a.status]}>
                                {APPOINTMENT_STATUS_LABELS[a.status]}
                              </Badge>
                            </div>

                            <p
                              className={cn(
                                "flex items-center gap-1.5 text-sm font-semibold mt-1.5 num",
                                past && a.status === "SCHEDULED" ? "text-rose-600" : "text-brand"
                              )}
                            >
                              <Clock size={14} />
                              {formatDateTime(a.startsAt)}
                            </p>

                            <p className="text-sm text-muted mt-1">
                              {APPOINTMENT_TYPE_LABELS[a.type]}
                              {a.project && ` · ${a.project.name}`}
                              {a.unit && ` · ${a.unit.unitNo} (${a.unit.type})`}
                              {a.user && ` · ${a.user.name}`}
                            </p>

                            {a.location && (
                              <p className="flex items-center gap-1.5 text-xs text-muted mt-1">
                                <MapPin size={12} /> {a.location}
                              </p>
                            )}
                            {a.notes && (
                              <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                                {a.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={`tel:${a.lead.phone}`}
                              title={prettyPhone(a.lead.phone)}
                              className="h-10 w-10 rounded-xl grid place-items-center text-brand bg-brand-50 hover:bg-brand-100 transition-colors"
                            >
                              <Phone size={17} />
                            </a>
                            <AppointmentStatusControl id={a.id} value={a.status} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
