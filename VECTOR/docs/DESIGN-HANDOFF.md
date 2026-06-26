# Design Handoff — VECTOR

---

## Design Tokens

| Token | Wert | Verwendung |
|---|---|---|
| `--c-bg` | `#f8fafc` | App-Hintergrund |
| `--c-surface` | `#ffffff` | Cards, Modals |
| `--c-border` | `#e2e8f0` | Alle Rahmen |
| `--c-text` | `#1e293b` | Primärtext |
| `--c-text-muted` | `#64748b` | Labels, Metadaten |
| `--c-primary` | `#2563eb` | Primäre Aktionen, WSJF-Score, Links |
| `--c-primary-hover` | `#1d4ed8` | Hover-State Primär-Button |
| `--c-danger` | `#dc2626` | Lösch-Aktionen, Überallokierungs-Balken |
| `--c-success` | `#16a34a` | Hohe Scores (≥ 70), OK-Balken |
| `--c-warning` | `#d97706` | Mittlere Scores (40–69) |
| `--c-shadow` | `0 1px 3px rgba(0,0,0,.1)` | Card-Schatten |
| `--radius` | `8px` | Standard-Radius |
| `--font` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | Systemfont-Stack |

**Score-Farbcodierung:**
- ≥ 70: `#16a34a` (grün, `--c-success`)
- 40–69: `#d97706` (gelb, `--c-warning`)
- < 40: `#dc2626` (rot, `--c-danger`)

**Bucket-Farben (Default):**
- Strategisch / RTI: `#2563eb`
- Opportunistisch / Turn-Key: `#7c3aed`

---

## Screens und Zustände

### Screen 1 — Dashboard: Bucket-Ansicht (Default-Startseite)

**Zweck:** Kapazitätsüberblick nach strategischen Kategorien. Raphael-Ansicht.

**Layout:**
- Filter-Leiste oben: Toggle Bucket/Ranking, Status-Dropdown, Bucket-Dropdown, CSV-Export, Drucken
- Je Bucket: Header-Karte (Titel, Ziel%, Anzahl Projekte, Ist%) + Kapazitätsbalken + Projekttabelle

**States:**
| State | Beschreibung |
|---|---|
| Leer (kein Projekt) | Placeholder-Text "Keine Projekte in diesem Bucket" |
| Laden | Keine Ladezeit (synchrones localStorage) |
| Mit Projekten | Tabelle mit Rang, Name, Typ, Wert-Score, Aufwand, WSJF, Trend, Status |
| Filter aktiv | Tabelle filtert entsprechend, Bucket-Stats bleiben immer auf aktiven Projekten |

**Kapazitätsbalken:**
- Grün (`--c-success`): Ist-Anteil ≤ Ziel + 5%
- Rot (`--c-danger`): Ist-Anteil > Ziel + 5% → Label "⚠ Überallokiert"
- Grau: Ist-Anteil < Ziel - 5% → Label "○ Unterallokiert"

---

### Screen 2 — Dashboard: Gesamtranking

**Zweck:** Übergreifende Sortierbarkeit aller Projekte.

**Layout:** Eine flache Tabelle. Zusätzliche Spalten: Bucket (farbiger Chip), Letzte Bewertung (Datum).

**Sortierung:** Per Klick auf Spaltenköpfe (Wert-Score, WSJF, Letzte Bewertung). Standard: WSJF absteigend.

---

### Screen 3 — Projekte: Liste

**Zweck:** Projektverwaltung.

**Layout:** Header mit "+ Neues Projekt" Button, darunter Card mit Tabelle.

**Spalten:** Name + Beschreibung | Bucket (Chip) | Typ | Wert-Score | WSJF | Runden | Status | Aktionen

**Aktionen je Zeile:** "Detail" Button, Edit-Icon (✎), Delete-Icon (🗑)

**Empty State:** Folder-Emoji, Text, "Erstes Projekt anlegen" Button

---

### Screen 4 — Projekt: Formular (Anlegen / Bearbeiten)

**Zweck:** Grunddaten eines Projekts erfassen.

**Layout:** Back-Link + Titel, dann Card mit Form.

**Felder:**
- Name (Text, Pflicht)
- Kurzbeschreibung (Textarea)
- Typ (Select: RTI-Produkt / Turn-Key / Feature)
- Bucket (Select, Pflicht)
- Status (Select: aktiv / zurückgestellt / abgeschlossen)

**States:**
| State | Beschreibung |
|---|---|
| Neu | Alle Felder leer, Status = aktiv |
| Bearbeiten | Felder vorausgefüllt |
| Validierungsfehler | Browser-native Validation (required) |

---

### Screen 5 — Projekt: Detail-Ansicht

**Zweck:** Score-Übersicht, Verlauf, Runden-Tabelle.

**Layout:**
```
[← Zurück] Projektname   [Bucket-Chip] [Status-Badge]   [Bearbeiten] [+ Neue Bewertung]
Beschreibung

Score-Summary-Box (4 Kacheln):
  Wert-Score | Aufwand | WSJF-Score | Trend

Card: Score-Verlauf
  → ab 2 Runden: Chart.js Liniendiagramm (Wert-Score + WSJF, 2 Linien)
  → < 2 Runden: Hinweistext

Card: Bewertungsrunden (N)
  Tabelle: Datum | [Kriterium 1..n] | Aufwand | Wert-Score | WSJF
  Neueste Runde hervorgehoben (hellblauer Hintergrund)
```

**Trend-Darstellung:**
- ↑ grün: WSJF um > 1 gestiegen vs. Vorperiode
- ↓ rot: WSJF um > 1 gefallen
- → grau: Stabil (< 1 Differenz)
- — grau: Nur eine Runde vorhanden

---

### Screen 6 — Projekt: Neue Bewertungsrunde

**Zweck:** Kriterien bewerten, Aufwand eintragen, live WSJF sehen.

**Layout:**
```
[← Zurück] Neue Bewertung: [Projektname]

Info-Box: Erklärung zweistufiges Scoring

Live-Score-Box (3 Kacheln):
  Wert-Score | Aufwand | WSJF-Score
  (aktualisieren live beim Bewegen der Schieberegler)

Datum-Feld

STUFE 1 — WERT-KRITERIEN
  [Criterion Row] × N:
    Links: Name + Beschreibung + Gewicht (% normiert)
    Rechts: Große Zahl (aktueller Slider-Wert) + Range-Slider 1–5 + Labels

STUFE 2 — AUFWAND (DIVISOR)
  [Criterion Row]:
    Links: "Aufwand" + Erklärung
    Rechts: Zahl + Range-Slider 1–5 + Aufwand-Labels (<1W / 1–4W / 1–2M / 2–4M / >4M)

Notiz-Textarea

[Bewertung speichern] [Abbrechen]
```

**Validierung:** Alle Kriterien müssen bewertet sein (Slider bewegt = Wert gesetzt). Aufwand Pflicht. Browser-Alert bei fehlendem Aufwand.

---

### Screen 7 — Konfiguration: Bewertungsmodell

**Zweck:** Kriterien anlegen, bearbeiten, löschen.

**Layout:** Card mit "Info über Gewichte" + Kriterien-Liste + Inline-Edit-Formular.

**Kriterium-Row:** Name | Beschreibung | Gewicht (Zahl + % normiert) | Edit | Delete
**Gewichts-Balken:** Horizontaler Balken der den normierten Anteil visualisiert.

**Legacy-Kriterien:** Ausgegraut, ohne Edit/Delete-Buttons, Badge "Legacy".

**Summe:** Info-Box zeigt Summe der aktiven Gewichte (Rohwerte).

---

### Screen 8 — Konfiguration: Strategic Buckets

**Zweck:** Buckets anlegen, Zielanteile setzen, Raphael-Modus.

**Layout:** Card mit Validierungsanzeige (Summe = 100%) + Bucket-Liste + Inline-Edit-Formular.

**Bucket-Row:** Farbiger Balken links | Name + Zielanteil-Chip + Kapazitätsbalken | Edit | Delete

**Raphael-Modus (Checkbox "Aufteilung gesperrt"):**
- Gesperrt: Edit/Delete-Buttons ausgeblendet, "+ Bucket" ausgeblendet
- Entsperrt: Alle Aktionen sichtbar

---

### Screen 9 — Konfiguration: Export & Backup

**Zweck:** Daten exportieren und sichern.

**Aktionen:**
- CSV exportieren (aktive Projekte, letzte Runde)
- Druckansicht öffnen
- JSON-Backup erstellen (vollständige Datenbasis)
- Backup wiederherstellen (File-Input)

---

### Screen 10 — Druckansicht (@media print)

**Zweck:** Management-Report für Meetings.

**Layout (DIN A4 Querformat):**
- Deckzeile: "VECTOR — Projektpriorisierung" | Datum | Bucket-Zielaufteilung
- Bucket-Header je Bucket (Soll / Ist)
- Projekttabellen je Bucket (nach WSJF sortiert)

**Versteckt im Druck:** Navigation, Filter-Leiste, alle Buttons.

---

## Komponenten-Bibliothek

| Komponente | CSS-Klasse(n) | Variants |
|---|---|---|
| Button | `.btn` | `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-sm` |
| Icon-Button | `.btn-icon` | `.danger` |
| Badge | `.badge` | `.badge-aktiv`, `.badge-zurückgestellt`, `.badge-abgeschlossen` |
| Bucket-Chip | `.bucket-chip` | Farbe inline über `style` |
| Score-Wert | `.score-value` | `.high` (grün), `.mid` (gelb), `.low` (rot) |
| WSJF-Score | `.wsjf-score` | — (immer primärblau) |
| Trend | `.trend-up`, `.trend-down`, `.trend-stable` | — |
| Kapazitätsbalken | `.capacity-bar-fill` | `.ok`, `.over`, `.under` |
| Card | `.card` | + `.card-header`, `.card-body`, `.card-title` |
| Toggle-Gruppe | `.toggle-group` | — |
| Info-Box | `.info-box` | — (blau) |
| Warn-Box | `.warn-box` | — (gelb) |
| Toast | `#toast` | Klasse `.show` |
| Empty State | `.empty-state` | — |

---

## Responsive-Verhalten

Laut PRD: Ausschließlich Desktop-Nutzung (Chrome/Edge). Keine Mobile-Optimierung in Scope.

- Mindestbreite: 900px (Tab-Spalten kollabieren sonst)
- `max-width: 1200px` für den Content-Bereich
- `overflow-x: auto` auf allen Tabellen

---

## Animation

| Element | Animation |
|---|---|
| Kapazitätsbalken | CSS `transition: width .3s` |
| Toast | CSS `transition: opacity .3s`, Auto-Hide nach 2.5s |
| Buttons | CSS `transition: all .15s` |
| Score-Verlauf | Chart.js Default-Animations |
| Confirm-Dialog | Kein Fade (instant) |
