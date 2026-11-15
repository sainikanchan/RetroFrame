import { FRAME_TEMPLATES } from "@/lib/constants";

export function FrameShowcase() {
  return (
    <section className="px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-2xl sm:text-3xl">Six frame styles. One perfect fit.</h2>
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-6">
          {FRAME_TEMPLATES.map((f) => (
            <div key={f.id} className="flex flex-col items-center gap-2">
              <div
                className="polaroid-shadow flex h-28 w-24 flex-col items-center justify-end rounded-sm"
                style={{ background: f.borderColor, padding: 6, border: f.id === "film-strip" ? "1px solid #000" : undefined }}
              >
                <div className="w-full flex-1 rounded-[1px]" style={{ background: f.accentColor || "#C9C0A8" }} />
                <div style={{ height: 10 }} />
              </div>
              <p className="text-center text-xs font-medium">{f.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
