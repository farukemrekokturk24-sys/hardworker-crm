/**
 * Asistanın niyet eşleştirmesi ve cevap kalıpları.
 * İstemci tarafında da çalışır; "server-only" içermez.
 */

import type { AssistantData, AssistantProject } from "./assistant";

export type Reply = {
  text: string;
  chips?: string[];
  /** Fiyat kaydı modalını açmayı öneren cevap */
  askPrice?: boolean;
  /** WhatsApp'a yönlendirme öner */
  toWhatsapp?: boolean;
  links?: { label: string; href: string }[];
};

const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/[ıİ]/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[^a-z0-9\s+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

function findProject(q: string, data: AssistantData): AssistantProject | null {
  for (const p of data.projects) {
    const n = norm(p.name);
    if (q.includes(n)) return p;
    const first = n.split(" ")[0];
    if (first.length > 4 && q.includes(first)) return p;
  }
  if (has(q, "luxera", "salamis")) return data.projects.find((p) => p.slug === "luxera-salamis") ?? null;
  if (has(q, "platinium", "platinum", "plat")) return data.projects.find((p) => p.slug === "sunrise-platinium") ?? null;
  if (has(q, "diamond", "diamont", "dia")) return data.projects.find((p) => p.slug === "sunrise-diamond") ?? null;
  if (has(q, "gold")) return data.projects.find((p) => p.slug === "sunrise-gold") ?? null;
  return null;
}

export const QUICK_CHIPS = [
  "Hangi projeler var?",
  "Fiyatlar nedir?",
  "Ödeme planı nasıl?",
  "Teslim ne zaman?",
  "Kira garantisi var mı?",
  "Ofisiniz nerede?",
];

export function answer(input: string, data: AssistantData): Reply {
  const q = norm(input);
  const project = findProject(q, data);

  if (!q) {
    return { text: "Size nasıl yardımcı olabilirim?", chips: QUICK_CHIPS };
  }

  /* ------------------------------------------------------------ selamlama */
  if (has(q, "merhaba", "selam", "gunaydin", "iyi gunler", "iyi aksamlar", "hey")) {
    return {
      text: "Merhaba! Hangi konuda yardımcı olabilirim?",
      chips: QUICK_CHIPS,
    };
  }

  /* --------------------------------------------------------------- fiyat */
  if (has(q, "fiyat", "kac para", "ne kadar", "ucret", "maliyet", "price", "butce")) {
    if (!data.showPrices) {
      return {
        text:
          "Fiyat listemizi paylaşabilmem için telefon numaranızı almam gerekiyor — tek alanlık kısa bir form. Numaranızı bıraktığınız anda tüm daire fiyatları, kat planları ve ödeme seçenekleri açılıyor.",
        askPrice: true,
        chips: ["Ödeme planı nasıl?", "Hangi projeler var?"],
      };
    }
    if (project) {
      return {
        text: project.minPriceLabel
          ? `${project.name} için başlangıç fiyatı ${project.minPriceLabel}. Şu an ${project.availableUnits} daire satışta. Daire bazlı fiyatları proje sayfasındaki listeden görebilirsiniz.`
          : `${project.name} projesinde şu an satışta daire görünmüyor. Size benzer bir proje önerebilirim.`,
        links: [{ label: `${project.name} fiyat listesi`, href: `/projeler/${project.slug}` }],
        chips: ["Ödeme planı nasıl?", "Teslim ne zaman?"],
      };
    }
    const withPrice = data.projects.filter((p) => p.minPriceLabel);
    return {
      text: withPrice.length
        ? "Güncel başlangıç fiyatlarımız:\n" +
          withPrice.map((p) => `• ${p.name} — ${p.minPriceLabel}`).join("\n") +
          "\n\nHangi projeyi detaylı konuşalım?"
        : "Şu an satışta daire bulunan projemiz görünmüyor; yeni projelerimiz için sizi arayabiliriz.",
      chips: withPrice.map((p) => p.name).slice(0, 4),
    };
  }

  /* -------------------------------------------------------- ödeme planı */
  if (has(q, "odeme", "taksit", "vade", "pesinat", "kredi", "plan")) {
    const p = project ?? data.projects.find((x) => x.downPaymentPct) ?? null;
    const pct = p?.downPaymentPct ?? 35;
    const months = p?.installmentMonths ?? 36;
    return {
      text:
        `Standart planımız %${pct} peşinat ve kalan tutarda ${months} aya varan faizsiz vade.\n\n` +
        "Peşinat oranına göre ek avantajlar var:\n" +
        "• %50 peşinatta %4 indirim ya da +12 ay vade\n" +
        "• %60 peşinatta %5 indirim\n" +
        "• %80 peşinatta %7,5 indirim ya da 2 yıl kira garantisi (yıllık %8)\n" +
        "• %100 peşinatta %10 indirim ya da 2 yıl kira garantisi",
      chips: ["Kira garantisi var mı?", "Teslim ne zaman?"],
      toWhatsapp: true,
    };
  }

  /* ------------------------------------------------------ kira garantisi */
  if (has(q, "kira", "getiri", "yatirim", "rant", "amortisman")) {
    return {
      text:
        "Evet. %80 ve üzeri peşinatla alımlarda 2 yıl boyunca yıllık %8 kira garantisi sunuyoruz. " +
        "Kira garantisinden yararlanmak için şirketin eşya paketinin alınması gerekiyor.\n\n" +
        "Bölgede üniversite ve turizm kaynaklı kiralama talebi yıl boyu sürüyor.",
      chips: ["Ödeme planı nasıl?", "Hangi projeler var?"],
      toWhatsapp: true,
    };
  }

  /* ------------------------------------------------------------- teslim */
  if (has(q, "teslim", "ne zaman", "bitis", "tarih", "hazir")) {
    if (project) {
      return {
        text: `${project.name} teslim tarihi: ${project.deliveryLabel ?? "satış ekibimizden teyit alınmalı"}.`,
        links: [{ label: `${project.name} detayları`, href: `/projeler/${project.slug}` }],
      };
    }
    return {
      text:
        "Projelerimizin teslim tarihleri:\n" +
        data.projects.map((p) => `• ${p.name} — ${p.deliveryLabel ?? "—"}`).join("\n"),
      chips: data.projects.map((p) => p.name).slice(0, 4),
    };
  }

  /* ------------------------------------------------------------ projeler */
  if (has(q, "proje", "daire", "ev", "konut", "stüdyo", "studio", "1+1", "2+1", "3+1", "hangi")) {
    if (project) {
      return {
        text:
          `${project.name} — ${[project.district, project.city].filter(Boolean).join(", ")}\n` +
          `• Daire tipleri: ${project.types.join(", ")}\n` +
          `• Toplam ${project.totalUnits} daire, ${project.availableUnits} tanesi satışta\n` +
          `• Teslim: ${project.deliveryLabel ?? "—"}` +
          (project.minPriceLabel ? `\n• Başlangıç: ${project.minPriceLabel}` : ""),
        links: [{ label: `${project.name} sayfası`, href: `/projeler/${project.slug}` }],
        chips: ["Ödeme planı nasıl?", "360 tur var mı?"],
      };
    }
    return {
      text:
        "Şu an dört projemiz var:\n" +
        data.projects
          .map(
            (p) =>
              `• ${p.name} — ${p.availableUnits > 0 ? `${p.availableUnits} daire satışta` : "tükendi"}`
          )
          .join("\n") +
        "\n\nHangisini detaylı anlatayım?",
      chips: data.projects.map((p) => p.name).slice(0, 4),
    };
  }

  /* ------------------------------------------------------------- 360 tur */
  if (has(q, "360", "tur", "sanal", "gez", "video")) {
    return {
      text:
        "360° sanal turumuzla daireleri tarayıcınızdan adım adım gezebilirsiniz. " +
        "Sayfadaki “360° Sanal Tur” düğmesinden hemen açabilirsiniz.",
      links: [{ label: "Projeleri gör", href: "/projeler" }],
    };
  }

  /* -------------------------------------------------------------- konum */
  if (has(q, "nerede", "konum", "adres", "ofis", "lokasyon", "harita", "ulasim")) {
    return {
      text:
        "Ofisimiz İsmet İnönü Bulvarı, Salamis Yolu No:55 (Access Butik yanı), Gazimağusa / Kuzey Kıbrıs adresinde. " +
        "İletişim sayfasındaki haritadan yol tarifi alabilirsiniz.",
      links: [{ label: "İletişim ve harita", href: "/iletisim" }],
    };
  }

  /* -------------------------------------------------------------- randevu */
  if (has(q, "randevu", "gezi", "gorusme", "ziyaret", "gelmek", "bakmak")) {
    return {
      text:
        "Memnuniyetle. Proje gezisi ya da ofis görüşmesi ayarlayabiliriz; uzaktaysanız görüntülü tur da yapıyoruz. " +
        "Sizi en hızlı WhatsApp üzerinden planlayabiliriz.",
      toWhatsapp: true,
      links: [{ label: "Randevu formu", href: "/iletisim" }],
    };
  }

  /* -------------------------------------------------- tapu / yabancı alım */
  if (has(q, "tapu", "yabanci", "vatandas", "izin", "yasal", "surec")) {
    return {
      text:
        "Yabancı yatırımcılar için süreç nettir: daire seçimi → rezervasyon → sözleşme ve peşinat → taksitler → satın alma izni ve tapu devri. " +
        "Tüm aşamaları biz yürütüyoruz.",
      links: [{ label: "Yatırım rehberi", href: "/neden-kibris" }],
      toWhatsapp: true,
    };
  }

  /* ------------------------------------------------------------ iletişim */
  if (has(q, "telefon", "ara", "whatsapp", "iletisim", "numara", "mail", "eposta")) {
    return {
      text: "Size en hızlı WhatsApp'tan dönüş yapabiliriz. Dilerseniz telefonla da arayabilirsiniz.",
      toWhatsapp: true,
      links: [{ label: "İletişim bilgileri", href: "/iletisim" }],
    };
  }

  /* ------------------------------------------------------------ anlaşılmadı */
  return {
    text:
      "Bunu tam anlayamadım. Projeler, fiyatlar, ödeme planı, teslim tarihleri ve randevu konularında yardımcı olabilirim. " +
      "Daha detaylı bir sorunuz varsa sizi satış ekibimize bağlayayım.",
    chips: QUICK_CHIPS,
    toWhatsapp: true,
  };
}
