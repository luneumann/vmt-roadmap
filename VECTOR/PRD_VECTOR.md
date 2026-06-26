# PRD — VECTOR
### Lokales Projektpriorisierungs- und Sequenzierungstool

**Status:** Draft  
**Autor:** Lukas  
**Datum:** 2026-06-19  
**Version:** 0.2 — ergänzt um Strategic Buckets, WSJF-Divisor-Logik, Bucket-Dashboard

---

## Problem Statement

Als PM trägt Lukas die Planungsverantwortung für Entwicklungsressourcen, ohne direkte Weisungsbefugnis. Priorisierungsentscheidungen zwischen strategischen Langfristprojekten und kurzfristigen Opportunitäten werden heute ad hoc und auf Basis subjektiver Einschätzungen getroffen.

Das Kernproblem ist struktureller Natur: Ein reines Score-Ranking ohne vorgelagerte Kapazitätszuordnung optimiert systematisch in kurzfristiges Firefighting hinein — strategische Langfristprojekte verlieren jedes Mal gegen dringende Opportunitäten, selbst wenn sie strategisch wertvoller sind. Außerdem blockieren große, langwierige Projekte die Entwicklungspipeline überproportional, was rein wertbasierte Rankings nicht abbilden.

Es fehlt ein System, das (a) Kapazität strukturell nach strategischen Kategorien (Buckets) aufteilt — bevor einzelne Projekte verglichen werden, (b) innerhalb jedes Buckets eine objektive, aufwandsbereinigte Rangfolge erzeugt (WSJF-Logik), (c) die Score-Entwicklung pro Projekt über Zeit verfolgt und (d) Ergebnisse so aufbereitet, dass Raphael / Management fundierte Ressourcenentscheidungen treffen können.

Das Tool läuft vollständig lokal (keine Netzwerkverbindung) und verarbeitet keine Daten außerhalb des Browsers, da es vertrauliche Projektinformationen enthält.

---

## Goals

1. **Objektive Rangfolge:** Entwicklungsprojekte und große Features können nach einem gewichteten Score-Modell bewertet und eindeutig gerankt werden.
2. **Konfigurierbarkeit:** Bewertungskriterien und Gewichtungen sind anpassbar — ohne Code-Änderungen.
3. **Score-Verlauf:** Für jedes Projekt ist sichtbar, wie sich der gewichtete Score über mehrere Bewertungsrunden entwickelt hat.
4. **Management-tauglicher Output:** Ein Klick erzeugt eine druckfähige Ansicht (PDF über Browser) und eine CSV-Datei, die direkt in Excel weiterverarbeitet werden kann.
5. **Zero-Installation:** Das Tool läuft als einzelne HTML-Datei im Browser — kein Server, keine Installation, keine Abhängigkeiten.
6. **Strategic Buckets:** Kapazität wird strukturell nach Projekt-Kategorien (Buckets) aufgeteilt — *vor* dem Einzel-Ranking. Raphael legt die Bucket-Zielanteile fest; Lukas rankt innerhalb jedes Buckets. So werden strategische Langfristprojekte strukturell vor kurzfristigen Opportunitäten geschützt.
7. **Aufwandsbereinigte Sequenzierung (WSJF):** Der Entwicklungsaufwand wirkt nicht als bloßes Score-Kriterium, sondern als Divisor des Nutzwerts — schnell umsetzbare Projekte mit hohem Wert werden systematisch vorgezogen.

---

## Non-Goals

| # | Nicht in Scope | Begründung |
|---|---|---|
| 1 | Cloud-Sync oder Mehrbenutzer-Modus | Datenschutz; Tool ist Single-User by design |
| 2 | Automatische Befüllung aus TFS / Jira | Zu aufwändig für v1; manuelle Eingabe ausreichend |
| 3 | Gantt-Ansicht oder Ressourcenplanung | Separates Thema; besteht bereits in anderem Format |
| 4 | Rollenbasierte Zugriffssteuerung | Nicht notwendig — nur Lukas befüllt das Tool |
| 5 | Mobile-Optimierung | Wird ausschließlich am Desktop verwendet |

---

## User Stories

### Lukas (PM, primärer Nutzer)

- Als PM möchte ich ein neues Projekt anlegen und alle Bewertungsdimensionen in einem Formular ausfüllen, damit der gewichtete Score sofort berechnet wird.
- Als PM möchte ich beim Anlegen eines Projekts einen Bucket (Kapazitätskategorie) zuweisen, damit das Projekt in der richtigen strategischen Kategorie erscheint.
- Als PM möchte ich ein bestehendes Projekt erneut bewerten (neue Scoring-Runde), damit der Score-Verlauf über Zeit sichtbar ist.
- Als PM möchte ich die Bewertungskriterien (Name, Beschreibung, Gewicht) konfigurieren können, damit das Modell bei sich ändernden strategischen Prioritäten angepasst wird.
- Als PM möchte ich alle Projekte nach Bucket gruppiert sehen, damit ich erkenne, ob die Kapazitätsverteilung dem strategischen Sollzustand entspricht.
- Als PM möchte ich alle Projekte in einer sortierbaren Tabelle sehen (nach WSJF-Score, nach Wert-Score, nach Name), damit ich schnell die aktuelle Prioritätsreihenfolge erkenne.
- Als PM möchte ich für ein einzelnes Projekt den Score-Trend als Liniendiagramm sehen, damit ich Verschiebungen in der Bewertung nachvollziehen kann.
- Als PM möchte ich Projekte als Status "aktiv", "zurückgestellt" oder "abgeschlossen" markieren, damit das Dashboard nicht mit erledigten Einträgen überfüllt wird.

### Raphael / Management (Empfänger des Exports)

- Als Entscheider möchte ich die Bucket-Zielaufteilung festlegen können (z.B. 60 % Strategisch / 40 % Opportunistisch), damit die Kapazitätszuweisung meiner strategischen Absicht entspricht.
- Als Entscheider möchte ich eine druckfähige Übersichtstabelle erhalten, die nach Buckets gegliedert ist und den WSJF-Score je Projekt zeigt, damit ich Ressourcenentscheidungen auf Basis nachvollziehbarer Kriterien treffen kann.
- Als Entscheider möchte ich sehen, wie viele aktive Projekte pro Bucket vorhanden sind vs. dem Zielanteil, damit Über- oder Unterallokation sofort erkennbar ist.

---

## Requirements

### P0 — Must-Have (MVP nicht lieferbar ohne diese)

**Datenverwaltung**
- Projekte anlegen mit Pflichtfeldern: Name, Kurzbeschreibung, Typ (RTI-Produkt / Turn-Key / Feature), **Bucket (Kapazitätskategorie)**, Bewertungsdatum
- Projekte bearbeiten und löschen
- Alle Daten werden im `localStorage` des Browsers persistiert — keine externe Abhängigkeit
- Beim ersten Start werden Default-Kriterien und Default-Buckets geladen

*Akzeptanzkriterien:*
- [ ] Daten überleben Browser-Refresh und Tab-Schließen
- [ ] Löschen erfordert Bestätigungsdialog
- [ ] Pflichtfelder werden vor dem Speichern validiert

**Scoring — Zweistufiges Modell (Wert-Score + WSJF)**

Das Scoring besteht aus zwei Komponenten, die getrennt berechnet und angezeigt werden:

*Stufe 1 — Wert-Score (0–100):*
- Pro Projekt und pro Bewertungsrunde: Einzelbewertung je Wert-Kriterium auf Skala 1–5
- 4 Wert-Kriterien (konfigurierbar, Aufwand ist *kein* Wert-Kriterium — s. Stufe 2)
- Formel: `Wert-Score = Σ(Einzelscore × Gewicht) / Σ Gewichte × 20` → Ergebnis: 0–100

*Stufe 2 — Aufwand als Divisor (WSJF-Logik):*
- Separates Pflichtfeld **Aufwand** (Skala 1–5): 1 = sehr gering (<1 Woche), 5 = sehr groß (>3 Monate)
- **WSJF-Score = Wert-Score / Aufwand** → dimensionslose Zahl, dient als Sequenzierungsindex
- Interpretation: Ein Projekt mit Wert-Score 80 und Aufwand 2 (WSJF = 40) wird höher sequenziert als ein Projekt mit Wert-Score 90 und Aufwand 5 (WSJF = 18)
- Dashboard zeigt beide Werte nebeneinander: Wert-Score (Wichtigkeit) und WSJF-Score (Sequenzierungs-Priorität)
- Default-Sortierung im Dashboard: nach WSJF-Score absteigend

*Zeitverlauf:*
- Bewertungsrunden sind datumgestempelt; eine neue Runde überschreibt nicht die vorherige
- Verlauf zeigt sowohl Wert-Score als auch WSJF-Score über Runden

*Akzeptanzkriterien:*
- [ ] Wert-Score und WSJF-Score werden live beim Eingeben berechnet
- [ ] Beide Scores sind im Dashboard als separate Spalten sichtbar
- [ ] Vergangene Bewertungsrunden bleiben erhalten und sind abrufbar
- [ ] Aufwand-Feld ist Pflicht — Speichern ohne Aufwand-Eingabe ist nicht möglich

**Dashboard — Zwei Ansichten**

*Ansicht 1 — Bucket-Übersicht (Default-Ansicht):*
- Projekte nach Bucket gruppiert, je Bucket ein eigener Abschnitt
- Kopfzeile je Bucket: Name, Zielanteil (%), Anzahl aktiver Projekte, visueller Balken Soll vs. Ist
- Innerhalb jedes Buckets: Tabelle sortiert nach WSJF-Score (desc)
- Spalten: Rang (innerhalb Bucket), Name, Typ, Wert-Score, Aufwand, WSJF-Score, Trend (↑↓→), Status

*Ansicht 2 — Gesamtranking (umschaltbar):*
- Alle aktiven Projekte in einer einzigen Tabelle, sortierbar nach WSJF-Score, Wert-Score, Name, Datum
- Bucket-Zugehörigkeit als Spalte sichtbar
- Spalten: Rang, Name, Bucket, Typ, Wert-Score, Aufwand, WSJF-Score, Trend, Status

*Filter (beide Ansichten):*
- Status: aktiv / zurückgestellt / abgeschlossen / alle
- Bucket: alle oder einzelner Bucket

*Akzeptanzkriterien:*
- [ ] Bucket-Übersicht ist die Standardansicht beim Öffnen des Tools
- [ ] Umschalten zwischen Bucket-Ansicht und Gesamtranking per Tab/Toggle — ohne Datenverlust
- [ ] Soll-Ist-Balken je Bucket zeigt Überallokation rot, Unterallokation grau, Zielbereich grün
- [ ] Trendpfeil zeigt Richtung WSJF-Score vs. vorherige Runde

**Konfiguration Bewertungsmodell**
- Kriterien können hinzugefügt, umbenannt, mit Beschreibungstext versehen und gelöscht werden
- Gewichtung pro Kriterium: numerische Eingabe (z.B. 25) — wird automatisch auf 100 % normiert
- Aufwand ist kein Kriterium und erscheint nicht in der Kriterien-Konfiguration (er ist immer ein separates Pflichtfeld)
- Änderungen am Modell werden für zukünftige Bewertungsrunden übernommen; historische Scores bleiben unverändert erhalten

*Default-Kriterien (4 Wert-Kriterien, voreingestellt, anpassbar):*

| Kriterium | Default-Gewicht | Beschreibung |
|---|---|---|
| Strategische Passung | 30 % | Alignment mit Produktstrategie und VMT-Portfolio |
| Marktpotenzial | 30 % | Adressierbare Opportunität, Anzahl potenzieller Kunden |
| Kundennutzen / Effizienz | 25 % | Messbarer Mehrwert für den Endkunden |
| Dringlichkeit / Cost of Delay | 15 % | Wirtschaftliche Kosten / Risiken des Verschiebens |

> **Aufwand** (Divisor, fix): Skala 1–5 — 1 = sehr gering (<1 Woche), 2 = gering (1–4 Wochen), 3 = mittel (1–2 Monate), 4 = groß (2–4 Monate), 5 = sehr groß (>4 Monate)

*Akzeptanzkriterien:*
- [ ] Gewichte normieren sich automatisch auf 100 %
- [ ] Mindestens 2 Wert-Kriterien müssen vorhanden sein
- [ ] Warnung wenn ein Kriterium gelöscht wird, für das historische Scores existieren

**Konfiguration Strategic Buckets**
- Buckets können angelegt, umbenannt und gelöscht werden
- Je Bucket: Name, Farbe (für Dashboard-Codierung), Zielanteil in % (Summe aller Buckets muss 100 % ergeben)
- Raphael-Modus: Zielanteil-Felder können gesperrt werden, um versehentliche Änderungen zu verhindern (Toggle: "Bucket-Aufteilung gesperrt")

*Default-Buckets (voreingestellt, anpassbar):*

| Bucket | Zielanteil | Beschreibung |
|---|---|---|
| Strategisch / RTI | 60 % | Langfristige RTI-Produktentwicklung, Plattform-Investments |
| Opportunistisch / Turn-Key | 40 % | Demand-driven Projekte, kurzfristige Kundenanfragen |

*Akzeptanzkriterien:*
- [ ] Zielanteile müssen in Summe 100 % ergeben — Validierung vor Speichern
- [ ] Mindestens 1 Bucket muss vorhanden sein
- [ ] Wenn ein Bucket gelöscht wird, dem noch Projekte zugeordnet sind: Warnung + Pflicht zur Neuzuweisung

**Export**
- **CSV-Export:** Alle aktiven Projekte mit Spalten: Name, Bucket, Typ, Datum, Einzelscores je Kriterium, Wert-Score, Aufwand, WSJF-Score → Download als `.csv`
- **Druckansicht:** Browser `window.print()` öffnet optimierte Ansicht:
  - Deckblatt-Zeile: Titel, Datum des Exports, Bucket-Zielaufteilung
  - Abschnitt 1: Kapazitäts-Übersicht (Soll vs. Ist je Bucket als Tabelle)
  - Abschnitt 2: Ranking je Bucket (nach WSJF-Score), mit Einzel-Scores und Kriterien-Legende
  - Kein Navigation, kein Sidebar

*Akzeptanzkriterien:*
- [ ] CSV öffnet sich korrekt in Excel (Semikolon-Trenner, UTF-8 BOM)
- [ ] Druckansicht enthält alle oben genannten Abschnitte auf max. 2 Seiten (DIN A4 Querformat)

---

### P1 — Nice-to-Have

- **Score-Verlaufsdiagramm** pro Projekt: Liniendiagramm (X = Bewertungsrunden, Y = Gesamtscore) — inline im Projektdetail-View
- **Notizfeld** pro Bewertungsrunde: Freitext für Begründungen (z.B. "Neues Kundenfeedback von GM erhalten")
- **Bulk-Import:** Projekte als CSV einlesen (z.B. aus vorhandenem TFS-Export)
- **Farbliche Score-Codierung** in der Tabelle: rot / gelb / grün nach Score-Schwellenwerten (konfigurierbar)
- **Backup / Restore:** JSON-Export und -Import der gesamten Datenbasis (als Sicherungskopie)

---

### P2 — Future Considerations (v2+)

- **Szenario-Vergleich:** Modell-Varianten durchspielen (z.B. "Was ändert sich am Ranking, wenn ich Dringlichkeit auf 25 % erhöhe?") ohne Daten zu überschreiben
- **Kommentarfunktion pro Kriterium** im Scoring-Formular
- **Zeitbasierter Reminder:** Hinweis im Tool wenn ein Projekt X Wochen nicht neu bewertet wurde
- **Verknüpfung mit Roadmap-HTML-Tool** (Link zu bestehendem interaktivem Roadmap-Tool)

---

## Technische Randbedingungen

| Anforderung | Spezifikation |
|---|---|
| Deployment | Einzelne `.html`-Datei — kein Build-Schritt, kein Server |
| Datenhaltung | `localStorage` des Browsers (ca. 5–10 MB Kapazität — ausreichend) |
| Netzwerk | Keine externe Requests; alle Abhängigkeiten inline oder via CDN nur optional für Chart-Library |
| Browser | Chromium-basiert (Chrome / Edge) — kein IE-Support nötig |
| Chart-Library | Chart.js (kann inline gebundelt werden, kein CDN nötig) |
| Sprache | Oberfläche auf Deutsch |

> **Hinweis für Implementierung:** Da das Tool offline betrieben wird, müssen alle JS-Libraries (Chart.js) entweder inline im HTML eingebettet oder als lokale Datei eingebunden werden. CDN-Links sind nur als Fallback akzeptabel.

---

## Open Questions

| # | Frage | Owner | Blocking? |
|---|---|---|---|
| OQ-1 | Soll der CSV-Export immer alle historischen Bewertungsrunden enthalten oder nur die jeweils letzte? | Lukas | Ja — beeinflusst Datenmodell |
| OQ-2 | Gibt es eine maximale Anzahl an Kriterien, die das Formular nicht sprengt? Empfehlung: max. 8. | Lukas | Nein |
| OQ-3 | Soll der Export den Kriterien-Konfig-Stand zum Zeitpunkt des Exports enthalten (für Nachvollziehbarkeit)? | Lukas | Nein |
| OQ-4 | Wie soll mit veralteten Kriterien in historischen Scores umgegangen werden, wenn ein Kriterium gelöscht wurde? (Empfehlung: Score wird als "legacy" markiert, Kriterium bleibt im Verlauf sichtbar) | Lukas/Impl. | Ja |
| OQ-5 | Soll der Aufwand-Divisor auf der Skala 1–5 fix bleiben, oder soll die Aufwand-Skala konfigurierbar sein (z.B. T-Shirt-Größen S/M/L/XL)? Empfehlung: 1–5 fix für v1, konfigurierbare Labels in v1.1. | Lukas | Nein |
| OQ-6 | Soll es möglich sein, einen Bucket-Zielanteil auf 0 % zu setzen (= Bucket existiert, bekommt aber aktuell keine Kapazität)? Empfehlung: ja, erlaubt — nützlich für "Parking"-Buckets. | Lukas | Nein |

---

## Timeline

| Phase | Inhalt | Ziel |
|---|---|---|
| v1 — MVP | Alle P0-Anforderungen inkl. Strategic Buckets, WSJF-Score, Bucket-Dashboard, CSV + Print-Export | Erste produktive Session |
| v1.1 | Score-Verlaufsdiagramm (P1); Notizfeld; Farbcodierung; Aufwand-Skalen-Labels konfigurierbar | Nach erstem Einsatz |
| v2 | Szenario-Vergleich; Backup/Restore; ggf. Roadmap-Integration | Nach Stabilisierung |

Keine harten Deadlines. Ziel: v1 in einer einzelnen Implementierungs-Session realisierbar (ca. 2–3 h Entwicklungsaufwand mit Claude).
