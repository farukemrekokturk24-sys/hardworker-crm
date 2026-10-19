"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Loader2, Trash2, CheckSquare, Square, AlertCircle, X } from "lucide-react";
import { Card, CardHeader, Badge, EmptyState, Field, inputClass, textareaClass, selectClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { createTask, toggleTask, deleteTask, type ActionState } from "@/app/panel/(crm)/actions";
import { formatDate, cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  detail: string | null;
  dueDate: string | null;
  priority: string;
  done: boolean;
  leadId: string | null;
  leadName: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
};

const PRIORITY_TONE: Record<string, string> = {
  HIGH: "bg-rose-50 text-rose-700 ring-rose-200",
  NORMAL: "bg-sky-50 text-sky-700 ring-sky-200",
  LOW: "bg-surface-2 text-muted ring-border",
};
const PRIORITY_LABEL: Record<string, string> = {
  HIGH: "Yüksek",
  NORMAL: "Normal",
  LOW: "Düşük",
};

export function TasksManager({
  tasks,
  users,
  leads,
  currentUserId,
}: {
  tasks: Task[];
  users: { id: string; name: string }[];
  leads: { id: string; name: string }[];
  currentUserId: string;
}) {
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [showDone, setShowDone] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        if (scope === "mine" && t.assignedToId !== currentUserId) return false;
        if (!showDone && t.done) return false;
        return true;
      }),
    [tasks, scope, showDone, currentUserId]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-border bg-surface p-1">
          {[
            { v: "mine" as const, label: "Bana atananlar" },
            { v: "all" as const, label: "Tümü" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setScope(o.v)}
              className={cn(
                "h-9 px-3.5 rounded-lg text-[0.8125rem] font-semibold transition-colors",
                scope === o.v ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-2"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-ink-soft cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDone}
            onChange={(e) => setShowDone(e.target.checked)}
            className="h-4 w-4 rounded border-border-strong accent-[var(--brand)]"
          />
          Tamamlananları göster
        </label>

        <Button
          size="sm"
          className="ml-auto"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Kapat" : "Yeni Görev"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader title="Yeni görev" />
          <div className="p-5">
            <NewTaskForm
              users={users}
              leads={leads}
              currentUserId={currentUserId}
              onDone={() => setShowForm(false)}
            />
          </div>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CheckSquare size={22} />}
            title="Görev yok"
            description={
              scope === "mine"
                ? "Size atanmış açık görev bulunmuyor."
                : "Henüz görev oluşturulmamış."
            }
          />
        </Card>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((t) => (
            <TaskItem key={t.id} task={t} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TaskItem({ task }: { task: Task }) {
  const [pending, start] = useTransition();
  const overdue = !task.done && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <li
      className={cn(
        "card p-4 flex items-start gap-3.5 transition-opacity",
        task.done && "opacity-60"
      )}
    >
      <button
        disabled={pending}
        onClick={() => start(() => { toggleTask(task.id); })}
        aria-label={task.done ? "Geri al" : "Tamamlandı işaretle"}
        className={cn(
          "shrink-0 mt-0.5 transition-colors",
          task.done ? "text-emerald-600" : "text-muted hover:text-brand"
        )}
      >
        {pending ? (
          <Loader2 size={19} className="animate-spin" />
        ) : task.done ? (
          <CheckSquare size={19} />
        ) : (
          <Square size={19} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn("font-medium text-ink", task.done && "line-through text-muted")}>
          {task.title}
        </p>
        {task.detail && (
          <p className="text-sm text-muted mt-1 leading-relaxed">{task.detail}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <Badge tone={PRIORITY_TONE[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge>
          {task.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[0.75rem] font-medium num",
                overdue ? "text-rose-600" : "text-muted"
              )}
            >
              {overdue && <AlertCircle size={12} />}
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.leadName && (
            <Link
              href={`/panel/leadler/${task.leadId}`}
              className="text-[0.75rem] font-medium text-brand hover:text-brand-600"
            >
              {task.leadName}
            </Link>
          )}
          {task.assignedToName && (
            <span className="text-[0.75rem] text-muted">· {task.assignedToName}</span>
          )}
        </div>
      </div>

      <button
        disabled={pending}
        onClick={() => {
          if (!confirm("Bu görev silinsin mi?")) return;
          start(() => { deleteTask(task.id); });
        }}
        aria-label="Sil"
        className="shrink-0 h-8 w-8 rounded-lg grid place-items-center text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
}

function NewTaskForm({
  users,
  leads,
  currentUserId,
  onDone,
}: {
  users: { id: string; name: string }[];
  leads: { id: string; name: string }[];
  currentUserId: string;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createTask, {});

  if (state.ok) setTimeout(onDone, 200);

  return (
    <form action={action} className="space-y-4">
      <Field label="Görev" required>
        <input
          name="title"
          required
          placeholder="Ör. Ali Kara'yı ara ve ödeme planını anlat"
          className={inputClass}
        />
      </Field>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field label="Son tarih">
          <input name="dueDate" type="date" className={inputClass} />
        </Field>
        <Field label="Öncelik">
          <select name="priority" defaultValue="NORMAL" className={selectClass}>
            <option value="HIGH">Yüksek</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Düşük</option>
          </select>
        </Field>
        <Field label="Sorumlu">
          <select name="assignedToId" defaultValue={currentUserId} className={selectClass}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </Field>
        <Field label="İlgili lead">
          <select name="leadId" defaultValue="" className={selectClass}>
            <option value="">Yok</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Detay">
        <textarea name="detail" rows={2} className={textareaClass} />
      </Field>

      {state.error && <p className="text-sm text-rose-600 font-medium">{state.error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>Vazgeç</Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Görev Oluştur
        </Button>
      </div>
    </form>
  );
}
