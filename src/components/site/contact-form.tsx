"use client";

import { useActionState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { sendContactMessage, type RegisterState } from "@/app/(site)/actions";
import { Button } from "@/components/ui/button";
import { Field, inputClass, textareaClass } from "@/components/ui/primitives";

export function ContactForm() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    sendContactMessage,
    { ok: false }
  );

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center">
        <CheckCircle2 size={34} className="text-emerald-600 mx-auto" />
        <h3 className="font-display font-bold text-emerald-900 mt-4 text-lg">
          Mesajınız alındı
        </h3>
        <p className="text-sm text-emerald-800 mt-2 leading-relaxed">
          Satış danışmanımız en kısa sürede sizinle iletişime geçecek. Acil durumlar için
          telefon ya da WhatsApp hattımızdan da ulaşabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Ad Soyad" required error={state.fieldErrors?.name}>
          <input name="name" required autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Telefon" required error={state.fieldErrors?.phone}>
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
      </div>

      <Field label="E-posta" error={state.fieldErrors?.email}>
        <input name="email" type="email" autoComplete="email" className={inputClass} />
      </Field>

      <Field label="Konu">
        <input name="subject" placeholder="Hangi proje ile ilgileniyorsunuz?" className={inputClass} />
      </Field>

      <Field label="Mesajınız" required error={state.fieldErrors?.message}>
        <textarea name="message" rows={5} required className={textareaClass} />
      </Field>

      {state.error && !state.fieldErrors && (
        <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? (
          <>
            <Loader2 size={17} className="animate-spin" /> Gönderiliyor...
          </>
        ) : (
          <>
            <Send size={17} /> Mesajı Gönder
          </>
        )}
      </Button>

      <p className="text-xs text-muted text-center leading-relaxed">
        Formu göndererek kişisel verilerinizin satış süreci kapsamında işlenmesini kabul
        etmiş olursunuz.
      </p>
    </form>
  );
}
