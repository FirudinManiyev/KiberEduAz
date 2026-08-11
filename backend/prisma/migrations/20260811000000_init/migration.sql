-- KiberEduAz initial schema
-- Content hierarchy: Path -> Module -> Room -> Task -> Question -> QuestionOption
-- The Supabase Data API is intentionally closed: RLS is enabled with no policies,
-- so every read/write must go through the NestJS API, which connects as the
-- database owner and therefore bypasses RLS.

-- The Supabase project still holds seven empty PascalCase tables from an
-- unrelated project. They do not collide with anything here; drop them with
-- prisma/manual/drop_legacy_tables.sql once you have confirmed they are dead.

-- Security-definer helpers must not live in an API-exposed schema.
create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('STUDENT', 'TEACHER', 'ADMIN');
create type public.room_type as enum ('WALKTHROUGH', 'CHALLENGE', 'ANALYSIS');
create type public.difficulty as enum ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
create type public.content_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');
create type public.content_accent as enum ('GREEN', 'RED');
create type public.question_type as enum ('SINGLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');
create type public.progress_status as enum ('IN_PROGRESS', 'COMPLETED');
create type public.points_reason as enum ('QUESTION_CORRECT', 'ROOM_COMPLETED', 'MANUAL_ADJUSTMENT');
create type public.notification_type as enum ('TRAINING', 'ACHIEVEMENT', 'SYSTEM');

-- ---------------------------------------------------------------------------
-- Tenancy: institutions and their classes
-- ---------------------------------------------------------------------------
create table public.organizations (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.class_groups (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null,
  academic_year   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, name)
);

-- ---------------------------------------------------------------------------
-- Profiles mirror auth.users; the id is the Supabase auth user id.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text not null,
  full_name           text,
  username            text unique,
  role                public.user_role not null default 'STUDENT',
  organization_id     uuid references public.organizations (id) on delete set null,
  avatar_key          text,
  bio                 text,
  institution_name    text,
  class_label         text,
  focus_track         text,
  weekly_goal         integer not null default 5,
  notify_new_rooms    boolean not null default true,
  notify_streak       boolean not null default true,
  notify_leaderboard  boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index profiles_organization_id_idx on public.profiles (organization_id);
create index profiles_role_idx on public.profiles (role);

create table public.class_memberships (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles (id) on delete cascade,
  class_group_id uuid not null references public.class_groups (id) on delete cascade,
  joined_at      timestamptz not null default now(),
  unique (profile_id, class_group_id)
);

create index class_memberships_class_group_id_idx on public.class_memberships (class_group_id);

-- ---------------------------------------------------------------------------
-- Content hierarchy
-- ---------------------------------------------------------------------------
create table public.paths (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  description   text not null default '',
  intro         text,
  image_url     text,
  category      text not null default '',
  status        public.content_status not null default 'DRAFT',
  order_index   integer not null default 0,
  created_by_id uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index paths_status_order_idx on public.paths (status, order_index);

create table public.learning_modules (
  id          uuid primary key default gen_random_uuid(),
  path_id     uuid not null references public.paths (id) on delete cascade,
  slug        text not null,
  title       text not null,
  description text not null default '',
  status      public.content_status not null default 'DRAFT',
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (path_id, slug)
);

create index learning_modules_path_id_order_idx on public.learning_modules (path_id, order_index);

create table public.rooms (
  id             uuid primary key default gen_random_uuid(),
  module_id      uuid not null references public.learning_modules (id) on delete cascade,
  slug           text not null unique,
  title          text not null,
  short_title    text not null default '',
  eyebrow        text not null default '',
  description    text not null default '',
  category       text not null default '',
  type           public.room_type not null default 'WALKTHROUGH',
  difficulty     public.difficulty not null default 'BEGINNER',
  duration_label text not null default '',
  points         integer not null default 0,
  accent         public.content_accent not null default 'GREEN',
  objectives     text[] not null default '{}',
  source_file    text,
  status         public.content_status not null default 'DRAFT',
  order_index    integer not null default 0,
  published_at   timestamptz,
  created_by_id  uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index rooms_module_id_order_idx on public.rooms (module_id, order_index);
create index rooms_status_idx on public.rooms (status);
create index rooms_category_idx on public.rooms (category);

-- `sections` holds the lesson body as an ordered array of
-- { heading?: string, body: string, bullets?: string[] }
create table public.tasks (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.rooms (id) on delete cascade,
  order_index    integer not null,
  title          text not null,
  duration_label text not null default '',
  points         integer not null default 0,
  sections       jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (room_id, order_index)
);

create table public.questions (
  id               uuid primary key default gen_random_uuid(),
  task_id          uuid not null references public.tasks (id) on delete cascade,
  order_index      integer not null default 0,
  type             public.question_type not null default 'SINGLE_CHOICE',
  prompt           text not null,
  explanation      text not null default '',
  points           integer not null default 0,
  accepted_answers text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (task_id, order_index)
);

create table public.question_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  order_index integer not null,
  label       text not null,
  is_correct  boolean not null default false,
  unique (question_id, order_index)
);

-- ---------------------------------------------------------------------------
-- Learner progress
-- ---------------------------------------------------------------------------
create table public.room_progress (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid not null references public.profiles (id) on delete cascade,
  room_id              uuid not null references public.rooms (id) on delete cascade,
  status               public.progress_status not null default 'IN_PROGRESS',
  completed_task_count integer not null default 0,
  points_earned        integer not null default 0,
  started_at           timestamptz not null default now(),
  completed_at         timestamptz,
  last_activity_at     timestamptz not null default now(),
  unique (profile_id, room_id)
);

create index room_progress_room_id_idx on public.room_progress (room_id);

create table public.task_progress (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  task_id       uuid not null references public.tasks (id) on delete cascade,
  room_id       uuid not null references public.rooms (id) on delete cascade,
  status        public.progress_status not null default 'IN_PROGRESS',
  points_earned integer not null default 0,
  attempts      integer not null default 0,
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  unique (profile_id, task_id)
);

create index task_progress_profile_room_idx on public.task_progress (profile_id, room_id);

create table public.answer_attempts (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references public.profiles (id) on delete cascade,
  question_id      uuid not null references public.questions (id) on delete cascade,
  task_id          uuid not null references public.tasks (id) on delete cascade,
  submitted_answer jsonb not null,
  is_correct       boolean not null,
  points_awarded   integer not null default 0,
  created_at       timestamptz not null default now()
);

create index answer_attempts_profile_question_idx on public.answer_attempts (profile_id, question_id);
create index answer_attempts_question_idx on public.answer_attempts (question_id);

-- ---------------------------------------------------------------------------
-- Gamification
-- ---------------------------------------------------------------------------
create table public.user_stats (
  profile_id       uuid primary key references public.profiles (id) on delete cascade,
  total_points     integer not null default 0,
  rooms_completed  integer not null default 0,
  tasks_completed  integer not null default 0,
  correct_answers  integer not null default 0,
  total_answers    integer not null default 0,
  current_streak   integer not null default 0,
  longest_streak   integer not null default 0,
  last_active_date date,
  updated_at       timestamptz not null default now()
);

create index user_stats_total_points_idx on public.user_stats (total_points desc);

create table public.points_ledger (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  amount     integer not null,
  reason     public.points_reason not null,
  room_id    uuid references public.rooms (id) on delete set null,
  task_id    uuid references public.tasks (id) on delete set null,
  created_at timestamptz not null default now()
);

create index points_ledger_profile_created_idx on public.points_ledger (profile_id, created_at desc);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type       public.notification_type not null default 'SYSTEM',
  title      text not null,
  body       text not null default '',
  href       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_profile_created_idx on public.notifications (profile_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  target text;
begin
  foreach target in array array[
    'organizations', 'class_groups', 'profiles', 'paths', 'learning_modules',
    'rooms', 'tasks', 'questions', 'task_progress', 'user_stats'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function private.set_updated_at()',
      target
    );
  end loop;
end;
$$;

-- A profile row is created for every new Supabase auth user. The role is read
-- from app_metadata (server-controlled) and never from user_metadata, which the
-- user can edit themselves.
create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role public.user_role;
begin
  begin
    requested_role := coalesce(
      (new.raw_app_meta_data ->> 'role')::public.user_role,
      'STUDENT'
    );
  exception
    when invalid_text_representation then
      requested_role := 'STUDENT';
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    requested_role
  )
  on conflict (id) do nothing;

  insert into public.user_stats (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Every table is exposed through PostgREST, so RLS must be on. No policies are
-- created on purpose: the Data API stays closed and the NestJS backend (which
-- connects as the table owner) is the only way in.
-- ---------------------------------------------------------------------------
do $$
declare
  target text;
begin
  foreach target in array array[
    'organizations', 'class_groups', 'profiles', 'class_memberships',
    'paths', 'learning_modules', 'rooms', 'tasks', 'questions', 'question_options',
    'room_progress', 'task_progress', 'answer_attempts',
    'user_stats', 'points_ledger', 'notifications'
  ]
  loop
    execute format('alter table public.%I enable row level security', target);
    execute format('revoke all on public.%I from anon, authenticated', target);
  end loop;
end;
$$;
