# VECTOR

Lokales Projektpriorisierungs- und Sequenzierungstool für Entwicklungsressourcen — kombiniert Strategic-Bucket-Kapazitätsplanung mit WSJF-Scoring.

## Tech-Stack

- Single-File HTML-Anwendung (`VECTOR.html`)
- Vanilla JavaScript, kein Build-Schritt
- Datenhaltung: `localStorage` des Browsers
- Charts: Custom Inline-SVG (keine Library, kein CDN)
- **Null externe Abhängigkeiten — voll offline / airgap-tauglich**
- Browser: Chrome / Edge (Chromium-basiert)

## Lokale Entwicklung starten

```bash
# Im VECTOR-Verzeichnis:
npx serve -p 4400 .
# Öffne: http://localhost:4400/VECTOR.html
```

Alternativ direkt die `VECTOR.html` im Browser öffnen (Datei-Doppelklick) — funktioniert vollständig offline, kein Server und keine Internetverbindung nötig.

## Tests ausführen

```bash
node test/scoring.test.js
```

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [PRD_VECTOR.md](PRD_VECTOR.md) | Produktanforderungen, User Stories, Akzeptanzkriterien |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architekturentscheidungen (ADRs) |
| [docs/SYSTEM-DESIGN.md](docs/SYSTEM-DESIGN.md) | Datenmodell, UI-Übersicht, Datenfluss |
| [docs/DESIGN-HANDOFF.md](docs/DESIGN-HANDOFF.md) | Design Tokens, Screen-Spezifikationen, Komponenten |
| [docs/TESTING.md](docs/TESTING.md) | Teststrategie, Test-Coverage |
| [SETUP.md](SETUP.md) | Setup-Anleitung für den ersten Start |
| [CLAUDE.md](CLAUDE.md) | Workflow für Claude-gestützte Weiterentwicklung |
