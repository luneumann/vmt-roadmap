# Design Handoff — VECTOR

---

## Design-Sprache

Reduziertes „Produkt-Design": warmer heller Hintergrund, weiße Cards mit feinem Rahmen
und großem Radius, viel Weißraum, **große Zahlen als Fokuspunkte**, gedämpfte
Salbe/Terracotta-Palette, custom geometrische Daten-Viz. System-Fonts, keine Web-Fonts.

## Design Tokens (CSS Custom Properties in `:root`)

| Token | Wert | Verwendung |
|---|---|---|
| `--bg` | `#f6f5f2` | App-Hintergrund (warmes Off-White) |
| `--surface` | `#ffffff` | Cards |
| `--surface-2` | `#faf9f6` | Hover, eingelassene Flächen |
| `--border` | `#ebe9e3` | Rahmen, Trennlinien |
| `--border-strong` | `#ddd9d0` | Input-Rahmen |
| `--text` | `#211f1c` | Primärtext, große Zahlen |
| `--text-2` | `#6b6760` | Labels, Beschreibungen |
| `--text-3` | `#a8a399` | Tertiär, Platzhalter, Unterallokierung |
| `--sage` | `#6f7f5b` | Primäraktion, hohe Scores, WSJF-Akzent, Bucket 1 |
| `--sage-deep` | `#5d6c4b` | Hover, Score-Text |
| `--sage-soft` | `#eef1e8` | Aktive Tab/Nav, OK-Status, Badge „aktiv" |
| `--terra` | `#a5614a` | Sekundär, niedrige Scores, Überallokierung, Bucket 2 |
| `--terra-soft` | `#f6ece7` | Aufwand-Block, Über-Status |
| `--blue` / `--blue-soft` | `#6b85a8` / `#eaeff4` | Info-Boxen |
| `--amber` / `--amber-soft` | `#b0843f` / `#f7efe2` | Mittlere Scores (40–69), Warn-Boxen |
| `--radius` / `--radius-sm` | `18px` / `12px` | Cards / Sub-Elemente |
| `--radius-pill` | `999px` | Buttons, Chips, Badges, Segmente |
| `--font` | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | **System-Stack, keine Web-Fonts** |

**Score-Farbcodierung:**
- ≥ 70: `--sage` (Salbeigrün)
- 40–69: `--amber` (gedämpftes Ocker)
- < 40: `--terra` (Terracotta)

**Bucket-Farben (Default):**
- Strategisch / RTI: `#6f7f5b` (Salbe)
- Opportunistisch / Turn-Key: `#a5614a` (Terracotta)

**Icons:** Handgeschriebene Inline-SVG (Stroke, `currentColor`), zentral im JS-Objekt `I`.

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
  → ab 2 Runden: custom Inline-SVG Liniendiagramm (Wert-Score sage + WSJF terra, 2 Linien, 0–100-Skala)
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

### Screen 11 — Leitfaden (Workflow-Guide) & Onboarding

**Zweck:** Den Arbeitsablauf direkt im Tool sichtbar machen, damit klar ist *wie* man VECTOR benutzt.

**Zugang:**
- **Header-Button „Leitfaden"** — jederzeit erreichbar, öffnet den Guide als Overlay
- **Auto-Öffnen** beim allerersten Start (kein `vector_guide_seen`-Flag und keine Projekte)
- **Onboarding-Startansicht** — ist das Dashboard leer (keine Projekte), erscheint statt der Bucket-Ansicht eine Willkommens-Karte mit denselben 6 Schritten und direkten Aktions-Buttons

**Guide-Inhalt (6 Schritte, Quelle: `GUIDE_STEPS`):**
- Phase „Einrichten": (1) Kapazität auf Buckets aufteilen, (2) Kriterien prüfen
- Phase „Laufender Betrieb": (3) Projekte anlegen, (4) bewerten, (5) priorisieren & Kapazität prüfen, (6) aktuell halten & exportieren
- Jeder Schritt hat einen Aktions-Link, der den Guide schließt und zur passenden Stelle navigiert
- Abschluss-Hinweis: Schritte 3–6 sind der laufende Kreislauf, Schritt 1 seltener (pro Planungszyklus)

**Kontextzeilen (`.page-sub`):** Jede Hauptseite (Dashboard, Projekte, Konfiguration/Tabs) trägt unter dem Titel eine kurze Zeile, die ihren Zweck im Workflow erklärt.

**States:** Overlay offen/geschlossen; Klick auf Backdrop schließt. Onboarding erscheint nur bei 0 Projekten.

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
| Score-Verlauf | Statisches SVG (keine Animation nötig) |
| Toast | Slide-up + Fade (`transform`/`opacity`, .3s) |
| Confirm-Dialog | Kein Fade (instant) |
