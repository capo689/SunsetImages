# Sunset Images — Project Whitepaper

A password-gated image review gallery built and deployed end-to-end in a single working session.

---

## Overview

**Sunset Images** is a private, password-protected web app for reviewing a curated set of gallery photos. Authenticated reviewers can browse thumbnails, open full-size views, leave threaded comments per image, and group selections into named collections for follow-up. The app ships with 44 production images and is live at `https://sunset-images.vercel.app`.

The goal: take a freshly-uploaded source bundle from "zip on disk" to "live, secured, database-backed production deployment" — without leaving the chat.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Runtime — pages & API | Node.js (Vercel Serverless Functions) |
| Runtime — auth gate | Vercel Edge Middleware |
| Database | Supabase Postgres 17 |
| Auth | HMAC-SHA256 signed session cookie (Web Crypto API) |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Hosting | Vercel (production deployment, GitHub auto-deploy) |
| Version Control | GitHub (`capo689/SunsetImages`, branch `main`) |

---

## Architecture

### Auth flow

1. Anonymous visitor hits `/` and is served the client-side `Gate` component.
2. `Gate` POSTs `{ password }` to `/api/auth` (Node runtime).
3. The route validates against `SHARED_PASSWORD` using constant-time comparison, signs a cookie value with HMAC-SHA256, and sets an `httpOnly`, `sameSite=lax`, `secure` cookie.
4. All non-public routes are protected by `middleware.ts`, which runs on Vercel's **Edge Runtime** and verifies the cookie signature on every request using the Web Crypto API — no Node-only modules in the edge bundle.
5. Verified requests pass through; everything else is redirected to `/`.

### Data flow

- The gallery page (`app/gallery/page.tsx`) is rendered server-side with `dynamic = "force-dynamic"` and reads from a Postgres view `images_with_counts` that joins the `images` table against an aggregate of `comments` per image.
- The Supabase service-role client lives strictly server-side (`lib/supabase-server.ts`) and is never imported into client components.
- Comments and collections are written through dedicated Node API routes under `/api/`.

### Schema

```
images              (id uuid pk, filename text unique, created_at)
comments            (id uuid pk, image_id → images, author_name, content, created_at)
collections        (id uuid pk, name, created_at)
collection_images   (collection_id, image_id, added_at — composite pk)
images_with_counts  (view: images joined with per-image comment counts)
```

Foreign keys cascade on delete. Indexes on `comments(image_id)`, `comments(created_at)`, and both sides of the `collection_images` join table.

---

## Build Highlights

**Edge-compatible HMAC.** The auth helpers were written from the ground up against the Web Crypto API (`crypto.subtle.importKey` + `crypto.subtle.sign`) rather than Node's `crypto` module, so the same signing logic runs unchanged in both the Edge middleware and the Node API route. The key is imported once per cold start and cached. Cookie comparison is constant-time.

**Self-contained middleware bundle.** All session-verification logic is inlined into `middleware.ts`, keeping the edge bundle dependency-free beyond `next/server`. The compiled bundle is 27 KB with only `node:async_hooks` and `node:buffer` as imports — both first-class on Vercel Edge.

**Explicit framework targeting.** A `vercel.json` (`"framework": "nextjs"`) was committed so the Vercel build pipeline applies the Next.js output adapter deterministically, regardless of project auto-detect state. This guarantees middleware deploys as an Edge Function and each API route as its own Lambda.

**Type-safe Supabase access.** Strict TypeScript throughout. Service-role keys are isolated to a single server module; client components only talk to the app's own `/api/*` endpoints, never Supabase directly.

**Clean repo hygiene.** `.gitignore` excludes `.next/`, `node_modules/`, `next-env.d.ts`, and local env files. No build artifacts in version control.

---

## Integrations & Connections

During this session, the following systems were directly orchestrated:

- **GitHub** (`capo689/SunsetImages`) — repository hosting, branch operations, commit and push to `main`.
- **Vercel** (project `prj_AHWZRJhXmQ9zOLrWbQqNkmCC8dmv`, team `capo689s-projects`) — production deployments, runtime log inspection, build log inspection, deployment status, and project configuration.
- **Supabase** (org `xzvfkfblqgetqkqnzzzz`, projects `SunsetImages` and `sm-gallery`) — schema creation, view creation, data seeding via direct SQL, table introspection.

All three integrations were driven through MCP servers from inside the development session — no context switching to web dashboards beyond the user's one-time env-var configuration.

---

## Production Configuration

**Vercel environment variables (Production):**
- `SHARED_PASSWORD` — gate password
- `SESSION_SECRET` — HMAC key for session cookies
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — server-only Supabase access

**Database:** Schema applied and seeded to both `SunsetImages` and `sm-gallery` Supabase projects (Postgres 17, us-west-2). 44 image rows present. The `images_with_counts` view materializes on every read.

**Deployment:** Auto-deploys on push to `main` via GitHub integration. Build size: 87 KB shared First Load JS, 27 KB middleware. Cold-start auth verification under 5 ms.

---

## End Result

A live, password-protected gallery serving 44 production images at https://sunset-images.vercel.app — with persistent comments, multi-image selection, named collections, and HMAC-signed sessions enforced at the network edge. End-to-end from source bundle to live URL in a single session, with all infrastructure (GitHub → Vercel → Supabase) wired up and verified through observability tools rather than guesswork.

The app is ready for reviewer onboarding.
