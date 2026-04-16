create extension if not exists pgcrypto;
create extension if not exists btree_gist;

do $$
begin
  create type public.app_role as enum ('admin', 'instructor', 'staff');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.lead_status as enum ('new', 'contacted', 'interested', 'converted', 'lost');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.student_status as enum (
    'enrolled',
    'theory_in_progress',
    'practical_in_progress',
    'exam_scheduled',
    'completed',
    'inactive'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.instructor_status as enum ('active', 'inactive');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.lesson_status as enum ('scheduled', 'completed', 'canceled', 'missed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_method as enum ('card', 'bank_transfer', 'cash');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.document_type as enum ('id', 'contract', 'medical', 'theory_certificate', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_priority as enum ('low', 'medium', 'high');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_status as enum ('pending', 'completed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.note_entity_type as enum ('student', 'lead', 'lesson');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null,
  full_name text not null,
  email text not null unique,
  role public.app_role not null default 'staff',
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  profile_id uuid unique,
  full_name text not null,
  phone text not null,
  email text not null,
  categories text[] not null default '{}',
  status public.instructor_status not null default 'active',
  bio text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  full_name text not null,
  phone text not null,
  email text not null,
  date_of_birth date not null,
  category text not null,
  enrollment_date date not null,
  assigned_instructor_id uuid,
  status public.student_status not null default 'enrolled',
  total_required_practical_hours integer not null default 30,
  completed_practical_hours integer not null default 0,
  exam_date date,
  total_course_price numeric(10,2) not null default 0,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint students_completed_hours_check
    check (completed_practical_hours >= 0 and completed_practical_hours <= total_required_practical_hours)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  full_name text not null,
  phone text not null,
  email text not null,
  source text not null,
  interested_category text not null,
  status public.lead_status not null default 'new',
  notes text not null default '',
  converted_student_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  student_id uuid not null,
  instructor_id uuid not null,
  lesson_date date not null,
  start_time time not null,
  end_time time not null,
  duration_minutes integer not null,
  status public.lesson_status not null default 'scheduled',
  notes text not null default '',
  starts_at timestamptz generated always as ((lesson_date::timestamp + start_time) at time zone 'Europe/Bucharest') stored,
  ends_at timestamptz generated always as ((lesson_date::timestamp + end_time) at time zone 'Europe/Bucharest') stored,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint lessons_time_check check (end_time > start_time)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  student_id uuid not null,
  amount numeric(10,2) not null check (amount > 0),
  payment_date date not null,
  payment_method public.payment_method not null,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  student_id uuid not null,
  title text not null,
  document_type public.document_type not null,
  file_name text not null,
  file_path text not null,
  uploaded_by uuid,
  uploaded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  title text not null,
  description text not null default '',
  related_student_id uuid,
  assigned_to uuid,
  due_date date not null,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'pending',
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  entity_type public.note_entity_type not null,
  entity_id uuid not null,
  author_id uuid,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.organizations (id, name, slug)
values ('00000000-0000-4000-8000-000000000000', 'Legacy Organization', 'legacy-default')
on conflict (id) do nothing;

alter table public.organizations
  add column if not exists name text,
  add column if not exists slug text,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.profiles add column if not exists organization_id uuid;
alter table public.instructors add column if not exists organization_id uuid;
alter table public.students add column if not exists organization_id uuid;
alter table public.leads add column if not exists organization_id uuid;
alter table public.lessons add column if not exists organization_id uuid;
alter table public.payments add column if not exists organization_id uuid;
alter table public.documents add column if not exists organization_id uuid;
alter table public.tasks add column if not exists organization_id uuid;
alter table public.notes add column if not exists organization_id uuid;

update public.profiles
set organization_id = '00000000-0000-4000-8000-000000000000'
where organization_id is null;

update public.instructors
set organization_id = '00000000-0000-4000-8000-000000000000'
where organization_id is null;

update public.students
set organization_id = '00000000-0000-4000-8000-000000000000'
where organization_id is null;

update public.leads
set organization_id = '00000000-0000-4000-8000-000000000000'
where organization_id is null;

update public.lessons
set organization_id = '00000000-0000-4000-8000-000000000000'
where organization_id is null;

update public.payments
set organization_id = '00000000-0000-4000-8000-000000000000'
where organization_id is null;

update public.documents
set organization_id = '00000000-0000-4000-8000-000000000000'
where organization_id is null;

update public.tasks
set organization_id = '00000000-0000-4000-8000-000000000000'
where organization_id is null;

update public.notes
set organization_id = '00000000-0000-4000-8000-000000000000'
where organization_id is null;

alter table public.profiles alter column organization_id set not null;
alter table public.instructors alter column organization_id set not null;
alter table public.students alter column organization_id set not null;
alter table public.leads alter column organization_id set not null;
alter table public.lessons alter column organization_id set not null;
alter table public.payments alter column organization_id set not null;
alter table public.documents alter column organization_id set not null;
alter table public.tasks alter column organization_id set not null;
alter table public.notes alter column organization_id set not null;

alter table public.instructors drop constraint if exists instructors_email_key;
alter table public.students drop constraint if exists students_email_key;
alter table public.leads drop constraint if exists leads_email_key;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
as $$
  select organization_id
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.current_instructor_id()
returns uuid
language sql
stable
as $$
  select id
  from public.instructors
  where profile_id = auth.uid()
    and organization_id = public.current_organization_id();
$$;

create or replace function public.note_entity_belongs_to_organization(
  target_entity_type public.note_entity_type,
  target_entity_id uuid,
  target_organization_id uuid
)
returns boolean
language plpgsql
stable
as $$
begin
  case target_entity_type
    when 'student' then
      return exists (
        select 1
        from public.students
        where id = target_entity_id
          and organization_id = target_organization_id
      );
    when 'lead' then
      return exists (
        select 1
        from public.leads
        where id = target_entity_id
          and organization_id = target_organization_id
      );
    when 'lesson' then
      return exists (
        select 1
        from public.lessons
        where id = target_entity_id
          and organization_id = target_organization_id
      );
    else
      return false;
  end case;
end;
$$;

create or replace function public.validate_note_entity_organization()
returns trigger
language plpgsql
as $$
begin
  if not public.note_entity_belongs_to_organization(new.entity_type, new.entity_id, new.organization_id) then
    raise exception 'Notes must reference an entity inside the same organization.';
  end if;

  return new;
end;
$$;

create unique index if not exists organizations_slug_key on public.organizations(slug);
create unique index if not exists profiles_organization_id_id_key on public.profiles(organization_id, id);
create unique index if not exists instructors_organization_id_id_key on public.instructors(organization_id, id);
create unique index if not exists students_organization_id_id_key on public.students(organization_id, id);
create unique index if not exists instructors_organization_email_key on public.instructors(organization_id, lower(email));
create unique index if not exists students_organization_email_key on public.students(organization_id, lower(email));
create unique index if not exists leads_organization_email_key on public.leads(organization_id, lower(email));

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_organization_id_idx on public.profiles(organization_id);
create index if not exists instructors_profile_id_idx on public.instructors(profile_id);
create index if not exists instructors_organization_id_idx on public.instructors(organization_id);
create index if not exists students_assigned_instructor_id_idx on public.students(assigned_instructor_id);
create index if not exists students_organization_status_idx on public.students(organization_id, status);
create index if not exists students_organization_category_idx on public.students(organization_id, category);
create index if not exists leads_organization_status_idx on public.leads(organization_id, status);
create index if not exists lessons_organization_instructor_date_idx on public.lessons(organization_id, instructor_id, lesson_date);
create index if not exists lessons_organization_student_date_idx on public.lessons(organization_id, student_id, lesson_date);
create index if not exists payments_organization_student_id_idx on public.payments(organization_id, student_id);
create index if not exists documents_organization_student_id_idx on public.documents(organization_id, student_id);
create index if not exists tasks_organization_assigned_to_due_date_idx on public.tasks(organization_id, assigned_to, due_date);
create index if not exists notes_organization_entity_idx on public.notes(organization_id, entity_type, entity_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_organization_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'instructors_organization_id_fkey'
  ) then
    alter table public.instructors
      add constraint instructors_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'students_organization_id_fkey'
  ) then
    alter table public.students
      add constraint students_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_organization_id_fkey'
  ) then
    alter table public.leads
      add constraint leads_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'lessons_organization_id_fkey'
  ) then
    alter table public.lessons
      add constraint lessons_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_organization_id_fkey'
  ) then
    alter table public.payments
      add constraint payments_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'documents_organization_id_fkey'
  ) then
    alter table public.documents
      add constraint documents_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tasks_organization_id_fkey'
  ) then
    alter table public.tasks
      add constraint tasks_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'notes_organization_id_fkey'
  ) then
    alter table public.notes
      add constraint notes_organization_id_fkey
      foreign key (organization_id) references public.organizations(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'instructors_profile_membership_fkey'
  ) then
    alter table public.instructors
      add constraint instructors_profile_membership_fkey
      foreign key (organization_id, profile_id)
      references public.profiles(organization_id, id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'students_assigned_instructor_membership_fkey'
  ) then
    alter table public.students
      add constraint students_assigned_instructor_membership_fkey
      foreign key (organization_id, assigned_instructor_id)
      references public.instructors(organization_id, id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_converted_student_membership_fkey'
  ) then
    alter table public.leads
      add constraint leads_converted_student_membership_fkey
      foreign key (organization_id, converted_student_id)
      references public.students(organization_id, id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'lessons_student_membership_fkey'
  ) then
    alter table public.lessons
      add constraint lessons_student_membership_fkey
      foreign key (organization_id, student_id)
      references public.students(organization_id, id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'lessons_instructor_membership_fkey'
  ) then
    alter table public.lessons
      add constraint lessons_instructor_membership_fkey
      foreign key (organization_id, instructor_id)
      references public.instructors(organization_id, id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_student_membership_fkey'
  ) then
    alter table public.payments
      add constraint payments_student_membership_fkey
      foreign key (organization_id, student_id)
      references public.students(organization_id, id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'documents_student_membership_fkey'
  ) then
    alter table public.documents
      add constraint documents_student_membership_fkey
      foreign key (organization_id, student_id)
      references public.students(organization_id, id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'documents_uploaded_by_membership_fkey'
  ) then
    alter table public.documents
      add constraint documents_uploaded_by_membership_fkey
      foreign key (organization_id, uploaded_by)
      references public.profiles(organization_id, id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tasks_related_student_membership_fkey'
  ) then
    alter table public.tasks
      add constraint tasks_related_student_membership_fkey
      foreign key (organization_id, related_student_id)
      references public.students(organization_id, id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tasks_assigned_to_membership_fkey'
  ) then
    alter table public.tasks
      add constraint tasks_assigned_to_membership_fkey
      foreign key (organization_id, assigned_to)
      references public.profiles(organization_id, id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tasks_created_by_membership_fkey'
  ) then
    alter table public.tasks
      add constraint tasks_created_by_membership_fkey
      foreign key (organization_id, created_by)
      references public.profiles(organization_id, id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'notes_author_membership_fkey'
  ) then
    alter table public.notes
      add constraint notes_author_membership_fkey
      foreign key (organization_id, author_id)
      references public.profiles(organization_id, id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'lessons_no_instructor_overlap'
  ) then
    alter table public.lessons
      add constraint lessons_no_instructor_overlap
      exclude using gist (
        instructor_id with =,
        tstzrange(starts_at, ends_at, '[)') with &&
      )
      where (status <> 'canceled');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'lessons_no_student_overlap'
  ) then
    alter table public.lessons
      add constraint lessons_no_student_overlap
      exclude using gist (
        student_id with =,
        tstzrange(starts_at, ends_at, '[)') with &&
      )
      where (status <> 'canceled');
  end if;
end $$;

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_instructors_updated_at on public.instructors;
create trigger set_instructors_updated_at before update on public.instructors
for each row execute function public.set_updated_at();

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at before update on public.lessons
for each row execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_notes_updated_at on public.notes;
create trigger set_notes_updated_at before update on public.notes
for each row execute function public.set_updated_at();

drop trigger if exists validate_notes_organization on public.notes;
create trigger validate_notes_organization before insert or update on public.notes
for each row execute function public.validate_note_entity_organization();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.instructors enable row level security;
alter table public.students enable row level security;
alter table public.leads enable row level security;
alter table public.lessons enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;

drop policy if exists "organizations_select" on public.organizations;
create policy "organizations_select" on public.organizations
for select
using (id = public.current_organization_id());

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
for select
using (
  auth.role() = 'authenticated'
  and organization_id = public.current_organization_id()
);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
for update
using (
  organization_id = public.current_organization_id()
  and (auth.uid() = id or public.current_app_role() = 'admin')
)
with check (
  organization_id = public.current_organization_id()
  and (auth.uid() = id or public.current_app_role() = 'admin')
);

drop policy if exists "instructors_read" on public.instructors;
create policy "instructors_read" on public.instructors
for select
using (
  auth.role() = 'authenticated'
  and organization_id = public.current_organization_id()
);

drop policy if exists "instructors_write" on public.instructors;
create policy "instructors_write" on public.instructors
for all
using (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
)
with check (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
);

drop policy if exists "leads_access" on public.leads;
create policy "leads_access" on public.leads
for all
using (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
)
with check (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
);

drop policy if exists "students_read" on public.students;
create policy "students_read" on public.students
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.current_app_role() in ('admin', 'staff')
    or assigned_instructor_id = public.current_instructor_id()
  )
);

drop policy if exists "students_write" on public.students;
create policy "students_write" on public.students
for all
using (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
)
with check (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
);

drop policy if exists "lessons_read" on public.lessons;
create policy "lessons_read" on public.lessons
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.current_app_role() in ('admin', 'staff')
    or instructor_id = public.current_instructor_id()
  )
);

drop policy if exists "lessons_write_admin" on public.lessons;
create policy "lessons_write_admin" on public.lessons
for all
using (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
)
with check (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
);

drop policy if exists "lessons_update_instructor" on public.lessons;
create policy "lessons_update_instructor" on public.lessons
for update
using (
  organization_id = public.current_organization_id()
  and instructor_id = public.current_instructor_id()
)
with check (
  organization_id = public.current_organization_id()
  and instructor_id = public.current_instructor_id()
);

drop policy if exists "payments_access" on public.payments;
create policy "payments_access" on public.payments
for all
using (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
)
with check (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
);

drop policy if exists "documents_read" on public.documents;
create policy "documents_read" on public.documents
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.current_app_role() in ('admin', 'staff')
    or exists (
      select 1
      from public.students s
      where s.id = student_id
        and s.organization_id = public.current_organization_id()
        and s.assigned_instructor_id = public.current_instructor_id()
    )
  )
);

drop policy if exists "documents_write" on public.documents;
create policy "documents_write" on public.documents
for all
using (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
)
with check (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
);

drop policy if exists "tasks_read" on public.tasks;
create policy "tasks_read" on public.tasks
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.current_app_role() in ('admin', 'staff')
    or assigned_to = auth.uid()
  )
);

drop policy if exists "tasks_write_admin" on public.tasks;
create policy "tasks_write_admin" on public.tasks
for all
using (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
)
with check (
  organization_id = public.current_organization_id()
  and public.current_app_role() in ('admin', 'staff')
);

drop policy if exists "tasks_update_assignee" on public.tasks;
create policy "tasks_update_assignee" on public.tasks
for update
using (
  organization_id = public.current_organization_id()
  and assigned_to = auth.uid()
)
with check (
  organization_id = public.current_organization_id()
  and assigned_to = auth.uid()
);

drop policy if exists "notes_read" on public.notes;
create policy "notes_read" on public.notes
for select
using (
  auth.role() = 'authenticated'
  and organization_id = public.current_organization_id()
);

drop policy if exists "notes_write" on public.notes;
create policy "notes_write" on public.notes
for insert
with check (
  auth.role() = 'authenticated'
  and organization_id = public.current_organization_id()
);

insert into storage.buckets (id, name, public)
values ('student-documents', 'student-documents', false)
on conflict (id) do nothing;

drop policy if exists "documents_storage_read" on storage.objects;
create policy "documents_storage_read" on storage.objects
for select
using (
  bucket_id = 'student-documents'
  and auth.role() = 'authenticated'
  and split_part(name, '/', 1) = public.current_organization_id()::text
);

drop policy if exists "documents_storage_insert" on storage.objects;
create policy "documents_storage_insert" on storage.objects
for insert
with check (
  bucket_id = 'student-documents'
  and public.current_app_role() in ('admin', 'staff')
  and split_part(name, '/', 1) = public.current_organization_id()::text
);

drop policy if exists "documents_storage_update" on storage.objects;
create policy "documents_storage_update" on storage.objects
for update
using (
  bucket_id = 'student-documents'
  and public.current_app_role() in ('admin', 'staff')
  and split_part(name, '/', 1) = public.current_organization_id()::text
);

drop policy if exists "documents_storage_delete" on storage.objects;
create policy "documents_storage_delete" on storage.objects
for delete
using (
  bucket_id = 'student-documents'
  and public.current_app_role() in ('admin', 'staff')
  and split_part(name, '/', 1) = public.current_organization_id()::text
);
