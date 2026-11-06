"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/panel");

  if (!email || !password) {
    return { error: "E-posta ve şifre gerekli." };
  }

  const result = await login(email, password);
  if (!result.ok) return { error: result.error };

  // Dış emlakçılar kendi paneline, şirket ekibi CRM'e gider.
  const home = result.user.role === "BROKER" ? "/emlakci" : "/panel";
  const allowed =
    next.startsWith("/panel") || next.startsWith("/emlakci") ? next : home;

  // Emlakçı şirket içi panele yönlendirilmeye çalışılırsa kendi paneline düşer
  redirect(result.user.role === "BROKER" && !allowed.startsWith("/emlakci") ? home : allowed);
}
