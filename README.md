# kalina — Site V3 (DA prune & or)

Landing page for the kalina Fusion Collagène+ coffret. It's a static site
with no build step, ready to deploy on Vercel.

## Contents

- `index.html` — the page (a Design Component: an `<x-dc>` template + a
  small logic class). Styles live in its inline `style="…"` attributes and
  the `<helmet><style>` block.
- `assets/` — images used by the page (18 files).
- `support.js`, `vendor/react*.js` — the runtime that renders the page in
  the browser.
- `vercel.json` — Vercel settings (clean URLs, long-term caching for assets).

## Deploy on Vercel

1. On vercel.com, choose **Add New → Project** and import the
   `nadia-zebakh/kalina` GitHub repository.
2. Leave the settings as detected: Framework Preset **Other**, Root
   Directory `./`, no build command, no output directory.
3. Click **Deploy**. Every push to `main` then redeploys automatically.

## Viewing locally

Serve the folder (e.g. `python3 -m http.server`) and open
http://localhost:8000/. Opening `index.html` directly over file:// won't
work in some browsers because they block the scripts.
