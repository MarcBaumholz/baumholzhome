## Baumholz Home – Projektplanung

Ziel: Eine schlanke, schnelle und suchmaschinenfreundliche Hausparty‑Website für „Baumholz Home“ im Look & Feel des Logos (wärmendes Gold auf sehr dunklem Hintergrund, dezentes Grün), veröffentlicht über GitHub Pages und unter der Porkbun‑Domain `baumholzhome.lol` erreichbar.

### CI aus dem Logo abgeleitet
- Farben
  - Primär Gold: `#D4A15A` (Akzent, Links, Buttons)
  - Dunkles Holz/Schwarzbraun: `#0E0B08` (Seitenhintergrund)
  - Warmes Hellgold: `#F0D7A1` (Hover, Linien)
  - Tiefgrün: `#2F6F3E` (Sekundärakzent, kleine Details)
  - Wolkiges Weiß: `#F5EFE6` (Text auf dunklem Grund)
- Typografie
  - Überschriften: Cinzel (Display‑Serif, erinnert an Gravur/Prägung)
  - Fließtext: Inter (klare Sans‑Serif, gut lesbar)
- Stil
  - Dunkler Canvas, goldene Akzente mit leichtem Glühen
  - Abgerundete Ecken, feine Linien, dezente Noise/Radial‑Glows

### Referenzseiten – Analyse

Quellen: [Party Pal Agenda (Preview)](https://preview--party-pal-agenda.lovable.app/) und [Home Party Secrets (Preview)](https://preview--home-party-secrets.lovable.app/)

Beide Seiten sind sehr minimal, fokussiert auf strukturierte Informationen pro Abschnitt. Ableitungen für unsere Site:
- Klare, einzeln scrollbare Sektionen (Hero, Countdown, Agenda, Infos/FAQ, Anfahrt/Location, Call‑to‑Action, Footer)
- Zweite Seite mit „Hausregeln/Secrets“ (WLAN, Playlist, „Was mitbringen?“, Regeln/No‑Gos), verlinkt aus der Hauptnavigation
- Kompakte Karten/Listen, prominent lesbare Zeiten (Agenda), klare Icons/Badges
- CTA‑Schwerpunkt: „Speichere dir den Termin“, „Sag kurz Bescheid (RSVP)“

### IA / Seitenstruktur
- `index.html`
  - Header mit Logo/Brand, Navigation (Agenda, Infos, Anfahrt, Geheimnisse)
  - Hero mit Claim „Baumholz Home – Hausparty“ und Termin
  - Countdown (bis Startzeit)
  - Agenda als Timeline
  - Infos (Dresscode, Mitbringen, Getränke, Rauchen, Nachbarn)
  - Anfahrt (Adresse, Link zu Maps)
  - RSVP (Mail/WhatsApp), Kalender‑Download (ICS)
  - Footer (Impressum‑Hinweis, Datenschutz‑Kurzlink/Placeholder)
- `secrets.html`
  - Hausregeln & Secrets (WLAN, Silent‑Area, Balkonzeiten, Mülltrennung, Notfallkontakt)
  - FAQ (Parken, Schlafcouch, Allergien)

### Technik / Anforderungen
- Reines Static Site Setup (HTML/CSS/JS, keine Build‑Tools nötig)
- Responsiv ab 320px, bevorzugt Mobile‑first
- Performance/SEO
  - Sauberes Semantik‑HTML, `meta`‑Tags (title, description, og, twitter)
  - `robots.txt`, `sitemap.xml`, `CNAME`, `.nojekyll`
  - JSON‑LD `Event`‑Schema auf `index.html`
  - Webfonts von Google Fonts mit Display‑Swap
- Deployment
  - GitHub Pages via GitHub Actions Workflow (on push to `main`)
  - Custom Domain: `CNAME` Datei + Porkbun DNS (A/AAAA für Apex)

### Ordnung / Struktur
```
assets/
  css/styles.css
  js/main.js
  img/logo.svg
  party.ics
.github/workflows/pages.yml
CNAME
README.md
PLANNING.md
TASK.md
index.html
secrets.html
robots.txt
sitemap.xml
manifest.webmanifest
.nojekyll
```

### Offene Stellen für den späteren Feinschliff
- Austausch Dummy‑Texte, finale Uhrzeit/Adresse, echte Social‑Image‑Datei
- Optional: Einbettung von Karten (Privacy‑freundlich) oder statischer Map‑Screenshot
- Optional: Einladungs‑QR, Spotify‑Playlist‑Embed


