import { cn } from "@/lib/utils";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 font-display text-xl", className)}>
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-sm border-2",
          dark ? "border-paper" : "border-ink"
        )}
      >
        <span className="size-2.5 rounded-full bg-safelight" />
      </span>
      <span className={dark ? "text-paper" : "text-ink"}>RetroFrame</span>
    </div>
  );
}
