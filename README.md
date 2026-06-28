# REZ Risk Radar

A daily risk-intelligence digest tracking emerging signals across NSW's Renewable
Energy Zones (Central-West Orana, New England, Hunter-Central Coast, Illawarra,
South West). Generated each morning by a Claude Cowork job and published as a
static site on GitHub Pages.

## How it works

The site is **data-driven**: all presentation lives in `assets/`, and each day's
content is a single JSON file. The Cowork job never edits HTML/CSS/JS — it only:

1. writes `data/digests/YYYY-MM-DD.json`, and
2. prepends an entry to `data/manifest.json`, then commits and pushes.

```
.
├── index.html            # homepage → latest digest + archive rail
├── digest.html           # single dated digest (digest.html?date=YYYY-MM-DD)
├── assets/
│   ├── styles.css        # the design system
│   └── app.js            # fetches JSON, renders (no build step)
├── data/
│   ├── manifest.json     # site meta + index of all digests (newest first)
│   └── digests/
│       └── YYYY-MM-DD.json
└── README.md
```

## Deploy to GitHub Pages

1. Create a public repo, e.g. `rez-risk-radar`, and push these files to `main`.
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. Your site goes live at `https://<username>.github.io/rez-risk-radar/`.

## Preview locally

`fetch()` is blocked on `file://`, so serve the folder over http:

```bash
python3 -m http.server 8099
# open http://localhost:8099
```

## Note on the sample data

The three included digests are illustrative, grounded in real mid-2026 REZ
developments, to show the format. The live job replaces them.
