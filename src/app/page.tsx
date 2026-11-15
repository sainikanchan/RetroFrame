import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { HeroPolaroids } from "@/components/landing/hero-polaroids";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { FrameShowcase } from "@/components/landing/frame-showcase";
import { CapsuleTeaser } from "@/components/landing/capsule-teaser";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-dvh bg-paper">
      <Navbar />

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 sm:py-24 md:grid-cols-2 md:px-8">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full border border-line bg-paper-dim px-3 py-1 font-mono-label text-[11px] text-ink-soft">
            AI-POWERED POLAROID STUDIO
          </span>
          <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">
            Turn your photos into <span className="text-shutter">Polaroid</span> memories worth keeping.
          </h1>
          <p className="max-w-md text-base text-ink-soft">
            Upload a photo, pick a frame, add filters and handwritten captions, decorate it like a real scrapbook —
            then lock one away as a memory capsule for your future self.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href="/create">
                Start creating <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/gallery">Browse the gallery</Link>
            </Button>
          </div>
        </div>
        <HeroPolaroids />
      </section>

      <FeatureGrid />
      <FrameShowcase />
      <CapsuleTeaser />

      <footer className="border-t border-line px-6 py-10 text-center text-xs text-ink-soft">
        <p>RetroFrame — made for people who still believe in printing the good ones.</p>
      </footer>
    </div>
  );
}
