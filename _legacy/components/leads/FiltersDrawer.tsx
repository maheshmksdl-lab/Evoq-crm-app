"use client";
import { useState, useEffect } from "react";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputBase from "@mui/material/InputBase";
import Tooltip from "@mui/material/Tooltip";
import { Plus, Trash, FunnelSimple } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

// ── Types ─────────────────────────────────────────
export type FilterOperator =
  | "contains" | "does_not_contain" | "equals" | "does_not_equal"
  | "starts_with" | "ends_with" | "is_empty" | "is_not_empty";

export type FilterLogic = "AND" | "OR";

export interface FilterRow {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string;
  logic: FilterLogic;
}

export type FilterColumn = { value: string; label: string };

const DEFAULT_FILTER_COLUMNS: FilterColumn[] = [
  { value: "name",       label: "CRM Lead · Lead Name"   },
  { value: "company",    label: "CRM Lead · Company"      },
  { value: "email",      label: "CRM Lead · Email"        },
  { value: "mobile",     label: "CRM Lead · Mobile"       },
  { value: "phone",      label: "CRM Lead · Phone"        },
  { value: "leadStatus", label: "CRM Lead · Lead Status"  },
  { value: "leadSource", label: "CRM Lead · Lead Source"  },
  { value: "industry",   label: "CRM Lead · Industry"     },
  { value: "rating",     label: "CRM Lead · Rating"       },
  { value: "leadOwner",  label: "CRM Lead · Lead Owner"   },
  { value: "creation",   label: "CRM Lead · Created"      },
  { value: "modified",   label: "CRM Lead · Modified"     },
];

const OPERATORS: { value: FilterOperator; label: string; noValue?: boolean }[] = [
  { value: "contains",          label: "contains"         },
  { value: "does_not_contain",  label: "doesn't contain"  },
  { value: "equals",            label: "equals"           },
  { value: "does_not_equal",    label: "doesn't equal"    },
  { value: "starts_with",       label: "starts with"      },
  { value: "ends_with",         label: "ends with"        },
  { value: "is_empty",          label: "is empty",        noValue: true },
  { value: "is_not_empty",      label: "is not empty",    noValue: true },
];

const uid = () => Math.random().toString(36).slice(2, 8);

interface Props {
  anchor: HTMLElement | null;
  onClose: () => void;
  filters: FilterRow[];
  onChange: (filters: FilterRow[]) => void;
  columns?: FilterColumn[];
  subtitle?: string;
}

export default function FiltersDrawer({ anchor, onClose, filters, onChange, columns, subtitle }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const open = Boolean(anchor);

  const SELECT_SX = {
    fontSize: "14px",
    ...(isDark ? {} : { bgcolor: "#fff" }),
    borderRadius: "8px",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#3F3F46" : "#E2E8F0", borderWidth: 1.5 },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#52525B" : "#CBD5E1" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#71717A" : "#1D4ED8", borderWidth: 1.5 },
    "&.Mui-focused": { boxShadow: "none" },
    "& .MuiSelect-select": { py: "8px", px: "10px" },
  };

  const FILTER_COLUMNS = columns ?? DEFAULT_FILTER_COLUMNS;
  const firstCol = FILTER_COLUMNS[0]?.value ?? "name";
  const defaultRow: Omit<FilterRow, "id"> = { column: firstCol, operator: "contains", value: "", logic: "AND" };

  const [local, setLocal] = useState<FilterRow[]>(
    filters.length ? filters : [{ id: uid(), ...defaultRow }]
  );

  // Re-sync local rows to the active filters whenever the popover opens,
  // so unapplied edits from a previous open don't linger.
  useEffect(() => {
    if (open) setLocal(filters.length ? filters : [{ id: uid(), ...defaultRow }]);
  }, [open]);

  const update = (id: string, patch: Partial<FilterRow>) =>
    setLocal(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const addRow = () =>
    setLocal(prev => [...prev, { id: uid(), ...defaultRow, logic: "AND" }]);

  const removeRow = (id: string) =>
    setLocal(prev => prev.length === 1 ? prev : prev.filter(r => r.id !== id));

  const handleApply = () => { onChange(local.filter(r => r.value || OPERATORS.find(o => o.value === r.operator)?.noValue)); onClose(); };
  const handleClear = () => { setLocal([{ id: uid(), ...defaultRow }]); onChange([]); };

  const activeCount = filters.filter(r => r.value || OPERATORS.find(o => o.value === r.operator)?.noValue).length;

  return (
    <Popover
      open={open} anchorEl={anchor} onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{
        sx: {
          width: 460,
          maxHeight: "70vh",
          borderRadius: "14px",
          border: `1.5px solid ${isDark ? "#27272A" : "#E3ECFC"}`,
          boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.14)",
          mt: 0.5,
          overflow: "hidden",
          bgcolor: isDark ? "#18181B" : "#fff",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between gap-2.5 px-4 py-3 border-b flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
        <div className="flex items-center gap-2">
          <FunnelSimple size={16} color={isDark ? "#E4E4E7" : "#1D4ED8"} weight="duotone" />
          <p className={`m-0 font-heading text-h2 ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Filters</p>
          {activeCount > 0 && (
            <span className={`text-badge-text px-2 py-0.5 rounded-full ${isDark ? "bg-[#27272A] text-[#A1A1AA]" : "bg-white text-[#1D4ED8]"}`}>
              {activeCount} active
            </span>
          )}
        </div>
        {subtitle && <span className={`text-caption ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>{subtitle}</span>}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="relative">
          {local.map((row, idx) => {
            const noValue = OPERATORS.find(o => o.value === row.operator)?.noValue;
            return (
              <div key={row.id} className="relative">
                {/* Connector: vertical line + AND/OR segmented toggle between rows */}
                {idx > 0 && (
                  <div className="flex items-center gap-3 py-2 pl-4">
                    <div className={`inline-flex rounded-lg p-0.5 ${isDark ? "bg-[#27272A]" : "bg-slate-100"}`}>
                      {(["AND", "OR"] as FilterLogic[]).map(l => (
                        <button key={l} onClick={() => update(row.id, { logic: l })}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all ${
                            row.logic === l
                              ? isDark ? "bg-[#3F3F46] text-[#F4F4F5] shadow-sm" : "bg-white text-[#1D4ED8] shadow-sm"
                              : isDark ? "text-[#71717A] hover:text-[#A1A1AA]" : "text-slate-400 hover:text-slate-600"
                          }`}>
                          {l}
                        </button>
                      ))}
                    </div>
                    <div className={`flex-1 h-px ${isDark ? "bg-[#27272A]" : "bg-slate-100"}`} />
                  </div>
                )}

                {/* Condition card */}
                <div className={`rounded-xl border p-3 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex gap-2">
                        {/* Column */}
                        <FormControl size="small" sx={{ flex: "1.3 1 0" }}>
                          <Select value={row.column} onChange={e => update(row.id, { column: e.target.value })} sx={SELECT_SX}>
                            {FILTER_COLUMNS.map(c => (
                              <MenuItem key={c.value} value={c.value} sx={{ fontSize: "14px" }}>{c.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {/* Operator */}
                        <FormControl size="small" sx={{ flex: "1 1 0" }}>
                          <Select value={row.operator} onChange={e => update(row.id, { operator: e.target.value as FilterOperator })} sx={SELECT_SX}>
                            {OPERATORS.map(o => (
                              <MenuItem key={o.value} value={o.value} sx={{ fontSize: "14px" }}>{o.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>

                      {/* Value */}
                      {!noValue && (
                        <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-all ${
                          isDark
                            ? "bg-[#111113] border-[#3F3F46] focus-within:border-[#71717A]"
                            : "bg-white border-slate-200 focus-within:border-[#1D4ED8]"
                        }`}>
                          <InputBase
                            fullWidth
                            placeholder="Enter value…"
                            value={row.value}
                            onChange={e => update(row.id, { value: e.target.value })}
                            sx={{ fontSize: "14px", color: isDark ? "#D4D4D8" : "#1E293B", "& input::placeholder": { color: isDark ? "#52525B" : "#94A3B8", opacity: 1 } }}
                          />
                        </div>
                      )}
                      {noValue && (
                        <div className={`flex items-center px-3 py-2 rounded-lg border ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-white border-slate-100"}`}>
                          <p className={`m-0 text-caption italic ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>No value needed for this condition</p>
                        </div>
                      )}
                    </div>

                    {/* Remove — only shown when there's more than one condition, since at
                        least one must always remain (clicking it on the last row would be a no-op) */}
                    {local.length > 1 && (
                      <Tooltip title="Remove condition">
                        <IconButton size="small" onClick={() => removeRow(row.id)}
                          sx={{ borderRadius: "8px", flexShrink: 0, "&:hover": { bgcolor: isDark ? "#27272A" : "#FEF2F2" } }}>
                          <Trash size={15} color={isDark ? "#71717A" : "#94A3B8"} weight="bold" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add condition */}
        <button onClick={addRow}
          className={`flex items-center justify-center gap-2 text-button-sm py-2 px-3 rounded-xl border border-dashed transition-all w-full mt-3 ${
            isDark
              ? "text-[#A1A1AA] border-[#3F3F46] hover:border-[#52525B] hover:bg-[#27272A]"
              : "text-[#1D4ED8] border-[#CBD5E1] hover:border-[#1D4ED8] hover:bg-[#EFF6FF]"
          }`}>
          <Plus size={14} weight="bold" />
          Add condition
        </button>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between px-4 py-3 border-t flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <button onClick={handleClear}
          className={`text-button-sm px-3 py-2 rounded-lg transition-colors ${isDark ? "text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#27272A]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
          Clear all
        </button>
        <Button variant="contained" size="small" startIcon={<FunnelSimple size={14} weight="bold" />}
          onClick={handleApply}
          sx={{
            bgcolor: isDark ? "#3F3F46" : "#1D4ED8",
            color: "#fff",
            borderRadius: "9px", textTransform: "none", fontWeight: 500, fontSize: "14px", px: 2.5, py: 0.9,
            boxShadow: isDark ? "none" : "0 2px 12px #1D4ED833",
            "&:hover": { bgcolor: isDark ? "#52525B" : "#1640B8", boxShadow: isDark ? "none" : "0 2px 14px #60A5FA55" },
          }}>
          Apply filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </div>
    </Popover>
  );
}
