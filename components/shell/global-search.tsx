"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useSearch } from "@/lib/query/hooks";
import { recordHref } from "@/lib/domain/names";
import { cn } from "@/lib/utils";

const LABEL: Record<string, string> = { leads: "Lead", contacts: "Contact", accounts: "Account", deals: "Deal", tasks: "Task", calls: "Call", meetings: "Meeting" };

export function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Search the CRM (Ctrl K)"
      className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card/80 px-3 text-left text-body text-ink-muted outline-none transition-colors hover:border-crm-hover focus-visible:ring-3 focus-visible:ring-ring/50 md:max-w-md"
    >
      <MagnifyingGlassIcon className="size-4 shrink-0" />
      <span className="truncate">Search across EVOQ CRM…</span>
      <kbd className="ml-auto hidden rounded border border-line px-1.5 text-micro text-ink-faint md:block">Ctrl K</kbd>
    </button>
  );
}

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="top-[18%] translate-y-0 gap-0 p-0 sm:max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search leads, contacts, accounts, deals, tasks, calls and meetings</DialogDescription>
        {/* mounted only while the dialog is open, so the query and highlight reset every time */}
        <SearchBody onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function SearchBody({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activeRaw, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 150);
    return () => clearTimeout(t);
  }, [q]);
  const { data = [], isFetching } = useSearch(debounced);
  const active = Math.max(0, Math.min(activeRaw, data.length - 1));

  const go = (i: number) => {
    const r = data[i];
    if (!r) return;
    onDone();
    router.push(recordHref(r.module, r.id));
  };

  return (
    <>
      <div className="flex items-center gap-2 border-b border-line px-4">
        <MagnifyingGlassIcon className="size-4 text-ink-muted" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={data[active] ? `${listId}-${active}` : undefined}
          placeholder="Search leads, contacts, accounts, deals…"
          className="h-12 w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-faint"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive(Math.min(active + 1, data.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
            if (e.key === "Enter") { e.preventDefault(); go(active); }
          }}
        />
      </div>
      <div id={listId} role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-1.5 scrollbar-thin">
        {debounced.trim().length < 2 ? (
          <p className="px-3 py-6 text-center text-body text-ink-muted">Type at least 2 characters to search.</p>
        ) : isFetching && !data.length ? (
          <p className="px-3 py-6 text-center text-body text-ink-muted">Searching…</p>
        ) : !data.length ? (
          <p className="px-3 py-6 text-center text-body text-ink-muted">No results for “{debounced}”.</p>
        ) : (
          data.map((r, i) => (
            <button
              key={`${r.module}-${r.id}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => go(i)}
              className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left outline-none", i === active && "bg-crm-surface dark:bg-info-bg")}
            >
              <span className="w-16 shrink-0 text-caption font-medium text-crm-primary">{LABEL[r.module]}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-body font-medium text-ink">{r.title}</span>{r.subtitle && <span className="block truncate text-caption text-ink-muted">{r.subtitle}</span>}</span>
            </button>
          ))
        )}
      </div>
    </>
  );
}
