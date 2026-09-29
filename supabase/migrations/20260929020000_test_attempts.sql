-- Each completed practice session and mock exam belongs to one signed-in user.
-- Anonymous attempts stay in the browser until that user signs in.
create table if not exists ltf.test_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('practice', 'mock')),
  completed_at timestamptz not null,
  area_code text check (area_code in ('I', 'II', 'III', 'IV', 'V')),
  correct_count integer not null check (correct_count >= 0),
  question_count integer not null check (question_count > 0),
  pct integer not null check (pct between 0 and 100),
  by_area jsonb not null default '{}'::jsonb,
  missed_codes jsonb not null default '[]'::jsonb,
  elapsed_seconds integer check (elapsed_seconds >= 0),
  check (correct_count <= question_count)
);

create index if not exists ltf_test_attempts_user_date_idx
  on ltf.test_attempts (user_id, completed_at desc);

alter table ltf.test_attempts enable row level security;
grant usage on schema ltf to authenticated;
grant select, insert, update on ltf.test_attempts to authenticated;

create policy "Users read their own test attempts" on ltf.test_attempts
  for select to authenticated using (user_id = auth.uid());
create policy "Users add their own test attempts" on ltf.test_attempts
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users update their own test attempts" on ltf.test_attempts
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

notify pgrst, 'reload schema';
