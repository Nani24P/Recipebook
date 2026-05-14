# Personal Recipe Book PWA

A private, photo-first recipe book PWA for iPhone, iPad, and desktop.

## What this starter includes

- Next.js + React + TypeScript app
- Static export for GitHub Pages
- GitHub Actions deployment workflow
- PWA manifest and service worker
- iPhone bottom-tab layout
- iPad/desktop sidebar layout
- Local IndexedDB recipe storage via Dexie
- Add recipe form with 3–10 photo page upload support
- Recipe cards, favorites, collections, tags, search, and page viewer
- Offline-ready app shell and local recipe storage

## Run locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Publish to GitHub Pages

Create a new GitHub repository, then run these commands from this folder:

```bash
git init
git add .
git commit -m "Initial personal recipe book PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Then in GitHub:

1. Open the repository settings.
2. Go to **Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Open the **Actions** tab and wait for **Deploy PWA to GitHub Pages** to finish.

Your app will be available at:

```text
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

For a user/organization Pages repo named `YOUR_USERNAME.github.io`, set the repository secret or workflow environment variable `NEXT_PUBLIC_BASE_PATH` to an empty string. For normal project repos, the workflow automatically uses `/<repo-name>` as the base path.

## Add to iPhone/iPad home screen

1. Open the deployed app in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Launch it from the home screen.

## Important personal-use note

This starter stores recipe data and uploaded images locally in the browser's IndexedDB. That is excellent for a private first version, but it is not a full cloud backup. Before adding hundreds of recipes, add export/import backup or Supabase/Cloudflare storage.

## Recommended next upgrades

1. Add export/import JSON backup.
2. Add edit recipe and page reorder screens.
3. Add Supabase Auth and Postgres for cross-device sync.
4. Move images to Supabase Storage or Cloudflare R2.
5. Generate image thumbnails and large reader versions.
6. Add OCR extraction for each recipe page.
7. Add shopping lists and meal planning.

## Suggested production architecture

```text
Next.js PWA
  ├─ Static GitHub Pages frontend for personal use
  ├─ IndexedDB offline layer
  ├─ Service worker app shell cache
  ├─ Supabase Auth and Postgres later
  ├─ Supabase Storage / Cloudflare R2 later
  ├─ OCR pipeline later
  └─ Meilisearch or Typesense later
```
