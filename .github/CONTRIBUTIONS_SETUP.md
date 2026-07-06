# GitHub contribution setup (Market Predictions workflow)

The **Market Predictions** workflow commits updated `public/data/predictions.json` up to **3 times per weekday** during NSE market hours:

| Run (IST) | Purpose |
|-----------|---------|
| 10:00 | Opening session snapshot |
| 12:30 | Midday refresh |
| 15:15 | Pre-close snapshot |

It **does not run** on weekends, NSE holidays, or outside **09:15–15:30 IST**.

## Green contribution graph

GitHub only counts commits toward **your** profile when the commit author email matches a **verified** email on your account.

### Step 1 — Verify your email on GitHub

1. GitHub → **Settings** → **Emails**
2. Add your email if not listed, confirm the verification link in your inbox
3. Keep **Keep my email addresses private** on or off — either works if the commit uses an email that is verified on your account

### Step 2 — Add repository secrets (required)

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret name | Value |
|-------------|--------|
| `GIT_COMMIT_EMAIL` | Your verified GitHub email (the one you use for commits) |
| `GIT_COMMIT_NAME` | Optional — e.g. `Athul-S-369` |

**Do not commit your email into the codebase.** Secrets live only in GitHub Settings.

If `GIT_COMMIT_EMAIL` is missing, commits use `github-actions[bot]` and **will not** appear on your contribution graph.

### Step 3 — Confirm after first run

After a successful workflow run on a trading day:

1. Open the latest commit on `main`
2. Author should be **your name**, not `github-actions[bot]`
3. Your profile contribution graph may take up to 24 hours to update

## Manual test (local)

```powershell
# Normal — skips if market closed
npm run predict

# Force run (testing only)
$env:FORCE_RUN="1"; npm run predict
```

## Manual test (GitHub)

Actions → **Market Predictions** → **Run workflow**

Use force only for debugging; scheduled runs always respect market hours.
