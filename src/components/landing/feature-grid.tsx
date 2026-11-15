import { Sparkles, Layers, Palette, Clock, Sticker, Camera } from "lucide-react";

const FEATURES = [
  { icon: Camera, title: "Instant Polaroid look", desc: "Upload or shoot a photo and watch it become a realistic Polaroid frame in seconds." },
  { icon: Palette, title: "12 real-time filters", desc: "From disposable-camera grain to warm light leaks — preview instantly, no waiting." },
  { icon: Sticker, title: "Decorate like a scrapbook", desc: "Stickers, washi tape, doodles and handwritten captions, all draggable and layered." },
  { icon: Sparkles, title: "AI creative direction", desc: "Get AI-written captions, quotes, and style suggestions tailored to your photo." },
  { icon: Layers, title: "Collages & photo booths", desc: "Arrange multiple Polaroids into scrapbook boards or classic photo-strip layouts." },
  { icon: Clock, title: "Memory Capsules", desc: "Lock a memory away and have it land back in your dashboard months or years later." },
];

export function FeatureGrid() {
  return (
    <section className="border-t border-line bg-paper-dim/40 px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl sm:text-3xl">Everything a scrapbooker needs, none of the glue.</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-lg border border-line bg-paper p-5">
              <f.icon className="size-6 text-shutter" />
              <h3 className="mt-3 font-display text-lg">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
