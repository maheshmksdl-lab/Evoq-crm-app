"use client";
import { useState } from "react";
import Popover from "@mui/material/Popover";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { ArrowUp, ArrowDown, Plus, Trash, SortAscending } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

export interface SortRow {
  id: string;
  column: string;
  dir: "asc" | "desc";
}

const SORT_COLUMNS = [
  { value: "name",          label: "Lead Name"      },
  { value: "company",       label: "Company"         },
  { value: "email",         label: "Email"           },
  { value: "leadStatus",    label: "Lead Status"     },
  { value: "leadSource",    label: "Lead Source"     },
  { value: "industry",      label: "Industry"        },
  { value: "rating",        label: "Rating"          },
  { value: "leadOwner",     label: "Lead Owner"      },
  { value: "creation",      label: "Created Date"    },
  { value: "modified",      label: "Modified Date"   },
  { value: "annualRevenue", label: "Annual Revenue"  },
];

const uid = () => Math.random().toString(36).slice(2, 8);

interface Props {
  anchor: HTMLElement | null;
  onClose: () => void;
  sorts: SortRow[];
  onChange: (sorts: SortRow[]) => void;
  columns?: { value: string; label: string }[];
}

export default function SortPopover({ anchor, onClose, sorts, onChange, columns = SORT_COLUMNS }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const SELECT_SX = {
    fontSize: "0.78rem",
    ...(isDark ? {} : { bgcolor: "#EFF6FF" }),
    borderRadius: "8px",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#3F3F46" : "#E3ECFC", borderWidth: 1.5 },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#52525B" : "#E3ECFC" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#71717A" : "#E3ECFC", borderWidth: 2 },
    "&.Mui-focused": { boxShadow: "none" },
    "& .MuiSelect-select": { py: "6px", px: "10px" },
  };

  const [local, setLocal] = useState<SortRow[]>(
    sorts.length ? sorts : [{ id: uid(), column: columns[0].value, dir: "asc" }]
  );

  const update = (id: string, patch: Partial<SortRow>) =>
    setLocal(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const add = () => setLocal(prev => [...prev, { id: uid(), column: columns[columns.length - 1].value, dir: "desc" }]);
  const remove = (id: string) => setLocal(prev => prev.filter(r => r.id !== id));

  const handleApply = () => { onChange(local); onClose(); };
  const handleClear = () => { setLocal([{ id: uid(), column: columns[0].value, dir: "asc" }]); onChange([]); onClose(); };

  return (
    <Popover
      open={Boolean(anchor)} anchorEl={anchor} onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          borderRadius: "14px",
          border: `1.5px solid ${isDark ? "#27272A" : "#E3ECFC"}`,
          boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.14)",
          mt: 0.5,
          overflow: "hidden",
          bgcolor: isDark ? "#18181B" : "#fff",
        },
      }}
    >
      <div className="w-[380px]">
        {/* Popover header */}
        <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
          <SortAscending size={16} color={isDark ? "#E4E4E7" : "#1D4ED8"} weight="duotone" />
          <p className={`m-0 font-heading text-h2 ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>Sort Records</p>
          <span className={`ml-auto text-caption ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>{local.length} sort{local.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Sort rows */}
        <div className="p-3 space-y-2">
          {local.map((row, idx) => (
            <div key={row.id} className="flex items-center gap-2">
              {/* Priority label */}
              <span className={`font-heading text-nav-group-label uppercase w-10 flex-shrink-0 ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>
                {idx === 0 ? "By" : "Then"}
              </span>

              {/* Column */}
              <FormControl size="small" sx={{ flex: 1 }}>
                <Select value={row.column} onChange={e => update(row.id, { column: e.target.value })} sx={SELECT_SX}>
                  {columns.map(c => (
                    <MenuItem key={c.value} value={c.value} sx={{ fontSize: "0.77rem" }}>{c.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Direction toggle */}
              <div className={`flex items-center rounded-lg border p-0.5 gap-0.5 ${isDark ? "bg-[#27272A] border-[#3F3F46]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
                {(["asc", "desc"] as const).map(dir => (
                  <Tooltip key={dir} title={dir === "asc" ? "Ascending A→Z / 0→9" : "Descending Z→A / 9→0"}>
                    <button
                      onClick={() => update(row.id, { dir })}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        row.dir === dir
                          ? isDark ? "bg-[#3F3F46] text-[#F4F4F5] shadow-sm" : "bg-[#1D4ED8] text-white shadow-sm"
                          : isDark ? "text-[#71717A] hover:text-[#A1A1AA]" : "text-slate-400 hover:text-slate-600"
                      }`}>
                      {dir === "asc"
                        ? <ArrowUp size={12} weight="duotone" />
                        : <ArrowDown size={12} weight="duotone" />
                      }
                      {dir === "asc" ? "Asc" : "Desc"}
                    </button>
                  </Tooltip>
                ))}
              </div>

              {/* Remove */}
              {local.length > 1 && (
                <IconButton size="small" onClick={() => remove(row.id)}
                  sx={{ borderRadius: "6px", p: 0.5, "&:hover": { bgcolor: isDark ? "#27272A" : "#FEF2F2" } }}>
                  <Trash size={13} color="#EF4444" weight="duotone" />
                </IconButton>
              )}
            </div>
          ))}

          {/* Add sort */}
          {local.length < 3 && (
            <button onClick={add}
              className={`flex items-center gap-1.5 text-button-sm py-1.5 px-2 rounded-lg transition-colors w-full ${
                isDark
                  ? "text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#27272A]"
                  : "text-[#1D4ED8] hover:text-[#0C2472] hover:bg-[#EFF6FF]"
              }`}>
              <Plus size={12} weight="bold" />
              Add sort
            </button>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#EFF6FF]"}`}>
          <button onClick={handleClear}
            className={`text-button-sm px-2 py-1 rounded-lg transition-colors ${isDark ? "text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#27272A]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
            Clear
          </button>
          <Button variant="contained" size="small" onClick={handleApply}
            sx={{
              bgcolor: isDark ? "#3F3F46" : "#1D4ED8",
              color: "#fff",
              borderRadius: "8px", textTransform: "none", fontWeight: 500, fontSize: "13px", px: 2,
              boxShadow: isDark ? "none" : undefined,
              "&:hover": { bgcolor: isDark ? "#52525B" : "#1640B8", boxShadow: isDark ? "none" : undefined },
            }}>
            Apply Sort
          </Button>
        </div>
      </div>
    </Popover>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Tooltip({ title, children }: { title: string; children: any }) {
  return <div title={title}>{children}</div>;
}
