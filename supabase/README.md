# Supabase setup

This folder contains everything needed to bring up the ConnectDirectory backend on a fresh Supabase project.

## Files

| File         | Purpose                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| `schema.sql` | The full Postgres schema, RLS policies, triggers, and storage buckets.   |
| `seed.sql`   | Optional demo profile rows (does **not** create auth users).             |

## Steps

1. Create a Supabase project at <https://supabase.com>.
2. Open **SQL Editor → New query**.
3. Paste the contents of `schema.sql` and click **Run**.
4. (Optional) Paste `seed.sql` and **Run** to add demo profile rows.
5. In **Authentication → URL configuration**:
   - Set **Site URL** to your dev URL, e.g. `http://localhost:3000`.
   - Add your production URL to the redirect allow list.
6. (Optional) Enable Google in **Authentication → Providers** using your Google OAuth client.
7. Copy the keys into `.env.local` of the Next.js app.

## After signing up

Promote yourself to admin:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Sign out and back in, then visit `/admin`.
