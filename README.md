# maler-berg.de

Neue Website für die Maler Berg GmbH, Malermeisterbetrieb in Köln-Zollstock (seit 1996).

Statische Seite ohne Build-Schritt: `index.html`, `impressum.html`, `datenschutz.html`, alles weitere unter `assets/`.
Schriften (Big Shoulders Stencil, DM Sans, Permanent Marker) und Bilder liegen lokal, es werden keine Drittanbieter geladen und keine Cookies gesetzt.

## Lokal ansehen

```
python -m http.server 5178
```

dann http://localhost:5178 öffnen.

## Bilder

Die Bilder sind KI-generierte Beispielmotive (LetzAI, Modell Seedream 5.5) und sollen vor dem Start durch echte Projektfotos ersetzt werden.
Neu erzeugen: Prompts in `tools/images.json`, dann `node tools/letzai-images.mjs tools/images.json [name ...]`.
Das Skript liest `LETZAI_API_KEY` und `LETZAI_ORGANIZATION_ID` aus `.env` (nicht im Repo). Die Originale landen in `assets/img-src/` (ignoriert), die Web-Versionen (max. 2400 px) in `assets/img/`.

## Vor dem Start klären

- Echte Projektfotos statt der Beispielmotive
- Vollständige Datenschutzerklärung (inkl. Hosting)
- Bewertungszahlen (250 Bewertungen, 9,4 bei trustlocal, Top Score 2024) aktuell halten
- Farbnamen in der Farbvorschau sind Beispiele, keine Brillux-Farbcodes
