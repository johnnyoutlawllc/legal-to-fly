-- American spelling across the question bank (recognize, behavior, maneuvering,
-- stabilized, labeled, prioritizing, color). Case of the first letter is kept.

create or replace function pg_temp.us(t text) returns text language sql immutable as $$
  select regexp_replace(regexp_replace(regexp_replace(regexp_replace(
         regexp_replace(regexp_replace(regexp_replace(t,
    '([Rr])ecognis', '\1ecogniz', 'g'),
    '([Bb])ehaviour', '\1ehavior', 'g'),
    '([Mm])anoeuvr', '\1aneuver', 'g'),
    '([Ss])tabilis', '\1tabiliz', 'g'),
    '([Ll])abelled', '\1abeled', 'g'),
    '([Pp])rioritis', '\1rioritiz', 'g'),
    '([Cc])olour', '\1olor', 'g')
$$;

update ltf.questions set
  stem = pg_temp.us(stem),
  explanation = pg_temp.us(explanation)
where stem is distinct from pg_temp.us(stem)
   or explanation is distinct from pg_temp.us(explanation);

update ltf.choices set
  body = pg_temp.us(body),
  rationale = pg_temp.us(rationale)
where body is distinct from pg_temp.us(body)
   or rationale is distinct from pg_temp.us(rationale);
