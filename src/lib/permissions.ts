// Rol → yetki matrisi (client & server ortak kullanım)

export const PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  SALES_MANAGER: [
    "dashboard", "leads", "leads.assign", "leads.delete",
    "appointments", "deals", "units", "units.edit",
    "projects", "reports", "tasks", "media", "view",
  ],
  AGENT: ["dashboard", "leads", "appointments", "deals", "units", "tasks", "view"],
  MARKETING: ["dashboard", "leads", "projects", "media", "reports", "settings.content", "view"],
  VIEWER: ["dashboard", "view"],
};

export function can(role: string | undefined, area: string): boolean {
  if (!role) return false;
  const perms = PERMISSIONS[role] ?? [];
  return perms.includes("*") || perms.includes(area);
}

/** Yetkisi yoksa hata fırlatır — server action koruması */
export function assertCan(role: string | undefined, area: string): void {
  if (!can(role, area)) throw new Error("FORBIDDEN");
}
