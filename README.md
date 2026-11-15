# RetroFrame

Turn your photos into Polaroid memories — upload, frame, filter, decorate, and share, with an AI co-editor along the way.

Built with **Next.js 15 (App Router) + React + TypeScript**, **Tailwind CSS**, hand-rolled **shadcn-style** UI primitives, **Zustand**, **Fabric.js + Canvas API**, **Framer Motion**, and **Supabase** (Auth, Database, Storage), deployable to **Vercel**.

---

## What's actually working right now

This build focused depth-first on the **core creator experience** — the part people will actually use every day — rather than spreading thin across all 40+ items in the original brief. Here's the honest breakdown:

### ✅ Fully working today (no extra setup needed)
- Photo upload: drag-and-drop, file picker, multi-image upload, live camera capture (`getUserMedia`)
- All 6 Polaroid frame templates (Classic White, Vintage, Colorful, Torn Paper, Minimal, Film Strip)
- Crop/reposition (drag), zoom (scroll or buttons), rotate — all with live preview
- All 12 filters with real-time preview thumbnails, plus 8 manual adjustment sliders (brightness, contrast, saturation, exposure, sharpness, blur, temperature, vignette)
- Captions with multiple fonts (incl. 4 handwriting fonts), size/color/weight/alignment, date stamps, location stamps, signatures
- Decorations: emoji stickers, washi tape, and a real Fabric.js **freehand pen/doodle tool**, all draggable/rotatable/scalable
- Undo/redo, keyboard shortcuts (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`), autosave drafts
- Export to **PNG / JPG / PDF** at high resolution (`html2canvas` + `jsPDF`)
- Guest mode, dashboard shell (My Projects, Favorites, Memory Capsules, Settings) backed by `localStorage`
- **Memory Capsules**: create, seal for 1 month / 6 months / 1 year / a custom date, and see a live countdown + blurred-until-unlocked preview
- Dark mode / light mode, responsive layout, Framer Motion micro-animations
- AI features that call a real Claude API route: AI captions, AI quotes, AI filter recommendation, and a "make this look like X" style-transfer that has Claude pick the closest filter/frame/adjustments and write a matching caption — **these need your own `ANTHROPIC_API_KEY`** (see below)

### 🧱 Scaffolded, needs your credentials to go live
- **Supabase Auth** (email/password + Google): pages, hooks, and the client/server/middleware setup are all wired — but disabled until you add `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Until then, sign-in falls back to **Guest mode**, which works fully offline.
- **Database + Storage**: a complete Postgres schema with Row Level Security (`supabase/schema.sql`) for projects, shares, memory capsules, gallery posts/likes, and scrapbook templates, plus seed data (`supabase/seed.sql`). Projects currently save to `localStorage` on the client instead — swap in the Supabase calls once your project is connected (the schema already matches the app's data shapes).
- **Public gallery / sharing / remix**: UI is built with sample data; goes live once `gallery_posts` / `project_shares` are wired to Supabase.
- **Colorize old B&W photos**: Claude is text+vision-in only and can't output image pixels, so this needs a separate image model. The route (`/api/ai/colorize`) is wired for Replicate — add `REPLICATE_API_TOKEN` to activate it, or swap in any other image-to-image provider.

### 🗺️ Structured but not deep-built yet
- **Collage Creator / Photo Booth Mode / Scrapbook Mode**: routes exist (`/collage`, `/photo-booth`, `/scrapbook`) with a short explanation and a link back to the editor. They're designed to reuse the same Zustand store, frame/filter/export pipeline, and the `scrapbook_templates` table already in the schema — natural next milestone once the core editor ships.

If you want any of the above taken further, tell me which piece matters most and I'll build it out deep, the same way the core editor was built.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the keys you have — the app runs fine with none of them set
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no environment variables set, you get the full editor experience in **Guest mode**, saving locally in your browser.

### Environment variables

| Variable | Required for | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Real accounts, cloud save, sharing, gallery, capsules syncing | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin tasks (e.g. a future capsule-unlock cron job) | Supabase project → Settings → API |
| `ANTHROPIC_API_KEY` | AI captions/quotes/filter recommendation/style transfer | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `REPLICATE_API_TOKEN`, `REPLICATE_COLORIZE_MODEL_VERSION` | True B&W colorization | [replicate.com](https://replicate.com/account/api-tokens) |

### Connecting Supabase (optional, for real accounts + cloud sync)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. In **Authentication → Providers**, enable Email and Google (add your OAuth client ID/secret).
4. Copy your project URL + anon key into `.env.local`.
5. In **Storage**, confirm the `polaroids` and `avatars` buckets were created by the schema script.
6. Restart `npm run dev` — the login/signup forms and Save-to-cloud flows activate automatically once these env vars are present.

### Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in [vercel.com/new](https://vercel.com/new).
3. Add the same environment variables from `.env.local` in the Vercel project settings.
4. Deploy. No custom build configuration is required — this is a standard Next.js App Router project.

---

## Project structure

```
src/
  app/
    page.tsx                 # Landing page
    create/                  # The Polaroid editor (core experience)
    login/, signup/          # Auth pages (guest mode always available)
    dashboard/                # My Projects, Favorites, Shared, Capsules, Settings
    gallery/                  # Public gallery (sample data until Supabase is wired)
    collage/, photo-booth/, scrapbook/   # Roadmap placeholders, link back to /create
    api/ai/                  # Server routes calling Claude (+ pluggable image provider)
  components/
    ui/                      # Hand-built shadcn-style primitives (button, dialog, slider, ...)
    editor/                  # PolaroidCard, DecorationLayer, DoodleLayer, panels/, EditorShell
    landing/                 # Marketing sections
    dashboard/                # ProjectCard
    shared/                   # Navbar, Logo, ThemeProvider
  store/editorStore.ts        # Zustand store: single source of truth for the active project
  lib/
    constants.ts               # Frame templates, filters, fonts, stickers, washi tape, capsule presets
    canvas/filters.ts           # CSS filter composition from presets + adjustment sliders
    canvas/export.ts            # PNG/JPG/PDF export via html2canvas + jsPDF
    ai/anthropic.ts             # Shared Claude client + helpers
    supabase/                   # Browser/server/middleware Supabase clients
    localProjects.ts, localCapsules.ts  # localStorage persistence (swap for Supabase queries)
  types/index.ts                 # Shared TypeScript types
supabase/
  schema.sql                     # Full Postgres schema + RLS policies + storage buckets
  seed.sql                       # Scrapbook template seed data
middleware.ts                    # Supabase session refresh (no-ops if Supabase isn't configured)
```

## Design system

The visual language is "vintage camera meets modern scrapbook": paper-cream surfaces, a darkroom-green/black app shell, an amber "safelight" accent, and a faded shutter-red secondary — see the CSS custom properties at the top of `src/app/globals.css`. Fonts are self-hosted via `@fontsource` (Fraunces for display, Inter for UI, Space Mono for labels, plus Caveat/Kalam/Shadows Into Light/Permanent Marker for handwriting) so the app builds and renders without a network dependency on Google Fonts.

## Known trade-offs (read before extending)

- **Persistence is `localStorage`-first.** This was a deliberate choice to ship a fully working, testable app without requiring your Supabase credentials up front. The schema already matches the app's data shapes 1:1, so swapping `lib/localProjects.ts` calls for Supabase queries is a mechanical refactor, not a redesign.
- **Style transfer ("make this look like a 90s film photo") re-composes RetroFrame's own filter/frame/adjustment library via Claude's reasoning** rather than regenerating pixels with an image model. It's fast, free of an extra API key, and looks good — but it's not literal pixel-level style transfer. True style transfer or the colorize feature would use the same pattern as `/api/ai/colorize`, wired to an image model.
- **Decoration dragging** uses lightweight pointer-event handling rather than a full Fabric.js object graph, so export is done by rasterizing the actual DOM (`html2canvas`) rather than compositing a Fabric canvas. This keeps the WYSIWYG preview and the exported file guaranteed to match, at the cost of not exposing a Fabric `Canvas` API for the decoration layer specifically (the doodle/pen layer does use a real Fabric `Canvas`).
