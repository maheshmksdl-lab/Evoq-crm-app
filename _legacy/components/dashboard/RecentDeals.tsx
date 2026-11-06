"use client";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { ArrowSquareOut, TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import { OWNER_AVATARS } from "@/lib/avatars";
import SourceReportLink from "@/components/shared/SourceReportLink";

type Deal = {
  id: string; name: string; amount: number;
  stage: string; stageBg: string; stageFg: string;
  owner: string; initials: string; avatarBg: string;
  closeDate: string; change: "up" | "same" | "down";
};

const deals: Deal[] = [
  { id:"CRM-2026-0013", name:"Sweany Inc",     amount:29999,  stage:"Qualification",  stageBg:"#EFF6FF", stageFg:"#0C2472", owner:"PM SDL",   initials:"PM", avatarBg:"#1D4ED8", closeDate:"15 May", change:"same" },
  { id:"CRM-2026-0012", name:"TechFlow Ltd",   amount:85000,  stage:"Proposal",       stageBg:"#E3ECFC", stageFg:"#0C2472", owner:"Sarah K",  initials:"SK", avatarBg:"#3B82F6", closeDate:"12 May", change:"up"   },
  { id:"CRM-2026-0011", name:"Apex Solutions", amount:42500,  stage:"Needs Analysis", stageBg:"#EFF6FF", stageFg:"#0C2472", owner:"John D",   initials:"JD", avatarBg:"#2E9E7B", closeDate:"10 May", change:"up"   },
  { id:"CRM-2026-0010", name:"Matrix Corp",    amount:120000, stage:"Negotiation",    stageBg:"#E3ECFC", stageFg:"#0C2472", owner:"PM SDL",   initials:"PM", avatarBg:"#1D4ED8", closeDate:"08 May", change:"up"   },
  { id:"CRM-2026-0009", name:"Pixel Studios",  amount:18750,  stage:"Qualification",  stageBg:"#EFF6FF", stageFg:"#0C2472", owner:"Ria M",    initials:"RM", avatarBg:"#0C2472", closeDate:"05 May", change:"down" },
];

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function RecentDeals({ isDark = false }: { isDark?: boolean }) {
  const cellSx = {
    borderBottom: `1px solid ${isDark ? "#27272A" : "#E3ECFC"}`,
    py: "14px",
    backgroundColor: isDark ? "#18181B" : "#f9fbff",
  };

  return (
    <div className="rounded-xl sm:rounded-2xl border overflow-hidden backdrop-blur-xl transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#18181B" : "rgba(255, 255, 255, 0.6)",
        borderColor: isDark ? "#27272A" : "rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}>
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-3.5 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}
        style={{ backgroundColor: isDark ? "#18181B" : undefined }}>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <h3 className={`text-sm sm:text-[14px] font-bold leading-none m-0 ${isDark ? "text-[#FFFFFF]" : "text-[#0C2472]"}`}>Recent Deals</h3>
          <span className="text-[11px] sm:text-[12px] text-slate-400 leading-none">· 5 latest active deals</span>
        </div>
        <Button
          size="small"
          endIcon={<ArrowSquareOut size={12} weight="duotone" />}
          sx={{ textTransform:"none", fontSize:"0.7rem", color: isDark ? "#9CA3AF" : "#1D4ED8", fontWeight:700, borderRadius:"8px", "&:hover":{ bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(96, 165, 250, 0.1)" } }}
        >
          View All
        </Button>
      </div>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {["Deal", "Amount", "Stage", "Owner", "Close Date"].map(h => (
                <TableCell key={h} sx={{ backgroundColor: isDark ? "#111111" : "#EFF6FF", color: isDark ? "#9CA3AF" : "#0C2472", borderBottom: `1px solid ${isDark ? "#27272A" : "#E3ECFC"}`, fontWeight: 700, fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {deals.map(deal => (
              <TableRow key={deal.id} hover sx={{ "&:hover td":{ bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(29,78,216,0.04)" }, cursor:"pointer", "& td": cellSx }}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-[13px] h-[13px] flex items-center justify-center flex-shrink-0">
                      {deal.change === "up" && <TrendUp size={13} color="#10B981" weight="duotone" />}
                      {deal.change === "down" && <TrendDown size={13} color="#EF4444" weight="duotone" />}
                      {deal.change === "same" && <Minus size={11} color="#94A3B8" weight="bold" />}
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <p className={`text-[14px] font-semibold leading-tight ${isDark ? "text-[#E2E8F0]" : "text-slate-800"}`}>{deal.name}</p>
                      <p className="text-[12px] text-slate-400 font-mono">{deal.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`text-[14px] font-bold ${isDark ? "text-[#FFFFFF]" : "text-slate-800"}`}>{fmt(deal.amount)}</span>
                </TableCell>
                <TableCell>
                  <Chip label={deal.stage} size="small" sx={{ bgcolor: isDark ? "rgba(39,39,42,0.8)" : deal.stageBg, color: isDark ? "#A1A1AA" : deal.stageFg, fontWeight:700, fontSize:"0.65rem", height:20, borderRadius:"5px" }} />
                </TableCell>
                <TableCell>
                  <Tooltip title={deal.owner}>
                    <div className="flex items-center gap-1.5">
                      <Avatar
                        src={OWNER_AVATARS[deal.owner]}
                        sx={{ width:22, height:22, bgcolor:deal.avatarBg, fontSize:"0.58rem", fontWeight:700 }}
                      >
                        {deal.initials}
                      </Avatar>
                      <span className={`text-[11.5px] font-medium ${isDark ? "text-[#94A3B8]" : "text-slate-600"}`}>{deal.owner}</span>
                    </div>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <span className="text-[12px] text-slate-400 font-medium">{deal.closeDate}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <SourceReportLink reportId="r1" reportName="Deal 30" isDark={isDark} className="rounded-b-2xl" />
    </div>
  );
}

