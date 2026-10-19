import Link from "next/link";
import { MessageSquare, Phone, Mail, Check } from "lucide-react";
import { Card, CardHeader, Badge, EmptyState } from "@/components/ui/primitives";
import { MarkHandledButton } from "@/components/admin/message-controls";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { formatDateTime, prettyPhone } from "@/lib/utils";

export const metadata = { title: "İletişim Mesajları" };

export default async function MessagesPage() {
  await requireSession();

  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <MessageSquare size={26} className="text-brand" /> İletişim Mesajları
        </h1>
        <p className="text-muted mt-1 text-sm">
          {messages.filter((m) => !m.handled).length} yanıtlanmamış · {messages.length} toplam
        </p>
      </div>

      {messages.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageSquare size={22} />}
            title="Mesaj yok"
            description="Siteden gelen iletişim formu mesajları burada listelenir."
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id}>
              <Card className={m.handled ? "opacity-70" : undefined}>
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink flex items-center gap-2">
                        {m.name}
                        {m.handled && (
                          <Badge tone="bg-emerald-50 text-emerald-700 ring-emerald-200">
                            <Check size={10} /> Yanıtlandı
                          </Badge>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm">
                        {m.phone && (
                          <a
                            href={`tel:${m.phone}`}
                            className="inline-flex items-center gap-1.5 text-muted hover:text-brand transition-colors num"
                          >
                            <Phone size={12} /> {prettyPhone(m.phone)}
                          </a>
                        )}
                        {m.email && (
                          <a
                            href={`mailto:${m.email}`}
                            className="inline-flex items-center gap-1.5 text-muted hover:text-brand transition-colors"
                          >
                            <Mail size={12} /> {m.email}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted num">
                        {formatDateTime(m.createdAt)}
                      </span>
                      {!m.handled && <MarkHandledButton id={m.id} />}
                    </div>
                  </div>

                  {m.subject && (
                    <p className="font-medium text-ink-soft text-sm mt-3">{m.subject}</p>
                  )}
                  <p className="text-sm text-ink-soft mt-2 leading-relaxed whitespace-pre-line">
                    {m.message}
                  </p>

                  {m.leadId && (
                    <Link
                      href={`/panel/leadler/${m.leadId}`}
                      className="inline-flex text-sm font-semibold text-brand hover:text-brand-600 mt-3"
                    >
                      Lead kaydını aç →
                    </Link>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
