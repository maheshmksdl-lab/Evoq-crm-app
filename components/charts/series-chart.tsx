"use client";

import { useId, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SeriesPoint } from "@/lib/domain/metrics";
import { money, num } from "@/lib/domain/format";
import type { Visualization } from "@/lib/schemas";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-5)", "var(--chart-4)", "var(--chart-6)", "var(--chart-7)", "var(--chart-3)"];

const fmt = (kind: "money" | "count", v: number) => (kind === "money" ? money(v, { compact: true }) : num(v));

/** One series (or two when `secondary` is present) rendered as bar/column/line/area/pie/donut. */
export function SeriesChart({ series, labels, kind = "count", visualization = "column", height = 240, title }: {
  series: SeriesPoint[]; labels?: [string, string?]; kind?: "money" | "count"; visualization?: Visualization | null; height?: number; title: string;
}) {
  const [table, setTable] = useState(false);
  const id = useId();
  const two = series.some((p) => p.secondary !== undefined) && labels?.[1] && labels[1] !== "Deals";
  const v = visualization ?? "column";
  const k1 = labels?.[0] ?? "Value";
  const k2 = labels?.[1] ?? "Secondary";
  const data = series.map((p) => ({ name: p.label, [k1]: p.value, ...(two ? { [k2]: p.secondary ?? 0 } : {}) }));
  const axis = { stroke: "var(--chart-axis)", fontSize: 12, tickLine: false, axisLine: false } as const;
  const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--popover-foreground)" }, formatter: (val: unknown) => fmt(kind, Number(val)) };
  const summary = `${title}. ${series.map((p) => `${p.label}: ${fmt(kind, p.value)}`).join("; ")}`;

  let chart: React.ReactNode;
  if (v === "pie" || v === "donut") {
    chart = (
      <PieChart>
        <Pie data={data} dataKey={k1} nameKey="name" innerRadius={v === "donut" ? "55%" : 0} outerRadius="85%" paddingAngle={1} stroke="var(--card)">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    );
  } else if (v === "line") {
    chart = (
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="name" {...axis} /><YAxis {...axis} width={56} tickFormatter={(x) => fmt(kind, x)} /><Tooltip {...tip} />
        <Line dataKey={k1} stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />{two && <Line dataKey={k2} stroke={COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />}{two && <Legend wrapperStyle={{ fontSize: 12 }} />}</LineChart>
    );
  } else if (v === "area") {
    chart = (
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="name" {...axis} /><YAxis {...axis} width={56} tickFormatter={(x) => fmt(kind, x)} /><Tooltip {...tip} />
        <Area dataKey={k1} stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.15} strokeWidth={2} />{two && <Area dataKey={k2} stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.15} strokeWidth={2} />}{two && <Legend wrapperStyle={{ fontSize: 12 }} />}</AreaChart>
    );
  } else {
    const horizontal = v === "bar";
    chart = (
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="22%">
        <CartesianGrid stroke="var(--chart-grid)" vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? <><XAxis type="number" {...axis} tickFormatter={(x) => fmt(kind, x)} /><YAxis type="category" dataKey="name" {...axis} width={120} /></> : <><XAxis dataKey="name" {...axis} /><YAxis {...axis} width={56} tickFormatter={(x) => fmt(kind, x)} /></>}
        <Tooltip {...tip} cursor={{ fill: "var(--hover)" }} />
        <Bar dataKey={k1} fill={COLORS[0]} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} />{two && <Bar dataKey={k2} fill={COLORS[2]} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} />}{two && <Legend wrapperStyle={{ fontSize: 12 }} />}
      </BarChart>
    );
  }
  return (
    <div>
      <div role="img" aria-label={summary} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">{chart as React.ReactElement}</ResponsiveContainer>
      </div>
      <button type="button" onClick={() => setTable((t) => !t)} aria-expanded={table} aria-controls={id} className="mt-1 text-caption text-ink-muted hover:text-crm-primary">{table ? "Hide data table" : "View as table"}</button>
      <div id={id} hidden={!table}>
        <table className="mt-1 w-full text-caption"><thead><tr className="text-left text-ink-muted"><th className="py-1 font-medium">Group</th><th className="py-1 text-right font-medium">{k1}</th>{two && <th className="py-1 text-right font-medium">{k2}</th>}</tr></thead>
          <tbody>{series.map((p) => <tr key={p.label} className="border-t border-line-soft"><td className="py-1">{p.label}</td><td className="py-1 text-right tabular">{fmt(kind, p.value)}</td>{two && <td className="py-1 text-right tabular">{fmt(kind, p.secondary ?? 0)}</td>}</tr>)}</tbody></table>
      </div>
    </div>
  );
}
