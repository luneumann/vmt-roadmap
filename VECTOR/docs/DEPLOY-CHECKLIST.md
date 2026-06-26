# Deploy-Checkliste — VECTOR

VECTOR hat kein klassisches Deployment. Die Checkliste beschreibt, was vor dem **produktiven Einsatz** und **bei Änderungen** zu prüfen ist.

---

## Erstmaliger Einsatz

- [ ] `VECTOR.html` auf dem eigenen Rechner ablegen (z.B. `~/Documents/VECTOR/`)
- [ ] Datei im Browser öffnen (Chrome / Edge)
- [ ] Beim ersten Öffnen: Chart.js wird von CDN geladen (Internetverbindung nötig)
- [ ] Anschließend: Default-Buckets und Kriterien erscheinen im Dashboard
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

## Chart.js offline verfügbar machen (optional)

Falls Chart.js auch ohne Internetverbindung verfügbar sein soll:

1. Chart.js herunterladen: https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js
2. Als `chart.umd.min.js` neben `VECTOR.html` ablegen
3. In `VECTOR.html` Zeile 5 ändern:
   ```html
   <!-- Von: -->
   <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
   <!-- Zu: -->
   <script src="./chart.umd.min.js"></script>
   ```
