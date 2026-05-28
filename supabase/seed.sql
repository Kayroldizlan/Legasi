-- ============================================================================
-- ConnectDirectory - Demo seed data (optional)
-- Run AFTER schema.sql and after signing up at least one auth user.
-- ============================================================================
-- This seed only creates a few demo profile rows. Real users come from auth.
-- ============================================================================

insert into public.profiles (id, username, full_name, email, occupation, company, city, country, bio, is_verified)
values
  (gen_random_uuid(), 'demo_jane',   'Jane Doe',     'jane@example.com',   'Product Designer', 'Acme Studio',  'Manila',  'Philippines', 'Designing delightful products.',  true),
  (gen_random_uuid(), 'demo_mark',   'Mark Cruz',    'mark@example.com',   'Software Engineer','Vercel Inc.',  'Cebu',    'Philippines', 'Full-stack engineer.',            true),
  (gen_random_uuid(), 'demo_ana',    'Ana Reyes',    'ana@example.com',    'CEO',              'BrightCo',     'Davao',   'Philippines', 'Leading with vision.',            false)
on conflict (username) do nothing;
