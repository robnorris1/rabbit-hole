# Rabbithole — Project Context

Drop this doc at the start of every Claude Code session. It is the source of truth for decisions made, conventions to follow, and what to build next.

---

## What this is

A UGC platform where people write about things they've gone genuinely deep on. Every post follows a loose format: **what sparked it → what you found → why it stuck**. That format *is* the editorial standard — it's what separates a rabbit hole from a blog post.

**Core monetisation:** Pro membership (£9/mo, billed quarterly = £27/charge) → quarterly printed book of the most upvoted rabbit holes. The physical book is the incentive mechanic for both writers and readers.

**Brand voice:** PostHog / James Hawkins LinkedIn. Dry wit, self-aware, opinionated. Never says "community for curious minds". Never uses "journey". Tagline: *"Proof that people still think interesting thoughts."*

---

## Current build status

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Foundations — CDK, Neon, CI/CD, Drizzle schema | ✅ Done |
| 1 | Read — feed, single hole view, end-of-article moment | ✅ Done |
| 2 | Write — editor, draft/publish, slug, read time | ✅ Done |
| 3 | Auth & Profiles — Cognito sign up/in, profiles, follows | 🔜 Next |
| 4 | Upvotes — toggle, count, optimistic UI | Pending |
| 5 | Pro — Stripe checkout, webhooks, pro status gating | Pending |
| 6 | Email — SES welcome, digest, receipts | Pending |
| 7 | Books — issue model, admin compilation, past issues | Pending |
| 8 | Polish — microcopy, 404/empty states, mobile QA, perf | Pending |

**Phases 0–4 = MVP.** Ship this, seed with real holes, get real feedback before touching Stripe.

### Phase 2 — what was built
- `app/write/page.tsx` — server page, loads existing draft if `?id=` param present
- `app/write/actions.ts` — `saveDraft` (upsert) + `publishHole` (slug generation, read time, redirect) server actions
- `app/_components/WriteEditor.tsx` — client editor with debounced autosave (2s) and Publish button
- `app/drafts/page.tsx` — lists the seed user's unpublished holes, links to `/write?id=xxx`
- `db/queries/holes.ts` — added `getSeedUser`, `getDraftsByAuthor`, `getDraftById`
- Author is hardcoded to seed user (`cognitoSub: 'local-seed-user'`). Real auth wired in Phase 3.

---

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 16 (App Router) | **Breaking changes from training data — always read `node_modules/next/dist/docs/` before writing Next.js code** |
| Database | Neon (serverless Postgres 16) | Free tier until paying users. Swap for Aurora later = just a `DATABASE_URL` change |
| ORM | Drizzle ORM | `db/schema.ts` is the source of truth. Never write raw SQL |
| Auth | AWS Cognito | JWT claims carry user ID — always validate, never trust client-supplied IDs |
| Infra | AWS CDK (`infra/`) | Deploy: `cdk deploy --context env=prod`. Region: `eu-west-2` |
| Deploy | `cdk-nextjs-standalone` v4 | OpenNext under the hood |
| Payments | Stripe | One product: Rabbithole Pro, quarterly billing |
| Email | AWS SES | Phase 6 |
| Styling | Tailwind v4 + CSS variables | See design tokens below |
| Runtime | Node 25 | Native TS support via `--experimental-strip-types` |

---

## Architectural decisions & why

**Neon over Aurora Serverless v2**
Aurora v2 doesn't truly scale to zero (min ~£22/month at 0.5 ACU). Neon is free until real traffic. Schema is identical Postgres — migration later is just a connection string swap.

**`"type": "module"` in package.json**
Required for Node 25 native ESM + TypeScript runner. All imports in `db/` files that run directly via Node need explicit `.ts` extensions (e.g. `import { db } from './index.ts'`). Next.js app code uses extensionless imports with the `@/` path alias — the bundler handles these.

**`allowImportingTsExtensions: true` in tsconfig**
Enables `.ts` extension imports without errors. Safe because `noEmit: true` is set.

**`@next/env` in `drizzle.config.ts`**
`drizzle-kit` doesn't load `.env.local` automatically (that's Next.js behaviour). `loadEnvConfig(process.cwd())` from `@next/env` handles it.

**Node `--env-file=.env.local` for seed scripts**
Same problem — Node scripts don't auto-load `.env.local`. The `db:seed` npm script includes this flag.

**Light mode default, dark via `data-theme="dark"`**
Design is warm paper (`#f4f0e7`) light mode. Dark mode is `[data-theme="dark"]` on `<html>`. Persisted in `localStorage` as `'rh-dark'`. Anti-flash script in `<head>` reads it before React hydration.

**Server components for data fetching, client components for interactivity**
`page.tsx` files are server components that fetch data from Neon and pass to client components. E.g. feed page fetches holes server-side → passes to `<FeedPage>` client component which handles search/tabs/votes.

**CDK in `infra/` subdirectory**
Separate `package.json`, `tsconfig.json` (commonjs module), excluded from root tsconfig. Run CDK commands from inside `infra/`.

---

## Key conventions (enforce these everywhere)

- **TypeScript strict mode, no `any`**
- **Drizzle schema = source of truth** — `db/schema.ts` defines everything
- **All timestamps are `timestamptz` (UTC)** — never naive timestamps
- **Slugs generated server-side on publish** — never client-side
- **`upvote_count` on `rabbit_holes` is denormalised** — update atomically with the upvotes insert/delete
- **Cognito JWT claims carry the user ID** — always validate, never trust client-supplied user IDs
- **Lambda handlers return `{ statusCode, body }`** — never throw uncaught
- **Stripe webhook handler must verify signature before touching DB**

---

## Design system

**Fonts**
- Serif: `Newsreader` (Google Fonts, loaded via `next/font/google`, variable `--font-newsreader`) — headings, editorial body text
- Sans: `Helvetica Neue, Helvetica, Arial, sans-serif` (system) — UI chrome, meta, monospace labels
- Mono: `ui-monospace, SF Mono, JetBrains Mono` (system) — tags, kickers, counts

**Colour tokens (CSS variables)**

| Token | Light | Dark |
|-------|-------|------|
| `--paper` | `#f4f0e7` | `#161418` |
| `--paper-2` | `#ece6d8` | `#1d1b21` |
| `--ink` | `#1b1a18` | `#ece6da` |
| `--ink-2` | `#57534a` | `#a39c90` |
| `--ink-3` | `#8b857a` | `#6f6a62` |
| `--accent` | `#9a4a32` | `#c4614a` |
| `--line` | `rgba(27,26,24,0.14)` | `rgba(236,230,218,0.13)` |

All tokens are also registered as Tailwind colours in `@theme inline` block in `globals.css`.

**Paper grain texture** — applied via `body::before` SVG filter. Extremely subtle.

**Key microcopy**
- Upvote button: "went down this too"
- Search placeholder: "What are you supposed to be doing right now?"
- First post published: "It begins."
- Empty feed: "Nobody's watching. Perfect time to write something weird."
- 404: has a rabbit hole reference (not "Oops, looks like you're lost!")

---

## File structure

```
rabbit-hole/
├── app/                         # Next.js app (App Router)
│   ├── layout.tsx               # Newsreader font, ThemeProvider, anti-flash script
│   ├── globals.css              # Design tokens, paper grain, all component CSS
│   ├── page.tsx                 # Feed page (server: fetch → pass to FeedPage client)
│   ├── holes/[slug]/page.tsx    # Single hole view
│   ├── write/
│   │   ├── page.tsx             # Write/edit page (server: load draft if ?id= param)
│   │   └── actions.ts           # saveDraft + publishHole server actions
│   ├── drafts/
│   │   └── page.tsx             # Lists seed user's unpublished drafts
│   ├── _components/
│   │   ├── ThemeProvider.tsx    # Dark/light context + localStorage
│   │   ├── TopBar.tsx           # Sticky header (client: search + theme toggle)
│   │   ├── FeedPage.tsx         # Full interactive feed (client: search/tabs/votes)
│   │   ├── WriteEditor.tsx      # Client editor — title/body, debounced autosave, publish
│   │   ├── Sidebar.tsx          # Pro book + Going deep now + Manifesto
│   │   ├── Footer.tsx           # Footer
│   │   ├── Rabbit.tsx           # SVG rabbit motif
│   │   └── EndOfHole.tsx        # End-of-article moment (intersection observer)
│   └── _lib/
│       └── time-stats.ts        # Witty read-time comparisons
├── db/
│   ├── schema.ts                # Drizzle schema (source of truth)
│   ├── index.ts                 # Neon/postgres client
│   ├── seed.ts                  # Dev seed (5 rabbit holes)
│   ├── migrations/              # Generated by drizzle-kit
│   └── queries/
│       └── holes.ts             # Feed, hole by slug, deep now, drafts queries
├── infra/                       # AWS CDK app (eu-west-2)
│   ├── bin/infra.ts
│   ├── lib/rabbithole-stack.ts  # Secrets Manager, Cognito, S3, OpenNext
│   ├── cdk.json
│   └── package.json            # Separate from root — commonjs module
├── docs/
│   ├── project-context.md       # This file
│   ├── rabbithole-dev-plan.docx
│   └── rabbithole-project-bible.docx
├── .env.local                   # Local secrets (not committed)
├── .env.local.example           # Template (committed)
├── .github/workflows/deploy.yml # CI/CD: lint+build on PRs, cdk deploy on main
├── drizzle.config.ts
├── CLAUDE.md → AGENTS.md        # Claude Code instructions
└── package.json                 # "type": "module", scripts below
```

---

## NPM scripts

```bash
npm run dev              # Next.js dev server
npm run build            # Production build
npm run lint             # ESLint
npm run db:generate      # Generate Drizzle migration from schema changes
npm run db:migrate       # Apply migrations to Neon
npm run db:seed          # Seed dev DB (clears + re-inserts seed user's holes)
npm run db:studio        # Drizzle Studio (DB browser)
```

---

## Local dev setup (from scratch)

1. `cp .env.local.example .env.local` — fill in `DATABASE_URL` from Neon dashboard (pooled connection string)
2. `npm install`
3. `npm run db:generate && npm run db:migrate`
4. `npm run db:seed`
5. `npm run dev` → http://localhost:3000

Cognito/Stripe/SES not needed until Phases 3/5/6.

---

## Phase 2 — what to build next

**Goal:** A `/write` page where the logged-in user can write and publish rabbit holes.

**Scope:**
- `/write` — new hole editor: title input + body textarea (blank canvas, no enforced structure yet)
- Draft autosave (debounced, every ~2s of inactivity)
- Publish action:
  - Generate slug from title (server-side, slugify + uniqueness check)
  - Calculate `read_time_mins` (word count ÷ 200, min 1)
  - Set `status = 'published'`, `published_at = now()`
  - Redirect to `/holes/[slug]`
- `/drafts` — list of the current user's unpublished holes
- For now: hardcode author to seed user (`cognitoSub = 'local-seed-user'`). Real auth wired in Phase 3.

**Editor note:** Phase 2 is a plain textarea (blank canvas). A rich text / markdown editor can come later in Phase 8 polish. Keep it simple.

---

## Phase 3 — Auth (Cognito)

- Cognito User Pool already provisioned in CDK stack
- Sign up / sign in flow
- JWT validation on API routes
- User profile pages (`/u/[username]`)
- Follow system
- Replace hardcoded seed user with real `req.user.id` from JWT claims

---

## Database schema (current)

See `db/schema.ts` for canonical definitions. Key tables:

- **`users`** — `cognitoSub`, `username`, `email`, `bio`, `proStatus`, `stripeCustomerId`
- **`rabbit_holes`** — `authorId`, `title`, `slug`, `spark`, `body`, `tags[]`, `featured`, `readTimeMins`, `status` (draft|published), `upvoteCount` (denormalised), `publishedAt`
- **`upvotes`** — `(userId, holeId)` primary key — one upvote per user per hole
- **`follows`** — `(followerId, followingId)` primary key
- **`book_issues`** — `issueNumber`, `season`, `status`, `cutoffDate`
- **`book_issue_holes`** — `issueId`, `holeId`, `rank`, `upvoteSnapshot`