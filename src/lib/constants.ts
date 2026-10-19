// Hardworker Construction — merkezi sabitler

export const BRAND = {
  name: "Hardworker",
  fullName: "Hardworker Construction Ltd.",
  slogan: "Her Proje Yeni Bir Hayat",
  sloganEn: "Every Project, A New Life",
  phone: "+90 548 840 80 80",
  phone2: "+90 546 999 80 80",
  phoneRaw: "905488408080",
  whatsapp: "905469998080",
  email: "info@hardworkercyprus.com",
  address: "İsmet İnönü Bulvarı, Salamis Yolu No:55, Access Butik Yanı, Gazimağusa / KKTC",
  city: "Gazimağusa",
  region: "Kuzey Kıbrıs",
  mapsUrl: "https://maps.google.com/?q=İsmet+İnönü+Bulvarı+Salamis+Yolu+55+Gazimağusa",
  social: {
    facebook: "https://fb.com/hardworker.construction",
    instagram: "https://www.instagram.com/hardworker.construction",
    youtube: "https://www.youtube.com/@hardworkerconstruction",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/projeler", label: "Projeler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/neden-kibris", label: "Neden Kıbrıs?" },
  { href: "/iletisim", label: "İletişim" },
] as const;

// ---------------------------------------------------------------- Roller

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SALES_MANAGER: "SALES_MANAGER",
  AGENT: "AGENT",
  MARKETING: "MARKETING",
  VIEWER: "VIEWER",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Süper Yönetici",
  SALES_MANAGER: "Satış Müdürü",
  AGENT: "Satış Danışmanı",
  MARKETING: "Pazarlama",
  VIEWER: "Görüntüleyici",
};

// ---------------------------------------------------------------- Proje

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  UPCOMING: "Yakında",
  ONGOING: "Devam Ediyor",
  COMPLETED: "Teslim Edildi",
};

export const PROJECT_STATUS_TONE: Record<string, string> = {
  UPCOMING: "bg-violet-50 text-violet-700 ring-violet-200",
  ONGOING: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export const IMAGE_CATEGORIES: { key: string; label: string }[] = [
  { key: "exterior", label: "Dış Mekan" },
  { key: "render", label: "3D Görseller" },
  { key: "interior", label: "İç Mekan" },
  { key: "activity", label: "Sosyal Alanlar" },
  { key: "floorplan", label: "Kat Planları" },
  { key: "siteplan", label: "Vaziyet Planı" },
  { key: "360", label: "360° Fotoğraflar" },
  { key: "progress", label: "İnşaat Durumu" },
  { key: "location", label: "Konum" },
];

export const IMAGE_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  IMAGE_CATEGORIES.map((c) => [c.key, c.label])
);

// ---------------------------------------------------------------- Daire

export const UNIT_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Satışta",
  RESERVED: "Rezerve",
  SOLD: "Satıldı",
  BLOCKED: "Bloke",
};

export const UNIT_STATUS_TONE: Record<string, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  RESERVED: "bg-amber-50 text-amber-700 ring-amber-200",
  SOLD: "bg-rose-50 text-rose-700 ring-rose-200",
  BLOCKED: "bg-slate-100 text-slate-600 ring-slate-200",
};

export const UNIT_STATUS_DOT: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  RESERVED: "bg-amber-500",
  SOLD: "bg-rose-500",
  BLOCKED: "bg-slate-400",
};

// ---------------------------------------------------------------- Lead

export const LEAD_STATUSES = [
  { key: "NEW", label: "Yeni", color: "#3B82F6" },
  { key: "CONTACTED", label: "İletişime Geçildi", color: "#8B5CF6" },
  { key: "QUALIFIED", label: "Nitelikli", color: "#06B6D4" },
  { key: "VIEWING", label: "Gezi Planlandı", color: "#F59E0B" },
  { key: "NEGOTIATION", label: "Görüşme / Teklif", color: "#F97316" },
  { key: "RESERVED", label: "Rezervasyon", color: "#14B8A6" },
  { key: "WON", label: "Satış Kapandı", color: "#22C55E" },
  { key: "LOST", label: "Kaybedildi", color: "#EF4444" },
] as const;

export const LEAD_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  LEAD_STATUSES.map((s) => [s.key, s.label])
);
export const LEAD_STATUS_COLORS: Record<string, string> = Object.fromEntries(
  LEAD_STATUSES.map((s) => [s.key, s.color])
);

export const KANBAN_COLUMNS = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "VIEWING",
  "NEGOTIATION",
  "RESERVED",
  "WON",
] as const;

export const LEAD_SOURCES = [
  { key: "PRICE_GATE", label: "Fiyat Kaydı (Web)" },
  { key: "CONTACT_FORM", label: "İletişim Formu" },
  { key: "WHATSAPP", label: "WhatsApp" },
  { key: "PHONE", label: "Telefon" },
  { key: "INSTAGRAM", label: "Instagram" },
  { key: "FACEBOOK", label: "Facebook" },
  { key: "REFERRAL", label: "Referans" },
  { key: "WALK_IN", label: "Ofis Ziyareti" },
  { key: "MANUAL", label: "Manuel" },
] as const;

export const LEAD_SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  LEAD_SOURCES.map((s) => [s.key, s.label])
);

export const LEAD_TEMP_LABELS: Record<string, string> = {
  HOT: "Sıcak",
  WARM: "Ilık",
  COLD: "Soğuk",
};

export const LEAD_TEMP_TONE: Record<string, string> = {
  HOT: "bg-rose-50 text-rose-700 ring-rose-200",
  WARM: "bg-amber-50 text-amber-700 ring-amber-200",
  COLD: "bg-sky-50 text-sky-700 ring-sky-200",
};

export const ACTIVITY_TYPES = [
  { key: "CALL", label: "Telefon Görüşmesi" },
  { key: "WHATSAPP", label: "WhatsApp" },
  { key: "EMAIL", label: "E-posta" },
  { key: "MEETING", label: "Toplantı" },
  { key: "VIEWING", label: "Proje Gezisi" },
  { key: "NOTE", label: "Not" },
] as const;

export const ACTIVITY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ACTIVITY_TYPES.map((a) => [a.key, a.label])
);

export const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  VIEWING: "Proje Gezisi",
  MEETING: "Ofis Görüşmesi",
  CALL: "Telefon",
  VIDEO_CALL: "Görüntülü Görüşme",
};

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Planlandı",
  CONFIRMED: "Onaylandı",
  COMPLETED: "Gerçekleşti",
  NO_SHOW: "Gelmedi",
  CANCELLED: "İptal",
};

export const DEAL_STATUS_LABELS: Record<string, string> = {
  RESERVATION: "Rezervasyon",
  CONTRACT: "Sözleşme",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

export const DEAL_STATUS_TONE: Record<string, string> = {
  RESERVATION: "bg-amber-50 text-amber-700 ring-amber-200",
  CONTRACT: "bg-sky-50 text-sky-700 ring-sky-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
};

export const PURPOSE_LABELS: Record<string, string> = {
  YATIRIM: "Yatırım",
  OTURUM: "Oturum",
  KIRALAMA: "Kiralama Geliri",
};

export const UNIT_TYPES = ["Studio", "1+1", "2+1", "2+1 Loft", "3+1"] as const;
