"use client";

import { useActionState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { createLead, type ActionState } from "@/app/panel/(crm)/actions";
import { Button } from "@/components/ui/button";
import { Field, inputClass, textareaClass, selectClass } from "@/components/ui/primitives";
import { LEAD_SOURCES, PURPOSE_LABELS } from "@/lib/constants";

const COUNTRIES = [
  "KKTC", "Türkiye", "İngiltere", "Almanya", "Rusya",
  "İsrail", "İran", "Ukrayna", "Polonya", "Diğer",
];

export function NewLeadForm({
  users,
  projects,
}: {
  users: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createLead, {});

  return (
    <form action={action} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Ad Soyad" required>
          <input name="name" required placeholder="Müşteri adı" className={inputClass} />
        </Field>
        <Field label="Telefon" required>
          <input
            name="phone"
            type="tel"
            required
            placeholder="+90 5XX XXX XX XX"
            className={inputClass}
          />
        </Field>
        <Field label="E-posta">
          <input name="email" type="email" placeholder="ornek@email.com" className={inputClass} />
        </Field>
        <Field label="Ülke">
          <select name="country" className={selectClass} defaultValue="">
            <option value="">Seçiniz</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Kaynak">
          <select name="source" className={selectClass} defaultValue="MANUAL">
            {LEAD_SOURCES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="İlgilendiği proje">
          <select name="projectId" className={selectClass} defaultValue="">
            <option value="">Belirtilmedi</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Amaç">
          <select name="purpose" className={selectClass} defaultValue="">
            <option value="">Belirtilmedi</option>
            {Object.entries(PURPOSE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Sorumlu danışman">
          <select name="assignedToId" className={selectClass} defaultValue="">
            <option value="">Atanmadı</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Bütçe alt sınırı (£)">
          <input name="budgetMin" type="number" min={0} step={1000} className={inputClass} />
        </Field>
        <Field label="Bütçe üst sınırı (£)">
          <input name="budgetMax" type="number" min={0} step={1000} className={inputClass} />
        </Field>
      </div>

      <Field label="Not">
        <textarea
          name="message"
          rows={3}
          placeholder="Müşteri ne istiyor, hangi kanaldan geldi..."
          className={textareaClass}
        />
      </Field>

      {state.error && (
        <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5 font-medium">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button href="/panel/leadler" variant="ghost">Vazgeç</Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          Lead Oluştur
        </Button>
      </div>
    </form>
  );
}
