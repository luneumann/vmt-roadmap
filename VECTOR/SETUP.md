# Setup — Was du selbst tun musst

VECTOR braucht keine Installation, keinen Server und keine Konfiguration.
Alles was du brauchst ist ein moderner Browser (Chrome oder Edge) und die Datei `VECTOR.html`.

---

## Vor dem ersten Start

### 1. Datei ablegen

Lege `VECTOR.html` an einem festen Ort ab, den du nicht versehentlich löscht:

```
~/Documents/VECTOR/VECTOR.html
```

Öffne die Datei per Doppelklick im Browser — oder über einen lokalen Server (empfohlen):

```bash
# Im VECTOR-Ordner:
npx serve -p 4400 .
# Öffne: http://localhost:4400/VECTOR.html
```

### 2. Vollständig offline

VECTOR braucht **keine Internetverbindung** — weder beim ersten noch bei späteren Starts.
Diagramme, Schriften und Logik sind alle in der einen `VECTOR.html`-Datei enthalten. Du
kannst das Tool bedenkenlos auf einem komplett vom Netz getrennten Rechner nutzen. Das ist
gewollt, da die App vertrauliche Projektdaten enthält.

### 3. Erste Schritte

Das Tool startet mit zwei Default-Buckets und vier Default-Kriterien:

| Bucket | Zielanteil |
|---|---|
| Strategisch / RTI | 60 % |
| Opportunistisch / Turn-Key | 40 % |

| Kriterium | Gewicht |
|---|---|
| Strategische Passung | 30 % |
| Marktpotenzial | 30 % |
| Kundennutzen / Effizienz | 25 % |
| Dringlichkeit / Cost of Delay | 15 % |

Du kannst beides unter **Konfiguration** anpassen.

---

## Nach jedem produktiven Einsatz

**Regelmäßiges Backup:** Konfiguration → Export & Backup → "JSON-Backup erstellen"

Die Datei `VECTOR_Backup_YYYY-MM-DD.json` enthält alle Projekte, Kriterien, Buckets und Bewertungsrunden.
Aufbewahrungsempfehlung: letzte 3 Backups behalten.

---

## Offene Fragen und bekannte Einschränkungen

### Offene Fragen aus dem PRD

| # | Frage | Empfehlung | Auswirkung |
|---|---|---|---|
| OQ-1 | CSV-Export: nur letzte Runde oder alle? | Nur letzte Runde (implementiert); vollständige Historie via JSON-Backup | Kein Handlungsbedarf |
| OQ-2 | Max. Anzahl Kriterien? | Max. 8 (Formular wird sonst unübersichtlich) | Manuell einhalten |
| OQ-3 | Kriterien-Konfiguration im Export? | Nein (nicht implementiert in v1) | Ggf. in v1.1 |
| OQ-5 | Aufwand-Skala konfigurierbar? | Nein (1–5 fix in v1); Labels sind fix | Für v1.1 geplant |
| OQ-6 | Bucket-Zielanteil 0% erlaubt? | Ja (implementiert) | Kein Handlungsbedarf |

### Bekannte Einschränkungen

- **Datenverlust-Risiko:** localStorage wird gelöscht wenn Browser-Daten gelöscht werden → regelmäßig Backup erstellen
- **Single-Browser:** Daten sind nur im Browser/Profil sichtbar, in dem das Tool geöffnet wurde
- **Daten unverschlüsselt:** localStorage speichert im Klartext im Browser-Profil. Wer Zugriff auf dein entsperrtes Benutzerprofil hat, kann die Daten lesen. Für ein desktop-only Single-User-Tool ist das akzeptabel, solange dein Rechner/Profil gesichert ist (Bildschirmsperre, Festplattenverschlüsselung). Optionale Passphrase-Verschlüsselung wäre ein möglicher v1.1-Schritt.
- **Kein Undo:** Gelöschte Projekte können nicht wiederhergestellt werden (außer aus JSON-Backup)
- **Max. ~5 MB Datenbasis:** localStorage-Limit; bei sehr vielen Projekten und langen Bewertungshistorien kann das Limit erreicht werden (in der Praxis bei < 50 Projekten kein Problem)
- **Druckoptimierung:** Optimiert für DIN A4 Querformat. Bei mehr als 8 aktiven Projekten pro Bucket kann die Druckansicht mehr als 2 Seiten umfassen

---

## Kosten-Übersicht

VECTOR hat keine laufenden Kosten. Alle Abhängigkeiten sind kostenlos:

| Komponente | Kosten |
|---|---|
| VECTOR.html | Kostenlos (null externe Abhängigkeiten) |
| Browser (Chrome / Edge) | Kostenlos |
| localStorage | Im Browser eingebaut, kostenlos |
| Lokaler Dev-Server (`npx serve`) | Kostenlos (Node.js nötig) |
