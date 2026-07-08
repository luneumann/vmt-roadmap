# Design Handoff — VECTOR

---

## Design-Sprache

Reduziertes „Produkt-Design": warmer heller Hintergrund, weiße Cards mit feinem Rahmen
und großem Radius, viel Weißraum, **große Zahlen als Fokuspunkte**, gedämpfte
Salbe/Terracotta-Palette, custom geometrische Daten-Viz. System-Fonts, keine Web-Fonts.

## Design Tokens (CSS Custom Properties in `:root`)

| Token | Wert | Verwendung |
|---|---|---|
> **Akzentfarbe:** `rgb(0,165,135)` = `#00a587` (Teal). Die CSS-Variablennamen `--sage*`
> sind aus historischen Gründen beibehalten, tragen aber die Teal-Werte.

| `--bg` | `#f3f6f5` | App-Hintergrund (kühles Off-White) |
| `--surface` | `#ffffff` | Cards |
| `--surface-2` | `#f5f8f7` | Hover, eingelassene Flächen, leerer Topf |
| `--border` | `#e5eae8` | Rahmen, Trennlinien |
| `--border-strong` | `#d4dbd8` | Input-Rahmen, Topf-Kontur |
| `--text` | `#1a2320` | Primärtext, große Zahlen, Ziel-Linie |
| `--text-2` | `#5c6763` | Labels, Beschreibungen |
| `--text-3` | `#97a09b` | Tertiär, Platzhalter, Unterallokierung |
| `--sage` (= Akzent Teal) | `#00a587` | Primäraktion, hohe Scores, Bucket 1 |
| `--sage-deep` | `#007e67` | Hover, Score-Text |
| `--sage-soft` | `#ddf2ec` | Aktive Tab/Nav, OK-Status, Badge „aktiv" |
| `--terra` | `#dd6150` | Niedrige Scores, Überallokierung (Koralle) |
| `--terra-soft` | `#fbe8e4` | Aufwand-Block, Über-Status |
| `--blue` / `--blue-soft` | `#3f7ea6` / `#e6eff5` | WSJF-Chartlinie, Info-Boxen, Bucket 3 |
| `--amber` / `--amber-soft` | `#cf9834` / `#f7efda` | Mittlere Scores (40–69), Warn-Boxen |
| `--radius` / `--radius-sm` | `18px` / `12px` | Cards / Sub-Elemente |
| `--radius-pill` | `999px` | Buttons, Chips, Badges, Segmente |
| `--font` | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | **System-Stack, keine Web-Fonts** |

**Score-Farbcodierung:**
- ≥ 70: `--sage` (Teal)
- 40–69: `--amber` (Ocker)
- < 40: `--terra` (Koralle)

**Bucket-Farben (Default):**
- Strategisch / RTI: `#00a587` (Teal)
- Opportunistisch / Turn-Key: `#e0864c` (Orange)
- (Beispieldaten Bucket 3: `#3f7ea6` Blau)

**Icons:** Handgeschriebene Inline-SVG (Stroke, `currentColor`), zentral im JS-Objekt `I`.

---

## Screens und Zustände

### Screen 1 — Hauptseite (Single Page, immer sichtbar)

**Zweck:** Alles auf einer Seite — Kapazität und Projekte gleichzeitig im Blick, keine
Seiten-Tabs mehr. `renderPage()` baut diese eine Ansicht; sie ist die einzige „Seite"
der App. Details/Bewertung/Konfiguration öffnen als Pop-up (Screen 2/3).

**Layout, von oben nach unten:**
- Sticky Header: Anker-Buttons `Kapazität` / `Alle Projekte` (Scroll, keine
  Seitenwechsel) + `Leitfaden` + `⚙ Konfiguration` (öffnet Screen 3) + `+ Neues Projekt`
  (öffnet Screen 2 im Form-Modus)
- Quartals-Leiste (Pills: Alle / Q3 2026 / Q4 2026 …)
- Filter-Leiste: Status-Dropdown, Bucket-Dropdown, CSV-Export, Drucken — wirkt auf
  Kapazitäts-Übersicht **und** Alle-Projekte-Tabelle gemeinsam
- `#capacity-tile`: **Kapazitäts-Übersicht** (nur wenn Bucket-Filter = „Alle"): Reihe von
  **Töpfen** (SVG, `buildPot`) je Bucket + **Donut** (`buildDonut`) mit Projektverteilung
- `#all-projects-tile`: **Alle Projekte** — eine einzige sortierbare Tabelle über alle
  gefilterten Buckets hinweg, mit Bucket als farbiger Chip-Spalte. Ersetzt sowohl die
  frühere separate „Projekte"-Seite als auch die frühere Bucket-Kachel-Ansicht (Kacheln
  je Bucket mit eigener Mini-Tabelle) — bewusst entfernt, da Bucket-Zugehörigkeit +
  Sortierung in einer Tabelle für den täglichen Gebrauch ausreicht.

**Kapazitäts-Übersicht (Töpfe + Donut):**
- **Topf je Bucket:** flaches **2D**-Behälter-Symbol (leicht konisch, ohne 3D-Rand/Henkel); Füllstand = Ist-**Kapazitäts**anteil (aufwandsgewichtet); gestrichelte Linie = Ziel-Anteil. Farbe: Bucket-Farbe wenn im Ziel, Koralle wenn überallokiert, Grau wenn unterallokiert.
- **Donut:** Segmente je Bucket (Projektanzahl), Bucket-Farben, Zentrum = Gesamtzahl aktiver Projekte. Legende mit Anzahl + %-Anteil.
- Beispieldaten via `loadExampleData()` (3 Buckets, 6 Projekte) — Buttons im Onboarding und in Konfiguration → Export.

**Klick auf ein Projekt** (Alle-Projekte-Tabelle, Button „Öffnen"): öffnet Screen 2
(Projekt-Modal) in der Detail-Ansicht — `openDetail(id)`.

**Projektbeschreibung als Tooltip:** Neben dem Projektnamen erscheint bei vorhandener
Beschreibung ein kleines **ⓘ-Icon** (`.info-dot`, Klasse `I.info`). Hover zeigt die volle
Beschreibung über den nativen HTML-`title`-Tooltip des Browsers — kein Custom-JS, keine
zusätzliche Bibliothek. Hält die Tabellenzeile kompakt auch bei langen Freitexten.

**States:**
| State | Beschreibung |
|---|---|
| Keine Projekte | `renderOnboarding()` ersetzt die gesamte Hauptseite (Willkommens-Karte, 6 Leitfaden-Schritte) |
| Leere Tabelle (Filter) | Empty-State „Keine Projekte mit aktuellem Filter." |
| Mit Projekten | Tabelle: Rang, Name (+ ⓘ-Tooltip), Bucket-Chip, Typ, Wert-Score, Aufwand, WSJF, Trend, Bewertet, Status |
| Filter aktiv | Kapazitäts-Übersicht + Alle-Projekte-Tabelle filtern synchron (Status, Bucket, Quartal) |

**Kapazitätsbalken (in den Töpfen):**
- Grün: Ist-Anteil ≤ Ziel + 5%
- Rot (Koralle): Ist-Anteil > Ziel + 5% → Überallokiert
- Grau: Ist-Anteil < Ziel - 5% → Unterallokiert

---

### Screen 2 — Pop-up: Projekt-Modal (Detail · Bewertung · Formular)

**Zweck:** Ein einziges Overlay-Modal für alles, was zu einem Projekt gehört. Kein
Seitenwechsel — `state.ui.projectModalView` (`detail | scoring | form`) bestimmt den
Inhalt; Wechsel zwischen den dreien passiert per `refreshProjectModal()` (Inhalt
austauschen, Overlay bleibt bestehen).

**detail (Standard beim Öffnen, `openDetail(id)`):**
```
[Name] [Quartal-Badge] [Bucket-Chip] [Status-Badge]      [Bearbeiten][+Neue Bewertung][🗑][✕]
Beschreibung

Score-Summary-Box (4 Kacheln): Wert-Score | Aufwand | WSJF-Score | Trend

Card: Score-Verlauf
  → ab 2 Runden: custom Inline-SVG Liniendiagramm (Wert-Score teal + WSJF blau)
  → < 2 Runden: Hinweistext

Card: Bewertungsrunden (N)
  Tabelle: Datum | [Kriterium 1..n] | Aufwand | Wert-Score | WSJF
  Neueste Runde hervorgehoben
```
Trend-Darstellung: ↑ grün (WSJF > +1 vs. Vorperiode) · ↓ rot (< −1) · → grau (stabil) · — grau (nur 1 Runde).

**scoring (`enterScoring()`, aus der Detail-Ansicht):** Ein Eingabefeld je aktivem
Kriterium, Typ abhängig von `criterion.valueType` (`renderScoringCriterionRow()`):
- **Skala-Kriterien:** Schieberegler 1–5 wie bisher.
- **Numerische Kriterien** (z.B. Marktpotenzial/SOM, Cost of Delay): freies Zahlenfeld
  (`<input type="number">`, `step="any"` — akzeptiert jeden Betrag, keine künstliche
  Schrittweiten-Rundung) mit `min`/`max` aus der Kriteriums-Konfiguration. Großer
  formatierter Live-Wert oben (z.B. „8,5 Mio. €"), darunter die Eingabe, darunter eine
  Zeile mit Minimum, **normiertem Äquivalent** („≈ 4,4 / 5") und Maximum — macht
  transparent, wie der Betrag in die Wert-Score-Formel eingeht (siehe System-Design →
  Scoring-Algorithmus → Normierung).

Plus **Aufwand-Regler** (Divisor, immer Skala 1–5) mit Live-Vorschau
(Wert-Score/Aufwand/WSJF). **Das ist die Stelle, an der die benötigte
Entwicklungskapazität eines Projekts eingetragen wird** — der Aufwand-Regler bestimmt
sowohl WSJF als auch den Kapazitätsanteil im zugehörigen Bucket-Topf. Speichern
(`saveScoringRound`) kehrt automatisch zur `detail`-Ansicht zurück; „Abbrechen"/
Zurück-Pfeil ebenso, X schließt das ganze Modal.

**form (`openProjectForm(id)`, aus Detail „Bearbeiten" oder Header „+ Neues Projekt"):**
Name (Pflicht), Kurzbeschreibung, Typ, Bucket (Pflicht), Status, **Quartal**. Nach
Speichern öffnet automatisch die `detail`-Ansicht desselben (neuen oder bearbeiteten)
Projekts. „Abbrechen" bei bestehendem Projekt → zurück zu `detail`; bei neuem Projekt →
Modal schließt ganz.

**Löschen:** Icon-Button im Detail-Kopf → Bestätigungsdialog (Screen: eigenständiges
`.overlay`, über dem Projekt-Modal) → schließt bei Bestätigung das ganze Modal.

---

### Screen 3 — Pop-up: Konfigurations-Modal

**Zweck:** Kriterien, Buckets und Export/Backup in einem Overlay, per interne Tabs
erreichbar (⚙-Button im Header, `openConfig(tab)`). Tab-Wechsel und Inline-Edits
(Kriterium/Bucket hinzufügen/bearbeiten/löschen, Sperr-Toggle) laufen über
`refreshConfigModal()` — das Modal bleibt offen, damit mehrere Einträge nacheinander
gepflegt werden können.

**Tab „Bewertungsmodell":** Info-Box zu Gewichten + Kriterien-Liste + Inline-Edit-Formular.
Kriterium-Row: Name (+ Bereichs-Badge bei numerischen Kriterien, z.B. „500.000 € – 10
Mio. €") | Beschreibung | Gewicht (Zahl + % normiert) | Edit | Delete. Gewichts-Balken
visualisiert den normierten Anteil. Legacy-Kriterien: ausgegraut, ohne Edit/Delete,
Badge „Legacy".

Formular pro Kriterium: Name, Gewicht, Beschreibung, dann **Bewertungsart**
(Select: „Skala 1–5" / „Numerischer Wert") — bei „Numerisch" blenden sich zusätzliche
Felder Minimum/Maximum/Einheit ein (reines Zeige/Verstecken per JS, kein
Modal-Neuaufbau, damit Eingaben in anderen Feldern nicht verloren gehen). Speichern
validiert Maximum > Minimum bei numerischen Kriterien.

**Tab „Strategic Buckets":** Validierungsanzeige (Summe = 100%) + Bucket-Liste +
Inline-Edit-Formular (Name, Zielanteil %, Farbe). Bucket-Row: farbiger Rand links |
Name + Zielanteil-Chip + Kapazitätsbalken | Edit | Delete. Raphael-Modus (Checkbox
„Aufteilung gesperrt"): gesperrt blendet Edit/Delete/„+ Bucket" aus.

**Tab „Export & Backup":** CSV exportieren, Druckansicht öffnen, JSON-Backup erstellen,
Backup wiederherstellen (File-Input), Beispieldaten laden, Alle Daten löschen.

---

### Screen 10 — Druckansicht (@media print)

**Zweck:** Management-Report für Meetings.

**Layout (DIN A4 Querformat):**
- Deckzeile: "VECTOR — Projektpriorisierung" | Quartal | Datum | Bucket-Zielaufteilung
- Kapazitäts-Übersicht (Soll vs. Ist je Bucket)
- Alle-Projekte-Tabelle (nach WSJF sortiert, Bucket als Spalte)

**Versteckt im Druck:** Header/Anker-Nav, Filter-Leiste, alle Buttons, **jedes offene
Pop-up-Modal** (`.overlay` global ausgeblendet — `openPrintView()` schließt zusätzlich
aktiv jedes offene Modal, bevor `window.print()` aufgerufen wird, damit garantiert die
Hauptseite gedruckt wird).

---

### Screen 11 — Leitfaden (Workflow-Guide) & Onboarding

**Zweck:** Den Arbeitsablauf direkt im Tool sichtbar machen, damit klar ist *wie* man VECTOR benutzt.

**Zugang:**
- **Header-Button „Leitfaden"** — jederzeit erreichbar, öffnet den Guide als Overlay (unabhängig vom Projekt-/Konfigurations-Modal, kann auch darüber erscheinen)
- **Auto-Öffnen** beim allerersten Start (kein `vector_guide_seen`-Flag und keine Projekte)
- **Onboarding-Startansicht** — ist die Hauptseite leer (keine Projekte), ersetzt `renderOnboarding()` die Kapazitäts-/Bucket-/Projekt-Bereiche komplett durch eine Willkommens-Karte mit denselben 6 Schritten und direkten Aktions-Buttons

**Guide-Inhalt (6 Schritte, Quelle: `GUIDE_STEPS`):**
- Phase „Einrichten": (1) Kapazität auf Buckets aufteilen → öffnet Konfigurations-Modal (Tab Buckets), (2) Kriterien prüfen → Konfigurations-Modal (Tab Bewertungsmodell)
- Phase „Laufender Betrieb": (3) Projekte anlegen → Projekt-Modal (Formular), (4) bewerten → scrollt zur Alle-Projekte-Kachel, (5) priorisieren & Kapazität prüfen → scrollt zur Kapazitäts-Übersicht, (6) aktuell halten & exportieren → Konfigurations-Modal (Tab Export)
- Jeder Schritt hat einen Aktions-Link (`step-action`), der den Guide schließt und die passende Aktion ausführt (Modal öffnen oder `scrollToSection()`)
- Abschluss-Hinweis: Schritte 3–6 sind der laufende Kreislauf, Schritt 1 seltener (pro Planungszyklus)

**Kontextzeile (`.page-sub`):** Die Hauptseite trägt unter der Quartals-Leiste eine kurze Zeile, die das Kernprinzip (Bucket vor WSJF) erklärt.

**States:** Guide-Overlay, Projekt-/Konfigurations-Modal und Bestätigungsdialog sind unabhängige `.overlay`-Ebenen und können gestapelt erscheinen. Escape schließt in der Reihenfolge Bestätigung → Modal → Leitfaden. Onboarding erscheint nur bei 0 Projekten.

---

## Komponenten-Bibliothek

| Komponente | CSS-Klasse(n) | Variants |
|---|---|---|
| Button | `.btn` | `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm` |
| Icon-Button | `.icon-btn` | `.danger` |
| Badge | `.badge` | `.badge-aktiv`, `.badge-zurückgestellt`, `.badge-abgeschlossen`, `.badge-type` |
| Chip (Bucket/Quartal) | `.chip` | Farbe inline über `style` |
| Score-Wert | `.score` | `.high` (grün), `.mid` (ocker), `.low` (koralle) |
| WSJF-Score | `.wsjf` | — |
| Trend | `.trend` | `.up`, `.down`, `.flat` |
| Kapazitäts-Topf | SVG (`buildPot()`) | Farbe inline (ok/über/unter), kein CSS-Balken mehr |
| Info-Tooltip | `.info-dot` (+ `I.info`) | nativer `title`-Tooltip für lange Projektbeschreibungen |
| Card | `.card` | + `.card-pad`, `.card-head` |
| **Pop-up-Modal** | `.overlay` + `.modal` | `.modal-md` (640px), `.modal-lg` (880px); Kopf/Körper reusen `.guide-head` / `.guide-body` |
| Quartals-Pill | `.qpill` | `.active` |
| Info-Box | `.note-box` | — (blau) |
| Warn-Box | `.warn-box` | — (ocker) |
| OK-Box | `.ok-box` | — (teal) |
| Toast | `#toast` | Klasse `.show` |
| Empty State | `.empty` | — |

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
