"use client";

import { useActionState, useState, useTransition } from "react";
import { Plus, Loader2, Check, X, UserPlus, Power } from "lucide-react";
import { Card, CardHeader, Badge, Avatar, Field, inputClass, selectClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { createUser, toggleUserActive, type ActionState } from "@/app/panel/(crm)/actions";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDateTime, prettyPhone, avatarTone, cn } from "@/lib/utils";

type U = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
  lastLogin: string | null;
  leadCount: number;
  dealCount: number;
};

export function UsersManager({
  users,
  currentUserId,
}: {
  users: U[];
  currentUserId: string;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Kapat" : "Yeni Kullanıcı"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader title="Yeni kullanıcı" subtitle="Satış ekibine yeni üye ekleyin." />
          <div className="p-5">
            <NewUserForm onDone={() => setShowForm(false)} />
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto thin-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Rol</th>
                <th>Lead</th>
                <th>Satış</th>
                <th>Son giriş</th>
                <th>Durum</th>
                <th className="text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.active ? undefined : "opacity-60"}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" tone={avatarTone(u.id)} />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">
                          {u.name}
                          {u.id === currentUserId && (
                            <span className="text-xs text-muted font-normal ml-1.5">(siz)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-[0.8125rem] text-ink-soft">
                    {ROLE_LABELS[u.role] ?? u.role}
                  </td>
                  <td className="num">{u.leadCount}</td>
                  <td className="num">{u.dealCount}</td>
                  <td className="text-[0.75rem] text-muted whitespace-nowrap">
                    {u.lastLogin ? formatDateTime(u.lastLogin) : "Hiç"}
                  </td>
                  <td>
                    <Badge
                      tone={
                        u.active
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-slate-100 text-slate-600 ring-slate-200"
                      }
                    >
                      {u.active ? "Aktif" : "Pasif"}
                    </Badge>
                  </td>
                  <td className="text-right">
                    {u.id !== currentUserId && <ToggleActive id={u.id} active={u.active} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ToggleActive({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => start(() => { toggleUserActive(id); })}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[0.75rem] font-semibold transition-colors disabled:opacity-60",
        active
          ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
          : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
      )}
    >
      {pending ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />}
      {active ? "Pasifleştir" : "Aktifleştir"}
    </button>
  );
}

function NewUserForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createUser, {});

  if (state.ok) setTimeout(onDone, 300);

  return (
    <form action={action} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Ad Soyad" required>
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="E-posta" required>
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Telefon">
          <input name="phone" type="tel" className={inputClass} />
        </Field>
        <Field label="Rol">
          <select name="role" defaultValue="AGENT" className={selectClass}>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Şifre" required hint="En az 6 karakter.">
        <input name="password" type="password" required minLength={6} className={inputClass} />
      </Field>

      {state.error && <p className="text-sm text-rose-600 font-medium">{state.error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>Vazgeç</Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          Kullanıcı Oluştur
        </Button>
      </div>
    </form>
  );
}
