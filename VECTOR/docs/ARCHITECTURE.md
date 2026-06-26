# Architecture Decision Record — VECTOR

---

## ADR-001: Single-File HTML-Anwendung

**Entscheidung:** VECTOR wird als einzelne `.html`-Datei ohne Build-Schritt implementiert.

**Begründung:** Das PRD verlangt Zero-Installation ("läuft als einzelne HTML-Datei im Browser — kein Server, keine Installation"). Die Anwendung muss offline betrieben werden können und vertrauliche Daten dürfen das Gerät nicht verlassen.

**Alternativen:**
- Next.js + Vercel: verworfen — erfordert Server, Build-Schritt, erzwingt Netzwerk-Requests
- Electron: verworfen — Installation nötig, zu schwer für das Use-Case
- PWA mit Service Worker: verworfen — höhere Komplexität ohne zusätzlichen Nutzen

**Konsequenzen:** Kein Hot-Reload, kein TypeScript-Compiler, kein Tree-Shaking. Alle Libraries müssen inline gebündelt werden. Test-Setup ist manuell (Browser-basiert oder Node-Skript).

---

## ADR-002: Vanilla JavaScript (kein Framework)

**Entscheidung:** Die gesamte UI-Logik wird in Vanilla JS implementiert, ohne React, Vue oder Svelte.

**Begründung:** Single-File-Constraint verhindert sinnvollen Einsatz von Component-Frameworks (kein Build-Schritt = kein JSX-Kompilat). Die Datenmenge ist klein (< 50 Projekte), kein Virtual-DOM-Vorteil. Vanilla JS ist wartbar bei klarer Struktur.

**Alternativen:**
- Alpine.js (CDN): erwogen, aber als zusätzliche Abhängigkeit vermieden
- Lit (CDN): zu unbekannt im Team

**Konsequenzen:** Manuelle DOM-Updates. Klare State-Management-Konvention nötig: globales `state`-Objekt, zentrale `render()`-Funktion. Alle UI-Komponenten sind Funktionen die HTML-Strings zurückgeben.

---

## ADR-003: localStorage als Persistenz-Layer

**Entscheidung:** Alle Daten werden in `localStorage` unter definierten Keys gespeichert.

**Begründung:** PRD explizit: "Alle Daten werden im `localStorage` des Browsers persistiert — keine externe Abhängigkeit." 5–10 MB Kapazität ist bei < 50 Projekten mit je ~10 Scoring-Runden ausreichend (ca. 100–200 KB tatsächliche Nutzung).

**Alternativen:**
- IndexedDB: mehr Kapazität, aber API-Komplexität nicht gerechtfertigt
- File System Access API: würde Datei-Schreibzugriff ermöglichen, aber schlechtere Browser-Unterstützung

**Konsequenzen:** Daten sind tab-/browser-gebunden. Kein automatischer Backup. Gelöschte Browser-Daten bedeuten Datenverlust. Daher P1: JSON-Backup/Restore.

---

## ADR-004: Custom Inline-SVG-Charts (keine Chart-Library)

**Entscheidung:** Der Score-Verlauf wird als handgeschriebenes Inline-SVG gerendert (`buildLineChart()`). **Keine externe Chart-Library, kein CDN, keine Build-Abhängigkeit.**

**Begründung:** Die App verarbeitet vertrauliche Daten und muss vollständig offline / airgap-tauglich laufen. Jeder externe Request (auch ein CDN-Load von Chart.js) widerspricht dieser Anforderung. Der benötigte Chart-Typ — ein Zwei-Linien-Verlauf auf fester 0–100-Skala (sowohl Wert-Score als auch WSJF liegen bei min. Aufwand=1 garantiert in 0–100) — ist mit ~30 Zeilen SVG trivial selbst zu bauen. Vorteile: null Netzwerk, winzige Dateigröße, exakte Kontrolle über das Design (passt zur reduzierten UI), keine Versions-/Lizenz-Pflege.

**Alternativen:**
- Chart.js via CDN: **verworfen** — externer Request, unvereinbar mit „geheime Daten / offline"
- Chart.js inline gebündelt (~200 KB): verworfen — große Datei, generischer Look, der nicht zum Design-System passt
- D3.js: zu komplex für ein einfaches Liniendiagramm

**Konsequenzen:** Komplexere Chart-Typen (gestapelte Balken, Tooltips) müssten von Hand ergänzt werden. Für den aktuellen Bedarf (Liniendiagramm) ist das vernachlässigbar. Die gesamte App hat damit **null externe Laufzeit-Abhängigkeiten**.

---

## ADR-005: Zweistufiges Scoring-Modell (Wert-Score + WSJF)

**Entscheidung:** Aufwand ist kein Bewertungskriterium, sondern ein Divisor. WSJF-Score = Wert-Score / Aufwand.

**Begründung:** Rein score-basierte Rankings optimieren in kurzfristiges Firefighting (PRD Problem Statement). Die WSJF-Logik (Weighted Shortest Job First) schützt schnell-umsetzbare, hochwertige Projekte strukturell vor aufwändigen, leicht besser bewerteten Projekten.

**Alternativen:**
- Aufwand als gewichtetes Kriterium: verworfen — Aufwand hat andere Semantik als strategische Kriterien
- Aufwand als Strafterm: weniger intuitiv als Division

**Konsequenzen:** WSJF-Score ist dimensionslos (0–100). Ein Projekt mit Wert-Score 80 / Aufwand 2 = WSJF 40 schlägt Wert-Score 90 / Aufwand 5 = WSJF 18. Dieser Effekt muss in der UI kommuniziert werden.

---

## ADR-006: Strategic Buckets als Kapazitätsfilter

**Entscheidung:** Vor dem Einzel-Ranking wird Kapazität strukturell nach Buckets aufgeteilt. Zielanteile sind konfigurierbar; Raphael kann die Aufteilung sperren.

**Begründung:** Reines Score-Ranking ohne vorgelagerte Kapazitätszuordnung begünstigt systematisch kurzfristige Opportunitäten (PRD Problem Statement). Buckets schützen strategische Langfristprojekte strukturell.

**Konsequenzen:** Die Default-Ansicht zeigt Projekte nach Buckets gruppiert, nicht als einheitliches Ranking. Das UI muss die Bucket-Logik prominent kommunizieren.

---

## ADR-007: OQ-Entscheidungen (für Implementierung)

| OQ | Entscheidung | Begründung |
|---|---|---|
| OQ-1 | CSV exportiert letzte Runde pro Projekt | Einfacheres Schema, Excel-kompatibel; Vollexport als JSON-Backup (P1) |
| OQ-4 | Gelöschte Kriterien bleiben in historischen Scores als "legacy" erhalten | Nachvollziehbarkeit; Score wird als "⚠ legacy" markiert |
| OQ-6 | Bucket-Zielanteil 0% erlaubt | Nützlich für "Parking"-Buckets ohne aktuelle Kapazitätszuweisung |

---

## ADR-008: Reduziertes Design-System (System-Fonts, keine Web-Fonts)

**Entscheidung:** Eigenes, reduziertes Design-System mit gedämpfter Palette (Salbeigrün `#6f7f5b` / Terracotta `#a5614a`), großzügigem Weißraum, runden Cards und großen Zahlen als Fokuspunkten. Typografie ausschließlich über den **System-Font-Stack** (`system-ui` / SF Pro / Segoe UI) — keine Google Fonts, keine Web-Font-Requests. Icons als handgeschriebene Inline-SVGs.

**Begründung:** Konsistent mit ADR-001/004 darf nichts extern geladen werden (geheime Daten, offline). Web-Fonts wären ein externer Request und damit unzulässig. System-Fonts sehen auf den Zielplattformen (macOS/Windows, Chrome/Edge) hochwertig aus. Das reduzierte, „Produkt-Design"-orientierte Erscheinungsbild wurde explizit gegenüber dem ursprünglichen Enterprise-SaaS-Look gewählt.

**Konsequenzen:** Das exakte Schriftbild variiert leicht zwischen Betriebssystemen — für ein internes Desktop-Tool unkritisch. Farben sind als CSS-Custom-Properties (`:root`) zentralisiert und damit leicht anpassbar.
