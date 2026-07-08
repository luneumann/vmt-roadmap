# System Design — VECTOR

---

## Komponenten-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                        VECTOR.html                          │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │Dashboard │  │Projekte  │  │Konfiguration             │  │
│  │          │  │          │  │                          │  │
│  │Bucket-   │  │Liste     │  │Kriterien-Editor          │  │
│  │Ansicht   │  │Formular  │  │Bucket-Editor             │  │
│  │          │  │Detail    │  │Export                    │  │
│  │Gesamt-   │  │(Scoring) │  │                          │  │
│  │ranking   │  │          │  │                          │  │
│  └──────────┘  └──────────┘  └──────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 State Manager                        │   │
│  │  state = { projects, criteria, buckets, ui }        │   │
│  │  loadState() / saveState() / render()               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Scoring Engine                          │   │
│  │  calculateValueScore(scores, criteria)               │   │
│  │  calculateWSJF(valueScore, effort)                   │   │
│  │  getTrend(project)                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Export Engine                           │   │
│  │  exportCSV() / openPrintView()                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              localStorage                            │   │
│  │  vector_projects / vector_criteria / vector_buckets  │   │
│  │  vector_config                                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Datenmodell (localStorage-Schema)

### `vector_projects` — Array von Projekten

```typescript
interface Project {
  id: string;               // UUID (crypto.randomUUID())
  name: string;             // Pflichtfeld
  description: string;      // Kurzbeschreibung
  type: "RTI-Produkt" | "Turn-Key" | "Feature";
  bucketId: string;         // Referenz auf Bucket.id
  status: "aktiv" | "zurückgestellt" | "abgeschlossen";
  rounds: ScoringRound[];   // Chronologisch, älteste zuerst
  createdAt: string;        // ISO 8601
}

interface ScoringRound {
  id: string;               // UUID
  date: string;             // ISO 8601
  scores: Record<string, number>; // criterionId → 1-5
  effort: number;           // 1-5 (Divisor)
  note?: string;            // P1: optionaler Freitext
  valueScore: number;       // berechnet, 0-100, gespeichert für Verlauf
  wsjfScore: number;        // berechnet, gespeichert für Verlauf
}
```

**Privacy-Modell:** Alle Daten sind ausschließlich lokal (localStorage). Kein Benutzerkonzept. Kein Netzwerk. Keine Zugriffsteuerung nötig.

### `vector_criteria` — Array von Bewertungskriterien

```typescript
interface Criterion {
  id: string;               // UUID
  name: string;
  description: string;
  weight: number;           // raw Zahl (z.B. 30), wird auf 100% normiert
  active: boolean;          // false = gelöscht aber legacy-sichtbar
  order: number;            // Sortierreihenfolge
}
```

**Default-Kriterien:**
| ID | Name | Gewicht |
|---|---|---|
| `crit-strategic` | Strategische Passung | 30 |
| `crit-market` | Marktpotenzial | 30 |
| `crit-customer` | Kundennutzen / Effizienz | 25 |
| `crit-urgency` | Dringlichkeit / Cost of Delay | 15 |

### `vector_buckets` — Array von Kapazitätskategorien

```typescript
interface Bucket {
  id: string;               // UUID
  name: string;
  color: string;            // Hex-Farbe für Dashboard-Codierung
  targetPercent: number;    // 0-100; Summe aller Buckets = 100
  locked: boolean;          // Raphael-Modus: Zielanteil gesperrt
  order: number;
}
```

**Default-Buckets:**
| Name | Zielanteil | Farbe |
|---|---|---|
| Strategisch / RTI | 60 % | `#2563eb` (Blau) |
| Opportunistisch / Turn-Key | 40 % | `#7c3aed` (Violett) |

### `vector_config` — Globale Konfiguration

```typescript
interface Config {
  bucketAllocationLocked: boolean;  // Raphael-Modus global
  lastExportDate?: string;
}
```

---

## Scoring-Algorithmus

### Wert-Score (0–100)

```
Wert-Score = Σ(score_i × weight_i) / Σ(weight_i) × 20
```

Wobei `score_i` ∈ {1,2,3,4,5} und `weight_i` die rohe Gewichtszahl des Kriteriums i.

Beispiel: 4 Kriterien mit Gewichten [30, 30, 25, 15], Scores [4, 3, 5, 2]:
- Zähler = 4×30 + 3×30 + 5×25 + 2×15 = 120+90+125+30 = 365
- Nenner = 100
- Wert-Score = 365/100 × 20 = 73,0

### WSJF-Score

```
WSJF-Score = Wert-Score / Effort
```

Mit Effort ∈ {1,2,3,4,5}. Beispiel: Wert-Score=73, Effort=2 → WSJF=36,5

### Trend

Vergleich des WSJF-Scores der letzten zwei Runden:
- ↑ wenn neue Runde > alte Runde + 1
- ↓ wenn neue Runde < alte Runde - 1  
- → sonst (stabil)
- — wenn nur eine Runde vorhanden

### Bucket-Auslastung (Ist-Anteil der Kapazität)

Der **Aufwand** eines Projekts (1–5, letzte Bewertungsrunde) ist gleichzeitig die
benötigte **Entwicklungskapazität**. Der Ist-Anteil eines Buckets ist daher
**aufwandsgewichtet**, nicht nur die Projektanzahl (`getBucketStats`):

```
Ist-Anteil(Bucket) = Σ Aufwand(aktive Projekte im Bucket) / Σ Aufwand(alle aktiven Projekte) × 100
```

So zählt ein großes Projekt (Aufwand 5) fünffach gegenüber einem kleinen (Aufwand 1).
Projekte ohne Bewertungsrunde tragen 0 Kapazität bei. Der **Donut** hingegen zeigt die
reine **Projektanzahl** je Bucket (zweite Perspektive). Status: |Ist − Ziel| ≤ 5 % = im
Ziel, > +5 % überallokiert, < −5 % unterallokiert.

---

## UI-Architektur: Single Page + Pop-ups

**Wichtig (Architekturwechsel):** VECTOR hatte ursprünglich drei Seiten-Tabs
(Dashboard / Projekte / Konfiguration). Das erschwerte die Übersicht, weil Kapazität,
Buckets und Projekte nie gleichzeitig sichtbar waren. VECTOR ist daher auf eine
**Single-Page-Architektur** umgestellt: `render()` baut immer die eine Hauptseite
(`renderPage()`); es gibt keine Seitennavigation mehr. Details, Bewertung und
Konfiguration öffnen sich als **Pop-up-Modals** (`openModal()` / `closeModal()`),
die als eigenständiges `#app-modal`-Overlay über die Hauptseite gelegt werden.

### Hauptseite (`renderPage()`, immer sichtbar, von oben nach unten)

```
┌──────────────────────────────────────────────────────────────┐
│ VECTOR   [Kapazität][Alle Projekte]  [Leitfaden][⚙ Konfiguration][+ Neues Projekt] │  ← sticky Header
├──────────────────────────────────────────────────────────────┤
│ Quartal:  [Alle] [Q3 2026 · 4] [Q4 2026 · 3] ...              │  ← Quartals-Leiste
│ Filter: [Status ▾] [Bucket ▾]         [📄 CSV] [🖨 Drucken]   │
├──────────────────────────────────────────────────────────────┤
│ #capacity-tile   Kapazitäts-Übersicht: Töpfe + Donut          │
├──────────────────────────────────────────────────────────────┤
│ #all-projects-tile  Alle Projekte (eine sortierbare Tabelle,  │
│   Spalte "Bucket" als farbiger Chip — ersetzt die frühere     │
│   Bucket-Kachel-Ansicht vollständig)                          │
└──────────────────────────────────────────────────────────────┘
```

- Header-Buttons `Kapazität`/`Alle Projekte` sind **Anker-Scrolls**
  (`scrollToSection(id)`) zu den zwei Bereichen — keine Seitenwechsel.
- `Status`- und `Bucket`-Filter wirken auf die Kapazitäts-Übersicht *und* die
  Alle-Projekte-Tabelle gemeinsam (ein Filter, ein Zustand).
- Ist bei `filterBucket !== 'all'` nur ein Bucket ausgewählt, entfällt die
  Kapazitäts-Übersicht (Töpfe für alle Buckets wären dann irreführend); die Tabelle
  filtert weiterhin auf diesen Bucket.
- Ohne Projekte zeigt die Hauptseite `renderOnboarding()` (Willkommens-Karte mit
  den 6 Leitfaden-Schritten) statt der Kacheln/Tabelle.
- Es gibt bewusst **keine separaten Bucket-Kacheln mehr** (frühere `renderBucketTiles()`/
  `projectRow()` entfernt) — die Bucket-Zugehörigkeit ist in der Alle-Projekte-Tabelle
  als Spalte sichtbar, das reicht für die tägliche Arbeit.
- **Projektbeschreibungen** erscheinen nicht mehr als Fließtext in der Tabelle, sondern
  als **ⓘ-Icon** neben dem Projektnamen mit nativem `title`-Tooltip (`.info-dot`,
  Hover zeigt die volle Beschreibung) — hält die Zeilenhöhe konstant bei langen Texten.

### Pop-up: Projekt-Modal (`renderProjectModal()`, 3 Ansichten in einem Overlay)

Ein einzelnes Modal (`#app-modal`) mit `state.ui.projectModalView` ∈ `detail | scoring | form`:

- **detail** (`renderProjectDetailModal`): Kopf mit Name/Bucket/Quartal/Status +
  Aktionen (Bearbeiten, Neue Bewertung, Löschen, Schließen). Körper: Summary-Kacheln
  (Wert/Aufwand/WSJF/Trend), Score-Verlauf (`buildLineChart()`), Bewertungsrunden-Tabelle.
- **scoring** (`renderScoringFormModal`): Kriterien-Schieberegler (1–5) + Aufwand-Regler,
  Live-Vorschau von Wert-Score/Aufwand/WSJF. Speichern kehrt zu `detail` zurück
  (`refreshProjectModal()`, kein Modal-Neuöffnen).
  **Beantwortet „Wo trage ich die Entwicklungskapazität ein?": im Aufwand-Regler
  dieses Schritts (Divisor, s. Bucket-Kapazität).**
- **form** (`renderProjectFormModal`): Name, Beschreibung, Typ, Bucket, Status, Quartal.
  Nach Speichern öffnet automatisch die `detail`-Ansicht desselben Projekts.

`openDetail(id)` / `openProjectForm(id)` öffnen das Modal neu (`openModal()`);
`enterScoring()` / `exitScoring()` / `backToProjectDetail()` wechseln nur den
Modal-Inhalt (`refreshProjectModal()`), ohne das Overlay neu zu erzeugen.

### Pop-up: Konfigurations-Modal (`renderConfigModal()`, ⚙-Button im Header)

Ein Modal mit internen Tabs (`switchConfigTab()`): **Bewertungsmodell** ·
**Strategic Buckets** · **Export & Backup**. Inline-Bearbeiten (Kriterium/Bucket
hinzufügen, editieren, löschen; Sperr-Toggle) aktualisiert nur den Modal-Inhalt
(`refreshConfigModal()`) — das Modal bleibt beim Speichern offen, damit man mehrere
Kriterien/Buckets nacheinander pflegen kann.

### Bestätigungs-Dialog & Leitfaden

`showConfirm()` (Löschen-Bestätigungen) und `openGuide()` (Workflow-Leitfaden) sind
eigene `.overlay`-Divs, unabhängig vom Projekt-/Konfigurations-Modal. Sie können auch
*über* einem bereits offenen Modal erscheinen (z. B. „Projekt löschen" aus dem
Detail-Modal heraus) — Escape schließt in der Reihenfolge Bestätigung → Modal → Leitfaden.

### Druckansicht (@media print)

`openPrintView()` schließt zuerst ein offenes Modal (`closeModal()`) und ruft dann
`window.print()`. Die Print-CSS blendet zusätzlich `.overlay` global aus (falls doch
ein Modal offen bleibt), sodass immer die Hauptseite gedruckt wird:
- Deckblatt-Zeile: Titel, Export-Datum, Bucket-Zielaufteilung
- Kapazitäts-Übersicht (Soll vs. Ist je Bucket)
- Alle-Projekte-Tabelle (Bucket als Spalte)

---

## Datenfluss — Haupt-Use-Case "Projekt bewerten"

```
1. Nutzer klickt ein Projekt in der Alle-Projekte-Tabelle → openDetail(id)
2. Projekt-Modal öffnet in der Detail-Ansicht
3. Klick "Neue Bewertung" → enterScoring() wechselt den Modal-Inhalt (kein Reload)
4. Formular zeigt alle aktiven Kriterien (aus vector_criteria)
5. Nutzer gibt Scores (1-5) und Aufwand (1-5) ein
6. Live-Berechnung: calculateValueScore() + calculateWSJF()
7. Nutzer klickt "Speichern" (saveScoringRound)
8. Neue ScoringRound wird zu project.rounds gepusht, saveData() persistiert
9. Modal springt zurück zur Detail-Ansicht (refreshProjectModal), Hauptseite
   aktualisiert im Hintergrund (render()) — die Alle-Projekte-Tabelle zeigt sofort
   den neuen Trend, ohne dass das Modal geschlossen werden muss
```

---

## Export-Flow

### CSV-Export
```
1. exportCSV() iteriert alle aktiven Projekte
2. Für jedes Projekt: letzte ScoringRound verwenden
3. Spalten: Name;Bucket;Typ;Datum;[Kriterium1-Score];...;Wert-Score;Aufwand;WSJF-Score
4. UTF-8 BOM prependen (﻿)
5. Semikolon als Trenner (Excel-kompatibel)
6. Blob → Object URL → automatischer Download
```

### Druckansicht
```
1. window.print() auslösen
2. @media print CSS versteckt Navigation, Filter, Buttons
3. Zeigt Deckblatt + Bucket-Übersicht + Rankings
4. DIN A4 Querformat via @page { size: A4 landscape; }
```
