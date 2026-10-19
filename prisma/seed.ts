import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import {
  LUXERA_UNITS, DIAMOND_UNITS, GOLD_UNITS, PLATINIUM_UNITS,
  SPECIAL_TERMS, PAYMENT_NOTE, BEDROOMS, type SeedUnit,
} from "./seed-data";

const prisma = new PrismaClient();
const MEDIA_ROOT = path.join(process.cwd(), "public", "media");

/** public/media/<slug>/<kategori>/*.webp dosyalarını okur */
function readImages(slug: string) {
  const dir = path.join(MEDIA_ROOT, slug);
  if (!fs.existsSync(dir)) return [];
  const out: { url: string; category: string; order: number; caption: string | null }[] = [];
  for (const category of fs.readdirSync(dir)) {
    const cdir = path.join(dir, category);
    if (!fs.statSync(cdir).isDirectory()) continue;
    const files = fs.readdirSync(cdir).filter((f) => f.endsWith(".webp")).sort();
    files.forEach((f, i) => {
      out.push({
        url: `/media/${slug}/${category}/${f}`,
        category,
        order: i,
        caption: null,
      });
    });
  }
  return out;
}

function pickCover(imgs: ReturnType<typeof readImages>) {
  const pref = ["exterior", "render", "interior", "activity"];
  for (const c of pref) {
    const hit = imgs.find((i) => i.category === c);
    if (hit) return hit.url;
  }
  return imgs[0]?.url ?? null;
}

async function seedUnits(projectId: string, units: SeedUnit[]) {
  const blockNames = [...new Set(units.map((u) => u.block).filter(Boolean))] as string[];
  const blockMap = new Map<string, string>();

  for (const [i, name] of blockNames.entries()) {
    const b = await prisma.block.create({
      data: { projectId, name, order: i, floors: 2 },
    });
    blockMap.set(name, b.id);
  }

  for (const [i, u] of units.entries()) {
    await prisma.unit.create({
      data: {
        projectId,
        blockId: u.block ? blockMap.get(u.block) ?? null : null,
        unitNo: u.unitNo,
        type: u.type,
        definition: u.definition ?? null,
        floor: u.floor ?? null,
        floorNo: u.floorNo ?? null,
        grossArea: u.grossArea ?? null,
        terraceArea: u.terraceArea ?? null,
        gardenArea: u.gardenArea ?? null,
        facing: u.facing ?? null,
        bedrooms: BEDROOMS(u.type),
        bathrooms: u.type.startsWith("3") ? 2 : 1,
        price: u.price ?? null,
        currency: "GBP",
        status: u.status,
        order: i,
      },
    });
  }
}

async function main() {
  // Yayındaki veritabanında seed her dağıtımda yeniden çalışır; veri varsa
  // dokunmayız, aksi hâlde müşterinin bıraktığı lead'ler silinirdi.
  // Sıfırlamak için: FORCE_SEED=1 npm run db:seed
  if (process.env.FORCE_SEED !== "1") {
    const existing = await prisma.project.count();
    if (existing > 0) {
      console.log(`↷ Veritabanında ${existing} proje var, seed atlandı.`);
      console.log("  Sıfırlamak için: FORCE_SEED=1 npm run db:seed");
      return;
    }
  }

  console.log("🧹 Mevcut veriler temizleniyor...");
  await prisma.$transaction([
    prisma.installment.deleteMany(),
    prisma.deal.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.task.deleteMany(),
    prisma.unitView.deleteMany(),
    prisma.leadStatusHistory.deleteMany(),
    prisma.leadActivity.deleteMany(),
    prisma.leadNote.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.projectImage.deleteMany(),
    prisma.unit.deleteMany(),
    prisma.block.deleteMany(),
    prisma.project.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.media.deleteMany(),
    prisma.user.deleteMany(),
    prisma.setting.deleteMany(),
  ]);

  // ------------------------------------------------------------- Kullanıcılar
  console.log("👤 Kullanıcılar...");
  const pw = await bcrypt.hash("hardworker2026", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Sistem Yöneticisi",
      email: "admin@hardworkercyprus.com",
      phone: "905488408080",
      passwordHash: pw,
      role: "SUPER_ADMIN",
    },
  });
  const manager = await prisma.user.create({
    data: {
      name: "Mehmet Satış",
      email: "satis@hardworkercyprus.com",
      phone: "905469998080",
      passwordHash: pw,
      role: "SALES_MANAGER",
    },
  });
  const agent1 = await prisma.user.create({
    data: {
      name: "Ayşe Demir",
      email: "ayse@hardworkercyprus.com",
      phone: "905331112233",
      passwordHash: pw,
      role: "AGENT",
    },
  });
  const agent2 = await prisma.user.create({
    data: {
      name: "Can Yılmaz",
      email: "can@hardworkercyprus.com",
      phone: "905334445566",
      passwordHash: pw,
      role: "AGENT",
    },
  });

  // ------------------------------------------------------------------ Projeler
  console.log("🏗  Projeler ve envanter...");

  const COMMON_AMENITIES = [
    { icon: "waves", labelTr: "Açık Yüzme Havuzu" },
    { icon: "dumbbell", labelTr: "Fitness Salonu" },
    { icon: "shield", labelTr: "7/24 Güvenlik" },
    { icon: "car", labelTr: "Otopark" },
    { icon: "trees", labelTr: "Peyzaj Alanları" },
    { icon: "zap", labelTr: "Jeneratör" },
  ];

  // --- Luxera Salamis
  const luxeraImgs = readImages("luxera-salamis");
  const luxera = await prisma.project.create({
    data: {
      slug: "luxera-salamis",
      name: "Luxera Salamis",
      nameEn: "Luxera Salamis",
      tagline: "Salamis sahilinde tatil konforunda yaşam",
      descriptionTr:
        "Luxera Salamis, Gazimağusa'nın en değerli hattı olan Salamis Yolu üzerinde, denize yürüme mesafesinde konumlanıyor. Dört blokta toplam 48 bağımsız bölüm; stüdyodan 3+1 bahçe dublekslerine uzanan geniş tip yelpazesi sunuyor. Proje içinde a la carte restoran, spa ve masaj üniteleri, sauna, fitness salonu, çocuk oyun alanları ve yüzme havuzu yer alıyor. Zemin kat daireler özel bahçeli, üst kat daireler geniş çatı teraslıdır.",
      status: "ONGOING",
      featured: true,
      published: true,
      city: "Gazimağusa",
      district: "Salamis",
      address: "Salamis Yolu, Gazimağusa / KKTC",
      lat: 35.1673,
      lng: 33.9016,
      deliveryDate: new Date("2028-12-01"),
      deliveryLabel: "Aralık 2028",
      startDate: new Date("2025-06-01"),
      coverImage: pickCover(luxeraImgs),
      heroImage: luxeraImgs.find((i) => i.category === "exterior")?.url ?? null,
      paymentPlanUrl: "/docs/luxera-salamis-odeme-plani.pdf",
      tourUrl: "https://renderstuff.com/tools/360-panorama-web-viewer/",
      downPaymentPct: 35,
      installmentMonths: 36,
      paymentTermsTr: "%35 peşinat, kalan tutar 36 ay vade ile ödenebilir.",
      specialTerms: SPECIAL_TERMS,
      features: [
        "48 bağımsız bölüm, 4 blok",
        "Denize yürüme mesafesi",
        "Zemin katlarda özel bahçe",
        "Üst katlarda geniş çatı terası",
        "A la carte restoran",
        "Spa, sauna ve masaj üniteleri",
        "Fitness salonu",
        "Çocuk oyun alanı",
        "Açık yüzme havuzu",
        "2 yıl kira garantisi opsiyonu",
      ],
      amenities: [
        ...COMMON_AMENITIES,
        { icon: "utensils", labelTr: "A La Carte Restoran" },
        { icon: "sparkles", labelTr: "Spa & Masaj" },
        { icon: "flame", labelTr: "Sauna" },
        { icon: "baby", labelTr: "Çocuk Oyun Alanı" },
      ],
      seoTitle: "Luxera Salamis — Gazimağusa Salamis'te Satılık Daireler",
      seoDescription:
        "Luxera Salamis projesinde stüdyodan 3+1'e satılık daireler. Denize yürüme mesafesi, %35 peşinat ve 36 ay vade. Fiyat listesi ve kat planları.",
      order: 0,
    },
  });
  await seedUnits(luxera.id, LUXERA_UNITS);
  if (luxeraImgs.length)
    await prisma.projectImage.createMany({
      data: luxeraImgs.map((i) => ({ ...i, projectId: luxera.id })),
    });

  // --- Sunrise Platinium
  const platImgs = readImages("sunrise-platinium");
  const platinium = await prisma.project.create({
    data: {
      slug: "sunrise-platinium",
      name: "Sunrise Platinium",
      tagline: "Şehrin merkezinde ayrıcalıklı yaşam",
      descriptionTr:
        "Sunrise Platinium, Gazimağusa merkezde 5 katlı modern bir apartman projesidir. 14 bağımsız bölümde 2+1 ve 3+1 daireler ile çatı katında geniş teraslı penthouse seçenekleri sunar. Her daire çift veya üç cepheli olacak şekilde tasarlanmış; gün ışığı ve doğal havalandırma ön planda tutulmuştur.",
      status: "ONGOING",
      featured: true,
      published: true,
      city: "Gazimağusa",
      district: "Merkez",
      lat: 35.1264,
      lng: 33.9387,
      deliveryDate: new Date("2027-12-01"),
      deliveryLabel: "Aralık 2027",
      coverImage: pickCover(platImgs),
      heroImage: platImgs.find((i) => i.category === "exterior")?.url ?? null,
      paymentPlanUrl: "/docs/sunrise-platinium-odeme-plani.pdf",
      downPaymentPct: 35,
      installmentMonths: 36,
      paymentTermsTr: "%35 peşinat, kalan tutar 36 ay vade ile ödenebilir.",
      specialTerms: SPECIAL_TERMS,
      features: [
        "14 bağımsız bölüm, 5 kat",
        "2+1 ve 3+1 daire seçenekleri",
        "Çatı katında teraslı penthouse",
        "Çift ve üç cepheli daireler",
        "Merkezi konum",
        "Kapalı otopark",
      ],
      amenities: COMMON_AMENITIES,
      seoTitle: "Sunrise Platinium — Gazimağusa Merkezde Satılık Daireler",
      seoDescription:
        "Sunrise Platinium projesinde 2+1 ve 3+1 satılık daireler, teraslı penthouse seçenekleri. %35 peşinat, 36 ay vade.",
      order: 1,
    },
  });
  await seedUnits(platinium.id, PLATINIUM_UNITS);
  if (platImgs.length)
    await prisma.projectImage.createMany({
      data: platImgs.map((i) => ({ ...i, projectId: platinium.id })),
    });

  // --- Sunrise Diamond
  const diaImgs = readImages("sunrise-diamond");
  const diamond = await prisma.project.create({
    data: {
      slug: "sunrise-diamond",
      name: "Sunrise Diamond",
      tagline: "Zarif mimari, akıllı yerleşim",
      descriptionTr:
        "Sunrise Diamond, 5 katlı 12 daireli butik bir apartman projesidir. 2+1 ve 3+1 daire tipleri ile çatı katında teraslı penthouse seçenekleri sunar. Proje büyük oranda satılmış olup sınırlı sayıda penthouse seçeneği mevcuttur.",
      status: "ONGOING",
      published: true,
      city: "Gazimağusa",
      district: "Merkez",
      lat: 35.1264,
      lng: 33.9387,
      deliveryDate: new Date("2028-12-01"),
      deliveryLabel: "Aralık 2028",
      coverImage: pickCover(diaImgs),
      heroImage: diaImgs.find((i) => i.category === "render")?.url ?? null,
      videoUrl: null,
      paymentPlanUrl: "/docs/sunrise-diamond-odeme-plani.pdf",
      downPaymentPct: 35,
      installmentMonths: 36,
      paymentTermsTr: "%35 peşinat, kalan tutar 36 ay vade ile ödenebilir.",
      specialTerms: SPECIAL_TERMS,
      features: [
        "12 bağımsız bölüm, 5 kat",
        "2+1 ve 3+1 daire tipleri",
        "Teraslı penthouse seçeneği",
        "Butik ölçekli apartman",
        "Merkezi konum",
      ],
      amenities: COMMON_AMENITIES.slice(0, 4),
      seoTitle: "Sunrise Diamond — Gazimağusa Satılık Daireler",
      seoDescription:
        "Sunrise Diamond projesinde son penthouse fırsatı. 2+1 ve 3+1 daireler, %35 peşinat ve 36 ay vade.",
      order: 2,
    },
  });
  await seedUnits(diamond.id, DIAMOND_UNITS);
  if (diaImgs.length)
    await prisma.projectImage.createMany({
      data: diaImgs.map((i) => ({ ...i, projectId: diamond.id })),
    });

  // --- Sunrise Gold
  const goldImgs = readImages("sunrise-gold");
  const gold = await prisma.project.create({
    data: {
      slug: "sunrise-gold",
      name: "Sunrise Gold",
      tagline: "Teslim edilmiş referans projemiz",
      descriptionTr:
        "Sunrise Gold, 2024 yılında zamanında teslim edilen 9 daireli apartman projemizdir. 1+1 ve 2+1 daireler ile çatı katında loft penthouse seçenekleri sunmuştur. Tüm daireler satılmış ve sahiplerine teslim edilmiştir.",
      status: "COMPLETED",
      published: true,
      city: "Gazimağusa",
      district: "Merkez",
      lat: 35.1264,
      lng: 33.9387,
      deliveryDate: new Date("2024-12-01"),
      deliveryLabel: "Aralık 2024 · Teslim Edildi",
      coverImage: pickCover(goldImgs),
      heroImage: goldImgs.find((i) => i.category === "exterior")?.url ?? null,
      features: [
        "9 bağımsız bölüm",
        "1+1 ve 2+1 daire tipleri",
        "Loft penthouse seçenekleri",
        "Zamanında teslim edildi",
        "Tamamı satıldı",
      ],
      amenities: COMMON_AMENITIES.slice(0, 4),
      seoTitle: "Sunrise Gold — Teslim Edilen Proje | Hardworker Construction",
      seoDescription:
        "Sunrise Gold, 2024'te zamanında teslim edilen 9 daireli referans projemiz.",
      order: 3,
    },
  });
  await seedUnits(gold.id, GOLD_UNITS);
  if (goldImgs.length)
    await prisma.projectImage.createMany({
      data: goldImgs.map((i) => ({ ...i, projectId: gold.id })),
    });

  // ---------------------------------------------------------------- Lead'ler
  console.log("📇 Örnek lead'ler...");
  const sampleLeads = [
    { name: "Ali Kara", phone: "905321234567", email: "ali.kara@example.com", country: "Türkiye", status: "NEW", source: "PRICE_GATE", temp: "HOT", project: luxera.id, purpose: "YATIRIM", budgetMin: 100000, budgetMax: 180000, assigned: agent1.id, days: 0 },
    { name: "Zeynep Aydın", phone: "905339876543", email: "zeynep@example.com", country: "Türkiye", status: "CONTACTED", source: "PRICE_GATE", temp: "HOT", project: luxera.id, purpose: "OTURUM", budgetMin: 150000, budgetMax: 290000, assigned: agent1.id, days: 2 },
    { name: "John Peterson", phone: "447700900123", email: "j.peterson@example.co.uk", country: "İngiltere", status: "QUALIFIED", source: "PRICE_GATE", temp: "HOT", project: luxera.id, purpose: "KIRALAMA", budgetMin: 90000, budgetMax: 130000, assigned: agent2.id, days: 4 },
    { name: "Murat Şen", phone: "905445556677", country: "KKTC", status: "VIEWING", source: "WHATSAPP", temp: "WARM", project: platinium.id, purpose: "OTURUM", budgetMin: 80000, budgetMax: 150000, assigned: agent2.id, days: 6 },
    { name: "Elena Volkova", phone: "79161234567", email: "elena.v@example.ru", country: "Rusya", status: "NEGOTIATION", source: "INSTAGRAM", temp: "HOT", project: luxera.id, purpose: "YATIRIM", budgetMin: 200000, budgetMax: 300000, assigned: agent1.id, days: 9 },
    { name: "Hasan Öztürk", phone: "905356667788", email: "hasan@example.com", country: "Türkiye", status: "RESERVED", source: "REFERRAL", temp: "HOT", project: diamond.id, purpose: "YATIRIM", budgetMin: 130000, budgetMax: 160000, assigned: manager.id, days: 14 },
    { name: "Fatma Yıldız", phone: "905367778899", country: "KKTC", status: "CONTACTED", source: "CONTACT_FORM", temp: "WARM", project: platinium.id, purpose: "OTURUM", budgetMin: 70000, budgetMax: 100000, assigned: agent2.id, days: 3 },
    { name: "David Mitchell", phone: "447700900456", email: "d.mitchell@example.co.uk", country: "İngiltere", status: "NEW", source: "PRICE_GATE", temp: "WARM", project: luxera.id, purpose: "KIRALAMA", budgetMin: 95000, budgetMax: 125000, assigned: null, days: 1 },
    { name: "Burak Demirtaş", phone: "905378889900", country: "Türkiye", status: "LOST", source: "PHONE", temp: "COLD", project: diamond.id, purpose: "OTURUM", budgetMin: 60000, budgetMax: 90000, assigned: agent1.id, days: 22 },
    { name: "Sarah Klein", phone: "4915112345678", email: "s.klein@example.de", country: "Almanya", status: "WON", source: "PRICE_GATE", temp: "HOT", project: platinium.id, purpose: "YATIRIM", budgetMin: 140000, budgetMax: 160000, assigned: manager.id, days: 30 },
    { name: "Okan Tuncel", phone: "905389990011", country: "KKTC", status: "NEW", source: "WALK_IN", temp: "WARM", project: null, purpose: "OTURUM", budgetMin: 80000, budgetMax: 120000, assigned: null, days: 0 },
    { name: "Ivan Petrov", phone: "79162345678", email: "ivan.p@example.ru", country: "Rusya", status: "QUALIFIED", source: "FACEBOOK", temp: "WARM", project: luxera.id, purpose: "YATIRIM", budgetMin: 100000, budgetMax: 170000, assigned: agent2.id, days: 5 },
  ];

  const createdLeads = [];
  for (const [i, s] of sampleLeads.entries()) {
    const created = new Date(Date.now() - s.days * 86400000);
    const lead = await prisma.lead.create({
      data: {
        refNo: `HW-2026-${String(i + 1).padStart(4, "0")}`,
        name: s.name,
        phone: s.phone,
        email: s.email ?? null,
        country: s.country,
        source: s.source,
        status: s.status,
        temp: s.temp,
        projectId: s.project,
        purpose: s.purpose,
        budgetMin: s.budgetMin,
        budgetMax: s.budgetMax,
        assignedToId: s.assigned,
        score: s.temp === "HOT" ? 80 : s.temp === "WARM" ? 50 : 20,
        createdAt: created,
        lastActivityAt: new Date(Date.now() - Math.floor(s.days / 2) * 86400000),
        convertedAt: s.status === "WON" ? new Date() : null,
      },
    });
    createdLeads.push(lead);

    await prisma.leadStatusHistory.create({
      data: { leadId: lead.id, toStatus: "NEW", userId: null, createdAt: created },
    });
    if (s.status !== "NEW") {
      await prisma.leadStatusHistory.create({
        data: {
          leadId: lead.id,
          fromStatus: "NEW",
          toStatus: s.status,
          userId: s.assigned,
          createdAt: new Date(created.getTime() + 86400000),
        },
      });
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          userId: s.assigned,
          type: "CALL",
          title: "İlk arama yapıldı",
          detail: "Müşteri proje hakkında bilgilendirildi, katalog WhatsApp ile gönderildi.",
          outcome: "ULASILDI",
          occurredAt: new Date(created.getTime() + 86400000),
        },
      });
    }
  }

  // ----------------------------------------------------------- Randevu/Satış
  console.log("📅 Randevular, satışlar, görevler...");

  const viewingLead = createdLeads.find((l) => l.status === "VIEWING")!;
  const negLead = createdLeads.find((l) => l.status === "NEGOTIATION")!;
  await prisma.appointment.createMany({
    data: [
      {
        leadId: viewingLead.id, projectId: platinium.id, userId: agent2.id,
        type: "VIEWING", status: "SCHEDULED",
        startsAt: new Date(Date.now() + 2 * 86400000),
        location: "Sunrise Platinium şantiye",
        notes: "Müşteri 4. kat 2+1 ile ilgileniyor.",
      },
      {
        leadId: negLead.id, projectId: luxera.id, userId: agent1.id,
        type: "MEETING", status: "CONFIRMED",
        startsAt: new Date(Date.now() + 86400000),
        location: "Gazimağusa ofis",
        notes: "Ödeme planı ve kira garantisi görüşülecek.",
      },
      {
        leadId: createdLeads[2].id, projectId: luxera.id, userId: agent2.id,
        type: "VIDEO_CALL", status: "SCHEDULED",
        startsAt: new Date(Date.now() + 3 * 86400000),
        notes: "Londra'dan katılacak, 360° tur gösterilecek.",
      },
      {
        leadId: createdLeads[0].id, projectId: luxera.id, userId: agent1.id,
        type: "VIEWING", status: "COMPLETED",
        startsAt: new Date(Date.now() - 5 * 86400000),
        location: "Luxera Salamis şantiye",
      },
    ],
  });

  // Satış: Sarah Klein → Platinium 2 no'lu daire (WON)
  const wonLead = createdLeads.find((l) => l.status === "WON")!;
  const platUnit = await prisma.unit.findFirst({
    where: { projectId: platinium.id, unitNo: "2" },
  });
  if (platUnit) {
    const deal = await prisma.deal.create({
      data: {
        refNo: "DEAL-2026-0001",
        leadId: wonLead.id,
        projectId: platinium.id,
        unitId: platUnit.id,
        agentId: manager.id,
        listPrice: 144900,
        agreedPrice: 137655,
        discountPct: 5,
        currency: "GBP",
        downPaymentPct: 60,
        downPayment: 82593,
        installmentMonths: 24,
        status: "CONTRACT",
        reservedAt: new Date(Date.now() - 25 * 86400000),
        contractAt: new Date(Date.now() - 18 * 86400000),
        notes: "%60 peşinat ile %5 indirim uygulandı.",
      },
    });
    const remaining = 137655 - 82593;
    const monthly = Math.round(remaining / 24);
    await prisma.installment.createMany({
      data: [
        {
          dealId: deal.id, no: 0, label: "Peşinat", amount: 82593,
          paidAmount: 82593, paidAt: new Date(Date.now() - 18 * 86400000),
          dueDate: new Date(Date.now() - 18 * 86400000), status: "PAID",
        },
        ...Array.from({ length: 24 }, (_, i) => {
          const due = new Date(Date.now() - 18 * 86400000);
          due.setMonth(due.getMonth() + i + 1);
          const paid = i < 1;
          return {
            dealId: deal.id, no: i + 1, label: `${i + 1}. Taksit`,
            amount: monthly, paidAmount: paid ? monthly : 0,
            paidAt: paid ? due : null, dueDate: due,
            status: paid ? "PAID" : "PENDING",
          };
        }),
      ],
    });
  }

  // Rezervasyon: Hasan Öztürk → Diamond 11 penthouse
  const resLead = createdLeads.find((l) => l.status === "RESERVED")!;
  const diaUnit = await prisma.unit.findFirst({
    where: { projectId: diamond.id, unitNo: "11" },
  });
  if (diaUnit) {
    await prisma.deal.create({
      data: {
        refNo: "DEAL-2026-0002",
        leadId: resLead.id, projectId: diamond.id, unitId: diaUnit.id,
        agentId: manager.id,
        listPrice: 149900, agreedPrice: 149900, currency: "GBP",
        downPaymentPct: 35, downPayment: 52465, installmentMonths: 36,
        status: "RESERVATION",
        reservedAt: new Date(Date.now() - 6 * 86400000),
        notes: "Rezervasyon bedeli alındı, sözleşme randevusu bekleniyor.",
      },
    });
    await prisma.unit.update({ where: { id: diaUnit.id }, data: { status: "RESERVED" } });
  }

  await prisma.task.createMany({
    data: [
      { title: "Ali Kara'yı ara — Luxera fiyat listesi gönderildi", leadId: createdLeads[0].id, assignedToId: agent1.id, createdById: manager.id, dueDate: new Date(Date.now() + 86400000), priority: "HIGH" },
      { title: "John Peterson için 360° tur linki hazırla", leadId: createdLeads[2].id, assignedToId: agent2.id, createdById: manager.id, dueDate: new Date(Date.now() + 2 * 86400000), priority: "NORMAL" },
      { title: "Elena Volkova'ya revize teklif gönder", leadId: createdLeads[4].id, assignedToId: agent1.id, createdById: manager.id, dueDate: new Date(Date.now() - 86400000), priority: "HIGH" },
      { title: "Haftalık satış raporu hazırla", assignedToId: manager.id, createdById: admin.id, dueDate: new Date(Date.now() + 4 * 86400000), priority: "NORMAL" },
      { title: "Luxera Salamis Temmuz ilerleme fotoğraflarını yükle", assignedToId: admin.id, createdById: manager.id, dueDate: new Date(Date.now() + 6 * 86400000), priority: "LOW" },
    ],
  });

  // ---------------------------------------------------------------- Ayarlar
  await prisma.setting.createMany({
    data: [
      { key: "site.heroTitle", value: "Kıbrıs'ta Güvenle Yatırım Yapın" as never },
      { key: "site.heroSubtitle", value: "Hardworker Construction ile zamanında teslim, kaliteli işçilik ve kazandıran yatırım." as never },
      { key: "site.stats", value: [
        { label: "Tamamlanan Proje", value: "12" },
        { label: "Teslim Edilen Daire", value: "280+" },
        { label: "Yıllık Tecrübe", value: "18" },
        { label: "Mutlu Aile", value: "250+" },
      ] as never },
      { key: "crm.priceGate.enabled", value: true as never },
      { key: "crm.priceGate.title", value: "Fiyat listesini görmek için kayıt olun" as never },
      { key: "crm.autoAssign", value: false as never },
    ],
  });

  const counts = {
    projeler: await prisma.project.count(),
    daireler: await prisma.unit.count(),
    görseller: await prisma.projectImage.count(),
    leadler: await prisma.lead.count(),
    kullanıcılar: await prisma.user.count(),
  };
  console.log("✅ Seed tamamlandı:", counts);
  console.log("\n   Panel girişi → http://localhost:3000/panel/giris");
  console.log("   E-posta: admin@hardworkercyprus.com");
  console.log("   Şifre:   hardworker2026\n");
}

main()
  .catch((e) => {
    // Veritabanına ulaşılamıyorsa build'i düşürmek yerine net bir uyarı bırak.
    const msg = String(e?.message ?? e);
    const unreachable =
      e?.code === "P1001" || e?.code === "P1000" || /Can't reach database/i.test(msg);
    if (unreachable) {
      console.warn("⚠️  Veritabanına ulaşılamadı, seed atlandı.");
      console.warn("   Vercel'de Postgres bağlantısının (DATABASE_URL) ekli olduğundan emin olun.");
      return;
    }
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
