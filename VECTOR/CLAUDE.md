# VECTOR — Projektpriorisierungs- und Sequenzierungstool

VECTOR ist ein lokales PM-Tool zur strukturierten Priorisierung von Entwicklungsprojekten.
Es kombiniert Strategic-Bucket-Kapazitätsplanung mit WSJF-Scoring (Wert / Aufwand) und
läuft vollständig als einzelne HTML-Datei im Browser — kein Server, keine Installation,
**null externe Laufzeit-Abhängigkeiten** (Charts als eigenes Inline-SVG, keine Library,
kein CDN, keine Web-Fonts) — voll offline / airgap-tauglich.

**Kernprinzip:** Kapazität wird strukturell nach Buckets aufgeteilt, *bevor* einzelne
Projekte verglichen werden. Innerhalb jedes Buckets entscheidet der WSJF-Score
(Wert-Score / Aufwand) über die Reihenfolge.

---

## Tech-Stack

| Schicht | Technologie |
|---|---|
| Deployment | Einzelne `.html`-Datei |
| Datenhaltung | `localStorage` des Browsers |
| Charts | Custom Inline-SVG (keine Library) |
| Sprache | Vanilla JS (kein Framework, kein Build-Schritt) |
| Fonts | System-Font-Stack (keine Web-Fonts) |
| Browser | Chromium-basiert (Chrome / Edge) |
| UI-Sprache | Deutsch |
| Design | Reduziert, gedämpfte Palette (Salbe/Terracotta), große Zahlen |

---

## Skills und Workflow

| Phase | Skill / Command |
|---|---|
| Produktdiscovery | `/product-management:product-discovery` |
| Architektur-Review | `/engineering:architecture` |
| Code-Review | `/code-review` |
| Testing | `/engineering:testing-strategy` |
| Deploy-Checkliste | `/engineering:deploy-checklist` |
| Dokumentation | `/engineering:documentation` |
| Frontend-Bau | `/engineering:frontend-build` |
| Full Setup | `/anthropic-skills:engineering-full-setup` |

---

## Fortschritts-Tracker

| Schritt | Aufgabe | Status |
|---|---|---|
| 1 | CLAUDE.md | ✅ Abgeschlossen |
| 2 | Architecture Decision Record | ✅ Abgeschlossen |
| 3 | System Design + Datenmodell | ✅ Abgeschlossen |
| 4 | localStorage-Schema (entspricht DB-Migration) | ✅ Abgeschlossen |
| 5 | Hauptanwendung VECTOR.html | ✅ Abgeschlossen |
| 6 | Design Handoff | ✅ Abgeschlossen |
| 7 | Tests + Teststrategie | ✅ Abgeschlossen |
| 8 | README + Deploy-Checkliste | ✅ Abgeschlossen |
| 9 | SETUP.md | ✅ Abgeschlossen |
