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
| 3 | Auth & Profiles — Cognito sign up/in, profiles, follows | ✅ Done |
| 4 | Upvotes — toggle, count, optimistic UI | ✅ Done |
| 5 | Polish — 404/empty states, mobile QA, perf, onboarding | 🔜 Next |
| 6 | Email — SES welcome, digest, writer onboarding | Pending |
| 7 | Pro — Stripe checkout, webhooks, pro status gating | Deferred — build audience first |
| 8 | Books — issue model, admin compilation, past issues | Deferred — depends on Pro |

**Phases 0–4 = MVP.** ✅ Complete — focus now is seeding with real writers and real holes before monetising.

**Why Stripe is deferred:** Pro membership only makes sense once there's enough content worth paying for. Ship the "coming soon" UI to signal intent, but don't build the payment flow until there's a real reader audience to convert.

### Phase 3 — what was built
- `app/_lib/session.ts` — `getSession()` / `requireSession()` — lazy JWT validation via `aws-jwt-verify`, HTTP-only cookie (`rh-token` = ID token, `rh-access` = access token)
- `app/auth/actions.ts` — `setSessionCookie`, `signUp`, `confirmSignUp`, `signOut` (revokes Cognito token via `GlobalSignOutCommand`)
- `app/auth/sign-in/` — sign in page; SRP auth runs client-side via `amazon-cognito-identity-js`, tokens passed to server action to set cookies
- `app/auth/sign-up/` — sign up page; creates Cognito user + DB record atomically
- `app/auth/confirm/` — email confirmation code page
- `db/queries/users.ts` — `getUserByCognitoSub`, `getUserByUsername`, `createUser`
- `db/queries/follows.ts` — `getFollowCounts`, `isFollowing`, `toggleFollow`
- `app/u/[username]/page.tsx` — public profile page: bio, follower/following counts, published holes, follow button
- `app/u/[username]/actions.ts` — `toggleFollowAction` server action
- `TopBar` — shows `@username → /u/[username]` + sign out when signed in; Sign in / Sign up when signed out
- All pages (`/`, `/write`, `/drafts`, `/holes/[slug]`) pass real `currentUser` to TopBar
- `write/actions.ts` — replaced hardcoded seed user with `requireSession()` + DB lookup
- `drafts/page.tsx` — protected by `requireSession()`
- DB: added `CHECK (follower_id != following_id)` constraint on follows table (migration `0002`)

**Auth flow:** SRP auth client-side → `setSessionCookie` server action validates + stores tokens → `getSession()` reads + validates on every request. Sign out calls `GlobalSignOutCommand` to revoke the Cognito token then deletes cookies.

**Security fixes applied:** SRP (not USER_PASSWORD_AUTH), token revocation on sign-out, stronger password policy (10 chars, uppercase + digit), lazy JWT verifier init, self-follow DB constraint.

### Phase 4 — what was built
- `db/queries/upvotes.ts` — `toggleUpvote` (atomic transaction: insert/delete upvote + update denormalised `upvote_count`), `getUpvotedHoleIds`, `isUpvoted`
- `app/_actions/upvote.ts` — `toggleUpvoteAction` server action — auth-gated, returns `{ error: 'sign-in' }` for unauthenticated users
- `app/page.tsx` — fetches `votedIds` for signed-in user, passes to `FeedPage`
- `app/_components/FeedPage.tsx` — initialises voted state from server, optimistic toggle with revert on error, redirects to sign-in if not authed; count formula accounts for initial DB state (`upvoteCount + current - initial`)
- `app/holes/[slug]/page.tsx` — fetches `initialVoted` server-side, passes `holeId` + `initialVoted` + `isSignedIn` to `EndOfHole`
- `app/_components/EndOfHole.tsx` — wired to `toggleUpvoteAction`, same optimistic pattern

**Upvote flow:** vote button click → optimistic state update → `toggleUpvoteAction` → DB transaction (upvotes table + `upvote_count` on `rabbit_holes`) → revert on error. Unauthenticated users redirected to `/auth/sign-in`.

---

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 16 (App Router) | **Breaking changes from training data — always read `node_modules/next/dist/docs/` before writing Next.js code** |
| Database | Neon (serverless Postgres 16) | Free tier until paying users. Swap for Aurora later = just a `DATABASE_URL` change |
| ORM | Drizzle ORM | `db/schema.ts` is the source of truth. Never write raw SQL |
| Auth | AWS Cognito | SRP flow client-side. JWT validated server-side via `aws-jwt-verify`. ID token in HTTP-only cookie |
| Infra | AWS CDK (`infra/`) | Deploy via GitHub Actions on push to `main`. Region: `eu-west-2` |
| Deploy | `cdk-nextjs-standalone` v4 | OpenNext under the hood. CloudFront + Lambda |
| Payments | Stripe | One product: Rabbithole Pro, quarterly billing. Phase 5 |
| Email | AWS SES | Phase 6. Currently in sandbox mode (emails may go to spam) |
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
Separate `package.json`, `tsconfig.json` (commonjs module), excluded from root tsconfig. Deploy happens via GitHub Actions — do not run CDK manually.

**`DATABASE_URL` passed as Lambda environment variable**
Not stored in Secrets Manager — baked into the Lambda env at deploy time from the GitHub Actions secret. Lambda env vars are encrypted at rest by AWS. Simpler and cheaper than Secrets Manager for a connection string that doesn't rotate.

**SRP auth flow**
Sign-in uses `amazon-cognito-identity-js` client-side (SRP — password never leaves the browser). On success, tokens are passed to a `setSessionCookie` server action which validates the ID token with `aws-jwt-verify` before storing in HTTP-only cookies. Never use `USER_PASSWORD_AUTH` (sends password to server).

**Lazy JWT verifier initialisation**
`CognitoJwtVerifier.create()` validates the User Pool ID format at construction time, which would fail during `next build` with placeholder env vars. Both `session.ts` and `auth/actions.ts` use a lazy singleton pattern to defer creation until first request.

---

## Key conventions (enforce these everywhere)

- **TypeScript strict mode, no `any`**
- **Drizzle schema = source of truth** — `db/schema.ts` defines everything
- **All timestamps are `timestamptz` (UTC)** — never naive timestamps
- **Slugs generated server-side on publish** — never client-side
- **`upvote_count` on `rabbit_holes` is denormalised** — update atomically with the upvotes insert/delete
- **Cognito JWT claims carry the user ID** — always validate, never trust client-supplied user IDs
- **Never use `USER_PASSWORD_AUTH`** — always SRP via `amazon-cognito-identity-js`
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
│   ├── page.tsx                 # Feed page (server: fetch + session → pass to FeedPage)
│   ├── holes/[slug]/page.tsx    # Single hole view
│   ├── write/
│   │   ├── page.tsx             # Write/edit page — requires auth
│   │   └── actions.ts           # saveDraft + publishHole server actions (auth gated)
│   ├── drafts/
│   │   └── page.tsx             # Lists current user's unpublished drafts — requires auth
│   ├── auth/
│   │   ├── actions.ts           # setSessionCookie, signUp, confirmSignUp, signOut
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── confirm/page.tsx
│   │   └── _components/        # SignInForm, SignUpForm, ConfirmForm
│   ├── u/[username]/
│   │   ├── page.tsx             # Public profile page
│   │   └── actions.ts           # toggleFollowAction
│   ├── _components/
│   │   ├── ThemeProvider.tsx    # Dark/light context + localStorage
│   │   ├── TopBar.tsx           # Sticky header — auth-aware (currentUser prop)
│   │   ├── FeedPage.tsx         # Full interactive feed (client: search/tabs/votes)
│   │   ├── WriteEditor.tsx      # Client editor — title/body, debounced autosave, publish
│   │   ├── Sidebar.tsx          # Pro book + Going deep now + Manifesto
│   │   ├── Footer.tsx           # Footer
│   │   ├── Rabbit.tsx           # SVG rabbit motif
│   │   └── EndOfHole.tsx        # End-of-article moment (intersection observer)
│   ├── _actions/
│   │   └── upvote.ts            # toggleUpvoteAction server action (auth-gated)
│   └── _lib/
│       ├── session.ts           # getSession() / requireSession() — JWT validation
│       └── time-stats.ts        # Witty read-time comparisons
├── db/
│   ├── schema.ts                # Drizzle schema (source of truth)
│   ├── index.ts                 # Neon/postgres client
│   ├── seed.ts                  # Dev seed (5 rabbit holes)
│   ├── migrations/              # Generated by drizzle-kit
│   └── queries/
│       ├── holes.ts             # Feed, hole by slug, deep now, drafts, profile holes
│       ├── users.ts             # getUserByCognitoSub, getUserByUsername, createUser
│       ├── follows.ts           # getFollowCounts, isFollowing, toggleFollow
│       └── upvotes.ts           # getUpvotedHoleIds, isUpvoted, toggleUpvote
├── infra/                       # AWS CDK app (eu-west-2)
│   ├── bin/infra.ts
│   ├── lib/rabbithole-stack.ts  # Cognito, S3, SES, Stripe secret, OpenNext
│   ├── cdk.json
│   └── package.json            # Separate from root — commonjs module
├── docs/
│   ├── project-context.md       # This file
│   ├── dev-setup.md             # Git workflow, deploy process, AWS setup
│   ├── rabbithole-dev-plan.docx
│   └── rabbithole-project-bible.docx
├── .env.local                   # Local secrets (not committed)
├── .env.local.example           # Template (committed)
├── .github/workflows/deploy.yml # CI: lint+build on PRs. CD: cdk deploy on main
├── drizzle.config.ts
├── CLAUDE.md                    # Claude Code instructions → AGENTS.md
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

1. `cp .env.local.example .env.local` — fill in all values (see `.env.local.example`)
2. `npm install`
3. `npm run db:generate && npm run db:migrate`
4. `npm run db:seed`
5. `npm run dev` → http://localhost:3000

Auth works locally — you need real Cognito env vars (`NEXT_PUBLIC_COGNITO_USER_POOL_ID`, `NEXT_PUBLIC_COGNITO_CLIENT_ID`, `COGNITO_USER_POOL_ID`) from the AWS console. See `docs/dev-setup.md`.

---

## Phase 4 — Upvotes

- Toggle upvote on feed rows and hole detail page
- Optimistic UI (immediate count update, revert on error)
- `upvote_count` on `rabbit_holes` updated atomically via DB transaction
- Requires auth — prompt to sign in if not authenticated
- `upvotes` table already in schema: `(userId, holeId)` primary key

---

## Database schema (current)

See `db/schema.ts` for canonical definitions. Key tables:

- **`users`** — `cognitoSub`, `username`, `email`, `bio`, `proStatus`, `stripeCustomerId`
- **`rabbit_holes`** — `authorId`, `title`, `slug`, `spark`, `body`, `tags[]`, `featured`, `readTimeMins`, `status` (draft|published), `upvoteCount` (denormalised), `publishedAt`
- **`upvotes`** — `(userId, holeId)` primary key — one upvote per user per hole
- **`follows`** — `(followerId, followingId)` primary key, `CHECK (follower_id != following_id)`
- **`book_issues`** — `issueNumber`, `season`, `status`, `cutoffDate`
- **`book_issue_holes`** — `issueId`, `holeId`, `rank`, `upvoteSnapshot`