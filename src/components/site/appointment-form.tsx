"use client";

import { useActionState } from "react";
import { CalendarCheck, Loader2, CheckCircle2 } from "lucide-react";
import { requestAppointment, type RegisterState } from "@/app/(site)/actions";
import { Button } from "@/components/ui/button";
import { Field, inputClass, textareaClass } from "@/components/ui/primitives";

export function AppointmentForm({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    requestAppointment,
    { ok: false }
  );

  if (state.ok) {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
        <CheckCircle2 size={26} className="text-emerald-600 mx-auto" />
        <p className="font-semibold text-emerald-800 mt-2 text-sm">Talebiniz alındı</p>
        <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
          Satış danışmanımız gezi saatini netleştirmek için sizi arayacak.
        </p>
      </div>
    );
  }

  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="note" value={`${projectName} proje gezisi talebi`} />

      <Field label="Ad Soyad" required>
        <input name="name" required autoComplete="name" placeholder="Adınız" className={inputClass} />
      </Field>

      <Field label="Telefon" required>
        <input
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="+90 5XX XXX XX XX"
          className={inputClass}
        />
      </Field>

      <Field label="Tercih ettiğiniz tarih">
        <input name="date" type="date" min={minDate} className={inputClass} />
      </Field>

      {state.error && <p className="text-xs font-medium text-rose-600">{state.error}</p>}

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Gönderiliyor...
          </>
        ) : (
          <>
            <CalendarCheck size={16} /> Gezi Talebi Gönder
          </>
        )}
      </Button>
    </form>
  );
}
