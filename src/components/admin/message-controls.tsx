"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { markMessageHandled } from "@/app/panel/(crm)/actions";

export function MarkHandledButton({ id }: { id: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => start(() => { markMessageHandled(id); })}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[0.75rem] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-60"
    >
      {pending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
      Yanıtlandı
    </button>
  );
}
