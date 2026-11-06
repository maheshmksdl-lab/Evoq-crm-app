"use client";
import { useRouter } from "next/navigation";
import { FileText, ArrowSquareOut } from "@phosphor-icons/react";

interface SourceReportLinkProps {
  reportId: string;
  reportName: string;
  isDark?: boolean;
  className?: string;
}

/**
 * Inline footer link shown on Dashboard widgets to clarify that the widget's
 * data originates from a Report — clicking opens that report's detail page.
 */
export default function SourceReportLink({ reportId, reportName, isDark = false, className = "" }: SourceReportLinkProps) {
  const router = useRouter();
  return (
    <button onClick={() => router.push(`/reports/${reportId}`)}
      className={`w-full flex items-center justify-center gap-1.5 px-4 py-2 border-t text-[11px] font-semibold transition-colors ${isDark ? "border-[#27272A] text-[#71717A] hover:text-[#93C5FD] hover:bg-[#111113]" : "border-[#E3ECFC] text-[#4A5675] hover:text-[#1D4ED8] hover:bg-[#f9fbff]"} ${className}`}>
      <FileText size={12} weight="duotone" />
      <span>Source Report: {reportName}</span>
      <ArrowSquareOut size={11} weight="bold" />
    </button>
  );
}
