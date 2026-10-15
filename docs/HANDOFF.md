# Entwickler-Handoff – V3.4.0

Stand: **15. Oktober 2026**. Einstieg für eine neue Sitzung oder einen übernehmenden Entwickler. Mit [Buildlog](BUILDLOG.md), [Architektur](ARCHITEKTUR.md) und [Roadmap](ROADMAP.md) lesen.

## Übergabeumfang und Status

Ein offlinefähiger deutscher Elternzeit-/Elterngeld-Planer als eigenständige HTML-Datei. Technisch weit fortgeschritten, **kein fachlich abgenommener öffentlicher Beta-Release**. `data/release-gates.json` bleibt gesperrt. Ein Merge ändert daran nichts.

Verbindliches Repository: `Codeelchi/elternzeit-zielplaner`. Kein zweites Repository und keine parallele Neuentwicklung. PR #9: Dokumentation; #10: Rechtskatalog; #11: Zeitachsen; #12: integrierte V3.4. Der Nutzer hat die Integration beauftragt. Tatsächlichen Merge-/CI-Status bei Übernahme neu abrufen.

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
| `index.html` | UI, Bestandsfinanzformeln, Sucherzeugung, Import/Persistenz und generierte Module |
| `scripts/embed-*.mjs` | Erzeugen/kontrollieren Offline-Snapshots; andere Module über `modules:sync` |
| `scripts/reference-report.mjs` | Aktueller und versionierter Delta-Bericht; Originalreferenzen erhalten |
| `scripts/release-check.mjs` | Öffentliche Freigaben und Referenzstatus; derzeit erwartet Exitcode 1 |

CommonJS dient unabhängiger Testbarkeit, nicht einem Node-Backend. Eingebettete Modulblöcke nicht von Hand ändern. Nach Quelländerungen synchronisieren, generierten Diff prüfen und Tests ausführen. In Legacy-HTML existieren teilweise mehrere Funktionsdefinitionen; den tatsächlich zuletzt gebundenen Eventpfad prüfen.

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

Letzter Funktionscommit: `b5c82e3`, [CI erfolgreich](https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/38680019062). **154 Node-/Modul-/jsdom-Tests, elf Chromium-Browserfälle, 50 Axe-Prüfungen**. Dokumentations-/Merge-Commits separat prüfen.

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
4. **Suchraum:** Begrenzte Vorlagen/Teilzeitstarts; keine exakten Betreuungsstunden, keine globale Optimalität. Lange synchrone Suche kann UI blockieren.
5. **Region/Jahre:** Historische Kölner Tarife nicht als aktuelle bestätigte Ansprüche verwenden. Andere Regionen/2027 brauchen eigene Prüfung.
6. **Abnahme:** Unabhängige Fach-/Rechts-/Datenschutzreviews, Nutzertests, Assistenztechnik und weitere Browser fehlen.
7. **Wartung:** HTML-Doppeldefinitionen können Änderungen unwirksam machen; Import/UI schrittweise in eindeutige Module auslagern.

## Nächster konkreter Auftrag

Auf aktuellem `main` beginnen und **P0-R1 der Roadmap** bearbeiten: einen vollständigen Evidenzfall zur taggenauen Mutterschaftsanrechnung mit Daten, Formel, amtlichem Beleg, Prüftag und Delta erstellen. Bleibt die Rechtsfrage offen, Sperre erhalten und parallel P0-R2 (vollständige Referenzfamilien) vorbereiten.

Danach Netto-Spezifikation/Fachreview, anschließend P1-Pakete. Keine ungeprüften Sonderfälle freischalten. Behörden/Dritte nur nach ausdrücklichem Auftrag kontaktieren; zuerst veröffentlichte amtliche Quellen nutzen.

## Abschluss einer nächsten Übergabe

Quellmodule und HTML-Snapshots stimmen überein; relevante Tests grün; aktuelle CI verlinkt. Unterstützte Fälle, geänderte Regeln, verbleibende Risiken und Gates dokumentiert. Softwareversion nicht mit Quellenprüftag verwechseln. Issues erst nach Abnahme schließen. Veröffentlichung benötigt unabhängige Freigaben und ausdrückliche Release-Entscheidung.
