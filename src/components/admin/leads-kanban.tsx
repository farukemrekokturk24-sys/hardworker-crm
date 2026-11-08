"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor, TouchSensor,
  useSensor, useSensors, useDraggable, useDroppable, closestCorners,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { Flame, GripVertical, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { updateLeadStatus } from "@/app/panel/(crm)/actions";
import {
  LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, KANBAN_COLUMNS,
} from "@/lib/constants";
import { prettyPhone, timeAgo, formatPrice, avatarTone, cn } from "@/lib/utils";
import type { LeadRow } from "./leads-view";

/**
 * Sürüklenebilir Kanban.
 * Kart bir kolona bırakıldığında lead durumu güncellenir; istek sürerken
 * kart yeni kolonda iyimser olarak gösterilir, hata olursa geri alınır.
 */
export function LeadKanban({ leads }: { leads: LeadRow[] }) {
  // İyimser durum: sunucu yanıtı beklenirken kartı yeni kolonda tut
  const [moved, setMoved] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<LeadRow | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    // Küçük bir mesafe şartı, karta tıklamayı sürüklemeden ayırır
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const statusOf = (l: LeadRow) => moved[l.id] ?? l.status;

  const onDragStart = (e: DragStartEvent) => {
    const lead = leads.find((l) => l.id === e.active.id);
    setDragging(lead ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null);
    const leadId = String(e.active.id);
    const target = e.over?.id ? String(e.over.id) : null;
    if (!target) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || statusOf(lead) === target) return;

    const previous = statusOf(lead);
    setMoved((m) => ({ ...m, [leadId]: target }));
    setSaving(leadId);

    startTransition(async () => {
      const res = await updateLeadStatus(leadId, target);
      setSaving(null);
      if (res?.error) {
        // Başarısızsa kartı eski kolonuna geri al
        setMoved((m) => ({ ...m, [leadId]: previous }));
      }
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <div className="flex gap-3.5 overflow-x-auto thin-scroll pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 max-w-[100vw] sm:max-w-full">
        {KANBAN_COLUMNS.map((col) => (
          <Column
            key={col}
            id={col}
            leads={leads.filter((l) => statusOf(l) === col)}
            saving={saving}
          />
        ))}
      </div>

      {/* Sürüklenen kartın imleci takip eden kopyası */}
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.22,1,0.36,1)" }}>
        {dragging ? <Card lead={dragging} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  id,
  leads,
  saving,
}: {
  id: string;
  leads: LeadRow[];
  saving: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const color = LEAD_STATUS_COLORS[id];

  return (
    <div className="shrink-0 w-[272px] flex flex-col">
      <div className="flex items-center gap-2 px-1 pb-2.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <h3 className="font-bold text-sm text-ink">{LEAD_STATUS_LABELS[id]}</h3>
        <span className="ml-auto num text-[0.6875rem] font-bold text-muted bg-surface-2 px-1.5 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 rounded-2xl p-2 min-h-[180px] transition-colors duration-200",
          isOver
            ? "bg-brand-50 ring-2 ring-brand/35 ring-inset"
            : "bg-surface-2/60"
        )}
      >
        {leads.length === 0 ? (
          <p className="text-xs text-muted text-center py-7">
            {isOver ? "Buraya bırakın" : "Kayıt yok"}
          </p>
        ) : (
          leads.map((l) => <Card key={l.id} lead={l} saving={saving === l.id} />)
        )}
      </div>
    </div>
  );
}

function Card({
  lead,
  overlay,
  saving,
}: {
  lead: LeadRow;
  overlay?: boolean;
  saving?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    disabled: overlay,
  });

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      className={cn(
        "card p-3 transition-shadow",
        overlay && "shadow-2xl rotate-2 cursor-grabbing",
        isDragging && "opacity-35"
      )}
    >
      <div className="flex items-start gap-2">
        {/* Yalnızca tutamaç sürükler; kartın geri kalanı tıklanabilir kalır */}
        <button
          ref={overlay ? undefined : undefined}
          {...(overlay ? {} : listeners)}
          {...(overlay ? {} : attributes)}
          aria-label={`${lead.name} kartını taşı`}
          className="shrink-0 -ml-1 mt-0.5 h-7 w-5 grid place-items-center text-muted hover:text-ink cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={14} />
        </button>

        <Avatar name={lead.name} size="xs" tone={avatarTone(lead.id)} />

        <div className="min-w-0 flex-1">
          <Link
            href={`/panel/leadler/${lead.id}`}
            className="font-semibold text-ink text-[0.8125rem] truncate flex items-center gap-1 hover:text-brand transition-colors"
          >
            {lead.name}
            {lead.temp === "HOT" && <Flame size={11} className="text-rose-500 shrink-0" />}
          </Link>
          <p className="text-[0.6875rem] text-muted num">{prettyPhone(lead.phone)}</p>
        </div>

        {saving && <Loader2 size={13} className="animate-spin text-brand shrink-0 mt-1" />}
      </div>

      {(lead.projectName || lead.budgetMax) && (
        <p className="text-[0.6875rem] text-muted mt-2 truncate pl-5">
          {lead.projectName}
          {lead.projectName && lead.budgetMax && " · "}
          {lead.budgetMax && formatPrice(lead.budgetMax)}
        </p>
      )}

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border pl-5">
        <span className="text-[0.625rem] text-muted truncate">
          {lead.assignedToName ?? "Atanmadı"}
        </span>
        <span className="text-[0.625rem] text-muted shrink-0">
          {timeAgo(lead.lastActivityAt)}
        </span>
      </div>
    </div>
  );
}
