/** Fiyat listelerinden ve proje dosyalarından çıkarılan gerçek envanter. */

export type SeedUnit = {
  block?: string;
  unitNo: string;
  type: string;
  definition?: string;
  floor?: string;
  floorNo?: number;
  grossArea?: number;
  terraceArea?: number;
  gardenArea?: number;
  facing?: string;
  price?: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
};

const bed = (t: string) => (t.startsWith("Studio") ? 1 : parseInt(t) + 1 || 1);

// ---------------------------------------------------------------------------
// LUXERA SALAMIS — 4 blok × 12 daire
// ---------------------------------------------------------------------------

const L = (
  block: string,
  unitNo: string,
  type: string,
  floor: string,
  gross: number,
  price: number,
  status: "AVAILABLE" | "RESERVED",
  garden?: number,
  terrace?: number
): SeedUnit => ({
  block,
  unitNo: `${block}${unitNo}`,
  type,
  definition: type.includes("Loft") ? "LOFT" : "FLAT",
  floor,
  floorNo: floor === "Zemin Kat" ? 0 : 1,
  grossArea: gross,
  gardenArea: garden,
  terraceArea: terrace,
  price,
  status,
});

export const LUXERA_UNITS: SeedUnit[] = [
  // Blok A
  L("A", "1", "Studio", "Zemin Kat", 45, 109900, "AVAILABLE", 13),
  L("A", "2", "2+1", "Zemin Kat", 75.5, 159900, "RESERVED", 21),
  L("A", "3", "2+1", "Zemin Kat", 75.5, 159900, "AVAILABLE", 21),
  L("A", "4", "Studio", "Zemin Kat", 45, 109900, "AVAILABLE", 13),
  L("A", "5", "Studio", "Zemin Kat", 45, 109900, "RESERVED", 13),
  L("A", "6", "2+1", "Zemin Kat", 75.5, 159900, "AVAILABLE", 21),
  L("A", "7", "2+1", "Zemin Kat", 75.5, 159900, "RESERVED", 21),
  L("A", "8", "Studio", "Zemin Kat", 45, 109900, "RESERVED", 13),
  L("A", "9", "3+1", "1. Kat", 128.2, 279000, "AVAILABLE", undefined, 96),
  L("A", "10", "3+1", "1. Kat", 128.2, 279000, "RESERVED", undefined, 96),
  L("A", "11", "3+1", "1. Kat", 128.2, 279000, "AVAILABLE", undefined, 96),
  L("A", "12", "3+1", "1. Kat", 128.2, 279000, "RESERVED", undefined, 96),
  // Blok B
  L("B", "1", "1+1", "Zemin Kat", 72, 149900, "AVAILABLE", 10),
  L("B", "2", "1+1", "Zemin Kat", 72, 149900, "AVAILABLE", 10),
  L("B", "3", "1+1", "Zemin Kat", 72, 149900, "RESERVED", 10),
  L("B", "4", "1+1", "Zemin Kat", 72, 149900, "AVAILABLE", 10),
  L("B", "5", "1+1", "Zemin Kat", 72, 149900, "RESERVED", 10),
  L("B", "6", "1+1", "Zemin Kat", 72, 149900, "RESERVED", 10),
  L("B", "7", "2+1 Loft", "1. Kat", 100, 239900, "RESERVED", undefined, 56.5),
  L("B", "8", "2+1 Loft", "1. Kat", 100, 239900, "AVAILABLE", undefined, 56.5),
  L("B", "9", "2+1 Loft", "1. Kat", 100, 239900, "AVAILABLE", undefined, 56.5),
  L("B", "10", "2+1 Loft", "1. Kat", 100, 239900, "AVAILABLE", undefined, 56.5),
  L("B", "11", "2+1 Loft", "1. Kat", 100, 239900, "RESERVED", undefined, 56.5),
  L("B", "12", "2+1 Loft", "1. Kat", 100, 239900, "AVAILABLE", undefined, 56.5),
  // Blok C
  L("C", "1", "2+1", "Zemin Kat", 76, 164900, "AVAILABLE", 21),
  L("C", "2", "Studio", "Zemin Kat", 54, 99900, "RESERVED"),
  L("C", "3", "Studio", "Zemin Kat", 47, 94900, "AVAILABLE"),
  L("C", "4", "Studio", "Zemin Kat", 47, 94900, "AVAILABLE"),
  L("C", "5", "Studio", "Zemin Kat", 54, 99900, "RESERVED"),
  L("C", "6", "2+1", "Zemin Kat", 76, 164900, "AVAILABLE", 21),
  L("C", "7", "2+1", "1. Kat", 76, 179900, "RESERVED", undefined, 70.5),
  L("C", "8", "Studio", "1. Kat", 54, 119900, "AVAILABLE", undefined, 49),
  L("C", "9", "Studio", "1. Kat", 47, 109900, "AVAILABLE", undefined, 42),
  L("C", "10", "Studio", "1. Kat", 47, 109900, "AVAILABLE", undefined, 42),
  L("C", "11", "Studio", "1. Kat", 54, 119900, "AVAILABLE", undefined, 49),
  L("C", "12", "2+1", "1. Kat", 76, 179900, "RESERVED", undefined, 70.5),
  // Blok D
  L("D", "1", "2+1", "Zemin Kat", 76, 164900, "AVAILABLE", 21),
  L("D", "2", "Studio", "Zemin Kat", 54, 99900, "AVAILABLE"),
  L("D", "3", "Studio", "Zemin Kat", 47, 94900, "AVAILABLE"),
  L("D", "4", "Studio", "Zemin Kat", 47, 94900, "AVAILABLE"),
  L("D", "5", "Studio", "Zemin Kat", 54, 99900, "AVAILABLE"),
  L("D", "6", "2+1", "Zemin Kat", 76, 164900, "RESERVED", 21),
  L("D", "7", "2+1", "1. Kat", 76, 179900, "RESERVED", undefined, 70.5),
  L("D", "8", "Studio", "1. Kat", 54, 119900, "RESERVED", undefined, 49),
  L("D", "9", "Studio", "1. Kat", 47, 109900, "AVAILABLE", undefined, 42),
  L("D", "10", "Studio", "1. Kat", 47, 109900, "AVAILABLE", undefined, 42),
  L("D", "11", "Studio", "1. Kat", 54, 119900, "AVAILABLE", undefined, 49),
  L("D", "12", "2+1", "1. Kat", 76, 179900, "AVAILABLE", undefined, 70.5),
];

// ---------------------------------------------------------------------------
// SUNRISE DIAMOND — 5 kat, 12 daire
// ---------------------------------------------------------------------------

export const DIAMOND_UNITS: SeedUnit[] = [
  { unitNo: "1", type: "2+1", definition: "FLAT", floor: "1. Kat", floorNo: 1, grossArea: 92, facing: "Güney/Batı/Doğu", status: "SOLD" },
  { unitNo: "2", type: "2+1", definition: "FLAT", floor: "1. Kat", floorNo: 1, grossArea: 85, facing: "Kuzey/Batı", status: "SOLD" },
  { unitNo: "3", type: "2+1", definition: "FLAT", floor: "1. Kat", floorNo: 1, grossArea: 85, facing: "Kuzey/Doğu", status: "SOLD" },
  { unitNo: "4", type: "2+1", definition: "FLAT", floor: "2. Kat", floorNo: 2, grossArea: 92, facing: "Güney/Batı/Doğu", status: "SOLD" },
  { unitNo: "5", type: "2+1", definition: "FLAT", floor: "2. Kat", floorNo: 2, grossArea: 85, facing: "Kuzey/Batı", status: "SOLD" },
  { unitNo: "6", type: "2+1", definition: "FLAT", floor: "2. Kat", floorNo: 2, grossArea: 85, facing: "Kuzey/Doğu", status: "SOLD" },
  { unitNo: "7", type: "3+1", definition: "FLAT", floor: "3. Kat", floorNo: 3, grossArea: 135, facing: "Kuzey/Batı/Güney", status: "SOLD" },
  { unitNo: "8", type: "3+1", definition: "FLAT", floor: "3. Kat", floorNo: 3, grossArea: 125, facing: "Kuzey/Doğu/Güney", status: "SOLD" },
  { unitNo: "9", type: "3+1", definition: "FLAT", floor: "4. Kat", floorNo: 4, grossArea: 135, facing: "Kuzey/Batı/Güney", status: "SOLD" },
  { unitNo: "10", type: "3+1", definition: "FLAT", floor: "4. Kat", floorNo: 4, grossArea: 125, facing: "Kuzey/Doğu/Güney", status: "SOLD" },
  { unitNo: "11", type: "2+1", definition: "PENTHOUSE", floor: "5. Kat", floorNo: 5, grossArea: 106, terraceArea: 18, facing: "Kuzey/Batı/Güney", price: 149900, status: "AVAILABLE" },
  { unitNo: "12", type: "2+1", definition: "PENTHOUSE", floor: "5. Kat", floorNo: 5, grossArea: 90, terraceArea: 42, facing: "Kuzey/Doğu/Güney", status: "SOLD" },
];

// ---------------------------------------------------------------------------
// SUNRISE GOLD — teslim edilmiş, 9 daire
// ---------------------------------------------------------------------------

export const GOLD_UNITS: SeedUnit[] = [
  { unitNo: "1", type: "1+1", definition: "FLAT", floor: "Zemin Kat", floorNo: 0, grossArea: 74, facing: "Güney/Batı", status: "SOLD" },
  { unitNo: "2", type: "1+1", definition: "FLAT", floor: "Zemin Kat", floorNo: 0, grossArea: 69, facing: "Kuzey/Batı", status: "SOLD" },
  { unitNo: "3", type: "2+1", definition: "FLAT", floor: "Zemin Kat", floorNo: 0, grossArea: 84, facing: "Kuzey/Doğu", status: "SOLD" },
  { unitNo: "4", type: "1+1", definition: "FLAT", floor: "1. Kat", floorNo: 1, grossArea: 74, facing: "Güney/Batı", status: "SOLD" },
  { unitNo: "5", type: "1+1", definition: "FLAT", floor: "1. Kat", floorNo: 1, grossArea: 69, facing: "Kuzey/Batı", status: "SOLD" },
  { unitNo: "6", type: "2+1", definition: "FLAT", floor: "1. Kat", floorNo: 1, grossArea: 84, facing: "Kuzey/Doğu", status: "SOLD" },
  { unitNo: "7", type: "1+1", definition: "LOFT PENTHOUSE", floor: "2. Kat", floorNo: 2, grossArea: 84, facing: "Güney/Batı", status: "SOLD" },
  { unitNo: "8", type: "1+1", definition: "LOFT PENTHOUSE", floor: "2. Kat", floorNo: 2, grossArea: 85, facing: "Kuzey/Batı", status: "SOLD" },
  { unitNo: "9", type: "2+1", definition: "LOFT PENTHOUSE", floor: "2. Kat", floorNo: 2, grossArea: 98, facing: "Kuzey/Doğu", status: "SOLD" },
];

// ---------------------------------------------------------------------------
// SUNRISE PLATINIUM — 5 kat, 14 daire
// ---------------------------------------------------------------------------

export const PLATINIUM_UNITS: SeedUnit[] = [
  { unitNo: "1", type: "3+1", definition: "FLAT", floor: "1. Kat", floorNo: 1, grossArea: 145, facing: "Batı/Kuzeybatı/Güneybatı", status: "SOLD" },
  { unitNo: "2", type: "3+1", definition: "FLAT", floor: "1. Kat", floorNo: 1, grossArea: 145, facing: "Doğu/Kuzeydoğu/Güneydoğu", price: 144900, status: "AVAILABLE" },
  { unitNo: "3", type: "3+1", definition: "FLAT", floor: "2. Kat", floorNo: 2, grossArea: 145, facing: "Batı/Kuzeybatı/Güneybatı", status: "SOLD" },
  { unitNo: "4", type: "3+1", definition: "FLAT", floor: "2. Kat", floorNo: 2, grossArea: 145, facing: "Doğu/Kuzeydoğu/Güneydoğu", status: "SOLD" },
  { unitNo: "5", type: "2+1", definition: "FLAT", floor: "3. Kat", floorNo: 3, grossArea: 70, facing: "Batı/Güneybatı", status: "SOLD" },
  { unitNo: "6", type: "2+1", definition: "FLAT", floor: "3. Kat", floorNo: 3, grossArea: 75, facing: "Kuzey/Kuzeybatı", status: "SOLD" },
  { unitNo: "7", type: "2+1", definition: "FLAT", floor: "3. Kat", floorNo: 3, grossArea: 75, facing: "Kuzey/Kuzeydoğu", status: "SOLD" },
  { unitNo: "8", type: "2+1", definition: "FLAT", floor: "3. Kat", floorNo: 3, grossArea: 70, facing: "Güney/Güneydoğu", status: "SOLD" },
  { unitNo: "9", type: "2+1", definition: "FLAT", floor: "4. Kat", floorNo: 4, grossArea: 70, facing: "Batı/Güneybatı", price: 91900, status: "AVAILABLE" },
  { unitNo: "10", type: "2+1", definition: "FLAT", floor: "4. Kat", floorNo: 4, grossArea: 75, facing: "Kuzey/Kuzeybatı", status: "SOLD" },
  { unitNo: "11", type: "2+1", definition: "FLAT", floor: "4. Kat", floorNo: 4, grossArea: 75, facing: "Kuzey/Kuzeydoğu", status: "SOLD" },
  { unitNo: "12", type: "2+1", definition: "FLAT", floor: "4. Kat", floorNo: 4, grossArea: 70, facing: "Güney/Güneydoğu", status: "SOLD" },
  { unitNo: "13", type: "2+1", definition: "PENTHOUSE", floor: "5. Kat", floorNo: 5, grossArea: 102, terraceArea: 44, facing: "Batı/Kuzeybatı/Güneybatı", status: "SOLD" },
  { unitNo: "14", type: "2+1", definition: "PENTHOUSE", floor: "5. Kat", floorNo: 5, grossArea: 102, terraceArea: 44, facing: "Doğu/Kuzeydoğu/Güneydoğu", price: 149900, status: "AVAILABLE" },
];

export const BEDROOMS = bed;

// ---------------------------------------------------------------------------
// Ödeme planı özel şartları (tüm projelerde ortak)
// ---------------------------------------------------------------------------

export const SPECIAL_TERMS = [
  { downPct: 50, benefitTr: "%4 indirim ya da +12 ay ek vade" },
  { downPct: 60, benefitTr: "%5 indirim" },
  { downPct: 80, benefitTr: "%7,5 indirim ya da 2 yıl kira garantisi (yıllık %8 getiri)" },
  { downPct: 100, benefitTr: "%10 indirim ya da 2 yıl kira garantisi (yıllık %8 getiri)" },
];

export const PAYMENT_NOTE =
  "Kira garantisinden yararlanmak isteyen yatırımcıların şirketin eşya paketinden almaları gerekmektedir.";
