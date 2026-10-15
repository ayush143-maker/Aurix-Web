# Aurix
Static site, no build step. Plain HTML, CSS and ES modules.

Deploy: push to GitHub, then on Vercel choose Add New > Project, import the repo,
leave Framework Preset as "Other", leave Build Command and Output Directory empty, Deploy.

Local preview: `npx serve .` or `python3 -m http.server` (open via http, not file://).
