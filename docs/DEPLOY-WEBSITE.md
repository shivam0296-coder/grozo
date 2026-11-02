# Website, GitHub and hosting

The public customer build is a **pre-launch catalogue**. It accepts no real orders. The persistent commerce backend is not implemented. Admin remains a labelled local development workspace and is not published by the Pages workflow.

## Build and preview

Use Node 24.12+ in the 24.x line and pnpm 11.25.0 from the complete repository root:

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm --filter @grozo/web build
pnpm --filter @grozo/web preview
```

Publish **apps/web/dist**. Relative assets and hash routes support the GitHub Pages project path **/grozo/**. pnpm dev:web preserves the existing labelled local synthetic shopping tests. Customer production build defaults to catalogue mode, using actual source entries and explicit unavailable commerce states. VITE_DATA_MODE=live remains a closed integration gate; it does not implement commerce.

## GitHub Pages

Repository: https://github.com/shivam0296-coder/grozo

The owner created it during this task. The original repository contained README.md and initial commit f81148a9e2e0caad334cf669ff6e767c5bdbc26f; existing history must be preserved.

1. Settings → Pages → Build and deployment → Source → **GitHub Actions**.
2. Push a validated commit to main, or Actions → **Publish customer catalogue** → Run workflow. The included .github/workflows/pages.yml installs locked dependencies, typechecks, tests, builds the catalogue and runs the official Pages actions.
3. Wait for build and deploy jobs to pass. Use the successful deploy job's returned URL. A guessed URL or committed workflow does not prove deployment; consult the final report for the actual result.

After signing in using your normal Git credential manager:

```powershell
git status
git remote -v
git push origin main
```

A fresh machine can use **git clone https://github.com/shivam0296-coder/grozo.git**. Do not force-push/discard other history. Git's credential-helper shell initially failed on this machine; connected GitHub tools are used where possible. No personal access token needs to be pasted into source.

Official guide: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Optional shared catalogue API

Run **node services/api/server.mjs** locally (127.0.0.1:4000). For a hosted API use a Node 24 host with valid HTTPS reverse proxy, supervised restarts and /health checks. Configure API_HOST/API_PORT and exact CUSTOMER_WEB_ORIGIN origins. This adapter is read-only, has no database and accepts no real accounts/orders. GitHub Pages cannot run Node servers or PostgreSQL.

Set **VITE_API_BASE_URL=https://YOUR_API_HOST/api/v1** at build time and rebuild the customer site. Without it, catalogue mode explicitly uses the bundled source catalogue. With it, a network failure displays an error/Retry and no fixture fallback. Do not deploy a localhost URL. All VITE values are public; never store secrets in them.

Android uses the same API via **-PgrozoApiBaseUrl=https://YOUR_API_HOST/api/v1/** (Retrofit needs the trailing slash). It currently checks catalogue connectivity explicitly; real commerce mapping remains pending.

Use separate ignored files and secret stores for development, staging and production. Never reuse production provider keys or databases for tests. No populated environment file, signing key or credential belongs in Git. The current service does not connect to PostgreSQL; adding DATABASE_URL alone cannot implement it. Production needs reviewed migrations, authenticated/authorized services, merchant-confirmed data and complete end-to-end/security/operational evidence.

## Custom domain and rollback

After successful Pages deployment, use Settings → Pages → Custom domain for a domain you control. Follow GitHub's displayed DNS verification instructions and enable HTTPS after certificate issuance. No domain was supplied/purchased. Do not invent DNS records for an unknown domain. Revert the relevant source commit and rerun Pages to roll back the static site; confirm its deployment status. Database restore/rollback must be designed and tested separately.