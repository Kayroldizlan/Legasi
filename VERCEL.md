# Deploy ConnectDirectory to Vercel

Your repo is on GitHub: **https://github.com/Kayroldizlan/Legasi**

## Option A — Import from GitHub (recommended)

1. Open **[vercel.com/new](https://vercel.com/new)** and sign in (GitHub account).
2. Click **Import** next to **`Kayroldizlan/Legasi`**.
3. Configure the project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (default)
   - **Install Command:** `npm install` (default)

4. Add **Environment Variables** (Production + Preview):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase → Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase → Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | From Supabase → Settings → API (secret) |
   | `NEXT_PUBLIC_APP_NAME` | `ConnectDirectory` |
   | `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` (update after first deploy) |

5. Click **Deploy**.

6. After deploy, copy your live URL (e.g. `https://legasi.vercel.app`) and:
   - Set **`NEXT_PUBLIC_APP_URL`** in Vercel → Project → Settings → Environment Variables to that URL, then **Redeploy**.
   - In **Supabase → Authentication → URL Configuration**:
     - **Site URL:** `https://YOUR-PROJECT.vercel.app`
     - **Redirect URLs:** add `https://YOUR-PROJECT.vercel.app/**` and `https://YOUR-PROJECT.vercel.app/auth/callback`

7. (Optional) Add a custom domain in Vercel → Settings → Domains.

---

## Option B — Vercel CLI

```powershell
cd D:\Legasi
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add NEXT_PUBLIC_APP_NAME
npx vercel env add NEXT_PUBLIC_APP_URL
npx vercel --prod
```

---

## Post-deploy checklist

- [ ] Supabase `schema.sql` has been run in SQL Editor
- [ ] All env vars set in Vercel (Production + Preview)
- [ ] `NEXT_PUBLIC_APP_URL` matches the live Vercel URL
- [ ] Supabase auth redirect URLs include your Vercel domain
- [ ] Google OAuth redirect URI includes Supabase callback (if using Google login)
- [ ] Promote admin: `update public.profiles set role = 'admin' where email = 'you@example.com';`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Auth redirect loop | Match `NEXT_PUBLIC_APP_URL` and Supabase Site URL exactly |
| Build fails on icons | `sharp` runs in `postinstall`; ensure Node 18+ on Vercel (default) |
| 500 on admin actions | Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel env |
| PWA not updating | Hard refresh; SW only runs in production builds |
