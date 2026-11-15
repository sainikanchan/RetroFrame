-- =========================================================
-- RetroFrame — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Assumes Supabase Auth is enabled (auth.users already exists).
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- profiles — one row per authenticated user
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  is_guest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- projects — a single Polaroid / collage / scrapbook creation
-- ---------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Untitled Memory',
  project_type text not null default 'polaroid' check (project_type in ('polaroid', 'collage', 'scrapbook', 'photo_booth')),
  frame_template text not null default 'classic-white',
  filter_id text not null default 'original',
  adjustments jsonb not null default '{}'::jsonb,
  transform jsonb not null default '{}'::jsonb,
  caption jsonb not null default '{}'::jsonb,
  stamps jsonb not null default '{}'::jsonb,
  decorations jsonb not null default '[]'::jsonb,
  canvas_json jsonb,
  image_path text,          -- storage path in the `polaroids` bucket
  thumbnail_path text,      -- storage path for a small preview
  is_favorite boolean not null default false,
  is_public boolean not null default false,
  scrapbook_template_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_owner_idx on public.projects (owner_id);
create index if not exists projects_public_idx on public.projects (is_public) where is_public = true;

-- ---------------------------------------------------------
-- project_shares — share-by-link and collaborator access
-- ---------------------------------------------------------
create table if not exists public.project_shares (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects (id) on delete cascade,
  share_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  shared_with_id uuid references public.profiles (id) on delete cascade,
  permission text not null default 'view' check (permission in ('view', 'edit')),
  created_at timestamptz not null default now()
);

create index if not exists shares_project_idx on public.project_shares (project_id);

-- ---------------------------------------------------------
-- memory_capsules — locked-until-a-future-date Polaroids
-- ---------------------------------------------------------
create table if not exists public.memory_capsules (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  message text,
  unlock_at timestamptz not null,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists capsules_owner_idx on public.memory_capsules (owner_id);
create index if not exists capsules_unlock_idx on public.memory_capsules (unlock_at);

-- ---------------------------------------------------------
-- gallery_posts — public feed entries + likes/remixes
-- ---------------------------------------------------------
create table if not exists public.gallery_posts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  caption text,
  like_count integer not null default 0,
  remix_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_likes (
  post_id uuid not null references public.gallery_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ---------------------------------------------------------
-- scrapbook_templates — seedable template catalogue
-- ---------------------------------------------------------
create table if not exists public.scrapbook_templates (
  id text primary key,
  name text not null,
  category text not null check (category in ('birthday', 'travel', 'graduation', 'wedding', 'festival', 'journal')),
  thumbnail_path text,
  slot_count integer not null default 4,
  layout jsonb not null default '[]'::jsonb
);

-- ---------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.projects;
create trigger set_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_shares enable row level security;
alter table public.memory_capsules enable row level security;
alter table public.gallery_posts enable row level security;
alter table public.gallery_likes enable row level security;
alter table public.scrapbook_templates enable row level security;

-- profiles: readable by anyone, editable only by owner
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- projects: owner has full access; public projects are readable by anyone; shared users can view/edit
create policy "Owners manage their own projects" on public.projects
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Public projects are viewable by everyone" on public.projects
  for select using (is_public = true);
create policy "Shared users can view shared projects" on public.projects
  for select using (
    exists (
      select 1 from public.project_shares s
      where s.project_id = projects.id and s.shared_with_id = auth.uid()
    )
  );

-- project_shares: only the project owner manages shares; invited user can see their own share row
create policy "Owners manage shares on their projects" on public.project_shares
  for all using (
    exists (select 1 from public.projects p where p.id = project_shares.project_id and p.owner_id = auth.uid())
  );
create policy "Invitees can see their own share" on public.project_shares
  for select using (shared_with_id = auth.uid());

-- memory_capsules: strictly owner-only, always (even after unlock, it's still their capsule)
create policy "Owners manage their own capsules" on public.memory_capsules
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- gallery_posts: readable by everyone, writable by the author
create policy "Gallery posts are public" on public.gallery_posts for select using (true);
create policy "Authors manage their own gallery posts" on public.gallery_posts
  for insert with check (auth.uid() = author_id);
create policy "Authors can delete their own gallery posts" on public.gallery_posts
  for delete using (auth.uid() = author_id);

-- gallery_likes: readable by everyone, a user can only like/unlike as themselves
create policy "Likes are public" on public.gallery_likes for select using (true);
create policy "Users manage their own likes" on public.gallery_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- scrapbook_templates: read-only catalogue
create policy "Templates are public" on public.scrapbook_templates for select using (true);

-- =========================================================
-- Storage buckets
-- Run once (or via the Supabase dashboard: Storage -> New bucket)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('polaroids', 'polaroids', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Polaroid images are publicly readable"
  on storage.objects for select using (bucket_id = 'polaroids');
create policy "Authenticated users can upload their own polaroids"
  on storage.objects for insert
  with check (bucket_id = 'polaroids' and auth.role() = 'authenticated');
create policy "Users can update/delete their own polaroid files"
  on storage.objects for update using (bucket_id = 'polaroids' and owner = auth.uid());
create policy "Users can delete their own polaroid files"
  on storage.objects for delete using (bucket_id = 'polaroids' and owner = auth.uid());
