# Game Competitor Analysis — GitHub Sync

Static HTML tool for GitHub Pages. This version can save the current analysis directly back to the GitHub repository as `data/project.json`.

## What changed

- Edit the analysis directly on GitHub Pages.
- **Save GitHub** creates/updates `data/project.json` using the GitHub Contents API.
- **Load GitHub** loads the shared project back into the app.
- On a normal `username.github.io/repository/` URL, Owner + Repository are auto-detected.
- The app can auto-load `data/project.json` when the page opens.
- Local browser autosave and JSON Import/Export still work as backup.

## Deploy

1. Create a GitHub repository.
2. Upload all files in this folder to the repository root.
3. Go to **Settings → Pages**.
4. Choose **Deploy from a branch** → `main` → `/ (root)`.
5. Open the generated GitHub Pages URL.

## First-time GitHub connection

On the website, click **GitHub**.

Use:
- **Owner**: your GitHub username or organization.
- **Repository**: the repository containing this tool.
- **Branch**: normally `main`.
- **Data path**: normally `data/project.json`.
- **Token**: a GitHub **fine-grained Personal Access Token** restricted to this repository with **Contents: Read and write** permission.

Then click **Test connection** and **Lưu cấu hình**.

After that:
- **Save GitHub** = commit the current project data to `data/project.json`.
- **Load GitHub** = replace the browser copy with the shared GitHub copy.

## Token safety

Do **not** put a token into `index.html`, `app.js`, `sample-data.js`, or any committed file.

This build stores the token only in `sessionStorage`, so it is not included in the repository or JSON exports and is cleared when the browser session/tab is closed. The repository settings (owner/repo/branch/path) are stored locally in the browser.

For team-wide production use, a GitHub App or a small backend is safer than asking every editor to use a PAT. This PAT-based version is intended as a practical internal prototype.

## Shared-data behavior

`data/project.json` is included in this folder as the initial shared project. When the site is hosted on GitHub Pages, it auto-detects the repo and can load that file on startup.

If two people edit at the same time, the app checks the remote file SHA. If the remote file changed since your last load, it warns before overwriting.

## Files

- `index.html` — app shell
- `style.css` — styling
- `app.js` — UI, local autosave, scoring, GitHub sync
- `sample-data.js` — fallback sample/default project
- `data/project.json` — shared project data saved via GitHub
- `standalone.html` — single-file version for local testing (GitHub sync also works, but Pages is recommended)
