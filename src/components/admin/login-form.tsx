"use client";

import { useActionState, useState } from "react";
import { Loader2, Eye, EyeOff, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/app/panel/giris/actions";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  );
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/panel"} />

      <Field label="E-posta" required>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="ornek@hardworkercyprus.com"
          className={inputClass}
        />
      </Field>

      <Field label="Şifre" required>
        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(inputClass, "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center text-muted hover:text-ink rounded-lg transition-colors"
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </Field>

      {state.error && (
        <p className="text-sm font-medium text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? (
          <>
            <Loader2 size={17} className="animate-spin" /> Giriş yapılıyor...
          </>
        ) : (
          <>
            <LogIn size={17} /> Giriş Yap
          </>
        )}
      </Button>
    </form>
  );
}
