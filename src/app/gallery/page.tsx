import { Navbar } from "@/components/shared/navbar";
import { Heart, Repeat } from "lucide-react";

const DEMO_POSTS = [
  { id: "1", author: "maya.k", bg: "linear-gradient(135deg,#E8A33D,#C1503F)", likes: 128, remixes: 12, caption: "golden hour, always" },
  { id: "2", author: "theo_travels", bg: "linear-gradient(135deg,#3B4A5A,#211E1B)", likes: 342, remixes: 40, caption: "somewhere in the alps" },
  { id: "3", author: "jules.p", bg: "linear-gradient(135deg,#7C8B6F,#2E3627)", likes: 87, remixes: 5, caption: "sunday market" },
  { id: "4", author: "aiko", bg: "linear-gradient(135deg,#C1503F,#E8A33D)", likes: 501, remixes: 63, caption: "film burn summer" },
  { id: "5", author: "rowan", bg: "linear-gradient(135deg,#2E3627,#7C8B6F)", likes: 214, remixes: 19, caption: "the last light" },
  { id: "6", author: "nadia_", bg: "linear-gradient(135deg,#E9E0CB,#B5673A)", likes: 76, remixes: 3, caption: "kitchen table, 8am" },
];

export default function GalleryPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <h1 className="font-display text-3xl">Community Gallery</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Public Polaroids from the RetroFrame community. Like a design, or remix it into your own.
        </p>
        <p className="mt-2 rounded-md border border-line bg-paper-dim p-3 text-xs text-ink-soft">
          Showing sample designs — connect Supabase and the <code>gallery_posts</code> table (see
          <code className="mx-1">supabase/schema.sql</code>) to make this feed live.
        </p>

        <div className="mt-8 columns-2 gap-5 sm:columns-3 lg:columns-4 [&>*]:mb-5">
          {DEMO_POSTS.map((post) => (
            <div key={post.id} className="break-inside-avoid rounded-lg border border-line bg-paper p-3 polaroid-shadow">
              <div className="aspect-[4/5] w-full rounded-sm" style={{ background: post.bg }} />
              <p className="mt-2 text-center font-caveat text-lg" style={{ fontFamily: "var(--font-caveat)" }}>
                {post.caption}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
                <span>@{post.author}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Heart className="size-3.5" /> {post.likes}</span>
                  <span className="flex items-center gap-1"><Repeat className="size-3.5" /> {post.remixes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
