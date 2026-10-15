# Elternzeit-Zielplaner

**Privater Entwicklungsstand V3.1 (14. Oktober 2026)** – offlinefähiger interaktiver Familienbudget- und Elterngeld-Planer für Deutschland.

## Start

Das Projekt ist derzeit eine **eigenständige HTML-Datei ohne Backend**. Die Oberfläche kann direkt durch Öffnen von [`index.html`](./index.html) im Browser gestartet werden. Zur Entwicklung:

```bash
git clone https://github.com/Codeelchi/elternzeit-zielplaner.git
cd elternzeit-zielplaner
npm ci
npm test
```

Zum lokalen HTTP-Test genügt zum Beispiel `python3 -m http.server 8080` im Repository-Verzeichnis, dann `http://localhost:8080` öffnen. Die App benötigt zur Laufzeit keinen Build-Schritt und keine Netzwerkverbindung.

## Funktionen (Stand V3.1)

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
| `docs/ANLEITUNG.md` | Bedienungs- und Fachanleitung V3.1 |
| `docs/ROADMAP.md` | Bekannte Grenzen und nächste Entwicklungsschritte |
| `qa/qa-bericht-v3.1.json` | Historischer QA-Stand aus der Erstellung |
| `tests/planner.test.mjs` | Im Repository ausführbare Regressionstests via jsdom |
| `package.json` / `package-lock.json` | Node-Testumgebung und reproduzierbare Abhängigkeiten |

## Qualitätssicherung

`npm test` prüft die reale, aus `index.html` geladene Applikationslogik u. a. auf Elterngeld-Äquivalente, Bonusstunden, Bezugsgrenzen, zeitabhängige Kinderdaten, Rechtsquellen und Ergebnisgültigkeit der automatischen Suche. Die frühere QA-Auswertung bleibt gesondert archiviert. **Die neue Testsuite ersetzt weder Behördenberechnungen noch eine individuelle rechtliche Prüfung.**

## MVP und Wettbewerbsabgleich

- [MVP-Spezifikation, Release-Gates und Abnahmekriterien](docs/MVP-2026-10-14.md)
- [Wettbewerbs- und Code-Abgleich mit Hypothesen und Evidenzgrenzen](docs/WETTBEWERB-UND-CODE-ABGLEICH.md)
- [Offene Aufgaben in GitHub Issues](https://github.com/Codeelchi/elternzeit-zielplaner/issues)

## Architektur / Weiterentwicklung

Aktuell ist `index.html` aus Gründen der Offline-Nutzung bewusst selbsttragend. Mittelfristig sollten Modell, Rechtsregel-Engine, Optimierer, Rendering und Datenpersistenz unabhängig voneinander testbar werden. Die im HTML angebotene Suchfunktion prüft nur erzeugte Muster und erhebt keinen Anspruch auf vollständige kombinatorische Optimierung. Weitere Schritte: siehe [Roadmap](docs/ROADMAP.md).

## Datenschutz

Es gibt kein Backend und keine nutzerseitige Anmeldung. Berechnete Familienpläne können lokal im Browser gespeichert bzw. als JSON/CSV exportiert werden. Keine echten Steuer- oder Einkommensbelege ins Repository einchecken. GitHub-Repository bleibt **privat**; für eine Veröffentlichung müssen außerdem Datenschutz-, Quellen- und Lizenzfragen geprüft werden.

## Rechtlicher Hinweis

Alle Beträge sind **Modellrechnungen**, keine Bewilligung. Das tatsächliche Elterngeld-Netto kann vom Auszahlungsnetto abweichen; Mutterschutz-Zeiträume, Steuerprogression, Elternzeitrecht, Sonderfälle und zukünftige Gesetzesänderungen erfordern Einzelfallprüfung. Quellen- und Prüfdaten stammen vom **14. Oktober 2026** und müssen vor der Verwendung für eine Geburt 2027 neu verifiziert werden. Keine Zusage über landesrechtliche Leistungen oder kommunale Gebühren.

## Projektstatus

**Importiert und lokal getestet.** Änderungen bitte mit Tests absichern und vorzugsweise per Feature-Branch / Pull Request integrieren. Nicht geprüfte Rechtsänderungen dürfen nicht als geltendes Recht in den Rechner übernommen werden.
