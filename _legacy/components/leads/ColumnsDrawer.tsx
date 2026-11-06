"use client";
import { useState, useMemo } from "react";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import InputBase from "@mui/material/InputBase";
import Tooltip from "@mui/material/Tooltip";
import { X, Columns, MagnifyingGlass } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

// ── Column definitions grouped ──────────────────────────────────────
export const COLUMN_GROUPS = [
  {
    group: "Name",
    cols: [
      { key: "leadName",   label: "Lead Name",   locked: true  },
      { key: "company",    label: "Company"                     },
      { key: "firstName",  label: "First Name"                  },
      { key: "lastName",   label: "Last Name"                   },
      { key: "title",      label: "Title"                       },
    ],
  },
  {
    group: "Contact Details",
    cols: [
      { key: "email",          label: "Email"           },
      { key: "phone",          label: "Phone"           },
      { key: "fax",            label: "Fax"             },
      { key: "mobile",         label: "Mobile"          },
      { key: "website",        label: "Website"         },
      { key: "skypeId",        label: "Skype ID"        },
      { key: "secondaryEmail", label: "Secondary Email" },
      { key: "twitter",        label: "Twitter"         },
    ],
  },
  {
    group: "Lead Information",
    cols: [
      { key: "leadSource",    label: "Lead Source"      },
      { key: "leadStatus",    label: "Lead Status"      },
      { key: "industry",      label: "Industry"         },
      { key: "noOfEmployees", label: "No of Employees"  },
      { key: "annualRevenue", label: "Annual Revenue"   },
      { key: "rating",        label: "Rating"           },
      { key: "emailOptOut",   label: "Email Opt out"    },
      { key: "description",   label: "Description"      },
    ],
  },
  {
    group: "Address",
    cols: [
      { key: "country",   label: "Country / Region"                             },
      { key: "building",  label: "Flat / House No. / Building / Apartment Name" },
      { key: "address1",  label: "Address Line 1"                               },
      { key: "city",      label: "City"                                         },
      { key: "state",     label: "State / Province"                             },
      { key: "pincode",   label: "Pincode / Zip / Postal Code"                  },
      { key: "latitude",  label: "Latitude"                                     },
      { key: "longitude", label: "Longitude"                                    },
    ],
  },
  {
    group: "System Fields",
    cols: [
      { key: "leadOwner",  label: "Lead Owner"  },
      { key: "createdBy",  label: "Created By"  },
      { key: "modifiedBy", label: "Modified By" },
      { key: "creation",   label: "Creation"    },
      { key: "modified",   label: "Modified"    },
      { key: "actions",    label: "Actions",    locked: true },
    ],
  },
] as const;

export const DEFAULT_COLUMNS = new Set([
  "leadName", "company", "email", "mobile", "leadStatus", "leadOwner", "creation", "actions",
]);

const ALL_KEYS = COLUMN_GROUPS.flatMap(g => g.cols.map(c => c.key));
const TOTAL    = ALL_KEYS.length;

interface Props {
  open: boolean;
  onClose: () => void;
  selected: Set<string>;
  onChange: (cols: Set<string>) => void;
}

export default function ColumnsDrawer({ open, onClose, selected, onChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [local, setLocal]   = useState<Set<string>>(new Set(selected));
  const [search, setSearch] = useState("");

  const toggle = (key: string, locked?: boolean) => {
    if (locked) return;
    setLocal(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleGroup = (keys: string[]) => {
    // @ts-expect-error - pre-existing type mismatch in column groups definition
    const allCols = COLUMN_GROUPS.flatMap(g => g.cols) as unknown as Array<{ key: string; label: string; locked?: boolean }>;
    const unlocked = keys.filter(k => !allCols.find(c => c.key === k && (c as { locked?: boolean }).locked));
    const allOn = unlocked.every(k => local.has(k));
    setLocal(prev => {
      const next = new Set(prev);
      unlocked.forEach(k => allOn ? next.delete(k) : next.add(k));
      return next;
    });
  };

  const selectAll    = () => setLocal(new Set(ALL_KEYS));
  const clearAll     = () => setLocal(new Set(COLUMN_GROUPS.flatMap(g => g.cols.filter(c => (c as { locked?: boolean }).locked).map(c => c.key))));
  const resetDefault = () => setLocal(new Set(DEFAULT_COLUMNS));

  const handleApply = () => { onChange(new Set(local)); onClose(); };

  const filtered = useMemo(() =>
    search ? COLUMN_GROUPS.map(g => ({
      ...g,
      cols: g.cols.filter(c => c.label.toLowerCase().includes(search.toLowerCase())),
    })).filter(g => g.cols.length > 0)
    : COLUMN_GROUPS,
  [search]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: 420, display: "flex", flexDirection: "column", bgcolor: isDark ? "#18181B" : "#F8FAFF", boxShadow: isDark ? "-12px 0 48px rgba(0,0,0,0.5)" : "-12px 0 48px rgba(12,36,114,0.12)" } }}>

      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
            <Columns size={18} color={isDark ? "#71717A" : "#1D4ED8"} weight="duotone" />
          </div>
          <div>
            <h2 className={`m-0 font-heading text-h2 tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Configure Columns</h2>
            <p className={`m-0 text-caption ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>{local.size} of {TOTAL} columns selected</p>
          </div>
        </div>
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose}
            sx={{ borderRadius: "9px", border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            <X size={17} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Search + Select All / Clear */}
      <div className={`px-5 pt-4 pb-2 border-b flex-shrink-0 space-y-3 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#EFF6FF]"}`}>
        <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 ${isDark ? "bg-[#1C1C1E] border-[#3F3F46]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
          <MagnifyingGlass size={14} color={isDark ? "#71717A" : "#94A3B8"} weight="duotone" />
          <InputBase
            placeholder="Search columns…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ flex: 1, fontSize: "0.77rem", "& input::placeholder": { color: isDark ? "#52525B" : "#94A3B8", opacity: 1 } }}
          />
          {search && (
            <button onClick={() => setSearch("")} className={`text-sm ${isDark ? "text-[#E4E4E7] hover:text-[#A1A1AA]" : "text-slate-300 hover:text-slate-500"}`}>✕</button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={selectAll}
            className={`text-button-sm px-2.5 py-1 rounded-lg transition-colors ${isDark ? "text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#27272A]" : "text-[#1D4ED8] hover:text-[#0C2472] hover:bg-[#EFF6FF]"}`}>
            Select All
          </button>
          <span className={isDark ? "text-[#3F3F46]" : "text-slate-200"}>·</span>
          <button onClick={clearAll}
            className={`text-button-sm px-2.5 py-1 rounded-lg transition-colors ${isDark ? "text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#27272A]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
            Clear
          </button>
          <span className={isDark ? "text-[#3F3F46]" : "text-slate-200"}>·</span>
          <button onClick={resetDefault}
            className={`text-button-sm px-2.5 py-1 rounded-lg transition-colors ${isDark ? "text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#27272A]" : "text-slate-400 hover:bg-[#EFF6FF]"}`}>
            Reset Default
          </button>
        </div>
      </div>

      {/* Column groups */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filtered.map(({ group, cols }) => {
          const keys      = cols.map(c => c.key as string);
          const unlocked  = cols.filter(c => !(c as { locked?: boolean }).locked).map(c => c.key as string);
          const allOn     = unlocked.every(k => local.has(k));
          const someOn    = unlocked.some(k => local.has(k));

          return (
            <div key={group} className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
              <button
                onClick={() => toggleGroup(keys)}
                className={`flex items-center gap-2 w-full px-4 py-2.5 border-b transition-colors ${isDark ? "bg-[#27272A] border-[#3F3F46] hover:bg-[#3F3F46]" : "bg-[#EFF6FF] border-[#E3ECFC] hover:bg-[#E3ECFC]"}`}
              >
                <Checkbox
                  checked={allOn}
                  indeterminate={!allOn && someOn}
                  size="small"
                  onClick={e => { e.stopPropagation(); toggleGroup(keys); }}
                  sx={{ p: 0.25, color: isDark ? "#3F3F46" : "#E2E8F0", "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "inherit" } }}
                />
                <span className={`font-heading text-nav-group-label uppercase ${isDark ? "text-[#71717A]" : "text-[#1D4ED8]"}`}>{group}</span>
                <span className={`ml-auto text-caption ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>
                  {unlocked.filter(k => local.has(k)).length} / {unlocked.length}
                </span>
              </button>

              <div className={`divide-y ${isDark ? "divide-[#27272A]" : "divide-[#EFF6FF]"}`}>
                {cols.map(col => {
                  const locked = (col as { locked?: boolean }).locked;
                  const checked = local.has(col.key as string);
                  return (
                    <label
                      key={col.key}
                      className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                        locked ? "cursor-default" : `cursor-pointer ${isDark ? "hover:bg-[#27272A]" : "hover:bg-[#EFF6FF]/60"}`
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={locked}
                        size="small"
                        onChange={() => toggle(col.key as string, locked)}
                        sx={{ p: 0.25, color: isDark ? "#3F3F46" : "#E2E8F0", "&.Mui-checked": { color: "inherit" }, "&.Mui-disabled": { color: isDark ? "#27272A" : "#E2E8F0" } }}
                      />
                      <span className={`text-body flex-1 truncate ${locked ? (isDark ? "text-[#52525B]" : "text-slate-400") : (isDark ? "text-[#D4D4D8]" : "text-slate-700")}`}>
                        {col.label}
                      </span>
                      {locked && (
                        <span className={`text-caption font-medium uppercase tracking-wide ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}>Locked</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className={`text-center py-10 text-sm ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>No columns match "{search}"</div>
        )}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between px-6 py-4 border-t flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <button onClick={onClose}
          className={`text-button-sm px-3 py-2 rounded-xl transition-colors ${isDark ? "text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#27272A]" : "text-slate-400 hover:text-slate-600 hover:bg-[#EFF6FF]"}`}>
          Cancel
        </button>
        <Button variant="contained" size="small" startIcon={<Columns size={14} weight="duotone" />}
          onClick={handleApply}
          sx={{
            bgcolor: isDark ? "#3F3F46" : "#1D4ED8",
            color: "#fff",
            borderRadius: "9px", textTransform: "none", fontWeight: 500, fontSize: "14px", px: 2.5, py: 0.9,
            boxShadow: isDark ? "none" : "0 2px 12px #1D4ED833",
            "&:hover": { bgcolor: isDark ? "#52525B" : "#1640B8", boxShadow: isDark ? "none" : "0 2px 14px #60A5FA55" },
          }}>
          Apply Columns
        </Button>
      </div>
    </Drawer>
  );
}
