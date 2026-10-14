# MVP-Abnahmebericht V3.3.0

**Ergebnis: interner integrierter Prüfstand, öffentliche Beta noch nicht freigegeben.**

## Baseline und Konsolidierung

GitHub am 14.10.2026 tatsächlich geprüft: `main` b4e6a12; PR #9 (Dokumentation), #10 (Katalog/Referenzen) und #11 (Zeitachsen) offen und Draft, keine abgegebenen Reviews. CI #10/#11 erfolgreich. `main` technisch nicht geschützt, aber beide Entwicklungs-PRs verlangen ausdrücklich Review und keinen automatischen Merge. Daher neuer Feature-Branch auf #11, Dokumentationscommit aus #9 übernommen; keine Änderung an `main` und kein Verlust der vorhandenen Funktionen. Baseline `npm ci && npm test`: 59/59 erfolgreich.

## Umsetzung und Status

| Paket | Implementierung | Verbleibende Abnahme |
| --- | --- | --- |
| #1 amtliche Referenzen | 34 Betragsvergleiche, 8 veröffentlichte Zahlenbeispiele, 4 veröffentlichte Grenzwerte; maschinenlesbarer Delta-Bericht einschließlich expliziter Mutterschutzabweichung | Weitere unabhängig bestätigte vollständige Behördenrechnungen; 8 Beispiele nicht als 10 vollständige Behördenfälle ausgeben |
| #2 Rechtskatalog | 21 datierte Regeln, zentraler generierter Snapshot, Prüf-Gates, 2027 keine bestätigte Standardkohorte | Nicht jede historische Inkrafttretensangabe ist unabhängig als Einzelklausel belegt; geplantes Kindergeld und regionale Beträge bleiben ungeprüft |
| #3 Zeitachsen | Mehrere editierbare Kalenderabschnitte, gemeinsame Datumslogik, unabhängige Stunden/Leistungsart an Finanzformel angeschlossen, echte Bankbuchungen separat | Mutterschutz-Referenzabweichung; Arbeitgeberzustimmung und echte Monatsdurchschnitte nicht automatisch bestätigt |
| #4 Regelvalidator | Vier Statuscodes, Regel-/Eltern-/Lebensmonatsbezug, Erklärung, Alternativen, Quellenstand; Fehlangaben und Sonderfälle sperren positives Label | Unabhängiges Fachreview; Anspruchsvoraussetzungen werden vom Nutzer bestätigt, keine Dokumentenprüfung |
| #5 Zielsuche | Nur positiv geprüfte Standardpläne, drei unterschiedliche erläuterte Profile, echte Null-Ergebnisse, begrenzte Vorlagen, Mindestbudget im gesamten Vergleichszeitraum, Robustheitsfilter vorsichtig | Vorlagen bleiben strukturell begrenzt; weder sämtliche Wechsel noch globales Optimum geprüft |
| #6 Budget | Drei Stresstests, getrennte Komponenten, Engpassmonate, kumulierte Anfangsrücklagen, Steuer-/Versicherungshinweise | Amtliche Brutto-Netto-Ermittlung und Verzögerung echter Auszahlungen fehlen |
| #7 NRW/Köln | Personalisierte datierte Checkliste, offizielle Zuständigkeit, Unterlagen und Antragswege; keine unbestätigten Zusatzbeträge automatisch addiert | Historische Kölner Behördenpassagen widersprüchlich; aktuelle Formulare vor Versand prüfen; weitere Länder offen |
| #8 UX/Datenschutz/QA | Dreischritt-Einstieg, Mobile, 32 Ansichten geprüft, Einwilligung für lokale Speicherung, Löschung, Importprüfung, Browser-/Axe-CI | Echte Nutzertests, Assistenztechnik-Review und Datenschutz-/Rechtsfreigabe fehlen; direktes file-Protokoll umgebungsbedingt nicht geprüft |

## Technische Prüfung

- **131 Node-/jsdom-/Modultests erfolgreich** nach Integration; ausschließlich synthetische Daten.
- **8 Chromium-End-to-End-Tests erfolgreich**, darunter tatsächlicher JSON-Download/Import, Speicher-Einwilligung und Wiederherstellung/Löschung, Suche und Übernahme, unabhängige Finanzachsen sowie tatsächliche Bankbuchungen.
- Desktop 1440×1000 und Smartphone 390×844: jeweils alle 16 Ansichten, keine horizontalen Seitenüberläufe, keine Axe-WCAG2A/AA/2.1-Verstöße. Automatische Prüfung ersetzt keine vollständige Barrierefreiheitsabnahme.
- Keine Browser-Konsolen- oder Laufzeitfehler. Offline-Interaktion nach Laden ohne Netzwerkverbindung; keine weiteren HTTP-Anfragen.
- `git diff --check`, alle drei Snapshot-Gates und Datums-/Import-Grenzfälle geprüft. Browserreport und ausgewählte Screenshots unter `qa/`. Zusätzlich drei dynamische Modelle an drei horizontalen Scrollpositionen je Bildschirmgröße: insgesamt 50 Axe-Prüfungen ohne Verstöße.
- `file://` ist durch die verwaltete Chromium-Richtlinie blockiert (`ERR_BLOCKED_BY_ADMINISTRATOR`). Richtlinie nicht umgangen. Einzeldatei enthält keine externen Laufzeitressourcen; direkter Dateistart muss vor Distributionsfreigabe zusätzlich in einem normalen Browser geprüft werden.

## Konkrete fachliche Release-Blocker

1. **Mutterschutz:** Familienportal nennt Geburt 20. Mai, Schutzfristende 14. Juli und 5/30 verbleibenden Elterngeldanteil in LM2. Die aktuelle Normableitung nach MuSchG §3 und BGB §§187/188 endet einschließlich 15. Juli und ergibt 4/30. Delta ein Tag; siehe `qa/reference-deltas-v3.3.json`. Originalreferenz nicht ersetzt oder als erfolgreich abgeglichen ausgegeben. Behördliche oder unabhängige fachliche Klärung erforderlich.
2. **Amtliche Vollberechnung:** Kein vollständiger eigenständiger Bemessungszeitraum-/Brutto-/Elterngeld-Netto-Rechner. Auszahlungs-Netto und Elterngeld-Netto werden separat eingegeben; Schätzungen dürfen nicht als amtlich geprüft gelten. Kein abgeschlossener durchgängiger Vergleich mit dem interaktiven Bundesrechner.
3. **Zukunft und Region:** Rechtsstand Oktober2026 bestätigt nicht Geburten2027, Kölner Tarife2027/28 oder geplante Kindergeldänderungen. Ungeprüfte Zukunftskohorten sind von positiven Standardempfehlungen gesperrt. Historische Kommunaltarife werden nicht automatisch in das Budget übernommen.
4. **Freigaben:** Bestehende PRs und dieser Prüfstand benötigen Review. Fach-/Rechts-/Datenschutzreview, echte Nutzertests und normale Browserprüfung des Dateistarts stehen aus. Kein Merge, Deployment oder öffentlicher Release vorgenommen.

## Nächste Abnahmeschritte

Amtliche Mutterschutzabweichung klären, zusätzliche vollständige unabhängige Standardfälle dokumentieren und Vergleich mit Bundesrechner durchführen. Anschließend Fachreview, Datenschutz- und Nutzertests abschließen, PR-Abhängigkeiten in der Reihenfolge #10 → #11 → integrierter Prüfstand reviewen. #9 ist inhaltlich übernommen; dessen separate Review bleibt unabhängig. Erst danach einen freigegebenen Release Candidate kennzeichnen und über öffentliche Beta entscheiden.

## Technische Veröffentlichungssperre

`npm run references:report` erstellt den Delta-Bericht erneut. `npm run release:check` gibt derzeit absichtlich Exitcode1 zurück: dokumentierte Freigaben in `data/release-gates.json` stehen aus und der amtliche Mutterschutzvergleich ist nicht bestanden. Grün bestandene Entwickler-CI allein ist keine Veröffentlichungsfreigabe. Diese Datei dokumentiert echte Reviews; sie darf nicht allein zur Erzeugung eines grünen Gates umgestellt werden.

## Zusätzliche unabhängige Quellenbelege

Am14.10.2026 zusätzlich geprüft: [SGBV §24i Absatz3](https://www.gesetze-im-internet.de/sgb_5/__24i.html) nennt Mutterschaftsgeld „für die Zeit der Schutzfrist ... sowie für den Entbindungstag“. Der [Bundesleitfaden zum Mutterschutz, Stand05.11.2025](https://www.bmbfsfj.bund.de/resource/blob/94398/1cf726867f2832166f693166b364ee6e/leitfaden-zum-mutterschutz-informationen-fuer-schwangere-und-stillende-data.pdf) bestätigt diesen zusätzlichen Entbindungstag. Die [BEEG-Richtlinien, Abschnitt4.1, PDF-Seite202](https://www.bmbfsfj.bund.de/resource/blob/243236/8a26d08d56511511e2fb7c9d5236b4de/richtlinien-zum-beeg-data.pdf) bestätigen die Anwendung von §§187–193BGB über §26SGBX und das Ende des Lebensmonats am dem Geburtstag vorangehenden Tag. Bei einem fehlenden entsprechenden Tag gilt §188Absatz3 (letzter Monatstag). Diese Belege stützen die Kalenderkorrektur; sie ersetzen kein unabhängig abgeglichenes Behördenbeispiel für die konkrete Mutterschaftsanrechnung.

## GitHub-CI-Ausführung

Der erste Lauf auf PR#12 bestand Node- und Chromium-Prüfungen. Nur das Hochladen der Nachweise scheiterte, weil das GitHub-Actions-Artefaktkontingent ausgeschöpft ist. Der Upload bleibt optional, das Ergebnis wird ausdrücklich in der Actions-Zusammenfassung protokolliert; Testfehler bleiben harte Gates. Ausgewählte Nachweise sind unabhängig davon im Repository vorhanden. Keine bestehenden accountweiten Artefakte gelöscht.
