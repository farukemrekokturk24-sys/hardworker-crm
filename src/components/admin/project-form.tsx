"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Check, Star, Trash2 } from "lucide-react";
import { Field, inputClass, textareaClass, selectClass, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import {
  updateProject, setProjectCover, deleteProjectImage, type ActionState,
} from "@/app/panel/(crm)/actions";
import { PROJECT_STATUS_LABELS, IMAGE_CATEGORY_LABELS, IMAGE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ProjectForm({
  project,
}: {
  project: {
    id: string;
    name: string;
    tagline: string | null;
    descriptionTr: string | null;
    status: string;
    published: boolean;
    featured: boolean;
    city: string | null;
    district: string | null;
    address: string | null;
    deliveryLabel: string | null;
    downPaymentPct: number | null;
    installmentMonths: number | null;
    paymentTermsTr: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    features: string[];
  };
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProject, {});

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={project.id} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Proje adı" required>
          <input name="name" required defaultValue={project.name} className={inputClass} />
        </Field>
        <Field label="Kısa slogan">
          <input name="tagline" defaultValue={project.tagline ?? ""} className={inputClass} />
        </Field>
      </div>

      <Field label="Açıklama">
        <textarea
          name="descriptionTr"
          rows={6}
          defaultValue={project.descriptionTr ?? ""}
          className={textareaClass}
        />
      </Field>

      <Field label="Öne çıkan özellikler" hint="Her satıra bir özellik yazın.">
        <textarea
          name="features"
          rows={6}
          defaultValue={project.features.join("\n")}
          className={textareaClass}
        />
      </Field>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Durum">
          <select name="status" defaultValue={project.status} className={selectClass}>
            {Object.entries(PROJECT_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Şehir">
          <input name="city" defaultValue={project.city ?? ""} className={inputClass} />
        </Field>
        <Field label="Bölge">
          <input name="district" defaultValue={project.district ?? ""} className={inputClass} />
        </Field>
        <Field label="Teslim etiketi">
          <input
            name="deliveryLabel"
            defaultValue={project.deliveryLabel ?? ""}
            placeholder="Aralık 2028"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Adres">
        <input name="address" defaultValue={project.address ?? ""} className={inputClass} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Peşinat oranı (%)">
          <input
            name="downPaymentPct"
            type="number"
            min={0}
            max={100}
            defaultValue={project.downPaymentPct ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Vade (ay)">
          <input
            name="installmentMonths"
            type="number"
            min={0}
            max={120}
            defaultValue={project.installmentMonths ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Ödeme koşulları metni">
        <textarea
          name="paymentTermsTr"
          rows={2}
          defaultValue={project.paymentTermsTr ?? ""}
          className={textareaClass}
        />
      </Field>

      <div className="rounded-xl border border-border p-4 space-y-4">
        <p className="font-semibold text-ink text-sm">SEO</p>
        <Field label="Sayfa başlığı">
          <input name="seoTitle" defaultValue={project.seoTitle ?? ""} className={inputClass} />
        </Field>
        <Field label="Meta açıklama">
          <textarea
            name="seoDescription"
            rows={2}
            defaultValue={project.seoDescription ?? ""}
            className={textareaClass}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            defaultChecked={project.published}
            className="h-4 w-4 rounded border-border-strong accent-[var(--brand)]"
          />
          <span className="text-sm font-medium text-ink">Sitede yayında</span>
        </label>
        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={project.featured}
            className="h-4 w-4 rounded border-border-strong accent-[var(--brand)]"
          />
          <span className="text-sm font-medium text-ink">Ana sayfada öne çıkar</span>
        </label>
      </div>

      {state.error && <p className="text-sm text-rose-600 font-medium">{state.error}</p>}
      {state.ok && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3.5 py-2.5 font-medium">
          Değişiklikler kaydedildi.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Kaydet
        </Button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------- Görseller */

export function ProjectImages({
  projectId,
  coverImage,
  images,
}: {
  projectId: string;
  coverImage: string | null;
  images: { id: string; url: string; category: string }[];
}) {
  const [pending, start] = useTransition();
  const [cover, setCover] = useState(coverImage);
  const [filter, setFilter] = useState("ALL");

  const categories = [...new Set(images.map((i) => i.category))];
  const shown = filter === "ALL" ? images : images.filter((i) => i.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter("ALL")}
          className={cn(
            "shrink-0 h-9 px-3.5 rounded-full text-[0.8125rem] font-semibold transition-colors",
            filter === "ALL" ? "bg-ink text-white" : "bg-surface-2 text-ink-soft hover:bg-surface-3"
          )}
        >
          Tümü ({images.length})
        </button>
        {IMAGE_CATEGORIES.filter((c) => categories.includes(c.key)).map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={cn(
              "shrink-0 h-9 px-3.5 rounded-full text-[0.8125rem] font-semibold transition-colors",
              filter === c.key ? "bg-ink text-white" : "bg-surface-2 text-ink-soft hover:bg-surface-3"
            )}
          >
            {c.label} ({images.filter((i) => i.category === c.key).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {shown.map((img) => {
          const isCover = cover === img.url;
          return (
            <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-surface-2 border border-border">
              <Image
                src={img.url}
                alt=""
                fill
                sizes="160px"
                className="object-cover"
              />

              {isCover && (
                <Badge
                  tone="bg-brand text-white ring-brand"
                  className="absolute top-1.5 left-1.5 !text-white shadow"
                >
                  <Star size={10} /> Kapak
                </Badge>
              )}

              <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/55 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                {!isCover && (
                  <button
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        await setProjectCover(projectId, img.url);
                        setCover(img.url);
                      })
                    }
                    title="Kapak yap"
                    className="h-8 w-8 rounded-lg bg-white/90 grid place-items-center text-ink hover:bg-white transition-colors"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Bu görsel silinsin mi?")) return;
                    start(() => { deleteProjectImage(img.id); });
                  }}
                  title="Sil"
                  className="h-8 w-8 rounded-lg bg-white/90 grid place-items-center text-rose-600 hover:bg-white transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <span className="absolute bottom-0 inset-x-0 bg-dark/70 text-white text-[0.5625rem] font-semibold px-1.5 py-1 truncate">
                {IMAGE_CATEGORY_LABELS[img.category] ?? img.category}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
