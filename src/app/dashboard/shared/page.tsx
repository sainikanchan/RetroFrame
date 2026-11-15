import { Share2 } from "lucide-react";

export default function SharedPage() {
  return (
    <div>
      <h1 className="font-display text-2xl">Shared Projects</h1>
      <p className="text-sm text-ink-soft">Polaroids shared with you, and projects you&apos;ve shared.</p>
      <div className="mt-16 flex flex-col items-center gap-3 text-center text-ink-soft">
        <Share2 className="size-8" />
        <p className="max-w-sm text-sm">
          Sharing requires a connected Supabase project so links and permissions can sync across accounts. Connect
          Supabase (see README) to enable this — the schema and share-link table are already defined in
          <code className="mx-1 rounded bg-paper-dim px-1">supabase/schema.sql</code>.
        </p>
      </div>
    </div>
  );
}
