create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$
begin
  create type public.gift_status as enum ('available', 'reserved', 'hidden', 'owned', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.reservation_status as enum ('confirmed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.event_settings (
  id uuid primary key default gen_random_uuid(),
  event_date timestamptz not null,
  event_time text not null,
  location_name text not null,
  address text not null,
  google_maps_url text not null,
  whatsapp_number text not null,
  dress_code text,
  welcome_message text not null,
  event_headline text,
  event_description text,
  couple_photo_url text,
  couple_photo_alt text,
  ultrasound_photo_url text,
  ultrasound_photo_alt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  suggested_brands text[] not null default '{}',
  image_url text,
  description text not null,
  notes text,
  quantity_needed integer not null check (quantity_needed > 0),
  quantity_owned integer not null default 0 check (quantity_owned >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  progress_weight numeric(8, 2) not null default 1 check (progress_weight > 0),
  status public.gift_status not null default 'available',
  is_public boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gifts_quantities_are_possible check (quantity_owned + quantity_reserved <= quantity_needed)
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gifts(id) on delete restrict,
  guest_name text not null check (length(trim(guest_name)) >= 2),
  guest_phone text,
  guest_message text,
  quantity integer not null check (quantity > 0),
  status public.reservation_status not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists categories_display_order_idx on public.categories(display_order);
create index if not exists gifts_category_idx on public.gifts(category_id);
create index if not exists gifts_public_status_idx on public.gifts(is_public, status);
create index if not exists gifts_display_order_idx on public.gifts(display_order);
create index if not exists gifts_search_idx
  on public.gifts using gin ((name || ' ' || coalesce(description, '') || ' ' || coalesce(notes, '')) gin_trgm_ops);
create index if not exists reservations_gift_status_idx on public.reservations(gift_id, status);
create index if not exists reservations_created_at_idx on public.reservations(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_event_settings_updated_at on public.event_settings;
create trigger set_event_settings_updated_at
before update on public.event_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_gifts_updated_at on public.gifts;
create trigger set_gifts_updated_at
before update on public.gifts
for each row execute function public.set_updated_at();

drop trigger if exists set_reservations_updated_at on public.reservations;
create trigger set_reservations_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;
create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    exists(select 1 from public.admin_profiles where user_id = p_user_id),
    false
  );
$$;

create or replace function public.sync_gift_reservation_state(p_gift_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reserved integer;
begin
  select coalesce(sum(quantity), 0)::integer
  into v_reserved
  from public.reservations
  where gift_id = p_gift_id
    and status = 'confirmed';

  update public.gifts
  set
    quantity_reserved = v_reserved,
    status = case
      when status in ('hidden', 'owned', 'archived') then status
      when quantity_owned + v_reserved >= quantity_needed then 'reserved'::public.gift_status
      else 'available'::public.gift_status
    end,
    updated_at = now()
  where id = p_gift_id;
end;
$$;

create or replace function public.handle_reservation_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_gift_reservation_state(old.gift_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.gift_id <> new.gift_id then
    perform public.sync_gift_reservation_state(old.gift_id);
    perform public.sync_gift_reservation_state(new.gift_id);
    return new;
  end if;

  perform public.sync_gift_reservation_state(new.gift_id);
  return new;
end;
$$;

drop trigger if exists reservations_sync_gift on public.reservations;
create trigger reservations_sync_gift
after insert or update or delete on public.reservations
for each row execute function public.handle_reservation_sync();

create or replace function public.get_registry_progress()
returns table (
  total_weight numeric,
  completed_weight numeric,
  percentage numeric,
  total_items integer,
  owned_items integer,
  reserved_items integer
)
language sql
security definer
set search_path = public
stable
as $$
  with totals as (
    select
      coalesce(sum(quantity_needed * progress_weight), 0)::numeric as total_weight,
      coalesce(sum(least(quantity_needed, quantity_owned + quantity_reserved) * progress_weight), 0)::numeric as completed_weight,
      coalesce(sum(quantity_needed), 0)::integer as total_items,
      coalesce(sum(quantity_owned), 0)::integer as owned_items,
      coalesce(sum(quantity_reserved), 0)::integer as reserved_items
    from public.gifts
    where status <> 'archived'
  )
  select
    total_weight,
    completed_weight,
    case
      when total_weight = 0 then 0
      else round((completed_weight / total_weight) * 100, 1)
    end as percentage,
    total_items,
    owned_items,
    reserved_items
  from totals;
$$;

create or replace function public.create_gift_reservation(
  p_gift_id uuid,
  p_quantity integer,
  p_guest_name text,
  p_guest_phone text default null,
  p_guest_message text default null
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gift public.gifts%rowtype;
  v_remaining integer;
  v_reservation public.reservations%rowtype;
begin
  if p_quantity is null or p_quantity < 1 then
    raise exception 'A quantidade precisa ser maior que zero.';
  end if;

  if p_guest_name is null or length(trim(p_guest_name)) < 2 then
    raise exception 'Informe seu nome para confirmar a reserva.';
  end if;

  select *
  into v_gift
  from public.gifts
  where id = p_gift_id
  for update;

  if not found then
    raise exception 'Presente nao encontrado.';
  end if;

  if not v_gift.is_public or v_gift.status not in ('available', 'reserved') then
    raise exception 'Este presente nao esta disponivel para reserva.';
  end if;

  v_remaining := v_gift.quantity_needed - v_gift.quantity_owned - v_gift.quantity_reserved;

  if v_remaining < p_quantity then
    raise exception 'Quantidade indisponivel. Restam apenas % unidade(s).', greatest(v_remaining, 0);
  end if;

  insert into public.reservations (
    gift_id,
    guest_name,
    guest_phone,
    guest_message,
    quantity,
    status
  )
  values (
    p_gift_id,
    trim(p_guest_name),
    nullif(trim(coalesce(p_guest_phone, '')), ''),
    nullif(trim(coalesce(p_guest_message, '')), ''),
    p_quantity,
    'confirmed'
  )
  returning * into v_reservation;

  perform public.sync_gift_reservation_state(p_gift_id);

  return v_reservation;
end;
$$;

create or replace function public.cancel_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation public.reservations%rowtype;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Apenas administradores podem cancelar reservas.' using errcode = '42501';
  end if;

  update public.reservations
  set status = 'cancelled'
  where id = p_reservation_id
  returning * into v_reservation;

  if not found then
    raise exception 'Reserva nao encontrada.';
  end if;

  perform public.sync_gift_reservation_state(v_reservation.gift_id);

  insert into public.audit_logs(actor_id, action, entity, entity_id, metadata)
  values (auth.uid(), 'cancel_reservation', 'reservations', p_reservation_id, '{}'::jsonb);

  return v_reservation;
end;
$$;

alter table public.event_settings enable row level security;
alter table public.categories enable row level security;
alter table public.gifts enable row level security;
alter table public.reservations enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Public event settings are readable" on public.event_settings;
create policy "Public event settings are readable"
on public.event_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage event settings" on public.event_settings;
create policy "Admins manage event settings"
on public.event_settings for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Public categories are readable" on public.categories;
create policy "Public categories are readable"
on public.categories for select
to anon, authenticated
using (is_active);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
on public.categories for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Public gifts are readable" on public.gifts;
create policy "Public gifts are readable"
on public.gifts for select
to anon, authenticated
using (is_public and status in ('available', 'reserved'));

drop policy if exists "Admins manage gifts" on public.gifts;
create policy "Admins manage gifts"
on public.gifts for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins read reservations" on public.reservations;
create policy "Admins read reservations"
on public.reservations for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins update reservations" on public.reservations;
create policy "Admins update reservations"
on public.reservations for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins read admin profiles" on public.admin_profiles;
create policy "Admins read admin profiles"
on public.admin_profiles for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins manage admin profiles" on public.admin_profiles;
create policy "Admins manage admin profiles"
on public.admin_profiles for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins read audit logs" on public.audit_logs;
create policy "Admins read audit logs"
on public.audit_logs for select
to authenticated
using (public.is_admin(auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.event_settings, public.categories, public.gifts to anon, authenticated;
grant select, insert, update, delete on public.event_settings, public.categories, public.gifts, public.reservations to authenticated;
grant select on public.admin_profiles, public.audit_logs to authenticated;
grant execute on function public.get_registry_progress() to anon, authenticated;
grant execute on function public.create_gift_reservation(uuid, integer, text, text, text) to anon, authenticated;
grant execute on function public.cancel_reservation(uuid) to authenticated;
