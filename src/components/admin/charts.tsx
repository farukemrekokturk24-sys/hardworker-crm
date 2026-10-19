"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid,
} from "recharts";

const BRAND = "#126fb2";

const PALETTE = [
  "#126fb2", "#2f9e8f", "#c9a227", "#8b5cf6",
  "#ef4444", "#06b6d4", "#f97316", "#64748b", "#ec4899",
];

const axisStyle = { fontSize: 11, fill: "#6b7684" };

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e6ec",
  boxShadow: "0 8px 24px -12px rgb(15 23 34 / 0.25)",
  fontSize: 13,
  padding: "8px 12px",
};

export function LeadTrendChart({
  data,
}: {
  data: { label: string; leads: number }[];
}) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
          <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} width={38} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [`${Number(v ?? 0)} lead`, ""]}
            labelFormatter={(l) => `${l} haftası`}
          />
          <Area
            type="monotone"
            dataKey="leads"
            stroke={BRAND}
            strokeWidth={2.5}
            fill="url(#leadFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SourcePieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  if (!data.length) {
    return (
      <div className="h-[240px] grid place-items-center text-sm text-muted">
        Veri yok
      </div>
    );
  }
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            verticalAlign="bottom"
            height={48}
            iconType="circle"
            iconSize={8}
            formatter={(v) => (
              <span style={{ fontSize: 11, color: "#3b4452" }}>{v}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusBarChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
          <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} width={38} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#eef1f5" }} />
          <Bar dataKey="value" fill={BRAND} radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueBarChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 6, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
          <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            width={60}
            tickFormatter={(v) => `£${Math.round(v / 1000)}K`}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [`£${new Intl.NumberFormat("tr-TR").format(Number(v ?? 0))}`, "Tutar"]}
            cursor={{ fill: "#eef1f5" }}
          />
          <Bar dataKey="value" fill="#2f9e8f" radius={[6, 6, 0, 0]} maxBarSize={56} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
