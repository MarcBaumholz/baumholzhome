# Baumholz Home – Hausparty Website

Statische Website im CI des Logos. Deployment via GitHub Pages, Domain über Porkbun (`baumholzhome.lol`).

## Lokale Nutzung
- Öffne `index.html` im Browser oder starte einen lokalen Server:
  - `python -m http.server 8000` → `http://localhost:8000`

## GitHub Pages Deployment
1. Neues Repo erstellen und Code auf `main` pushen.
2. Workflow `.github/workflows/pages.yml` deployed automatisch auf Pages.
3. In Repository Settings → Pages: Domain prüfen (wird aus `CNAME` gelesen).

## Porkbun DNS (Custom Domain)
1. `CNAME` im Repo enthält `baumholzhome.lol`.
2. Porkbun Records anlegen:
   - A‑Records für Apex `@` → 185.199.108.153 / .109 /.110 /.111
   - Optional AAAA → 2606:50c0:8000::153 / ::8001 / ::8002 / ::8003
   - Optional `www` CNAME → `<username>.github.io.`
3. In GitHub Pages „Enforce HTTPS“ aktivieren (nach Zertifikatserstellung).

## SEO
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest` vorhanden
- JSON‑LD `Event` in `index.html`

Inhalte und Farben anpassen: `index.html`, `secrets.html`, `assets/css/styles.css`.


