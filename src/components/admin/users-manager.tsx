"use client";

import { useActionState, useState, useTransition } from "react";
import {
  Plus, Loader2, X, UserPlus, Power, Pencil, Trash2, Check, Link2, Copy,
} from "lucide-react";
import { Card, CardHeader, Badge, Avatar, Field, inputClass, selectClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import {
  createUser, updateUser, deleteUser, toggleUserActive, type ActionState,
} from "@/app/panel/(crm)/actions";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDateTime, avatarTone, cn } from "@/lib/utils";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  role: string;
  active: boolean;
  shareCode: string | null;
  lastLogin: string | null;
  leadCount: number;
  dealCount: number;
};

const ROLE_TONE: Record<string, string> = {
  SUPER_ADMIN: "bg-violet-50 text-violet-700 ring-violet-200",
  SALES_MANAGER: "bg-brand-50 text-brand ring-brand/20",
  AGENT: "bg-sky-50 text-sky-700 ring-sky-200",
  MARKETING: "bg-amber-50 text-amber-700 ring-amber-200",
  VIEWER: "bg-surface-2 text-muted ring-border",
  BROKER: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function UsersManager({
  users,
  currentUserId,
  siteUrl,
}: {
  users: ManagedUser[];
  currentUserId: string;
  siteUrl: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);

  const staff = users.filter((u) => u.role !== "BROKER");
  const brokers = users.filter((u) => u.role === "BROKER");

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Kapat" : "Yeni Kullanıcı"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader
            title="Yeni kullanıcı"
            subtitle="Şirket içi ekip üyesi ya da dış emlakçı ekleyin."
          />
          <div className="p-5">
            <UserForm mode="create" onDone={() => setShowForm(false)} />
          </div>
        </Card>
      )}

      <UserTable
        title="Şirket ekibi"
        users={staff}
        currentUserId={currentUserId}
        onEdit={setEditing}
        siteUrl={siteUrl}
      />

      <UserTable
        title="Emlakçı partnerler"
        subtitle="Kendi müşterilerini emlakçı panelinden yönetirler."
        users={brokers}
        currentUserId={currentUserId}
        onEdit={setEditing}
        siteUrl={siteUrl}
        showShare
      />

      {editing && (
        <EditModal user={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function UserTable({
  title,
  subtitle,
  users,
  currentUserId,
  onEdit,
  siteUrl,
  showShare,
}: {
  title: string;
  subtitle?: string;
  users: ManagedUser[];
  currentUserId: string;
  onEdit: (u: ManagedUser) => void;
  siteUrl: string;
  showShare?: boolean;
}) {
  if (users.length === 0) {
    return (
      <Card>
        <CardHeader title={title} subtitle={subtitle} />
        <p className="px-5 py-8 text-center text-sm text-muted">Kayıt yok.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader title={title} subtitle={subtitle ?? `${users.length} kullanıcı`} />
      <div className="overflow-x-auto thin-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Rol</th>
              {showShare && <th>Sunum linki</th>}
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
                      <p className="text-xs text-muted truncate">
                        {u.email}
                        {u.company && ` · ${u.company}`}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABELS[u.role] ?? u.role}</Badge>
                </td>
                {showShare && (
                  <td>
                    {u.shareCode ? (
                      <CopyLink url={`${siteUrl}/projeler?ref=${u.shareCode}`} />
                    ) : (
                      <span className="text-muted text-xs">—</span>
                    )}
                  </td>
                )}
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
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(u)}
                      aria-label={`${u.name} bilgilerini düzenle`}
                      className="h-8 w-8 rounded-lg grid place-items-center text-muted hover:text-brand hover:bg-brand-50 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    {u.id !== currentUserId && (
                      <>
                        <ToggleActive id={u.id} active={u.active} />
                        <DeleteUser id={u.id} name={u.name} />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* pano kapalıysa sessiz geç */
        }
      }}
      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-surface-2 text-[0.75rem] font-medium text-ink-soft hover:bg-surface-3 transition-colors max-w-[200px]"
      title={url}
    >
      {copied ? <Check size={13} className="text-emerald-600" /> : <Link2 size={13} />}
      <span className="truncate">{copied ? "Kopyalandı" : url.replace(/^https?:\/\//, "")}</span>
    </button>
  );
}

function ToggleActive({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => { toggleUserActive(id); })}
      aria-label={active ? "Pasifleştir" : "Aktifleştir"}
      className={cn(
        "h-8 w-8 rounded-lg grid place-items-center transition-colors disabled:opacity-60",
        active
          ? "text-muted hover:text-amber-600 hover:bg-amber-50"
          : "text-muted hover:text-emerald-600 hover:bg-emerald-50"
      )}
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Power size={15} />}
    </button>
  );
}

function DeleteUser({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <>
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm(`${name} silinsin mi? Oluşturduğu lead ve satış kayıtları kalır.`)) return;
          start(async () => {
            const r = await deleteUser(id);
            if (r?.error) setErr(r.error);
          });
        }}
        aria-label={`${name} kullanıcısını sil`}
        className="h-8 w-8 rounded-lg grid place-items-center text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-60"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
      {err && (
        <span className="text-[0.6875rem] text-rose-600 font-medium ml-1">{err}</span>
      )}
    </>
  );
}

function EditModal({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm anim-fade" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg card rounded-t-3xl sm:rounded-2xl anim-slide-up sm:anim-scale safe-b max-h-[92dvh] overflow-y-auto thin-scroll">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <h3 className="font-bold text-ink">{user.name}</h3>
            <p className="text-sm text-muted mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="h-9 w-9 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-surface-2 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <UserForm mode="edit" user={user} onDone={onClose} />
        </div>
      </div>
    </div>
  );
}

function UserForm({
  mode,
  user,
  onDone,
}: {
  mode: "create" | "edit";
  user?: ManagedUser;
  onDone: () => void;
}) {
  const action = mode === "create" ? createUser : updateUser;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const [role, setRole] = useState(user?.role ?? "AGENT");

  if (state.ok) setTimeout(onDone, 250);

  return (
    <form action={formAction} className="space-y-4">
      {user && <input type="hidden" name="id" value={user.id} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Ad Soyad" required>
          <input name="name" required defaultValue={user?.name} className={inputClass} />
        </Field>
        <Field label="E-posta" required>
          <input
            name="email"
            type="email"
            required
            defaultValue={user?.email}
            className={inputClass}
          />
        </Field>
        <Field label="Telefon">
          <input name="phone" type="tel" defaultValue={user?.phone ?? ""} className={inputClass} />
        </Field>
        <Field label="Rol">
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={selectClass}
          >
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
      </div>

      {role === "BROKER" && (
        <Field label="Bağlı olduğu ofis / firma" hint="Emlakçı listesinde görünür.">
          <input name="company" defaultValue={user?.company ?? ""} className={inputClass} />
        </Field>
      )}

      <Field
        label={mode === "create" ? "Şifre" : "Yeni şifre"}
        required={mode === "create"}
        hint={mode === "create" ? "En az 6 karakter." : "Boş bırakırsanız şifre değişmez."}
      >
        <input
          name="password"
          type="password"
          required={mode === "create"}
          minLength={6}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>

      {state.error && (
        <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5 font-medium">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onDone}>Vazgeç</Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : mode === "create" ? (
            <UserPlus size={16} />
          ) : (
            <Check size={16} />
          )}
          {mode === "create" ? "Kullanıcı Oluştur" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
