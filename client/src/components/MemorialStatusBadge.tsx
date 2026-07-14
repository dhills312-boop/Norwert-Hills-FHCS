import { type MemorialStatus } from "@shared/schema";

const CONFIG: Record<MemorialStatus, { dot: string; label: string; pill: string }> = {
  draft:     { dot: "bg-zinc-400",   label: "Draft",      pill: "bg-zinc-800 text-zinc-300 border-zinc-700" },
  review:    { dot: "bg-amber-400",  label: "In Review",  pill: "bg-amber-950/60 text-amber-300 border-amber-800" },
  scheduled: { dot: "bg-sky-400",    label: "Scheduled",  pill: "bg-sky-950/60 text-sky-300 border-sky-800" },
  published: { dot: "bg-emerald-400",label: "Published",  pill: "bg-emerald-950/60 text-emerald-300 border-emerald-800" },
  archived:  { dot: "bg-zinc-600",   label: "Archived",   pill: "bg-zinc-900 text-zinc-500 border-zinc-700" },
};

interface Props {
  status: string;
  size?: "sm" | "md";
}

export function MemorialStatusBadge({ status, size = "md" }: Props) {
  const cfg = CONFIG[status as MemorialStatus] ?? CONFIG.draft;
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${cfg.pill} ${textSize} font-medium`}>
      <span className={`rounded-full flex-shrink-0 ${dotSize} ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
