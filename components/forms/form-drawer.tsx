"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/shared/primitives";

/**
 * Shared drawer chrome for every create/edit form: title, scrolling body, sticky footer,
 * and unsaved-change protection (closing a dirty form asks first).
 */
export function FormDrawer({ open, onClose, title, description, dirty, submitLabel, submitting, onSubmit, children, width = "sm:max-w-xl", formId, hideSubmit }: {
  open: boolean; onClose: () => void; title: string; description?: string; dirty: boolean; submitLabel: string; submitting: boolean;
  onSubmit?: () => void; children: ReactNode; width?: string; formId?: string; hideSubmit?: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  const requestClose = () => (dirty && !submitting ? setConfirm(true) : onClose());
  return (
    <>
      <Sheet open={open} onOpenChange={(o) => { if (!o) requestClose(); }}>
        <SheetContent side="right" className={`w-full gap-0 p-0 ${width}`}>
          <SheetHeader className="border-b border-line px-5 py-4">
            <SheetTitle className="text-section text-heading">{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : <SheetDescription className="sr-only">{title}</SheetDescription>}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">{children}</div>
          <SheetFooter className="flex-row justify-end gap-2 border-t border-line bg-card px-5 py-3">
            <Button type="button" variant="outline" onClick={requestClose} disabled={submitting}>Cancel</Button>
            {!hideSubmit && <Button type={formId ? "submit" : "button"} form={formId} onClick={formId ? undefined : onSubmit} disabled={submitting}>{submitting ? "Saving…" : submitLabel}</Button>}
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Discard changes?" description="You have unsaved changes. If you close now they will be lost." confirmLabel="Discard" destructive onConfirm={onClose} />
    </>
  );
}
