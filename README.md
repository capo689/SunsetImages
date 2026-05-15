# SM Review

Private image review tool. Reviewers enter a shared password and their name,
browse a thumbnail gallery, comment on individual images, and bundle images into
named collections. Comments live with the image, so a comment posted in any
view shows up everywhere that image appears.

## What's already done

- **Code:** all of it
- **Supabase project:** created (`sm-gallery`, us-west-1, free tier)
- **Schema:** applied (tables: images, comments, collections, collection_images, plus images_with_counts view)
- **Env file:** `.env.local` is pre-filled with the project URL, a 32-byte session secret, and a default shared password

## What's still on you (about 15 minutes)

### 1. Grab the service_role key

Open https://supabase.com/dashboard/project/bqmtuzuyvtlnfsoavuey/settings/api-keys
Copy the `service_role` secret (NOT anon) into the bottom line of `.env.local`.
The Supabase MCP intentionally doesn't expose this key for security, so it has
to be manual.

### 2. Drop the images in

In Google Drive, open the SMSuper folder, select all images, right-click,
Download. Drive will give you a ZIP. Extract it into `public/images/` so you
end up with `public/images/AK_01_Gallery.jpg` etc. About 46 files.

### 3. Install, seed, run

```bash
npm install
npm run seed    # creates a row per image
npm run dev     # http://localhost:3000
```

Log in with password `UvFaA9OBTGHG` (change in `.env.local` if you want a
different one) and any name. Verify everything works.

### 4. Deploy

```bash
git init
git add .
git commit -m "initial"
gh repo create sm-gallery --private --source=. --remote=origin --push
```

(If you don't use the `gh` CLI, create the repo in GitHub UI, then
`git remote add origin <url>` and `git push -u origin main`.)

In Vercel:
1. Import the repo
2. Copy the four env vars from `.env.local` into Settings, Environment Variables
3. Deploy

Send the deployment URL plus the password to your reviewers. Done.

## How it works

- `/` is the gate: name + password
- Middleware (`middleware.ts`) enforces the cookie on every route except gate,
  auth POST, and static files
- `/gallery` is the main grid; comment dots on thumbnails, checkboxes for select
- Lightbox shows full image + comment thread, posts back through `/api/comments`
- Selecting one or more thumbs reveals the bottom bar: New collection or Add to
  existing. Sidebar shows all collections.
- Comments are tied to image, not view, so they appear wherever the image lives.

## Adding images later

Drop new `.jpg` files into `public/images/`, commit, push, then run
`npm run seed` against production env vars locally. Seed is idempotent (only
inserts new filenames).

## Security notes

- Service-role key is server-side only (route handlers and seed script). Never
  reaches the browser.
- Row Level Security is not enabled because access is gated by the password and
  writes happen server-side. Add RLS later if you need finer permissions.
- Auth cookie is HMAC-signed but not encrypted. Rotate `SESSION_SECRET` to
  invalidate every active session at once.

## File map

```
app/
  page.tsx                      Gate
  gallery/page.tsx              All images view
  collections/[id]/page.tsx     Single collection view
  api/auth/route.ts             Password verify, cookie set
  api/comments/route.ts         List and create
  api/collections/route.ts      Create collection
  api/collections/add/route.ts  Add to existing collection
components/
  Gate.tsx                      Login form
  GalleryClient.tsx             Grid state orchestrator
  Thumbnail.tsx                 Image tile (dot, checkbox, click)
  Lightbox.tsx                  Floating image + comment thread
  Sidebar.tsx                   Collections nav
  SelectionBar.tsx              Sticky bottom action bar
lib/
  auth.ts                       HMAC signing for the gate cookie
  supabase-server.ts            Service-role client
middleware.ts                   Cookie enforcement
supabase/schema.sql             Tables and view (already applied)
scripts/seed.ts                 Insert image rows for new files
.env.local                      Pre-filled (service_role still needed)
```
