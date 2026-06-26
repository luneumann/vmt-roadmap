# Teststrategie — VECTOR

---

## Übersicht

VECTOR ist eine Single-File HTML-Anwendung ohne Build-Schritt. Die Teststrategie unterscheidet drei Ebenen:

| Ebene | Ansatz | Tool |
|---|---|---|
| Unit-Tests (Scoring-Engine) | Node.js-Skript, kein Framework nötig | `node test/scoring.test.js` |
| Manuelle UI-Tests | Browser-basiert, Checkliste unten | Chrome / Edge |
| Regressionstests | Manuell bei jeder Änderung an VECTOR.html | — |

**Nicht automatisiert getestet** (bewusste Entscheidung):
- localStorage-Persistenz: zu tightly coupled an Browser-API
- SVG-Chart-Rendering (`buildLineChart`): visueller Output, manuell im Browser geprüft
- CSV-Download-Dialog: Browser-spezifisches Verhalten
- Druckdialog: Browser-UI

**Coverage-Ziel:** 100% der Scoring-Engine-Funktionen durch Unit-Tests abgedeckt.

---

## Unit-Tests: Scoring Engine

Testdatei: `test/scoring.test.js` — läuft direkt in Node.js, keine Dependencies.

Führe mit `node test/scoring.test.js` aus. Alle Tests müssen mit "PASS" beenden.
