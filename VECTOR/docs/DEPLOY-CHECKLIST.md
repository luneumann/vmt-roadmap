# Deploy-Checkliste — VECTOR

VECTOR hat kein klassisches Deployment. Die Checkliste beschreibt, was vor dem **produktiven Einsatz** und **bei Änderungen** zu prüfen ist.

---

## Erstmaliger Einsatz

- [ ] `VECTOR.html` auf dem eigenen Rechner ablegen (z.B. `~/Documents/VECTOR/`)
- [ ] Datei im Browser öffnen (Chrome / Edge) — funktioniert vollständig offline, keine Internetverbindung nötig
- [ ] Default-Buckets und Kriterien erscheinen im Dashboard
- [ ] Erstes Projekt anlegen und eine Bewertungsrunde durchführen — prüfen ob Scores korrekt berechnet werden

---

## Vor jeder Änderung an VECTOR.html

- [ ] JSON-Backup erstellen (Konfiguration → Export → JSON-Backup)
- [ ] Änderung einbauen
- [ ] Tests ausführen: `node test/scoring.test.js` — alle 25 Tests grün
- [ ] Browser neu öffnen, Basis-Flow testen: Projekt anlegen → bewerten → Dashboard prüfen
- [ ] CSV-Export testen: in Excel öffnen, Umlaute korrekt, Semikolon-Trenner

---

## Datensicherung (empfohlen vor jedem größeren Einsatz)

VECTOR speichert alle Daten im `localStorage` des Browsers. Der Browser kann Daten löschen wenn:
- Browser-Cache geleert wird
- Browserprofil gelöscht wird
- "Browserdaten löschen" ausgeführt wird

**Daher:** Regelmäßig JSON-Backup erstellen (Konfiguration → Export & Backup).

---

## Wechsel auf neuen Rechner / Browser

1. JSON-Backup auf dem alten System erstellen
2. `VECTOR.html` auf den neuen Rechner kopieren
3. Datei im Browser öffnen
4. Konfiguration → Export & Backup → "Backup wiederherstellen"
5. Prüfen ob alle Projekte, Kriterien und Buckets vorhanden sind

---

## Offline-Betrieb

Keine Maßnahme nötig: VECTOR hat **null externe Abhängigkeiten**. Charts werden als
eigenes Inline-SVG gerendert, Schriften kommen aus dem System-Font-Stack. Die App kann
auf einem Rechner ohne jede Internetverbindung (Airgap) betrieben werden — die einzige
Datei `VECTOR.html` enthält alles.
