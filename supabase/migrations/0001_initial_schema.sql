-- Fiber Link initial schema, RLS, storage, and approval RPCs.
-- Prices are stored as integer PKR (not paisa).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'roman_ur')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  download_speed_mbps integer not null check (download_speed_mbps >= 0),
  upload_speed_mbps integer check (upload_speed_mbps is null or upload_speed_mbps >= 0),
  monthly_price_pkr integer not null check (monthly_price_pkr >= 0),
  installation_fee_pkr integer check (installation_fee_pkr is null or installation_fee_pkr >= 0),
  billing_period text not null default 'monthly',
  data_limit_label text not null default 'Unlimited',
  features jsonb not null default '[]'::jsonb,
  is_popular boolean not null default false,
  is_active boolean not null default false,
  is_archived boolean not null default false,
  is_demo boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  package_id uuid references public.packages (id) on delete set null,
  package_name_snapshot text not null,
  download_speed_snapshot integer not null,
  monthly_price_pkr_snapshot integer not null check (monthly_price_pkr_snapshot >= 0),
  customer_name text not null,
  customer_phone text not null,
  installation_address text not null,
  city text not null,
  notes text,
  status text not null check (
    status in (
      'draft',
      'pending_payment',
      'payment_submitted',
      'under_review',
      'active',
      'rejected',
      'cancelled',
      'expired'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users (id)
);

create table public.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_pkr integer not null check (amount_pkr >= 0),
  payment_method text not null,
  transaction_reference text,
  proof_storage_path text not null,
  status text not null check (
    status in ('not_submitted', 'submitted', 'under_review', 'approved', 'rejected')
  ),
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  email_type text not null,
  entity_id uuid not null,
  recipient_email text not null,
  status text not null check (status in ('sent', 'failed', 'preview')),
  error_message text,
  created_at timestamptz not null default now(),
  unique (email_type, entity_id)
);

create table public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index subscriptions_user_id_idx on public.subscriptions (user_id);
create index subscriptions_status_idx on public.subscriptions (status);
create index subscriptions_reference_code_idx on public.subscriptions (reference_code);
create index subscriptions_created_at_idx on public.subscriptions (created_at desc);
create index payment_submissions_subscription_id_idx on public.payment_submissions (subscription_id);
create index payment_submissions_user_id_idx on public.payment_submissions (user_id);
create index payment_submissions_status_idx on public.payment_submissions (status);
create index payment_submissions_created_at_idx on public.payment_submissions (created_at desc);
create index packages_active_order_idx on public.packages (is_active, display_order);
create index admin_audit_logs_created_at_idx on public.admin_audit_logs (created_at desc);
create index rate_limit_events_lookup_idx on public.rate_limit_events (user_id, action, created_at desc);

create trigger packages_updated_at before update on public.packages
for each row execute function public.set_updated_at();

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger subscriptions_updated_at before update on public.subscriptions
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New user bootstrap: profile + customer role only
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, preferred_language)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    coalesce(nullif(new.raw_user_meta_data->>'preferred_language', ''), 'en')
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Reference codes
-- ---------------------------------------------------------------------------

create or replace function public.generate_reference_code()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := 'FL-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.subscriptions where reference_code = candidate);
  end loop;
  return candidate;
end;
$$;

-- ---------------------------------------------------------------------------
-- Customer: create subscription with package snapshot
-- ---------------------------------------------------------------------------

create or replace function public.create_subscription(
  p_package_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_installation_address text,
  p_city text,
  p_notes text default null
)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  pkg public.packages%rowtype;
  created public.subscriptions%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into pkg
  from public.packages
  where id = p_package_id
    and is_active = true
    and is_archived = false;

  if not found then
    raise exception 'Package is not available';
  end if;

  insert into public.subscriptions (
    reference_code,
    user_id,
    package_id,
    package_name_snapshot,
    download_speed_snapshot,
    monthly_price_pkr_snapshot,
    customer_name,
    customer_phone,
    installation_address,
    city,
    notes,
    status
  ) values (
    public.generate_reference_code(),
    auth.uid(),
    pkg.id,
    pkg.name,
    pkg.download_speed_mbps,
    pkg.monthly_price_pkr,
    p_customer_name,
    p_customer_phone,
    p_installation_address,
    p_city,
    p_notes,
    'pending_payment'
  )
  returning * into created;

  return created;
end;
$$;

grant execute on function public.create_subscription(uuid, text, text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Customer: submit payment proof (does NOT activate)
-- ---------------------------------------------------------------------------

create or replace function public.submit_payment_proof(
  p_subscription_id uuid,
  p_amount_pkr integer,
  p_payment_method text,
  p_transaction_reference text,
  p_proof_storage_path text
)
returns public.payment_submissions
language plpgsql
security definer
set search_path = public
as $$
declare
  sub public.subscriptions%rowtype;
  created public.payment_submissions%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into sub
  from public.subscriptions
  where id = p_subscription_id
  for update;

  if not found or sub.user_id <> auth.uid() then
    raise exception 'Subscription not found';
  end if;

  if sub.status not in ('pending_payment', 'rejected') then
    raise exception 'Payment proof cannot be submitted in the current status';
  end if;

  if exists (
    select 1
    from public.payment_submissions
    where subscription_id = p_subscription_id
      and status in ('submitted', 'under_review', 'approved')
  ) then
    raise exception 'A payment proof is already awaiting review';
  end if;

  insert into public.payment_submissions (
    subscription_id,
    user_id,
    amount_pkr,
    payment_method,
    transaction_reference,
    proof_storage_path,
    status
  ) values (
    p_subscription_id,
    auth.uid(),
    p_amount_pkr,
    p_payment_method,
    p_transaction_reference,
    p_proof_storage_path,
    'submitted'
  )
  returning * into created;

  update public.subscriptions
  set status = 'payment_submitted'
  where id = p_subscription_id;

  return created;
end;
$$;

grant execute on function public.submit_payment_proof(uuid, integer, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin: atomic approve / reject
-- ---------------------------------------------------------------------------

create or replace function public.approve_payment(
  p_submission_id uuid,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  submission public.payment_submissions%rowtype;
  sub public.subscriptions%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  select * into submission
  from public.payment_submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Payment submission not found';
  end if;

  if submission.status = 'approved' then
    raise exception 'Payment already approved';
  end if;

  if submission.status not in ('submitted', 'under_review') then
    raise exception 'Payment cannot be approved from the current status';
  end if;

  select * into sub
  from public.subscriptions
  where id = submission.subscription_id
  for update;

  if sub.status = 'active' then
    raise exception 'Subscription is already active';
  end if;

  update public.payment_submissions
  set
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    rejection_reason = null
  where id = p_submission_id;

  update public.subscriptions
  set
    status = 'active',
    approved_at = now(),
    approved_by = auth.uid()
  where id = sub.id;

  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    'payment_approved',
    'payment_submission',
    p_submission_id,
    jsonb_build_object(
      'subscription_id', sub.id,
      'note', p_note,
      'warning', 'Active means approved in Fiber Link, not ISP provisioning'
    )
  );

  return jsonb_build_object('ok', true, 'subscription_id', sub.id);
end;
$$;

create or replace function public.reject_payment(
  p_submission_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  submission public.payment_submissions%rowtype;
  sub public.subscriptions%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  select * into submission
  from public.payment_submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Payment submission not found';
  end if;

  if submission.status = 'approved' then
    raise exception 'Approved payments cannot be rejected';
  end if;

  if submission.status not in ('submitted', 'under_review') then
    raise exception 'Payment cannot be rejected from the current status';
  end if;

  select * into sub
  from public.subscriptions
  where id = submission.subscription_id
  for update;

  update public.payment_submissions
  set
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    rejection_reason = p_reason
  where id = p_submission_id;

  update public.subscriptions
  set
    status = 'rejected',
    approved_at = null,
    approved_by = null
  where id = sub.id;

  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    'payment_rejected',
    'payment_submission',
    p_submission_id,
    jsonb_build_object(
      'subscription_id', sub.id,
      'reason', p_reason
    )
  );

  return jsonb_build_object('ok', true, 'subscription_id', sub.id);
end;
$$;

create or replace function public.mark_payment_under_review(p_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  update public.payment_submissions
  set status = 'under_review'
  where id = p_submission_id
    and status = 'submitted';

  update public.subscriptions s
  set status = 'under_review'
  from public.payment_submissions p
  where p.id = p_submission_id
    and s.id = p.subscription_id
    and s.status = 'payment_submitted';
end;
$$;

grant execute on function public.approve_payment(uuid, text) to authenticated;
grant execute on function public.reject_payment(uuid, text) to authenticated;
grant execute on function public.mark_payment_under_review(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Notification logging (idempotent)
-- ---------------------------------------------------------------------------

create or replace function public.record_notification(
  p_email_type text,
  p_entity_id uuid,
  p_recipient_email text,
  p_status text,
  p_error_message text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notification_logs (email_type, entity_id, recipient_email, status, error_message)
  values (p_email_type, p_entity_id, p_recipient_email, p_status, p_error_message)
  on conflict (email_type, entity_id) do nothing;

  return found;
end;
$$;

grant execute on function public.record_notification(text, uuid, text, text, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.packages enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_submissions enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.app_settings enable row level security;
alter table public.notification_logs enable row level security;
alter table public.rate_limit_events enable row level security;

create policy "public_read_active_packages"
on public.packages
for select
using (is_active = true and is_archived = false);

create policy "admin_all_packages"
on public.packages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "users_read_own_profile"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "users_update_own_profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "users_read_own_role"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

-- No insert/update/delete policies for customers on user_roles.

create policy "customers_read_own_subscriptions"
on public.subscriptions
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "admin_update_subscriptions"
on public.subscriptions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "customers_read_own_payments"
on public.payment_submissions
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "admin_read_audit_logs"
on public.admin_audit_logs
for select
to authenticated
using (public.is_admin());

create policy "public_read_public_settings"
on public.app_settings
for select
using (is_public = true);

create policy "admin_all_settings"
on public.app_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "users_read_own_notifications"
on public.notification_logs
for select
to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: private payment proofs
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do update set public = false;

create policy "customers_upload_own_proofs"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payment-proofs'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce(split_part(name, '.', array_length(string_to_array(name, '.'), 1)), '') not in ('svg', 'exe', 'js', 'html', 'htm')
);

create policy "customers_read_own_proofs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-proofs'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);

create policy "no_public_proof_access"
on storage.objects
for update
to authenticated
using (false);

create policy "admins_delete_proofs"
on storage.objects
for delete
to authenticated
using (bucket_id = 'payment-proofs' and public.is_admin());
