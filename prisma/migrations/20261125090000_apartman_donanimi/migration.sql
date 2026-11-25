-- Apartman projelerinde standart bina donanımı.
-- Sunrise projelerinde havuz/fitness gibi site olanakları hatalı girilmişti;
-- bu projeler merkezde 9-14 daireli apartmanlar. Listeleri tamamen değişiyor.
-- Luxera Salamis site ölçeğinde olduğu için kendi sosyal alanlarını korur,
-- aynı donanım maddeleri üzerine eklenir.

-- 1) Sunrise apartman projeleri: liste tamamen değişir
UPDATE "Project"
SET "amenities" = '[
  {"icon":"wifi","labelTr":"Merkezi İnternet"},
  {"icon":"wind","labelTr":"Klima Altyapısı"},
  {"icon":"satellite-dish","labelTr":"Merkezi Uydu Sistemi"},
  {"icon":"door-closed","labelTr":"Çelik Giriş Kapıları"},
  {"icon":"layers","labelTr":"Asma Tavan"},
  {"icon":"arrow-up-down","labelTr":"Asansör"},
  {"icon":"clipboard-list","labelTr":"Apartman Yönetimi"}
]'::jsonb
WHERE "slug" IN ('sunrise-platinium','sunrise-diamond','sunrise-gold','sunrise-premium');

-- 2) Luxera Salamis: mevcut sosyal alanlar korunur, donanım eklenir
UPDATE "Project"
SET "amenities" = "amenities" || '[
  {"icon":"wifi","labelTr":"Merkezi İnternet"},
  {"icon":"wind","labelTr":"Klima Altyapısı"},
  {"icon":"satellite-dish","labelTr":"Merkezi Uydu Sistemi"},
  {"icon":"door-closed","labelTr":"Çelik Giriş Kapıları"},
  {"icon":"layers","labelTr":"Asma Tavan"},
  {"icon":"arrow-up-down","labelTr":"Asansör"},
  {"icon":"clipboard-list","labelTr":"Apartman Yönetimi"}
]'::jsonb
WHERE "slug" = 'luxera-salamis'
  AND NOT ("amenities" @> '[{"labelTr":"Asansör"}]'::jsonb);
