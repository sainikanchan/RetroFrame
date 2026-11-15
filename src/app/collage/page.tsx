import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Construction } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-dvh bg-paper">
      <Navbar />
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 py-24 text-center">
        <Construction className="size-8 text-ink-soft" />
        <h1 className="font-display text-2xl">Collage Creator</h1>
        <p className="text-sm text-ink-soft">
          This creative mode builds on the core Polaroid editor (same store, frames, filters and export pipeline) —
          it is next on the roadmap. For now, create individual Polaroids and arrange them, or check README.md for
          the planned data model.
        </p>
        <Button asChild variant="accent" className="mt-2">
          <Link href="/create">Go to the Polaroid editor</Link>
        </Button>
      </div>
    </div>
  );
}
