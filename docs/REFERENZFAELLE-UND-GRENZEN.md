# Fachliche Referenzfälle und Rechtsregeln – Prüfstand 14.10.2026

**Version des Modells:** 3.1.1 · **Status:** P0-Fundament teilweise umgesetzt, noch **nicht fachlich freigegeben**.

## Welche Referenzen sind jetzt wirklich abgesichert?

Die Datei `data/referenzfaelle-bund-2026-10-14.json` enthält **34 Betragsfälle**, aufgeteilt nach Belegqualität:

| Nachweisart | Fälle | Bedeutung |
| --- | ---: | --- |
| `official_published_example` | **8** | Vier direkt auf dem Familienportal dargestellte Basis/Plus-Beispiele (je zwei Auszahlungswerte) |
| `official_published_threshold` | **4** | Mindest- und Höchstgrenzen aus der amtlichen FAQ |
| `statutory_formula_derived` | **22** | Aus denselben amtlich erklärten Formeln abgeleitete Zahlen; **keine** separat behördlich bestätigten Vergleichsrechnungen |

Zusätzlich prüft `tests/reference.test.mjs` den **anteiligen Anspruch 5/30 Tage** im zweiten Lebensmonat aus dem offiziellen Mutterschutzbeispiel bei Geburt am 20. Mai. `tests/integration.test.mjs` führt ganze Monatsmodelle aus, einschließlich der Mittelung variierender Teilzeitstunden.

**Primärquellen** (Stand der Sichtung: 14.10.2026):
- [Bundesfamilienportal – Höhe des Elterngeldes und vier Zahlenbeispiele](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-viel-elterngeld-kann-ich-bekommen--124616)
- [Bundesfamilienportal – taggenaue Anrechnung von Mutterschaftsleistungen](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/kann-ich-elterngeld-und-mutterschaftsleistungen-bekommen--124776)
- [§ 2 BEEG – Höhe des Elterngeldes](https://www.gesetze-im-internet.de/beeg/__2.html)
- [§ 4a BEEG – ElterngeldPlus](https://www.gesetze-im-internet.de/beeg/__4a.html)

## Was diese Tests nicht nachweisen

Die Betragsfälle setzen das **bereits richtig ermittelte pauschalierte Elterngeld-Netto** vor und nach der Geburt voraus. Sie beweisen **nicht**, dass der Rechner dieses Netto aus einem Bruttogehalt nach BEEG/Steuerpauschalen selbst korrekt herleiten kann. Insbesondere fehlen noch die detaillierten Berechnungen von Werbungskosten, Entgeltgruppen, Steuerklasse/Bemessungszeitraum, Unterbrechungen, variablem Erwerbseinkommen und tatsächlichem Mutterschaftsgeld/Zuschuss.

Die Monatsintegration überprüft unsere Programmierung gegen amtlich veröffentlichte **Einzelbeträge**, nicht gegen vollständige bewilligte Elterngeldbescheide. Die Einteilung in veröffentlichte Beispiele, amtliche Grenzwerte und Formelableitungen ist daher verpflichtend; `34 amtlich geprüfte Auszahlungsfälle` wäre eine falsche Behauptung.

## Single-Source-Workflow

`data/rechtsregeln-de-nrw-2026-10-14.json` ist die **einzige redaktionell zu bearbeitende Rechtsregelquelle**. Die Anwendung bleibt eine eigenständig offline nutzbare HTML-Datei. Beim Build wird ein Snapshot der Regeldaten automatisch zwischen zwei Markierungen in `index.html` eingebettet.

```bash
npm ci
npm run rules:sync      # nach einer bewussten Änderung der Rechtsregeln
npm run rules:check     # erwartet exakt synchrones JSON/HTML
npm test                # check + Rechen- und Referenztests
```

`scripts/embed-rules.mjs --check` schlägt fehl, wenn die JSON-Datei nicht zum eingebetteten Snapshot passt, ein Regel-Schemaelement fehlt oder das Datumsformat unbrauchbar ist.

Schema je Regel: `id`, `source`, `url`, `effective_from`, optional `effective_to`, `checked_at`, `verification_status`, Region und Geltungshinweis. Der aktuelle Bestand unterscheidet *amtliche Quelle am Prüftag gesichtet*, *nur als Quelle gelistet/nicht erneut geprüft* und *Gesetzentwurf/nicht geltend*. Das sind **Provenienzlabels**, keine rechtsverbindlichen Gültigkeitsatteste.

`standard_parameters` führt die numerischen Modellgrenzen. Die aktive Ersatzbetragsfunktion und zentrale Monatsgrenzen der Prüfung lesen daraus; nicht jeder UI-Hilfetext und nicht jeder Legacy-Builder-Wert ist bereits parametrisiert.

## Unmittelbar offene P0-Arbeit

1. In `index.html` bestehen noch ältere doppelte Funktionsdefinitionen und ein monolithisches UI. Logik-/UI-/Test-Trennung folgt.
2. Elterngeld-Netto aus realen Abrechnungsdaten und Einkommensgruppen fachlich korrekt bestimmen; Benchmark gegen amtliche, unabhängige Gesamtberechnungen und Expertenprüfung.
3. Mutterschaftsgeld sowie Arbeitgeberzuschuss als tatsächliche Zahlungen getrennt erfassen und taggenau verrechnen. Der bisherige Bezugsvorteil wird **vereinfacht** modelliert; Anspruchslage kann abweichen.
4. Arbeitstage, Elternzeitkalenderabschnitte, Elterngeld-Lebensmonate und Geldeingangszeitpunkte fachlich entkoppeln.
5. Regeln mit Jahreswechsel 2027 erneut prüfen; insbesondere Kindergeld, Landesleistungen und Kölner Kita-Gebühren.
6. Weitere unabhängige vollständige Referenzfälle aufbauen, einschließlich negativer/inkompletter Datenkonstellationen.

Der Rechner bleibt bis dahin **ein unverbindlicher Standardfall-Planer**.
