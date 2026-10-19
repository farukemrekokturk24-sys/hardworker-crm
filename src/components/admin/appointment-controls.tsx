"use client";

import { useState, useTransition } from "react";
import { updateAppointmentStatus } from "@/app/panel/(crm)/actions";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { selectClass, inputClass } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function AppointmentStatusControl({
  id,
  value,
}: {
  id: string;
  value: string;
}) {
  const [pending, start] = useTransition();
  const [v, setV] = useState(value);

  return (
    <select
      value={v}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setV(next);
        start(() => { updateAppointmentStatus(id, next); });
      }}
      className={cn(selectClass, "!h-10 !w-auto min-w-[140px] text-[0.8125rem]")}
      aria-label="Randevu durumu"
    >
      {Object.entries(APPOINTMENT_STATUS_LABELS).map(([k, label]) => (
        <option key={k} value={k}>{label}</option>
      ))}
    </select>
  );
}

export { inputClass };
