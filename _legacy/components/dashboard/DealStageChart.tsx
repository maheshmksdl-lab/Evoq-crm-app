"use client";
import SourceReportLink from "@/components/shared/SourceReportLink";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const STAGES_LIGHT = [
  { name: "Qualification", deals: 425, color: "#0C2472" },
  { name: "Needs Analysis", deals: 287, color: "#10B981" },
  { name: "Value Prop.", deals: 198, color: "#3B82F6" },
  { name: "Decision", deals: 156, color: "#3B82F6" },
  { name: "Proposal", deals: 124, color: "#F59E0B" },
  { name: "Negotiation", deals: 93, color: "#EC4899" },
];

const STAGES_DARK = [
  { name: "Qualification", deals: 425, color: "#60A5FA" },
  { name: "Needs Analysis", deals: 287, color: "#34D399" },
  { name: "Value Prop.", deals: 198, color: "#FBBF24" },
  { name: "Decision", deals: 156, color: "#F472B6" },
  { name: "Proposal", deals: 124, color: "#A78BFA" },
  { name: "Negotiation", deals: 93, color: "#38BDF8" },
];

const TOTAL = STAGES_LIGHT.reduce((s, d) => s + d.deals, 0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const pct = ((payload[0].value / TOTAL) * 100).toFixed(1);
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-white/10">
      <p className="text-slate-400 text-[12px] mb-1">{label}</p>
      <p className="font-bold text-[15px]">{payload[0].value} deals</p>
      <p className="text-slate-400 text-[12px] mt-0.5">{pct}% of pipeline</p>
    </div>
  );
};

export default function DealStageChart({ isDark = false }: { isDark?: boolean }) {
  const stages = isDark ? STAGES_DARK : STAGES_LIGHT;
  return (
    <div className="rounded-2xl p-6 border h-full backdrop-blur-xl transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#18181B" : "rgba(255, 255, 255, 0.6)",
        borderColor: isDark ? "#27272A" : "rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}>
      <div className="mb-5">
        <h3 className={`m-0 text-[14px] font-bold ${isDark ? "text-white" : "text-[#0C2472]"}`}>Pipeline by Stage</h3>
        <p className="text-[12px] text-slate-400 mt-0.5">Active deals distribution</p>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <BarChart
          data={stages}
          layout="vertical"
          margin={{ top: 0, right: 28, left: 0, bottom: 0 }}
          barSize={11}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: isDark ? "#9CA3AF" : "#6B7280", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={82}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? "#18181B" : "#EFF6FF" }} />
          <Bar dataKey="deals" radius={[0, 6, 6, 0]}>
            <LabelList
              dataKey="deals"
              position="right"
              style={{ fontSize: 10.5, fill: "#94A3B8", fontWeight: 600 }}
            />
            {stages.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <SourceReportLink reportId="r2" reportName="Deal with Stage" isDark={isDark} className="-mx-6 -mb-6 mt-4 rounded-b-2xl" />
    </div>
  );
}

