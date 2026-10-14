# Elternzeit-Zielplaner

**Privater Entwicklungsstand V3.2.0 (Feature-Branch) (14. Oktober 2026)** – offlinefähiger interaktiver Familienbudget- und Elterngeld-Planer für Deutschland.

## Start

Das Projekt ist derzeit eine **eigenständige HTML-Datei ohne Backend**. Die Oberfläche kann direkt durch Öffnen von [`index.html`](./index.html) im Browser gestartet werden. Zur Entwicklung:

```bash
git clone https://github.com/Codeelchi/elternzeit-zielplaner.git
cd elternzeit-zielplaner
npm ci
npm test
```

Zum lokalen HTTP-Test genügt zum Beispiel `python3 -m http.server 8080` im Repository-Verzeichnis, dann `http://localhost:8080` öffnen. Die App benötigt zur Laufzeit keinen Build-Schritt und keine Netzwerkverbindung.

## Funktionen (Stand V3.2.0)

- 36 Lebensmonate, Geburtsdatum und Kindesalter samt konkreten Monatsdaten
- Elternzeit und Elternteilzeit getrennt für beide Elternteile konfigurieren
- Basiselterngeld, ElterngeldPlus, Partnerschaftsbonus und unbezahlte Elternzeit
- Unterschiedliche Brutto-, Netto-, Elterngeld-Netto- und Teilzeit-Annahmen
- Zielbasierte Suche über eine *begrenzte Menge erzeugter zulässiger Monatsmuster*
- Sensitivitätsanalyse für Teilzeit-Netto, Elterngeld-Netto und Betreuungskosten
- Ortsabhängige Modellkosten am Beispiel Köln/NRW mit datierter Tariftabelle
- Rechtsregelkatalog, Plausibilitätsmeldungen, JSON/CSV-Export

## Struktur

| Pfad | Inhalt |
| --- | --- |
| `index.html` | Vollständige ausführbare Offline-App (HTML + CSS + JavaScript) |
| `data/rechtsregeln-de-nrw-2026-10-14.json` | Rechtliche Quellen, Prüfdaten und Gültigkeitsfenster |
| `docs/ANLEITUNG.md` | Bedienungs- und Fachanleitung der V3.1-Basis |
| `docs/ROADMAP.md` | Bekannte Grenzen und nächste Entwicklungsschritte |
| `qa/qa-bericht-v3.1.json` | Historischer QA-Stand aus der Erstellung |
| `tests/*.test.mjs` | Regression, Integration und 34 Referenz-Betragsfälle via jsdom |
| `data/referenzfaelle-bund-2026-10-14.json` | 8 amtliche Beispielwerte, 4 amtliche Grenzen, 22 gesetzlich hergeleitete Werte |
| `docs/REFERENZFAELLE-UND-GRENZEN.md` | Herkunft, Grenzen und offene fachliche Prüfungen |
| `scripts/embed-rules.mjs` | Erzeugt und kontrolliert den Offline-Snapshot der zentralen Rechtsregeln |
| `src/time-axes.cjs` | Reine Kalender-/Zeitachsenlogik für Lebensmonate, Mutterschutz, Elternzeit, Arbeit und Leistungsart |
| `docs/ZEITACHSEN-ARCHITEKTUR.md` | Architektur und aktuell unterstützte Zeitachsen sowie explizite Grenzen |
| `scripts/embed-time-axes.mjs` | Synchronisiert die Offline-App mit dem Zeitachsen-Modul |
| `.github/workflows/ci.yml` | Pull-Request-Prüfung für Rechtsregeln und Tests |
| `package.json` / `package-lock.json` | Node-Testumgebung und reproduzierbare Abhängigkeiten |

## Qualitätssicherung

`npm test` prüft zunächst die Übereinstimmung der eingebetteten Rechtsregeln mit dem JSON-Quellkatalog und anschließend die reale, aus `index.html` geladene Applikationslogik u. a. auf Elterngeld-Äquivalente, Bonusstunden, Bezugsgrenzen, zeitabhängige Kinderdaten, Rechtsquellen und Ergebnisgültigkeit der automatischen Suche. Die zusätzliche Referenztestsuite umfasst veröffentlichte Beträge des Familienportals, daraus abgeleitete Grenzwerte und vereinfachte vollständige Monatsmodelle. Die frühere QA-Auswertung bleibt gesondert archiviert. **Die neue Testsuite ersetzt weder Behördenberechnungen noch eine individuelle rechtliche Prüfung.**

## Rechtliche Quellen aktualisieren

Alle redaktionellen Rechtsregeländerungen erfolgen ausschließlich in `data/rechtsregeln-de-nrw-2026-10-14.json`. Die HTML-App enthält nur den daraus erzeugten Offline-Snapshot. Nach Rechtsregeländerungen `npm run rules:sync`, nach Zeitachsenänderungen `npm run axes:sync` und anschließend immer `npm test` ausführen. **Ein Prüftag 2026 bestätigt noch keine Ansprüche bei Geburt 2027.** Weitere Einzelheiten: [Referenzfälle und Prüflimits](docs/REFERENZFAELLE-UND-GRENZEN.md).

## Architektur / Weiterentwicklung

Aktuell ist `index.html` aus Gründen der Offline-Nutzung bewusst selbsttragend. Mittelfristig sollten Modell, Rechtsregel-Engine, Optimierer, Rendering und Datenpersistenz unabhängig voneinander testbar werden. Die im HTML angebotene Suchfunktion prüft nur erzeugte Muster und erhebt keinen Anspruch auf vollständige kombinatorische Optimierung. Weitere Schritte: siehe [Roadmap](docs/ROADMAP.md).

## Datenschutz

Es gibt kein Backend und keine nutzerseitige Anmeldung. Berechnete Familienpläne können lokal im Browser gespeichert bzw. als JSON/CSV exportiert werden. Keine echten Steuer- oder Einkommensbelege ins Repository einchecken. GitHub-Repository bleibt **privat**; für eine Veröffentlichung müssen außerdem Datenschutz-, Quellen- und Lizenzfragen geprüft werden.

## Rechtlicher Hinweis

Alle Beträge sind **Modellrechnungen**, keine Bewilligung. Das tatsächliche Elterngeld-Netto kann vom Auszahlungsnetto abweichen; Mutterschutz-Zeiträume, Steuerprogression, Elternzeitrecht, Sonderfälle und zukünftige Gesetzesänderungen erfordern Einzelfallprüfung. Quellen- und Prüfdaten stammen vom **14. Oktober 2026** und müssen vor der Verwendung für eine Geburt 2027 neu verifiziert werden. Keine Zusage über landesrechtliche Leistungen oder kommunale Gebühren.

## Projektstatus

**Importiert und lokal getestet.** Änderungen bitte mit Tests absichern und vorzugsweise per Feature-Branch / Pull Request integrieren. Nicht geprüfte Rechtsänderungen dürfen nicht als geltendes Recht in den Rechner übernommen werden.
