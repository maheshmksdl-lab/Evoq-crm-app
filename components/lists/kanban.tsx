"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface KanbanDef<R> {
  groupOf: (r: R) => string;
  groups: readonly string[];
  card: (r: R) => ReactNode;
  title: (r: R) => string;
  /** returns a promise so the board can show failure; rejections are surfaced by the mutation toast */
  move: (r: R, group: string) => void;
  summary?: (rows: R[]) => ReactNode;
}

/** Drag-and-drop board with a keyboard/touch-accessible "Move to…" menu on every card. */
export function KanbanBoard<R extends { id: string }>({ rows, def, rowHref, canMove }: { rows: R[]; def: KanbanDef<R>; rowHref: (r: R) => string; canMove: boolean }) {
  const [over, setOver] = useState<string | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  return (
    <div className="flex gap-3 overflow-x-auto p-4 scrollbar-thin" role="list" aria-label="Board">
      {def.groups.map((g) => {
        const items = rows.filter((r) => def.groupOf(r) === g);
        return (
          <section
            key={g} role="listitem" aria-label={g}
            onDragOver={(e) => { if (canMove) { e.preventDefault(); setOver(g); } }}
            onDragLeave={() => setOver((o) => (o === g ? null : o))}
            onDrop={(e) => {
              e.preventDefault(); setOver(null);
              const id = e.dataTransfer.getData("text/plain") || drag;
              const r = rows.find((x) => x.id === id);
              if (r && def.groupOf(r) !== g) def.move(r, g);
              setDrag(null);
            }}
            className={cn("flex w-[272px] shrink-0 flex-col rounded-xl border border-line bg-surface-subtle/70 transition-colors", over === g && "border-crm-primary bg-crm-surface")}
          >
            <header className="flex items-center justify-between px-3 py-2.5">
              <h3 className="text-card-title text-heading">{g}</h3>
              <span className="rounded-full bg-card px-2 text-caption text-ink-muted tabular">{items.length}</span>
            </header>
            {def.summary && <p className="px-3 pb-2 text-caption text-ink-muted">{def.summary(items)}</p>}
            <ul className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
              {items.map((r) => (
                <li key={r.id} draggable={canMove} onDragStart={(e) => { e.dataTransfer.setData("text/plain", r.id); setDrag(r.id); }} onDragEnd={() => setDrag(null)}
                  className={cn("group relative rounded-lg border border-line bg-card p-3 shadow-card", canMove && "cursor-grab active:cursor-grabbing", drag === r.id && "opacity-50")}>
                  <Link href={rowHref(r)} className="block outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:rounded-lg">{def.card(r)}</Link>
                  {canMove && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" aria-label={`Move ${def.title(r)} to another column`} className="absolute right-1.5 top-1.5 z-10 opacity-0 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"><ArrowsLeftRightIcon /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Move to</DropdownMenuLabel>
                        {def.groups.filter((x) => x !== g).map((x) => <DropdownMenuItem key={x} onSelect={() => def.move(r, x)}>{x}</DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </li>
              ))}
              {items.length === 0 && <li className="grid flex-1 place-items-center rounded-lg border border-dashed border-line px-3 py-6 text-center text-caption text-ink-faint">{canMove ? "Drop here" : "Empty"}</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
