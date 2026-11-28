"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/primitives";
import { changeOwnPassword, type ActionState } from "@/app/hesap/actions";
import { cn } from "@/lib/utils";

/** Yeni şifrenin kabaca gücü — kullanıcıya yön vermek için, kural değil. */
function guc(pw: string) {
  let p = 0;
  if (pw.length >= 8) p++;
  if (pw.length >= 12) p++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) p++;
  if (/\d/.test(pw)) p++;
  if (/[^A-Za-z0-9]/.test(pw)) p++;
  if (p <= 2) return { ad: "Zayıf", renk: "bg-rose-500", genislik: "33%" };
  if (p === 3) return { ad: "Orta", renk: "bg-amber-500", genislik: "66%" };
  return { ad: "Güçlü", renk: "bg-emerald-500", genislik: "100%" };
}

/**
 * Yeni şifre alanı ve güç göstergesi.
 * Durumu kendi içinde tutar; form sıfırlanınca `key` değiştiği için
 * bileşen yeniden kurulur ve gösterge de temizlenir.
 */
function YeniSifreAlani({ gorunur }: { gorunur: boolean }) {
  const [deger, setDeger] = useState("");
  const g = deger ? guc(deger) : null;

  return (
    <>
      <Field label="Yeni şifre" required hint="En az 8 karakter.">
        <input
          name="next"
          type={gorunur ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
          value={deger}
          onChange={(e) => setDeger(e.target.value)}
          className={inputClass}
        />
      </Field>

      {g && (
        <div className="flex items-center gap-3 -mt-1">
          <div className="h-1 flex-1 rounded-full bg-surface-2 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", g.renk)}
              style={{ width: g.genislik }}
            />
          </div>
          <span className="text-xs font-semibold text-muted">{g.ad}</span>
        </div>
      )}
    </>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    changeOwnPassword,
    {}
  );
  const [show, setShow] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Başarılı olunca alanları temizle — şifreler ekranda kalmasın.
  // Yalnızca DOM sıfırlaması yapılır; durum güncellemesi gerekmez.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-4 max-w-md">
      <Field label="Mevcut şifreniz" required>
        <div className="relative">
          <input
            name="current"
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(inputClass, "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Şifreleri gizle" : "Şifreleri göster"}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center text-muted hover:text-ink rounded-lg transition-colors"
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </Field>

      <YeniSifreAlani key={state.ok ? "temiz" : "giris"} gorunur={show} />

      <Field label="Yeni şifre (tekrar)" required>
        <input
          name="repeat"
          type={show ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
          className={inputClass}
        />
      </Field>

      {state.error && (
        <p className="text-sm font-medium text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="text-sm font-medium text-emerald-700 bg-emerald-50 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
          <CheckCircle2 size={16} /> Şifreniz değiştirildi. Bir sonraki girişte
          yeni şifrenizi kullanın.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Kaydediliyor...
          </>
        ) : (
          <>
            <KeyRound size={16} /> Şifreyi Değiştir
          </>
        )}
      </Button>
    </form>
  );
}
