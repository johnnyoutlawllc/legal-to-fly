-- Anonymous first-party page views on the shared Outlaw Apps project.
-- No IP address, account identity, query string, or full referrer URL is stored.
create table if not exists ltf.website_page_views (
  id uuid primary key default gen_random_uuid(),
  visited_at timestamptz not null default now(),
  visitor_id uuid not null,
  session_id uuid not null,
  page_path text not null check (left(page_path, 1) = '/' and length(page_path) <= 200),
  referrer_host text,
  device_type text not null check (device_type in ('desktop', 'tablet', 'mobile')),
  country text
);

create index if not exists ltf_website_page_views_visited_idx
  on ltf.website_page_views (visited_at desc);
create index if not exists ltf_website_page_views_session_idx
  on ltf.website_page_views (session_id, visited_at);

alter table ltf.website_page_views enable row level security;
grant usage on schema ltf to anon, service_role;
grant insert on ltf.website_page_views to anon;
grant select on ltf.website_page_views to service_role;
drop policy if exists "Anonymous website page views" on ltf.website_page_views;
create policy "Anonymous website page views" on ltf.website_page_views
  for insert to anon with check (true);

notify pgrst, 'reload schema';
