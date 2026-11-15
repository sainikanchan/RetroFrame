-- =========================================================
-- RetroFrame — seed data
-- Run after schema.sql. Safe to re-run (uses ON CONFLICT).
-- =========================================================

insert into public.scrapbook_templates (id, name, category, slot_count, layout) values
  ('birthday-1', 'Birthday Bash', 'birthday', 4, '[{"x":5,"y":5,"w":40,"h":45},{"x":50,"y":5,"w":45,"h":30},{"x":50,"y":40,"w":45,"h":30},{"x":5,"y":55,"w":40,"h":40}]'),
  ('travel-1', 'Road Trip Journal', 'travel', 6, '[{"x":5,"y":5,"w":28,"h":28},{"x":36,"y":5,"w":28,"h":28},{"x":67,"y":5,"w":28,"h":28},{"x":5,"y":36,"w":28,"h":28},{"x":36,"y":36,"w":28,"h":28},{"x":67,"y":36,"w":28,"h":28}]'),
  ('grad-1', 'Class of Memories', 'graduation', 5, '[{"x":5,"y":5,"w":55,"h":40},{"x":63,"y":5,"w":32,"h":18},{"x":63,"y":26,"w":32,"h":18},{"x":5,"y":48,"w":32,"h":30},{"x":40,"y":48,"w":55,"h":30}]'),
  ('wedding-1', 'Forever Day', 'wedding', 4, '[{"x":5,"y":5,"w":90,"h":45},{"x":5,"y":53,"w":28,"h":30},{"x":36,"y":53,"w":28,"h":30},{"x":67,"y":53,"w":28,"h":30}]'),
  ('festival-1', 'Festival Nights', 'festival', 6, '[{"x":5,"y":5,"w":28,"h":28},{"x":36,"y":5,"w":28,"h":28},{"x":67,"y":5,"w":28,"h":28},{"x":5,"y":36,"w":45,"h":40},{"x":53,"y":36,"w":42,"h":40}]'),
  ('journal-1', 'Everyday Journal', 'journal', 3, '[{"x":5,"y":5,"w":42,"h":90},{"x":52,"y":5,"w":43,"h":42},{"x":52,"y":52,"w":43,"h":43}]')
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  slot_count = excluded.slot_count,
  layout = excluded.layout;

-- NOTE: profiles/projects/gallery_posts seed rows are intentionally omitted
-- here because they must reference real auth.users ids. After you sign up
-- a test user in your Supabase project, you can seed a sample project like:
--
-- insert into public.projects (owner_id, title, frame_template, filter_id, is_public)
-- values ('<your-auth-user-uuid>', 'Sunday Drive', 'vintage', 'warm', true);
