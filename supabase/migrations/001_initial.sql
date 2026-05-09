create table operators (
  id                uuid primary key default gen_random_uuid(),
  business_name     text not null,
  owner_name        text not null,
  email             text not null,
  alert_phone       text not null,
  twilio_number     text,
  greeting          text,
  faq               text not null default '',
  active            boolean not null default false,
  plan              text not null default 'starter',
  dashboard_token   uuid not null default gen_random_uuid(),
  created_at        timestamptz not null default now()
);

create table calls (
  id               uuid primary key default gen_random_uuid(),
  operator_id      uuid not null references operators(id) on delete cascade,
  caller_number    text not null,
  duration_seconds integer not null default 0,
  transcript       text not null default '',
  summary          text not null default '',
  urgent           boolean not null default false,
  leads            jsonb not null default '[]',
  created_at       timestamptz not null default now()
);

create table leads (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null references operators(id) on delete cascade,
  call_id      uuid not null references calls(id) on delete cascade,
  name         text,
  party_size   integer,
  tour_date    text,
  notes        text,
  created_at   timestamptz not null default now()
);

create index operators_twilio_number_idx on operators(twilio_number);
create index calls_operator_id_created_at_idx on calls(operator_id, created_at desc);
create index leads_operator_id_idx on leads(operator_id);
