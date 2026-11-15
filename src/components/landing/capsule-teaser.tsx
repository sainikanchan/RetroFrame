import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function CapsuleTeaser() {
  return (
    <section className="border-t border-line bg-darkroom px-6 py-16 text-paper sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-lg">
          <span className="flex items-center gap-2 font-mono-label text-[11px] text-safelight">
            <Lock className="size-3.5" /> MEMORY CAPSULE
          </span>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl">Lock a memory away. Open it later.</h2>
          <p className="mt-2 text-sm text-paper/70">
            Create a Polaroid, seal it for 1 month, 6 months, a year, or any custom date — and let RetroFrame
            deliver it back to you right when you need it most.
          </p>
        </div>
        <Button asChild size="lg" variant="accent">
          <Link href="/dashboard/capsules">Create a capsule</Link>
        </Button>
      </div>
    </section>
  );
}
