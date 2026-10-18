# Buildlog und Integrationsnachweis

**V3.19 – interner Ausbau (18.10.2026):** Reproduzierter Fehler bei verweigertem localStorage-Speichern/Löschen; Abhilfe in der Offline-Datei inklusive sichtbarer Warnung und fehlersicherem Reset/Import. Vier neue DOM-Negativtests und vier direkte Chromiumfälle vorbereitet, dazu parallele CI-Jobs mit finalem test-Gate. Basistests/PR-CI vor Merge gesondert prüfen. [Fachlich und datenschutzrechtlich nicht freigegeben](PRIVACY-ROBUSTNESS-V319-2026-10-18.md).

Historischer Entwicklungsverlauf seit V3.4, ergänzter **Stand vom 17. Oktober 2026: auf main integrierter V3.16-Funktionsstand** (Paket-/Exportversionsnummer 3.10.0 bis separater Release-Entscheidung). Technische Nachweise, fachliche Evidenz und öffentliche Freigaben sind getrennt. Ein Merge nach `main` ist keine Veröffentlichung und keine unabhängige Fachabnahme.

## V3.17-D – lokale Verständnisübung und unabhängiger Nutzerreview-Vorbereitungsprozess, 18.10.2026

Acht fiktive Lernfälle in `src/understanding-guide.cjs` und im Prüfbereich der Offline-App; reine Sitzungsauswahl, kein Plan-/Finanz-/Exportstatus. Separate `data/usability-review-v317d.json`-Vorlage und `npm run usability:check` verhindern vorgespiegelte Nutzerstudien. [V3.17-D-Moderations- und Accessibility-Leitfaden](PRODUKTREIFE-V317D-NUTZERPRUEFUNG.md). **0 tatsächlich getestete Personen, keine Freigabe.** Technische Gesamtregression: **495/495** Node-/DOM-, **63/63** Chromium-E2E- und **3/3** direkte V3.17-D-`file://`-Browserfälle bestanden. PR-CI und Merge weiterhin getrennt zu belegen.

## V3.17-B/C – Exporthinweise und prüfbare externe Referenzevidenz, 17.10.2026

**Vollständiger Testabschluss:** 481/481 Node-/DOM-Tests, 60/60 Chromium-Browser-E2E und 4/4 neue V3.17-B-`file://`-Fälle bestanden. Externe Fachreferenzen weiterhin 0/10. Vor dem Commit: generiertes `qa/browser-results.json` auf unveränderten Repo-Stand zurücksetzen; keine Testartefakte, Secrets oder Freigabeflags einchecken.

Die reinen Module `src/export-disclosure.cjs` (im Offline-Browser eingebettet) und `src/independent-review-evidence.cjs` (nur Build/CLI) ergänzen die technische Produkthärtung. JSON-Schema 1 bleibt stabil; Top-Level-`planningDisclosure` wird beim Import ignoriert, CSV erhält sieben neue Metadaten-Spalten und bei unbekannten Kosten einen leeren statt fiktiven Restbetrag. Die externen Prüfanfragen sind über SHA256 an zehn Fall-IDs gebunden; keine unabhängige Abnahme wird behauptet. [Ausführlicher Bericht](AUSBAU-V317B-C-EXPORTE-EVIDENZ-2026-10-17.md).

## V3.17-A – erste Umsetzung und Gesamtabnahme, 17.10.2026

Neue reine Einordnung `src/model-scope.cjs` mit HTML-Status vor dem Schnellstart sowie in „Plan prüfen“. Modellplausibilität, 2027-Vorschau, unbestätigte Fälle, Datenlücken und Einkommen-/Ausgaben-Herkunft werden **ohne** neue Gesetzesberechnung erläutert. Mobile Eingangsansicht nach eigener visueller Prüfung von 875 auf ca. 90 px verkürzt (klappbare Details). Gesamtlauf: 468/468 Node-/DOM, 56/56 Chromium-E2E und 3/3 zusätzliche V3.17-filenative Tests. [Ausbau/Abnahme](AUSBAU-V317-PRODUKTREIFE-EINORDNUNG.md). Neutrale [Referenzfall-Vorlage](FACHABNAHME-V317-REFERENZFALL-VORLAGE.md) vorbereitet, weiterhin 0/10 externe Vollabnahmen. Freigaben bleiben gesperrt.

## Integration von PR #20 und Produktreifeplanung V3.17, 17.10.2026

V3.15–V3.16 nach erfolgreicher GitHub-PR-CI in main gemergt (Merge 19f047d), Workbench nachgezogen, sauberer Stand. Das extern übergebene Produktreife-Audit wurde mit dem Code abgeglichen; fachliche und datenschutzbezogene Freigaben bleiben ausdrücklich offen. [Neue operative Roadmap](ROADMAP.md), [Audit-Abgleich](PRODUKTREIFE-ABGLEICH-V317-2026-10-17.md), [aktuelle Anleitung](ANLEITUNG.md) und [historische Roadmap](ROADMAP-HISTORIE-BIS-V316-2026-10-17.md). Der V3.17-Ausbau beginnt mit einer rein informativen Standardfall-/Warnungsanzeige, nicht mit einer Änderung an den Berechnungsregeln.

## V3.16 Zwei-Eltern-Wochenkoordination, 17.10.2026

Neuer 15-Minuten-Familienwochenplan mit getrennten Arbeitszeiten/Wiedereinstiegen, begleitender Person während der Kita-Eingewöhnung und realen zeitlichen Überschneidungskonflikten. Vollständige technische Tests: 452/452 Node-/DOM, 53/53 Chromium und 4/4 direkte file://-V3.16-Fälle. Beträge nur ausdrückliche Benutzerannahmen; keine Plan-/Speichermutation. Ausführliche Grenzen und Tests: [V3.16](AUSBAU-V316-GEMEINSAME-BETREUUNG-2026-10-17.md). Fachliche Freigaben bleiben blockiert.

## V3.15.2 begrenzter Kita-Verschiebungs-Stresstest, 17.10.2026

Neue pure Sensitivitätsfunktion src/care-resilience.cjs sowie mobile, aufklappbare UI-Tabelle. Gesamtabnahme: 430/430 Node-/DOM-Tests, 49/49 Chromium-E2E und 10/10 direkte file://-V3.15.x-Browserfälle bestanden. Varianten: eigen, zwei und vier Wochen zusätzliche Verzögerung, aber maximal zwölf Wochen Gesamtverschiebung. Differenzen nur auf gleiche manuelle Wochen-/Geld-/Rückkehr-Annahmen bezogen; unbekannte Kosten bleiben unbekannt und der Plan wird nicht mutiert. [Detailbericht](AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md).

## V3.15.1 Korrektur und technischer QA-Abschluss, 17.10.2026

Kita-Eingewöhnung: fälschlich mitgezählte reguläre Woche entfernt; Arbeitsrückkehr 0–24 Wochen getrennt, dauerhaft ungedeckte Wochenstunden als eigenes Problem benannt. Rein hypothetische Cent-Zuordnung zu Lebensmonaten mit vollständiger Offenlegung unberücksichtigter Zeiträume, ohne gespeicherte Planänderung. Vollständige Tests: 418/418 Node-/DOM, 47/47 Chromium, 8/8 direkte file:// V3.15.x-Browserfälle. Release-Gates unabhängig weiterhin BLOCKED. [Detailnachweis](AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md).

## Historischer V3.15-Entwicklungszweig, 17.10.2026 (inzwischen als PR #20 auf main integriert)

Arbeitszweig feat/v3-15-eingewoehnung-kibiz-20271017 baut auf main fa1fda2 auf. Neue reine Module: KiBiz-Rechtsfassung nach Betreuungsdatum, Wochen-Eingewöhnung/Ersatzbetreuung und Bundesleistungen-Dokumentennavigator. Vorhandene Antrags-Aufgaben erhalten fristgebundene lokale Statusmarkierungen und den unverbindlichen Fristenkalender. Transparente Vergleichskarten nutzen ausschließlich die vorhandene begrenzte Kandidatenliste. Alle neuen Eingaben sind nur temporär, keine Datenschema-Migration. Zu erwartender Testnachweis und fachliche Grenzen: [V3.15 Ausbau](AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md).

## Stand der aktuellen Zusammenführung

Aufbauend auf dem in main integrierten V3.11-Stand aa8286d liegen der V3.12-Commit 8c257ea (Kita-Finanzdeltas, Pareto, tagdatierte Ist-Buchungen), V3.13-Commit 7b49b38 (Zahlungsannahmen, Risiko-/Quellen-/ICS-Funktionen) und V3.14-Commit 09764a6 (Kostenpuffer, Kölner Gebührengruppen, synthetische Mikrosuche, Legacy-/Privacy-Härtung) vor. Diese SHA-Angaben sind der geprüfte Entwicklungszweig **vor** der Integrations-Dokumentationsaktualisierung.

- Technisch geprüft im Workbench: 375/375 Node-/DOM-, 39/39 Browser- und 3/3 direkte file://-V3.14-Fälle; erzeugte Browser-Testartefakte werden nicht versehentlich eingecheckt.
- npm run release:check bleibt ausdrücklich negativ wegen fehlender Fach-, Rechts-, Datenschutz- und Nutzerprüfungen sowie ungeklärter amtlicher Mutterschutz-Referenzabweichung.
- Technische Integration in main und öffentlicher Produktausrollung dürfen nicht gleichgesetzt werden. Der Live-Branch- und CI-Status ist nach dem PR-Merge separat neu zu prüfen.
- Verbindlicher Fachreview-Übergabesatz: [V3.14 Nachweise](ROADMAP-FACHABNAHME-V314-2026-10-17.md).

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

217 Node-Tests und 16 Browserfälle direkt über file:// (52 Axe-Prüfungen) bestanden. Aktuelle Offline-Evidenz umfasst den SHA256 der geprüften HTML-Datei, Versionsnummer und Grenzen. Keine reale Nutzertest-/Fachabnahme simuliert; [vollständiger Bericht](UMSETZUNG-ZIELBUDGET-V3.7.md). Der ursprüngliche Buildlog oben bleibt als historische Nachweiskette bestehen.


## Fortsetzung V3.10 – 16.10.2026

Tatsächlichen GitHub-Stand abgefragt: PRs #14–#16 gemergt, main `e8bb586`, letzte Main-CI 38773827065 erfolgreich. Auf Feature-Branch `feat/v3-10-evidence-guidance` fortgesetzt. V3.9-Baseline isoliert auf dem unveränderten Commit ausgeführt: 246/246 Node-Tests bestanden. Ein erster Lauf im Arbeitsbranch bemerkte während paralleler Moduländerungen einen erwartbar veralteten Snapshot; kein Baselinefehler.

Auf ausdrücklichen Nutzerauftrag Subagents für fachliche Recherche/Budget, Schnellstart, Wissensinhalte, Infowebseite und Browser-QA eingesetzt. Keine externen Personen kontaktiert. Erst bestehende Rechnung und Nutzerführung verbessert, dann Ziel zur kleinen Infowebseite erweitert. Einzeldatei-Rechner erhalten, `start.html` als redaktioneller Einstieg ergänzt. Details/Quellen: [Umsetzung V3.10](UMSETZUNG-V3.10.md), [Fachrecherche](FACHRECHERCHE-V3.10.md), [UX-Recherche](UX-RECHERCHE-V3.10.md), [Zusatzinformationen](ZUSATZINFORMATIONEN-V3.10.md), [Familienstart](FAMILIENSTART-V3.10.md), [QA](QA-V3.10.md).

Kein Merge und keine öffentliche Veröffentlichung in dieser Fortsetzung. Unabhängige Freigaben bleiben ausstehend.


Das CI-Jobbudget wurde für die erweiterte Node-/Browsermatrix von zehn auf 15 Minuten erhöht. Die einzelnen Browser-Testlimits bleiben unverändert bei 120 Sekunden; Assertions und Accessibility-Gates wurden nicht gelockert. Unterbrochene/parallele Vorläufe werden nicht als erfolgreiche Nachweise gezählt.

Finale lokale Nachweise: 279/279 Node-Tests (167,4 s), ergänzte Link-Regression 2/2, 27/27 direkte file://-Browserfälle (7,5 min). Gesamtergebnis und Grenzen in [QA V3.10](QA-V3.10.md). Die ersten unterbrochenen Browser-/Node-Vorläufe wurden durch vollständige beziehungsweise gezielt zur Linkänderung passende Läufe ersetzt.


## Design-Nachbesserung 17.10.2026

Die aktuelle Portalgestaltung und ihre gezielten Nachweise stehen in [DESIGN-2026-10-17.md](DESIGN-2026-10-17.md). Der Rechner bleibt unverändert. Frühere vollständige Browserberichte und deren Portalhash beziehen sich auf den 16.10.; die neue Portaldatei hat einen eigenen Hash und einen getrennten Bericht. PR #17 wird damit aktualisiert.

## V3.18 (18.10.2026) – interne Sicherheits- und Staging-Vorbereitung

Importstatus-Codes sind auf eigene erlaubte Einträge begrenzt; privater, nur loopback-gebundener Staging-Build mit gehashtem Skript-CSP und reproduzierbarer Header-Vorlage ist vorbereitet. **Keine öffentliche Bereitstellung und keine neue externe Freigabe.** [Prüf- und Betriebsdokument](STAGING-UND-FREIGABE-V318-2026-10-18.md).

## Amtliche BEEG-Richtlinien Juli 2026 – zusätzliche Teilreferenz

Die 07/2026-Richtlinien bestätigen an einem veröffentlichten **7/31-Beispiel** die taggenaue Anrechnung nach BEEG § 3. Eine neue, explizit **nicht als vollständiger Familien-Review gezählte** Zeitachsenregression prüft den veröffentlichten Teilfall; die 4/30-gegen-5/30-Frage vom 20.05., **0/10 externe Familienreferenzen** und alle externen Freigaben bleiben offen. Details: [Fachquellen-Abgleich](FACHABNAHME-RICHTLINIEN-2026-10-18.md). Die 2027er-KiBiz-Fassung ist getrennt von der nicht freigegebenen BEEG-Prognose zu behandeln.

## V3.20 – Nachweisgebundene Release-Sperre (18.10.2026)

Der Release-Direktbefehl prüft neben Administrations-Flags jetzt die unabhängig validierten Familien-/Nutzer-Evidenzen, Mutterschutz-Fachentscheid, aktuelle SHA-256-Hashes der Offline-HTML-Seiten und einen echten extern kontrollierten Betreiberentscheid. Manipulierte Freigabe-Flags allein lösen **keine** Produktfreigabe mehr aus. Bestehende Referenzfamilien: **0/10**, reale Nutzertests: **0**, 4/30-gegen-5/30-Differenz und externe Rechts-/Datenschutz-/Betreiberfreigaben offen. **Keine Änderung an Berechnung, Paketversion, JSON-Schema oder den echten Freigabedateien.** [Tests und Nachweise](RELEASE-EVIDENZ-SPERRE-V320-2026-10-18.md).

## Pages-Testseiten-Review: nachvollziehbarer Build und synthetische Daten

Die nächste **manuell ausgelöste** öffentliche Pages-Testvorschau zeigt nun die Paketversion 3.10.0, den getrennten Stand der Rechtsquellen (15.10.2026), den exakten Git-Commit samt Link und – im GitHub-Workflow – die Ausführungs-ID. Historische V3.15/V3.16-Modulnamen werden getrennt erklärt. Alle Eingabe-, Zeitachsen-/Buchungs- und Ergebnisansichten verweisen in dieser Vorschau ausdrücklich auf **ausschließlich synthetische Testdaten**. Die Original-Offline-Quellen bleiben unverändert; JSON-Schema 1 und Rechenlogik ebenfalls. Die NRW-KomNet-Fachauskunft stärkt die eigenständige Schutzfrist-Herleitung, **löst die 4/5-Tage-Anrechnung nicht abschließend**. P0-A/B/D/E und Betreiberfreigabe bleiben offen. Die Vorschau wird nicht automatisch beim Merge veröffentlicht. [Externer Review-Abgleich, Prüfergebnisse und Rollout-Grenzen](PAGES-REVIEW-ABGLEICH-2026-10-18.md).

## P1 UX: synthetische Vorschau, Feldfehler und letzte gültige Ergebnisse

Die öffentliche GitHub-Pages-Testvorschau verwendet nun in zusätzlichen statischen und dynamischen Bereichen ausschließlich synthetische Finanz- und Familienangaben; auch die Infoseite erklärt das explizit. Die Vorschau startet mit einem fiktiven Datum 28.05.2026, während die lokale Offline-Fassung ihre bisherige Voreinstellung behält. Negative/ungültige Einnahmen, Datumsangaben sowie Wochenstunden über 40 werden vor Übernahme in die Modellberechnung abgewiesen (feldnahe zugängliche Fehler). Ein noch nicht berechneter oder ungültiger Schnellstart kennzeichnet das bisherige Ergebnis als letzten gültigen Entwurf. Bewusst eingetragene 0 bleibt verschieden von unbekanntem/leerem Betrag. Rechenformeln und JSON-Schema 1 bleiben bestehen.

Fachprüfungen 4/30 gegen 5/30, unabhängige Referenzfälle (0/10), manuelle Screenreader-/Nutzertests und Rechts-/DSGVO-/Betreiberfreigaben bleiben **offen**. Ein Merge aktualisiert die GitHub-Pages-Testvorschau nicht automatisch; der betreiberseitig bestätigte manuelle Pages-Workflow ist weiterhin erforderlich. [Implementierung und Testgrenzen](P1-UX-VALIDIERUNG-2026-10-18.md).

## P2 – Herkunft des Elterngeld-Netto und verständlicherer JSON-Import

Bei Änderung des Schnellstart-Auszahlungsnettos und schon vorhandenen manuellen/importierten Elterngeld-Netto-Fachwerten verlangt die Anwendung nun eine ausdrückliche Wahl: **beibehalten, unverbindlich neu schätzen oder als unbekannt leeren**. Ohne Wahl bleibt der alte Berechnungszustand erhalten. Die Ergebnisübersicht nennt die Herkunft je Elternteil ausdrücklich ohne amtlichen Prüfclaim. Schätzungen, leer/unbekannt und 0 € bleiben unterscheidbar. Das JSON-Schema 1 sowie die rechtlichen Formeln bleiben unverändert. Der Import erklärt vorab, welche temporären Szenarien nicht exportiert werden, zeigt feldbezogene deutsche Fehlermeldungen statt roher Parser-/Datenschlüsseltexte, erhält auf Fehlern den vorherigen Plan und aktiviert nie ungefragt die Browserspeicherung. Die bekannten fachlichen und rechtlichen Release-Gates bleiben offen; die öffentliche GitHub-Pages-Testvorschau ist weiterhin manuell freizugeben und nur für fiktive Eingaben gedacht. [Technischer Nachweis und Testgrenzen](P2-NETTO-HERKUNFT-IMPORT-2026-10-18.md).

## P2-Zielsuche: drei vergleichbare Modellkennzahlen und Laufzeit

Die bestehende Zielsuche zeigt nun je Vorschlag direkt dieselben drei Kennzahlen: Gesamtbudget realistisch, niedrigster Lebensmonat realistisch und Anfangsruecklage vorsichtig. Die vollstaendige Realistisch/Vorsichtig-Tabelle samt Engpassmonaten und Zielkonflikten ist weiterhin in aufklappbaren Details verfuegbar. Die Suchgrenzen und der fehlende globale Optimalitaetsnachweis bleiben sichtbar; angezeigte Betragswerte sind weder Bewilligungen noch Bankbuchungen. Der Suchlauf zeigt den Busy-Status, echten Fortschritt und die nur auf diesem Geraet beobachtete Laufzeit; Abbruch und Eingabeaenderungen uebernehmen nie ungefragt den Monatsplan. Ein separat startbarer, synthetischer file://-Chromium-Benchmark protokolliert getesteten HTML-SHA, Plattform, Browser und Wallzeit ohne Speicherung oder Netzwerk. Quellformeln, JSON-Schema und Release-Sperre bleiben unveraendert. Mutterschutz 4/5 Tage, 0/10 externe Referenzen, Nutzer-/Screenreader-/Datenschutz-/Rechts-/Betreiberfreigaben bleiben offen. GitHub Pages bleibt eine nur manuell ausgeloeste synthetische Testvorschau. [Vollstaendiger technischer Bericht](P2-ZIELSUCHE-VERGLEICH-2026-10-18.md).
