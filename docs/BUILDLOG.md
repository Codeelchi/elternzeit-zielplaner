# Buildlog und Integrationsnachweis

Stand: **15. Oktober 2026**, Software **V3.4.0**. Technische Nachweise, fachliche Evidenz und öffentliche Freigaben sind getrennt. Ein Merge nach `main` ist keine Veröffentlichung und keine unabhängige Fachabnahme.

## Entwicklungshistorie

| Stand / Commit | Änderung | Nachweis / Grenze |
| --- | --- | --- |
| `b4e6a12` / V3.1 | Offline-Rechner mit erster reproduzierbarer Testumgebung | Ausgangsstand von `main` vor Integration |
| PR #9 / `1d8cd64` | Wettbewerbsabgleich, MVP-Spezifikation, Zielgruppe und Release-Gates | Dokumentation; Wettbewerberangaben nicht unabhängig bestätigt |
| PR #10 / `571baae` / V3.1.1 | Zentraler Rechtskatalog, Snapshot, Referenzfixtures, Node-CI | 51 Tests; unterschiedliche Evidenzstärke der 34 Betragsfälle |
| PR #11 / `0a9f5de` / V3.2.0 | Getrennte Zeitachsen als Modul und erste UI-Anbindung | 59 Tests; auf PR #10 aufgebaut |
| `97262bb` | Inhalt aus PR #9 in integrierten Feature-Branch übernommen | Cherry-Pick; ursprünglicher PR wird ebenfalls berücksichtigt |
| `635ea1d` / V3.3.0 | Regelvalidator, unabhängige Achsen, Budget, Antragsassistent und Browser-QA | Unbestätigte Standardfälle, Sonderfälle und 2027 gesperrt |
| `b44d727` | Dynamische Browser-QA und öffentliche Release-Gates | Entwickler-CI ersetzt keinen Fachnachweis |
| `885c5c0` | Schätzcharakter und Prüfstatus in jeder Ansicht | Finanzwerte bleiben Modellwerte |
| `e457055` | Toast-Kontrastfehler behoben, echte Dateiverteilung geprüft | 131 Node-Tests, acht Browsertests, 50 Axe-Prüfungen; CI erfolgreich |
| `b5c82e3` / V3.4.0 | Importreparatur, strengere Validierung, persönliche Risikobänder, Rollenvarianten und einheitliche Stressrechnung | 154 Node-Tests, elf Browsertests, 50 Axe-Prüfungen; CI erfolgreich |

Die Softwareversion ist nicht die Rechtskatalogversion. Der Katalog behält seinen tatsächlichen Prüfstand **14.10.2026**. Die ergänzende Quellenanalyse vom 15.10.2026 bestätigt keine zukünftige Rechtslage.

## Architekturentscheidungen

- Eine eigenständige `index.html` erhält die Offline-Verteilung ohne Build-Server, Benutzerkonto oder Backend.
- Reine CommonJS-Module sind unabhängig vom DOM testbar. Skripte erzeugen daraus die eingebetteten Offline-Snapshots.
- Node-Abhängigkeiten sind Entwicklungswerkzeuge. Keine zur Laufzeit nachgeladenen Skripte, Fonts oder Analysepakete.
- Arbeitgeber-Elternzeit, Mutterschutz, Erwerb, Leistungsbezug und tatsächliche Buchungen bleiben eigene Achsen. Arbeitgeber-Elternzeit ändert keine Lohn-/Leistungswahl implizit.
- Nur vollständig eingegebene, unterstützte und regelkonforme Standardfälle erhalten `PLAUSIBEL_STANDARD`. Das ist keine Bewilligung.
- Die Suche filtert ausgewählte Monatsmuster. Keine vollständige Enumeration und kein nachgewiesenes globales Optimum.
- Budgetband, Rücklagen und robuste Suche nutzen dieselben Komponenten-Stresstests. Bänder sind Annahmen, keine statistischen Konfidenzintervalle.

## Reproduzierbare Befehle

Voraussetzungen: Git, Node.js 22 entsprechend CI, npm, Python 3 für den Testserver und Chromium bzw. der Playwright-Browser. Für die Nutzung genügt ein moderner Browser.

```bash
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install --with-deps chromium
npm test
npm run test:e2e
npm run references:report
npm run release:check
```

`release:check` liefert beim dokumentierten Stand **erwartet Exitcode 1**: Es meldet die gesperrte öffentliche Freigabe, keinen Installationsfehler. Die übrigen Befehle müssen erfolgreich sein. Freigabefelder nicht zur Erzeugung eines grünen Ergebnisses umstellen.

Nach Änderungen an Quellen/Modulen die betroffenen Snapshots synchronisieren:

```bash
npm run rules:sync
npm run axes:sync
npm run modules:sync
npm test
git diff --check
```

`npm test` führt alle drei Snapshot-Prüfungen aus. Eingebetteten Modulcode nicht allein bearbeiten. Die ausgegebene HTML-Datei benötigt keinen weiteren Build-Schritt. Playwright startet zusätzlich einen lokalen HTTP-Testserver; die aktuellen Browserseiten werden direkt per `file://` geöffnet.

## Prüfmatrix V3.4.0

| Prüfung | Ergebnis | Aussagegrenze |
| --- | --- | --- |
| Node-/Modul-/jsdom-Tests | 154/154 bestanden | Regression und Integration; kein unabhängiger Behördenbescheid |
| Snapshot-Kontrolle | Alle drei Snapshots synchron | Erkennt veraltete Kopien im HTML |
| Chromium-E2E | 11/11 bestanden | Keine vollständige Browsermatrix |
| Accessibility | 50 Axe-Prüfungen ohne Verstöße | 16 Ansichten je Desktop/Mobil plus 18 dynamische Scans; ersetzt kein Screenreader-/Usability-Review |
| Laufzeit/Layout | Keine erfassten Konsolen-/Seitenfehler oder Seitenüberläufe | Geprüfte synthetische Abläufe |
| Datenhaltung | Opt-in, Löschung, Neu-Laden, echter JSON-Roundtrip geprüft | Speicher und Export sind unverschlüsselt |
| Offline | Vollständiger Lauf über `file://`; Netzwerk im Offline-Ablauf deaktiviert | Verwaltete Browser können Dateizugriff blockieren |
| SVG-Beschriftung | `#45606b` auf Weiß: 6,69:1 | Zusätzlich berechnet und visuell geprüft |
| Referenzbericht | 34 Betragsvergleiche; Tagesabweichung sichtbar | Acht veröffentlichte Werte, vier Grenzen und 22 Formelableitungen sind keine 34 vollständigen amtlichen Familienfälle |

Browserfälle prüfen Navigation/Tastatur, Speichereinwilligung/Löschung, Dateiexport/-import, Zielsuche/Übernahme, unabhängige Achsen, dynamische Modelle, Desktop/Mobil sowie V3.4-Risiko-/Rollenvarianten. Ausschließlich synthetische Haushaltsdaten.

## CI, korrigierte Fehler und Umgebungsgrenzen

Für `b5c82e3` ist [Run 38680019062](https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/38680019062) erfolgreich: 154 Node-Tests und elf Browsertests. Neue Dokumentations-/Merge-Commits erhalten eigene Checks; aktueller Status unter [Actions](https://github.com/Codeelchi/elternzeit-zielplaner/actions).

Korrigierte Produktfehler:

1. Ein ausblendender Toast hatte während der Opazitätsanimation unzureichenden Kontrast. Fehler reproduziert; Anzeige bleibt bis zum unmittelbaren Ausblenden deckend. Test nicht abgeschwächt.
2. Der aktive Import stellte Erwerbs-/Leistungs-Overrides und Bankbuchungen nicht vollständig wieder her. Ein echter Download-/Import-Test prüft jetzt auch die Finanzwerte.
3. Widersprüchliche Sonderfalltypen und ungültige Quellenzeiträume konnten eine positive Standardbewertung zulassen. Konservative Prüfung mit Regressionstests verhindert dies.
4. Diagramm, Rücklagen und robuste Suche verwendeten unterschiedliche Stressmethoden. V3.4 vereinheitlicht sie und hält Mutterschaftsleistungen separat konstant.

Umgebungsgrenzen:

- Erster Dateistart mit verwaltetem `/usr/bin/chromium`: `ERR_BLOCKED_BY_ADMINISTRATOR`. Richtlinien unverändert gelassen. Anschließend vollständige Offline-Prüfung mit regulärem Playwright Headless Shell 156 erfolgreich.
- Browserauswahl: zuerst `CHROMIUM_PATH`, dann `/usr/bin/chromium`, sonst Playwright. Bei verwaltetem Browserproblem einen erlaubten installierten Playwright-Browser ausdrücklich über `CHROMIUM_PATH` auswählen; keine Richtlinien umgehen.
- GitHub-Artefaktupload scheitert derzeit an der Speicherquote. Upload ist separat protokolliert und optional; echte Testfehler bleiben harte Gates. Eingecheckte QA-Berichte und ausgewählte Screenshots sind verfügbar. Keine kontoweiten Artefakte gelöscht.
- Actions meldet eine Laufzeit-Deprecation der verwendeten v4-Actions. Migration ist ein eigenes Wartungspaket; die Anwendung verwendet diese Laufzeit nicht.

## Fachliche Evidenz und gesperrter Release

Der Familienportal-Fall mit Geburt am 20. Mai nennt Schutzfristende 14. Juli und 5/30 verbleibenden Bezug im zweiten Lebensmonat. Die Normableitung aus MuSchG § 3 und BGB §§ 187/188 ergibt 15. Juli und 4/30. Originalreferenz unverändert; der Bericht weist **−1 Tag** aus.

Die Analyse des öffentlichen Bundesrechner-Skripts vom 15.10.2026 stützt das Kalenderdatum, zeigt aber keinen taggenauen Restgeldbetrag in Schutzmonaten. Sie löst die Geldbetragsabweichung nicht unabhängig auf. Quellenlink, Hash und Grenzen im [Abnahmebericht](MVP-ABNAHME-2026-10-15.md).

Weiter offen: vollständige amtliche Nettoermittlung, zusätzliche vollständige Behördenreferenzen, Fach-/Rechts-/Datenschutzreview und Nutzertests. Keine bestätigte Freigabe für Geburten 2027.

## Merge-Verfahren und Nachverfolgung

Der Nutzer hat am **15.10.2026** die Integration ausdrücklich beauftragt und diese Dokumentation vor dem Merge verlangt. Das ersetzt die zuvor fehlende Entscheidung zur Repository-Integration; fachliche und öffentliche Freigaben bleiben unverändert.

Vorher geprüft: `main` technisch ungeschützt, Merge-Commits erlaubt. Die Ruleset-API meldet eine Tarifbeschränkung für das private Repository; daraus wird keine zusätzliche Regel abgeleitet. Kein Admin-Bypass. Keine abgegebenen unabhängigen Reviews behauptet.

Reihenfolge: **#9 → #10 → #11 → #12**. #11 nach #10 auf `main` umstellen, #12 nach #11. Merge-Commits erhalten die ursprünglichen Abhängigkeiten. Die lokale Merge-Simulation war konfliktfrei und ergab vor diesen Dokumentationsänderungen exakt den geprüften V3.4-Baum.

Diese Datei wird vor dem Merge eingecheckt und behauptet keinen noch nicht erfolgten Merge. Verbindliche Zeitpunkte/SHAs stehen in [PR #9](https://github.com/Codeelchi/elternzeit-zielplaner/pull/9), [#10](https://github.com/Codeelchi/elternzeit-zielplaner/pull/10), [#11](https://github.com/Codeelchi/elternzeit-zielplaner/pull/11) und [#12](https://github.com/Codeelchi/elternzeit-zielplaner/pull/12). Nach Integration: `origin/main` abrufen, Baumgleichheit mit dem geprüften Feature-Stand kontrollieren und Push-CI auf `main` prüfen. Keine öffentliche Veröffentlichung oder Release-Tag.

## Nachweisdateien

- [Browserumgebung](../qa/browser-environment.json), [Playwright-Ergebnisse](../qa/browser-results.json), [Screenshots](../qa/screenshots/)
- [Aktueller Delta-Bericht](../qa/reference-deltas-current.json), [V3.4-Delta](../qa/reference-deltas-v3.4.0.json)
- [Maschinenlesbare Release-Gates](../data/release-gates.json)
- [Abnahme 14.10.](MVP-ABNAHME-2026-10-14.md), [Fortsetzung 15.10.](MVP-ABNAHME-2026-10-15.md)
- [Changelog](../CHANGELOG.md), [Handoff](HANDOFF.md), [Roadmap](ROADMAP.md)

## Fortsetzung V3.7.0 – 15.10.2026

Auf V3.6-main `a26a5e4` und Wettbewerbs-Audit `662ecc3` aufgebaut. Neutrale Rollen-/Nettoeingaben, unabhängiges Vergleichsmodul, sinnvolle Profilunterschiede, abbrechbarer Suchgenerator und normativ belegte Cent-Rundung implementiert. Fachliche Tagesabweichung bleibt erhalten. Neue Regressionen fanden und schlossen Referenzstunden in freien Monaten sowie unsynchronisierte fokussierte Namensfelder nach Import.

216 Node-Tests und 16 Browserfälle direkt über file:// (52 Axe-Prüfungen) bestanden. Aktuelle Offline-Evidenz umfasst den SHA256 der geprüften HTML-Datei, Versionsnummer und Grenzen. Keine reale Nutzertest-/Fachabnahme simuliert; [vollständiger Bericht](UMSETZUNG-ZIELBUDGET-V3.7.md). Der ursprüngliche Buildlog oben bleibt als historische Nachweiskette bestehen.
