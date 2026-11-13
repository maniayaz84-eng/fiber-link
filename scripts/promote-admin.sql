-- One-time admin bootstrap.
-- 1. Sign up on the website as a normal customer.
-- 2. Copy that user's UUID from Supabase Auth > Users.
-- 3. Replace YOUR_USER_UUID below and run this in the Supabase SQL editor.
-- Public sign-up never creates admins.

update public.user_roles
set role = 'admin'
where user_id = 'YOUR_USER_UUID';

-- Confirm:
-- select user_id, role from public.user_roles where role = 'admin';
