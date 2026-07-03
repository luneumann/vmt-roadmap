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

## UI-Ansichten

### Ansicht 1: Dashboard → Bucket-Übersicht (Default)

```
┌────────────────────────────────────────────────────┐
│ VECTOR                    [Bucket-Ansicht] [Ranking]│
│ Filter: [Status ▾] [Bucket ▾]    [📄 CSV] [🖨 Print]│
├────────────────────────────────────────────────────┤
│ ● Strategisch / RTI           Ziel: 60%  Ist: 2/3  │
│   ████████████░░░ (Balken: grün im Ziel)           │
│ ┌──┬──────────────┬────────┬──────┬────┬──────┬──┐ │
│ │Rg│ Name         │ Typ    │ Wert │ Aw.│ WSJF │⬆⬇│ │
│ ├──┼──────────────┼────────┼──────┼────┼──────┼──┤ │
│ │ 1│ Projekt A    │ RTI    │  73  │  2 │ 36,5 │↑ │ │
│ │ 2│ Projekt B    │ Feature│  60  │  3 │ 20,0 │→ │ │
│ └──┴──────────────┴────────┴──────┴────┴──────┴──┘ │
│                                                    │
│ ● Opportunistisch / Turn-Key  Ziel: 40%  Ist: 1/2  │
│ ...                                                │
└────────────────────────────────────────────────────┘
```

### Ansicht 2: Dashboard → Gesamtranking

Alle aktiven Projekte in einer Tabelle, sortierbar nach WSJF / Wert-Score / Name / Datum.
Zusätzliche Spalte: Bucket (farbig kodiert).

### Ansicht 3: Projekte → Liste

```
[+ Neues Projekt]
Tabelle: Name | Bucket | Typ | Wert-Score | WSJF | Runden | Status | [✎] [🗑]
```

### Ansicht 4: Projekt-Detail / Formular

Tabs innerhalb der Ansicht:
- **Grunddaten:** Name, Beschreibung, Typ, Bucket, Status
- **Neue Bewertung:** Scores je Kriterium (Schieberegler 1-5 + Beschreibung), Aufwand, Datum
- **Score-Verlauf:** Liniendiagramm (custom Inline-SVG, `buildLineChart()`) + Verlaufstabelle

### Ansicht 5: Konfiguration → Kriterien

Liste aller Kriterien, editierbar. Drag-to-reorder.
Summenanzeige der Gewichte (wird live normiert).

### Ansicht 6: Konfiguration → Buckets

Liste aller Buckets mit Name, Farbe, Zielanteil.
Summe der Zielanteile: muss 100% ergeben.
Toggle "Bucket-Aufteilung gesperrt" (Raphael-Modus).

### Ansicht 7: Druckansicht (@media print)

Separates Layout, aktiviert via `window.print()`:
- Deckblatt-Zeile: Titel, Export-Datum, Bucket-Zielaufteilung
- Kapazitäts-Übersicht (Soll vs. Ist je Bucket)
- Ranking je Bucket

---

## Datenfluss — Haupt-Use-Case "Projekt bewerten"

```
1. Nutzer öffnet Projekt-Detail
2. Klickt "Neue Bewertungsrunde"
3. Formular zeigt alle aktiven Kriterien (aus vector_criteria)
4. Nutzer gibt Scores (1-5) und Aufwand (1-5) ein
5. Live-Berechnung: calculateValueScore() + calculateWSJF()
6. Nutzer klickt "Speichern"
7. Neue ScoringRound wird zu project.rounds gepusht
8. saveState() → localStorage.setItem('vector_projects', JSON.stringify(...))
9. render() aktualisiert Dashboard + Trend-Anzeige
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
