# Rabbithole — Dev Setup & Workflow

---

## Git setup (important — work vs personal)

This repo belongs to the **robnorris1** personal GitHub account. The machine also has a work AWS/GitHub account. To avoid mixing them up:

**Verify before every commit session:**
```bash
git config user.email   # should be rob.norris999@gmail.com
git config user.name    # should be robnorris1
```

**If it shows the wrong account, fix for this repo:**
```bash
git config user.email "rob.norris999@gmail.com"
git config user.name "robnorris1"
```

This sets it locally for this repo only — it does not affect global git config or work projects.

**GitHub CLI authentication:**
The machine has a `GITHUB_TOKEN` env var set (by work tooling). If `gh` commands fail with auth issues, unset it for the session:
```bash
unset GITHUB_TOKEN
gh auth login   # choose robnorris1
```

---

## Day-to-day development workflow

1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to `main`:

```bash
git add -A
git commit -m "Description of change"
git push
```

Pushing to `main` triggers GitHub Actions:
- **CI job** — lint + build (runs on all pushes and PRs)
- **Deploy job** — CDK deploy to AWS prod (runs on push to `main` only)

---

## AWS infrastructure

**Account:** Personal AWS account (ID in GitHub secret `AWS_DEPLOY_ROLE_ARN`)
**Region:** `eu-west-2` (London)
**Live site:** CloudFront URL from CDK outputs (see `SiteUrl` output after deploy)

### What's deployed
- **Cognito User Pool** — ID in `NEXT_PUBLIC_COGNITO_USER_POOL_ID` GitHub secret — handles sign up / sign in
- **Cognito App Client** — ID in `NEXT_PUBLIC_COGNITO_CLIENT_ID` GitHub secret
- **CloudFront** — CDN + entry point for the app
- **Lambda** — Next.js server function (SSR)
- **S3** — static assets
- **DynamoDB** — Next.js ISR revalidation table
- **SES** — email identity for `rabbithole.app` (currently sandbox mode)
- **Secrets Manager** — Stripe keys (Phase 5, not yet set)

### Estimated cost
~$0.80/month at zero traffic (Secrets Manager). Effectively free until real users.

### Deploying
Deploy happens automatically on push to `main` via GitHub Actions. You should never need to run CDK manually.

If you ever need to manually bootstrap a new environment:
```bash
cd infra
npm install
# set AWS_PROFILE or ensure correct credentials first
npx cdk bootstrap aws://ACCOUNT_ID/eu-west-2
npx cdk deploy --context env=prod
```

---

## GitHub Actions secrets

These must be set in **GitHub → Settings → Secrets and variables → Actions:**

| Secret | Description |
|--------|-------------|
| `AWS_DEPLOY_ROLE_ARN` | ARN of the `github-actions-rabbithole` IAM role (from AWS console → IAM → Roles) |
| `DATABASE_URL` | Neon pooled connection string (from Neon dashboard) |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Cognito User Pool ID (from CDK outputs or AWS console) |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Cognito App Client ID (from CDK outputs or AWS console) |
| `NEXT_PUBLIC_API_URL` | CloudFront URL from CDK `SiteUrl` output |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Set in Phase 5 |

---

## Local environment variables (`.env.local`)

See `.env.local.example` for all required keys. Values come from:
- Cognito IDs — CDK outputs after deploy, or AWS console → Cognito
- `DATABASE_URL` — Neon dashboard (use the pooled connection string)
- Stripe keys — Stripe dashboard (Phase 5)

---

## Database

**Provider:** Neon (serverless Postgres 16) — free tier
**Connection:** pooled connection string from Neon dashboard

```bash
npm run db:generate   # generate migration after schema change
npm run db:migrate    # apply pending migrations to Neon
npm run db:seed       # reset dev data (seed user + 5 holes)
npm run db:studio     # open Drizzle Studio browser UI
```

Always run `db:generate` + `db:migrate` after changing `db/schema.ts`. Never write raw SQL — use Drizzle.

---

## Auth

Sign up requires a real email — Cognito sends a 6-digit verification code. Emails currently go to spam (SES sandbox mode, fixed in Phase 6).

Password requirements: 10+ characters, at least one uppercase letter and one number.

---

## AWS OIDC trust (GitHub → AWS)

Set up once. GitHub Actions assumes the IAM role `github-actions-rabbithole` via OIDC — no long-lived AWS credentials stored in GitHub. The role ARN is stored in the `AWS_DEPLOY_ROLE_ARN` GitHub secret.

The trust policy restricts it to pushes from `robnorris1/rabbit-hole` on the `main` branch only.