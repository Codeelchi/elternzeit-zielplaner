# Entwickler-Handoff – V3.19: technische Datenschutzresilienz, keine externe Freigabe

**Aktueller Arbeitsstand V3.19 (18.10.2026):** Ausgangspunkt GitHub-main a4afb8a (PR #23, V3.18 integriert). Neue Browser-Speicherfehlerbehandlung und CI-Aufteilung auf node/browser/staging mit fail-closed Schlussjob test. Fachliche Freigabestände weiterhin 0/10 Referenzfamilien, null Nutzer, Mutterschutzkonflikt 4/5 offen; release:check bleibt gesperrt. [V3.19-Nachweise](PRIVACY-ROBUSTNESS-V319-2026-10-18.md). Historische V3.17-Prüfzahlen weiter unten sind keine Abnahme des neuen Commits.

Stand: **18. Oktober 2026**. Paket-/Export-Metadaten bleiben bis zu einer separaten Release-Entscheidung bei 3.10.0; die V3.17-Arbeit baut auf PR #20 (V3.15–V3.16, Merge `19f047d`, CI erfolgreich) auf und enthält nun die technischen Teile A–D. Einstieg für eine neue Sitzung oder einen übernehmenden Entwickler. Mit [Buildlog](BUILDLOG.md), [Architektur](ARCHITEKTUR.md) und [Roadmap](ROADMAP.md) lesen.

**V3.17-D (18.10.2026):** [Acht lokale synthetische Verständnisfälle, moderiertes UX-/Accessibility-Protokoll und Null-Evidenzmatrix](PRODUKTREIFE-V317D-NUTZERPRUEFUNG.md); Modul `src/understanding-guide.cjs`, Node-Schutz `src/usability-evidence.cjs` und `npm run usability:check`. Die Übung manipuliert weder Familienplan noch Speicher/Export, ist keine echte Nutzerstudie und vergibt keine Freigabe. **Technischer QA-Nachweis:** 495/495 Node-/DOM-, 63/63 vollständige Chromium-E2E und 3/3 separate V3.17-D-`file://`-Browserfälle bestanden. GitHub-PR-CI vor Merge gegen identischen Commit prüfen.

**Externes Fachreview vorbereiten:** [Neutrale V3.17-Fallvorlage](FACHABNAHME-V317-REFERENZFALL-VORLAGE.md) mit zehn noch nicht bestätigten synthetischen Fällen, expliziter Trennung von unabhängigen Sollwerten und internem Ist. Dies ist kein beauftragter/eingegangener externer Review.

**V3.17-B/C QA:** 481/481 Node-/DOM-, 60/60 vollständige Chromium-E2E und 4/4 zusätzliche echte `file://`-V3.17-B-Browserfälle bestanden. Manipulierte JSON-Freigabeinformationen werden ignoriert; unbekannte Haushaltskosten bleiben im CSV-Rest leer. Der unabhängige Evidenzcheck meldet 10 vorbereitete, 0 extern bestätigte Fälle. Rechts-/Datenschutz-/Nutzer- und echte Referenzfreigaben weiterhin offen.

**V3.17-B/C neuer interner Stand:** [Exportvertrags- und Referenzevidenz-Härtung](AUSBAU-V317B-C-EXPORTE-EVIDENZ-2026-10-17.md). `src/export-disclosure.cjs` für begrenzte JSON-/CSV-Hinweise; `src/independent-review-evidence.cjs` und `scripts/independent-evidence-check.mjs` für getrennte strukturelle Prüfung der noch fehlenden externen Familienreferenzen. Exporte folgen weiterhin Schema 1 (CSV hat sieben neue Zusatzspalten); importierte Freigabe-Claims werden ignoriert; Kosten unbekannt heißt CSV-Rest leer. Fachreviewstatus: 0/10.

**V3.17-A komplette technische QA:** 468/468 Node-/DOM-, 56/56 vollständige Chromium-Browserfälle und 3/3 direkte `file://`-V3.17-Tests; Browserstatus, 2027-Flag, Export-Kompatibilität und 320-px-Schnellstart geprüft. Paketversion 3.10.0 und öffentliche Review-Gates unverändert.

**Implementierter V3.17-A-Arbeitsstand:** [Statusanzeige und Testgrenzen](AUSBAU-V317-PRODUKTREIFE-EINORDNUNG.md) nutzt nur den bestehenden RuleValidator, ohne Quellen- oder Berechnungsregeländerung. Die zentrale pure Funktion liegt in src/model-scope.cjs, über scripts/embed-modules.mjs in der Offline-Datei gebündelt. Technische Tests und Freigabe weiterhin unabhängig behandeln.

**Aktueller Einstieg V3.17:** [Neue operative Roadmap](ROADMAP.md), [Abgleich des externen Audits](PRODUKTREIFE-ABGLEICH-V317-2026-10-17.md) und [aktuelle Nutzeranleitung](ANLEITUNG.md). Beauftragter erster Ausbau: sichtbarer, validatorbasierter Umfang-/Unsicherheitsstatus, **ohne** Rechtsänderung oder Freigabe. Frühere Versionsabschnitte unten sind **historische Teststände**, keine Live-Statusmeldung.

**Ergänzung 15.10.2026 / V3.5.0:** 48 monetäre Vergleichstests (22 direkt veröffentlichte Beispielwerte und Gesamtsummen einschließlich des L-Bank-Familienfalls, 4 amtlich veröffentlichte Grenzen, 22 Formelableitungen) erfolgreich. Der vollständige [Quellenabgleich](AMTLICHE-REFERENZPRUEFUNG-2026-10-15.md) dokumentiert den ungelösten Widerspruch zwischen Familienportal (5/30 Resttage) und KomNet/MuSchG/SGB V (4/30 Resttage). **Release gesperrt.** Für 2027 wurde ausschließlich eine deutlich markierte, nicht rechtsfreigegebene Szenariosuche ergänzt; Status bleibt NICHT_UNTERSTUETZT. CI-Browserprüfung des neuen E2E-Falles nach Branch-Push ausführen.

**V3.6.0:** Die vier dokumentierten echten Bescheidfälle sind nur historisch und unvollständig reproduzierbar. BSG B 10 EG 1/20 R wurde anhand des veröffentlichten BSG-Urteils auf den **24.03.2022** korrigiert. Neue Tests prüfen Beträge/Verfahrensstufen, variable Einkommensarten, Rechtsereignisse 2027 und NRW-KiBiz-Frist. Keine Änderung an den öffentlichen Release-Gates. Siehe [Referenzdokumentation](HISTORISCHE-BESCHEIDE-UND-RECHTSSTAND-2027.md).

**V3.8:** Schnellstart baut ausschließlich auf der bestehenden V3.7-Monatsberechnung auf. Der Anfänger-Modus blendet Fachnavigation bewusst aus; Playwright-Expertentests aktivieren sie vor dem alten Navigationspfad. `npm run quickstart:sync` aktualisiert die Single-HTML-Version, `npm run quickstart:check` prüft Quellcode-Drift. [Bedienung, Datenschutz und Limits](SCHNELLSTART-V3.8.md).

**Historische Offline-QA V3.9:** 22/22 Playwright-Fälle direkt über file://, 53 Axe-Scans ohne gemeldete Verstöße; versionsgebundener HTML-SHA256 und reale Laufdaten in qa/browser-environment.json sowie qa/browser-results.json. Ältere V3.7-Nachweise in diesem Handoff bleiben ausschließlich historisch.

**V3.9 – auf main integriert:** Neue Schutzlogik liegt im weiterhin offline-fähigen HTML-Schnellstart und der bestehenden Renderlogik; nicht in einer zweiten Leistungs-Engine. Akzeptanztests unter `tests/usability-v39.test.mjs` und zusätzlichen Playwright-Szenarien. Es darf keine automatische öffentliche Freigabe entstehen. [UX-Details](UX-NACHBESSERUNG-V3.9.md).

**Historischer technischer Stand V3.14:** [Aktueller Review-/QA-Bericht](ROADMAP-FACHABNAHME-V314-2026-10-17.md), [Roadmap-Matrix](../data/roadmap-status-2026-10-17.json) und [Changelog](../CHANGELOG.md) zuerst lesen. V3.10-Nachweise bleiben historische Snapshots. Im Workbench: 375/375 Node-/DOM-Tests, 39/39 Browserfälle und 3/3 direkte V3.14-file://-Browserfälle bestanden. Die unabhängige öffentliche Freigabe bleibt gesperrt.

**V3.16 QA:** 452/452 Node-/DOM-, 53/53 Chromium-Regressionen und 4/4 direkte V3.16-file://-Tests erfolgreich. Alle bestehenden öffentlichen Release-Gates bleiben unverändert.

**V3.16 (interner Code):** [Gemeinsamer Eltern-Arbeitswochenplan](AUSBAU-V316-GEMEINSAME-BETREUUNG-2026-10-17.md), src/parent-coordination.cjs (rein) und eigener aufklappbarer Abschnitt in der Kita-Ansicht. Arbeitszeiten/Nettoannahmen beider Eltern und Tagesbegleitung bleiben session-only, werden weder importiert noch exportiert. Keine automatisch bestätigte Bonusberechtigung; Release-Gates unverändert blockiert.

**V3.15.2 geprüfter Stand:** 430/430 Node-/DOM-Tests, 49/49 Browser-E2E und 10/10 direkte file://-V3.15.x-Browserfälle. Hinweise auf unbekannte Beträge, ungedeckte Stunden und 12-Wochen-Modellgrenze bleiben sichtbare Pflichtkennzeichnungen.

**V3.15.2 Ausbau:** [Kita-Verzögerung im Robustheitsvergleich](AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md). Neues reines src/care-resilience.cjs: eigener Kita-Plan und zusätzliche 2/4 Wochen unter identischen Arbeits- und Kostenannahmen. Kein Datenbankschreiben, kein Import-/Export-Schemawechsel und kein offizieller Anspruch.

**V3.15.1 QA:** 418/418 Node-/DOM-Tests, 47/47 volle Chromium-Regression und 8/8 V3.15.x-Browserfälle direkt über file:// bestanden. Die öffentliche Abnahme ist unabhängig davon weiterhin blockiert.

**V3.15.1 Nachbesserung:** [Übergang versus Regelbetreuung](AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md) korrigiert falsche Zusatzausgaben der ersten regulären Woche. Arbeit später starten, Kita-Stunden unabhängig eingeben, wiederkehrende Lücken kennzeichnen und Übergangskosten nur illustrativ je Lebensmonat zuordnen. Das unveränderte Schema v1 und die gesperrte öffentliche Freigabe gelten weiter.

**V3.15-Folgestand:** [Wochenweise Eingewöhnung und KiBiz-Kohorten](AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md), Module kibiz-cohorts.cjs, settling-in.cjs und benefits-navigator.cjs. Die neuen UI-Szenarien, KiZ-Datumsauswahl und Aufgabenmarker bleiben nur im Arbeitsspeicher; Plan und Export-Schema v1 bleiben unverändert. Negative Unit- und Browserfälle sichern die Trennung. QA: 403/403 Node-/DOM-Tests; voller Chromium-Lauf 45/45, abschließend V3.15-Härtung separat 6/6 HTTP und 6/6 file://. Das bleibt ein technischer Arbeitsstand ohne öffentliche Freigabe.

## Übergabeumfang und Status

Eine kleine Familienstart-Infowebseite (`start.html`) und ein offlinefähiger deutscher Elternzeit-/Elterngeld-Planer als eigenständige HTML-Datei (`index.html`). Technisch weit fortgeschritten, **kein fachlich abgenommener öffentlicher Beta-Release**. `data/release-gates.json` bleibt gesperrt. Ein Merge ändert daran nichts.

Verbindliches Repository: Codeelchi/elternzeit-zielplaner. PR #20 (V3.15–V3.16) wurde nach grüner GitHub-CI in main gemergt; Merge-SHA 19f047d. Arbeit an V3.17 nur im neuen Feature-Branch und ohne automatische Weitergabe nach main. Den Live-Status bei Übernahme dennoch neu abrufen.

Modellrahmen: zwei abhängig beschäftigte Eltern in Deutschland, gemeinsamer Haushalt und eigene Betreuung, ein regulär geborenes Kind; Basiselterngeld, Plus, Partnerschaftsbonus, reguläre Elternzeit/Teilzeit. NRW/Köln regional vertieft. Positive Standardkohorte laut Katalog **01.04.2025 bis 31.12.2026**; 2027 bleibt ungeprüft. Explizite Standardfallbestätigung erforderlich.

## Einstieg und Arbeitsbasis

```bash
git status --short
git fetch origin
git log -8 --oneline --decorate
gh pr list --state open
gh issue list --state open
gh run list --branch main --limit 5
npm ci --ignore-scripts --no-audit --no-fund
npm test
```

Lokale Änderungen vor Branchwechsel prüfen und erhalten. Nach Integration auf aktuellem `main` einen neuen Feature-Branch beginnen; alte Stapelbranches nicht ungeprüft weiterverwenden. Aktuelle Repository-/Reviewregeln und gegebenenfalls neue `AGENTS.md` lesen. Historische SHAs sind Nachweise, kein Ersatz für Live-Status.

`index.html` direkt öffnen. Browserregression: `npx playwright install --with-deps chromium`, dann `npm run test:e2e`. Verwaltete Browsergrenzen siehe Buildlog. Node 22 entspricht CI. Die App benötigt zur Nutzung weder npm noch Python.

## Modulkarte

| Datei | Zuständigkeit / Änderungsweg |
| --- | --- |
| `data/rechtsregeln-de-nrw-2026-10-14.json` | Redaktionelle Rechtsquelle mit Prüfdatum, Gültigkeit und Status; vor Logikänderung amtliche Grundlage prüfen |
| `src/time-axes.cjs` | Datums-/Lebensmonatsgrenzen, Mutterschutz, Elternzeit, Erwerb, Bezug, Bank; danach `axes:sync` |
| `src/planning-model.cjs` | Materialisiert unabhängige Arbeits-/Leistungsachsen für Bestandsberechnung |
| `src/rule-validator.cjs` | Vier Statuscodes und strukturierte Findings; unvollständige/unbestätigte Fälle nie positiv |
| `src/family-budget.cjs` | Drei Komponenten-Stresstests, Rücklagen und Engpässe; Mutterschaft nicht doppelt addieren |
| `src/candidate-patterns.cjs` | Rollen-Spiegelvarianten; Mutterschutz bleibt bei Mutter; keine eigene Gültigkeitsgarantie |
| `src/goal-ranking.cjs` | Fingerprints, Kennzahlen und unterschiedliche Ergebnisprofile |
| `src/application-guide.cjs` | Datierte Aufgaben, Unterlagen und NRW-/Köln-Behördenwege |
| src/expected-payments.cjs / src/calendar-export.cjs | Angenommene Zahlungstage und rein vorläufige Checklistenfristen als ICS, keine Bank- oder Bewilligungserfindung |
| src/manual-cost-impact.cjs / src/finance-guidance.cjs | Manuell angenommene Krankenversicherungs-/Steuerreserven und fachliche Warnungen |
| src/cologne-fees.cjs | Historische kommunale Tarife seit August 2025 für drei Altersgruppen, ohne Budgetübernahme |
| src/microspace-proof.cjs / src/search-coverage.cjs | Kleine vollständige technische Orakelsuche und ausdrücklich begrenzte Kandidatenabdeckung |
| scripts/legacy-function-check.mjs / scripts/privacy-technical-check.mjs | Kontrollen für eindeutige Controller und statische lokale Datenschutz-Schutzgeländer |
| `index.html` | UI, Bestandsfinanzformeln, Sucherzeugung, Import/Persistenz und generierte Module |
| `scripts/embed-*.mjs` | Erzeugen/kontrollieren Offline-Snapshots; andere Module über `modules:sync` |
| `scripts/reference-report.mjs` | Aktueller und versionierter Delta-Bericht; Originalreferenzen erhalten |
| `scripts/release-check.mjs` | Öffentliche Freigaben und Referenzstatus; derzeit erwartet Exitcode 1 |

CommonJS dient unabhängiger Testbarkeit, nicht einem Node-Backend. Eingebettete Modulblöcke nicht von Hand ändern. Nach Quelländerungen synchronisieren, generierten Diff prüfen und Tests ausführen. Die alten sich überschattenden Controllerfunktionen wurden in V3.14 bereinigt. Der Check npm run legacy:check schützt gegen neue Doppeldefinitionen und alte aktive Speicherlesepfade.

## Kritische Invarianten

### Zeitachsen

- Lebensmonate vom ursprünglichen Geburtstag ableiten; Kalender-Zahlungsmonat und Lebensmonat unterscheiden.
- Mutterschutz ist taggenau. Standardfristende: Geburt plus 56 Tage. Abweichender ET/Frist ist kein freigeschalteter Sonderfall.
- `leaveOverrides` trennt Listen für `father`/`mother`. Fehlende Elternteile können abgeleitet werden; ausdrücklich leere Listen sind anders als fehlende Listen.
- `employmentOverrides` und `benefitOverrides` beeinflussen Arbeit bzw. Bezug unabhängig. `planning-model` liefert die wirksamen Monatswerte.
- `bankLedger` enthält tatsächliche tagdatierte Buchungen. Aus einem Anspruch keinen Bankeingang erfinden und aus Buchungen keine Bewilligung ableiten.
- Q mit 35 Wochenstunden ohne Bezug und ohne Elternzeit anders behandeln als Erwerb während tatsächlicher/abgeleiteter Elternzeit.

### Regelbewertung

`PLAUSIBEL_STANDARD`, `REGELKONFLIKT`, `NICHT_UNTERSTUETZT`, `DATEN_UNVOLLSTAENDIG`. Findings enthalten Regel, Eltern/Lebensmonate, Erklärung, Alternativen und amtliche Quellenmetadaten. Nur der erste Status erlaubt positives Standardlabel; Nutzerbestätigung ist keine Dokumentenprüfung.

Unbekannte Sonderfalltypen, ungültige Daten, ungeprüfte Quellen und zukünftige Kohorten konservativ sperren. Nicht beim Import automatisch bestätigen. UI, Validator und Zielsuche müssen konsistent bleiben.

### Finanzen

- `fi`: väterliches Einkommen. `mi`: mütterliches Einkommen einschließlich modellierter Mutterschaft. `maternityBenefits` ist Teilmenge von `mi`, kein zusätzlicher Geldbetrag.
- Persönliche Erwerbsbänder: `0` bedeutet keine Schwankung; leer übernimmt gemeinsames Band. Mutterschaft bleibt konstant.
- Stressfaktoren für Leistungshöhe und Kosten sind Annahmen, keine Wahrscheinlichkeiten. Diagramm, Rücklagen und robuste Suche nutzen dieselbe Projektion.
- Anfangsrücklage: größtes kumuliertes Defizit gegenüber Mindestbetrag nach Kosten; vorherige Überschüsse verfügbar. Auszahlungsverzögerung damit nicht erfasst.
- Explizit null Kindergeld erhalten. Keine ungeprüften Jahreserhöhungen. Unbestätigte regionale Leistungen nicht addieren.
- Steuerprogression, individuelle Kranken-/Pflegeversicherung und Rückforderungen nicht vollständig berechnet. Ergebnisse bleiben sichtbar Schätzungen.

### Suche

Kandidaten passieren Betreuung, Überschneidung, Regeln und Finanzfilter. Spiegelung allein beweist keine Quoten-/Regelkonformität. Unterschiedliche Ergebnisprofile sind keine vollständige Pareto-Front.

Unmögliche Ziele liefern keine Vorschläge; Mindestbudget nicht heimlich absenken. Änderungen machen Empfehlungen ungültig; vor Übernahme neu prüfen. Neue Gesamtpläne verwenden ihre eigene Erwerbs-/Leistungswahl; aktuelle manuelle Overrides werden bei Übernahme zurückgesetzt.

## Tests und Nachweise

Historischer V3.4-Funktionsnachweis: `b5c82e3`, [CI erfolgreich](https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/38680019062). **154 Node-/Modul-/jsdom-Tests, elf Chromium-Browserfälle, 50 Axe-Prüfungen**. Dokumentations-/Merge-Commits separat prüfen.

- `tests/*.test.mjs`: Module, reale HTML-Integration, Importgrenzen, Quellen, amtliche Einzelwerte, Regressionen.
- `tests/e2e/browser.spec.mjs`: echte Benutzer-/Dateiabläufe, Opt-in/Löschung, Achsen, Suche, Risiko, Mobil/Desktop, dynamische Modelle und Laufzeit.
- `qa/browser-environment.json`: lokaler Browser, Version, Dateiprotokoll und Nachweisgrenzen.
- `qa/browser-results.json`: letzter eingecheckter lokaler Playwright-Lauf; neue Läufe überschreiben ihn. Nur beabsichtigte Änderungen committen.
- `qa/browser-artifacts/`: lokale ignorierte Traces/Vollbilder. Ausgewählte Bilder in `qa/screenshots/`.
- `qa/reference-deltas-current.json`: Geld-/Tagesvergleich. Historische Berichte nicht überschreiben oder Unterschiede verstecken.

GitHub-Upload ist wegen Quote optional. Grüner Job bedeutet nicht erfolgreichen Upload; Summary/Annotations lesen. Echte Testfehler bleiben harte Gates. Axe ersetzt kein Screenreader-/Usability-Review.

## Datenschutz und Import

Ohne Konto, standardmäßig nur RAM. Speicherung in `localStorage` ist optional und unverschlüsselt; Exporte enthalten Finanzdaten. Ausschalten/Löschen entfernt bekannte Speicherschlüssel, ein geöffneter Plan kann bis zum Schließen im RAM bleiben. Erfolgreicher Import entfernt alte gespeicherte Kopie und aktiviert Speicherung nicht stillschweigend. Ungültige Dateien werden vor Übernahme abgelehnt.

Keine echten Gehalts-/Steuerdaten oder Familienexporte in Fixtures, Screenshots, Issues oder CI-Artefakten. Keine Telemetrie, externen Laufzeitskripte oder Accountpflicht ohne entsprechende Produkt-/Datenschutzentscheidung. Amtliche Links dienen Information; private Eingaben werden nicht an den Bundesrechner übertragen.

## Bekannte Grenzen

1. **Mutterschutz 4/30 vs. 5/30:** Originalreferenz erhalten, Fach-/Releaseblocker. Bestätigtes Kalenderdatum löst Geldbetragsvergleich nicht auf.
2. **Nettoermittlung:** Elterngeld-Netto ist Schätz-/Benutzereingabe; keine vollständige amtliche Brutto-/Steuer-/Versicherungsberechnung.
3. **Referenzbreite:** Acht publizierte Einzelbeträge plus Grenzen/Formelableitungen sind keine zehn vollständigen Behördenfamilien.
4. **Suchraum:** Begrenzte Vorlagen/Teilzeitstarts; keine exakten Betreuungsstunden und keine globale Optimalität. Die sichtbare Suche bleibt asynchron/abbrechbar (512er-Schritte), kann auf langsamen Geräten jedoch merklich Zeit benötigen. Der vollständige 256er-Mikro-Suchraum beweist nur den synthetischen Teilfall.
5. **Region/Jahre:** Historische Kölner Tarife nicht als aktuelle bestätigte Ansprüche verwenden. Andere Regionen/2027 brauchen eigene Prüfung.
6. **Abnahme:** Unabhängige Fach-/Rechts-/Datenschutzreviews, Nutzertests, Assistenztechnik und weitere Browser fehlen.
7. **Wartung:** Doppelte alte Top-Level-Funktionen sind technisch bereinigt; neue Änderungen mit npm run legacy:check, Snapshot-Checks und Browser-Roundtrip sichern. Weitere UI-Modularisierung ist optional, keine Freigabevoraussetzung.

## Nächster konkreter Auftrag

Am integrierten main beginnen und die bereits angelegten Prüfunterlagen aus [V3.14](ROADMAP-FACHABNAHME-V314-2026-10-17.md) verwenden. **P0-R1** (Mutterschutzkonflikt) ist als maschinenprüfbarer Delta-Fall vorbereitet, aber weiter ungeklärt. **P0-R2**: zehn synthetische Prüfaufträge liegen vor, jedoch weiterhin **null vollständig unabhängig überprüfte Familienverläufe**. Keine künstliche Bestätigung aus eigenen Tests ableiten. Danach P0-R3 (pauschaliertes Elterngeld-Netto) und P0-R4 (Juristen-/Kohortenreview) durch tatsächlich unabhängige Fachpersonen beauftragen.

Danach Netto-Spezifikation/Fachreview, anschließend P1-Pakete. Keine ungeprüften Sonderfälle freischalten. Behörden/Dritte nur nach ausdrücklichem Auftrag kontaktieren; zuerst veröffentlichte amtliche Quellen nutzen.

## Abschluss einer nächsten Übergabe

Quellmodule und HTML-Snapshots stimmen überein; relevante Tests grün; aktuelle CI verlinkt. Unterstützte Fälle, geänderte Regeln, verbleibende Risiken und Gates dokumentiert. Softwareversion nicht mit Quellenprüftag verwechseln. Issues erst nach Abnahme schließen. Veröffentlichung benötigt unabhängige Freigaben und ausdrückliche Release-Entscheidung.

## Neue Wettbewerbsbegutachtung, 15.10.2026

Vor weiteren Produktänderungen den [V3.6-Audit](WETTBEWERB-MVP-AUDIT-2026-10-15.md) lesen. Neue lokale Prüfung: 186 Node-Tests; bestehende main-CI belegt 13 Browserfälle. Dies aktualisiert nicht automatisch den eingecheckten V3.4-Dateistartnachweis. Markt-/USP-Aussagen bleiben hypothesespezifisch, keine Exklusivität behaupten. Die im Audit priorisierten Produktlücken ergänzen die Roadmap.

## Historische Übergabe V3.7

[Umsetzung und Prüfungen](UMSETZUNG-ZIELBUDGET-V3.7.md) lesen. 217 Node-Tests, 16 file://-Browserfälle und 52 Axe-Scans sind aktuell bestanden; `qa/browser-environment.json` enthält jetzt Version und HTML-Hash. Die vorher dokumentierte V3.4-Metadatenlücke ist damit behoben. Neue Module: `money.cjs` und `plan-comparison.cjs`. `runGoalSearch` bleibt synchron testbar, die sichtbare Oberfläche nutzt `runGoalSearchAsync` mit Abbruch.

Nächste offene Abnahmeschritte: taggenaue Mutterschutz-Geldanrechnung unabhängig klären; die angebotene manuelle Netto-/Finanzlogik fachlich reviewen; vorbereitete Nutzertests durchführen; Assistenztechnik und Datenschutz unabhängig prüfen. Keine Ergebnissimulation als erledigte Nutzertests ausgeben. Die vollständige Bruttoengine ist nicht Bestandteil des engen manuellen MVP-Pfads.


## Historische Übergabe V3.10 – 16.10.2026

Mit [Umsetzung V3.10](UMSETZUNG-V3.10.md) und [QA V3.10](QA-V3.10.md) beginnen. Einstieg für werdende Eltern ist `start.html`; `index.html` bleibt der unverändert verteilbare Rechner mit erweitertem Schnellstart. Die Startseite speichert keine Gesundheits-/Nutzerdaten. Amtliche Links sind externe Angebote, keine eingebundenen Tracker.

Neues reines Modul `src/planning-knowledge.cjs` ist in `scripts/embed-modules.mjs` aufgenommen. Wissenskarten nutzen dieselbe Zeitachsenengine und ändern weder Finanzen noch Rechtsstatus. `family-budget.cjs` benötigt nun `money.cjs`; nach Quelländerungen `npm run modules:sync`. Schnellstartquellen nach Änderungen mit `npm run quickstart:sync` einbetten. Beide Snapshotchecks sind Teil von `npm test`.

Nächste Abnahmearbeit bleibt P0-R1 (Mutterschutz-Geldanrechnung) und P0-R2 (vollständige unabhängige Referenzfamilien). Für das Infoportal außerdem verantwortlichen Anbieter/Impressum, öffentliche Datenschutzhinweise und redaktionelle Linkpflege vor einem öffentlichen Start verbindlich festlegen; keine erfundenen Betreiberangaben ergänzen. Echte Nutzertests für den gesamten Weg Infoseite → Rechner → Beratung durchführen. Veröffentlichung bleibt gesperrt.


## Design-Nachbesserung 17.10.2026

Die aktuelle Portalgestaltung und ihre gezielten Nachweise stehen in [DESIGN-2026-10-17.md](DESIGN-2026-10-17.md). Der Rechner bleibt unverändert. Frühere vollständige Browserberichte und deren Portalhash beziehen sich auf den 16.10.; die neue Portaldatei hat einen eigenen Hash und einen getrennten Bericht. PR #17 wird damit aktualisiert.

## V3.18 (18.10.2026) – interne Sicherheits- und Staging-Vorbereitung

Importstatus-Codes sind auf eigene erlaubte Einträge begrenzt; privater, nur loopback-gebundener Staging-Build mit gehashtem Skript-CSP und reproduzierbarer Header-Vorlage ist vorbereitet. **Keine öffentliche Bereitstellung und keine neue externe Freigabe.** [Prüf- und Betriebsdokument](STAGING-UND-FREIGABE-V318-2026-10-18.md).

## Amtliche BEEG-Richtlinien Juli 2026 – zusätzliche Teilreferenz

Die 07/2026-Richtlinien bestätigen an einem veröffentlichten **7/31-Beispiel** die taggenaue Anrechnung nach BEEG § 3. Eine neue, explizit **nicht als vollständiger Familien-Review gezählte** Zeitachsenregression prüft den veröffentlichten Teilfall; die 4/30-gegen-5/30-Frage vom 20.05., **0/10 externe Familienreferenzen** und alle externen Freigaben bleiben offen. Details: [Fachquellen-Abgleich](FACHABNAHME-RICHTLINIEN-2026-10-18.md). Die 2027er-KiBiz-Fassung ist getrennt von der nicht freigegebenen BEEG-Prognose zu behandeln.

## V3.20 – Nachweisgebundene Release-Sperre (18.10.2026)

Der Release-Direktbefehl prüft neben Administrations-Flags jetzt die unabhängig validierten Familien-/Nutzer-Evidenzen, Mutterschutz-Fachentscheid, aktuelle SHA-256-Hashes der Offline-HTML-Seiten und einen echten extern kontrollierten Betreiberentscheid. Manipulierte Freigabe-Flags allein lösen **keine** Produktfreigabe mehr aus. Bestehende Referenzfamilien: **0/10**, reale Nutzertests: **0**, 4/30-gegen-5/30-Differenz und externe Rechts-/Datenschutz-/Betreiberfreigaben offen. **Keine Änderung an Berechnung, Paketversion, JSON-Schema oder den echten Freigabedateien.** [Tests und Nachweise](RELEASE-EVIDENZ-SPERRE-V320-2026-10-18.md).

## GitHub Pages – öffentliche, ausdrücklich unfreigegebene Testvorschau

Ein ausschließlich manuell ausgelöster GitHub-Actions-Workflow stellt für Tests **nur zwei HTML-Seiten** als öffentlich abrufbare Pages-Vorschau bereit. Beide Seiten tragen eine sichtbare Warnung, Noindex und ein JavaScript-SHA-CSP. Das Repository bleibt privat; die Vorschau ist **öffentlich**, erfordert fiktive Testdaten und ist kein rechts- oder datenschutzgeprüftes Produkt. Die eigentliche öffentliche Produkt-Release-Sperre bleibt BLOCKED; **keine** automatische Veröffentlichung bei Push auf main. [Testanleitung](GITHUB-PAGES-TESTVORSCHAU-2026-10-18.md).

## Pages-Testseiten-Review: nachvollziehbarer Build und synthetische Daten

Die nächste **manuell ausgelöste** öffentliche Pages-Testvorschau zeigt nun die Paketversion 3.10.0, den getrennten Stand der Rechtsquellen (15.10.2026), den exakten Git-Commit samt Link und – im GitHub-Workflow – die Ausführungs-ID. Historische V3.15/V3.16-Modulnamen werden getrennt erklärt. Alle Eingabe-, Zeitachsen-/Buchungs- und Ergebnisansichten verweisen in dieser Vorschau ausdrücklich auf **ausschließlich synthetische Testdaten**. Die Original-Offline-Quellen bleiben unverändert; JSON-Schema 1 und Rechenlogik ebenfalls. Die NRW-KomNet-Fachauskunft stärkt die eigenständige Schutzfrist-Herleitung, **löst die 4/5-Tage-Anrechnung nicht abschließend**. P0-A/B/D/E und Betreiberfreigabe bleiben offen. Die Vorschau wird nicht automatisch beim Merge veröffentlicht. [Externer Review-Abgleich, Prüfergebnisse und Rollout-Grenzen](PAGES-REVIEW-ABGLEICH-2026-10-18.md).

## P1 UX: synthetische Vorschau, Feldfehler und letzte gültige Ergebnisse

Die öffentliche GitHub-Pages-Testvorschau verwendet nun in zusätzlichen statischen und dynamischen Bereichen ausschließlich synthetische Finanz- und Familienangaben; auch die Infoseite erklärt das explizit. Die Vorschau startet mit einem fiktiven Datum 28.05.2026, während die lokale Offline-Fassung ihre bisherige Voreinstellung behält. Negative/ungültige Einnahmen, Datumsangaben sowie Wochenstunden über 40 werden vor Übernahme in die Modellberechnung abgewiesen (feldnahe zugängliche Fehler). Ein noch nicht berechneter oder ungültiger Schnellstart kennzeichnet das bisherige Ergebnis als letzten gültigen Entwurf. Bewusst eingetragene 0 bleibt verschieden von unbekanntem/leerem Betrag. Rechenformeln und JSON-Schema 1 bleiben bestehen.

Fachprüfungen 4/30 gegen 5/30, unabhängige Referenzfälle (0/10), manuelle Screenreader-/Nutzertests und Rechts-/DSGVO-/Betreiberfreigaben bleiben **offen**. Ein Merge aktualisiert die GitHub-Pages-Testvorschau nicht automatisch; der betreiberseitig bestätigte manuelle Pages-Workflow ist weiterhin erforderlich. [Implementierung und Testgrenzen](P1-UX-VALIDIERUNG-2026-10-18.md).

## P2 – Herkunft des Elterngeld-Netto und verständlicherer JSON-Import

Bei Änderung des Schnellstart-Auszahlungsnettos und schon vorhandenen manuellen/importierten Elterngeld-Netto-Fachwerten verlangt die Anwendung nun eine ausdrückliche Wahl: **beibehalten, unverbindlich neu schätzen oder als unbekannt leeren**. Ohne Wahl bleibt der alte Berechnungszustand erhalten. Die Ergebnisübersicht nennt die Herkunft je Elternteil ausdrücklich ohne amtlichen Prüfclaim. Schätzungen, leer/unbekannt und 0 € bleiben unterscheidbar. Das JSON-Schema 1 sowie die rechtlichen Formeln bleiben unverändert. Der Import erklärt vorab, welche temporären Szenarien nicht exportiert werden, zeigt feldbezogene deutsche Fehlermeldungen statt roher Parser-/Datenschlüsseltexte, erhält auf Fehlern den vorherigen Plan und aktiviert nie ungefragt die Browserspeicherung. Die bekannten fachlichen und rechtlichen Release-Gates bleiben offen; die öffentliche GitHub-Pages-Testvorschau ist weiterhin manuell freizugeben und nur für fiktive Eingaben gedacht. [Technischer Nachweis und Testgrenzen](P2-NETTO-HERKUNFT-IMPORT-2026-10-18.md).

## P2-Zielsuche: drei vergleichbare Modellkennzahlen und Laufzeit

Die bestehende Zielsuche zeigt nun je Vorschlag direkt dieselben drei Kennzahlen: Gesamtbudget realistisch, niedrigster Lebensmonat realistisch und Anfangsruecklage vorsichtig. Die vollstaendige Realistisch/Vorsichtig-Tabelle samt Engpassmonaten und Zielkonflikten ist weiterhin in aufklappbaren Details verfuegbar. Die Suchgrenzen und der fehlende globale Optimalitaetsnachweis bleiben sichtbar; angezeigte Betragswerte sind weder Bewilligungen noch Bankbuchungen. Der Suchlauf zeigt den Busy-Status, echten Fortschritt und die nur auf diesem Geraet beobachtete Laufzeit; Abbruch und Eingabeaenderungen uebernehmen nie ungefragt den Monatsplan. Ein separat startbarer, synthetischer file://-Chromium-Benchmark protokolliert getesteten HTML-SHA, Plattform, Browser und Wallzeit ohne Speicherung oder Netzwerk. Quellformeln, JSON-Schema und Release-Sperre bleiben unveraendert. Mutterschutz 4/5 Tage, 0/10 externe Referenzen, Nutzer-/Screenreader-/Datenschutz-/Rechts-/Betreiberfreigaben bleiben offen. GitHub Pages bleibt eine nur manuell ausgeloeste synthetische Testvorschau. [Vollstaendiger technischer Bericht](P2-ZIELSUCHE-VERGLEICH-2026-10-18.md).
