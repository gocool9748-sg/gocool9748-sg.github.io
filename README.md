# V. Sai Gokul — Portfolio (v3)

A fast, dependency-free personal portfolio. Everything you'd want to change (text, projects, skills, achievements, links) lives in **one file: `content.js`**, and you can edit it without touching code using **`editor.html`**.

```
portfolio/
├── index.html          ← the website
├── content.js          ← ALL your content (the only file you edit)
├── editor.html         ← no-code editor for content.js
└── assets/
    ├── css/            ← styles (no need to touch)
    ├── js/             ← site logic (no need to touch)
    ├── img/            ← put your photo / project images here
    └── files/          ← put your resume PDF here
```

## Editing your content (no code)

1. Open `editor.html` in your browser (double-click it, or visit `yoursite/editor.html`).
2. Pick a section on the left: Profile, Projects, Skills, Achievements…
3. Change text, add/remove/reorder items. The live preview on the right updates instantly.
4. Click **Download content.js** and replace the old `content.js` with the new one.
   - On GitHub: open your repo → **Add file → Upload files** → drop in `content.js` → **Commit changes**. The site updates in about a minute.

Your unsaved edits are kept in your browser, so closing the tab won't lose them.

## Opening it
In VS Code, open this folder and click **Go Live** (Live Server). Or just double-click `index.html`.

## Common updates

| I want to… | Do this |
|---|---|
| Add my photo | Put it in `assets/img/` (e.g. `profile.jpg`), then set **Profile photo** to `assets/img/profile.jpg` |
| Enable the resume button | Put the PDF in `assets/files/`, then set **Resume PDF** to `assets/files/your-file.pdf` |
| Add LinkedIn / email | **Contact Links** section. Empty links are hidden automatically |
| Add a live demo link | **Projects → Live demo link**. The button turns on when a link is present |
| Add a skill | **Skills →** open a group → **+ Add skill** |
| Add an achievement | **Achievements → + Add achievement**. Only items marked *Verified* are shown |
| Change availability badge | **Profile → Availability badge** (untick to hide) |
| Default light theme | **Site Settings → Default theme** |
| Italic serif accent words | Wrap words in `*asterisks*`, e.g. `Building *Intelligent* Systems.` |
| Turn on the contact form | Add your email in **Contact Links** (optionally a Formspree URL in **Contact Section**) |

## Publish free on GitHub Pages

1. Create a new repository on GitHub, e.g. `gocool9748-sg.github.io` (this name gives you the URL `https://gocool9748-sg.github.io`).
2. Upload **all** files and folders from this `portfolio` folder to the repo.
3. Go to **Settings → Pages**, set **Source: Deploy from a branch**, branch **main**, folder **/ (root)**, then save.
4. Your site is live in 1–2 minutes.

Vercel and Netlify work too: drag the folder in, with no build settings needed.

## Notes
- The GitHub section loads your newest public repositories live. If GitHub can't be reached, it shows your project repos instead.
- Project pages have shareable links, e.g. `yoursite/#project-glow-spa`.
- Dark/light mode remembers each visitor's choice.
