# Zeitachsen-Architektur (V3.2.0 – erster Ausbau von Issue #3)

Die Finanzberechnung basiert weiterhin auf dem vorhandenen monatlichen Modell. Zusätzlich gibt es jetzt ein **eigenständiges Kalender- und Zeitachsenmodell** in `src/time-axes.cjs`. Es wird über `scripts/embed-time-axes.mjs` ohne externe Abhängigkeiten in die Offline-App eingebettet.

## Eigenständige Bereiche

- **Geburtsdatum/Lebensmonat:** 36 Perioden mit Start-/Enddatum, Kindesalter, inklusiver Tageszahl und ISO-Datumswerten.
- **Mutterschutz:** kalendertäglicher Zeitraum vor/nach Geburt, konfigurierbarer voraussichtlicher Termin und Schutzfrist; bei Abweichungen Hinweis auf erforderliche individuelle Prüfung.
- **Arbeitsrechtliche Elternzeit:** aus dem bisherigen Monatsstatus *abgeleitete* Intervalle oder optionale *manuell eingegebene* Kalenderabschnitte je Elternteil. Die Quelle wird mitgeführt.
- **Erwerbstätigkeit:** Vollzeit, Teilzeit, keine Erwerbsarbeit oder Mutterschutzstatus sowie Wochenstunden je Lebensmonat.
- **Elterngeld:** Basis, Plus, Partnerschaftsbonus, Mutterschutzanrechnung oder kein Bezug – unabhängig von eingetragenen arbeitsrechtlichen Elternzeitabschnitten.
- **Finanzprojektion:** separat als **geschätzte Beträge für Lebensmonate** (kein Kontoeingangstag, keine Einzelauszahlung).

Die neue Oberfläche befindet sich im Bereich **„Zeitachsen“**. Dort werden Mutterschutz, individuelle Elternzeitabschnitte, Standardfristen sowie eine Tabelle der 36 Lebensmonate zusammengeführt. Anders als der bisherige Status kann ein arbeitsrechtliches Intervall hier auch mitten im Lebensmonat beginnen.

## Standardannahmen und Grenzen

Einzelgeburt, reguläre Mutterschutzfrist 42 Tage vor erwartetem Geburtstermin und 56 Tage nach Geburt, ohne Sonderregelungen. Eine frühere tatsächliche Geburt verlängert in der Projektion die Schutzfrist, aber **die Finanzberechnung wird ausdrücklich nicht umgerechnet**; die Oberfläche warnt in diesem Fall. Bei anderen abweichenden Schutzfristen und Monatsende-Geburtstagen gibt es ebenfalls Warnhinweise. Die vorliegende Standard-UI kann derzeit je Elternteil **einen** expliziten Elternzeitabschnitt editieren; die Kernfunktion unterstützt mehrere Intervalle.

Die Standardfrist zur Anmeldung von Elternzeit bis zum dritten Geburtstag wird rein rechnerisch **49 Tage vor dem eingetragenen Beginn** angezeigt. Der genannte Anmeldetermin kann bei individuellen Umständen abweichen (z. B. später beginnender Abschnitt, Sonderregelungen, konkrete Geburt/ET, verschiedene Phasen); er ersetzt keine Prüfung von §16 BEEG. Die Elternzeit ist nicht automatisch beantragt, die Eingabe im Rechner löst keinen Versand aus.

Die heutigen Leistungsbeträge bleiben **Näherungen**, und der Elterngeldantrag kann in der Praxis andere Einkommens- und Fristenbewertungen erfordern. Die Arbeitszeiten sind Wochenmittelwerte, keine vollständigen Stundennachweise.

## Kompatibilität

- Vorhandene Monatsmodelle, Autosuche und Budgetberechnung bleiben erhalten.
- Neue Elternzeitintervalle werden separat unter `leaveOverrides` gespeichert; ohne Eintrag wird der Statusplan weiterhin als Planungsannahme verwendet.
- `expectedDueDate` und `postnatalDays` beeinflussen ausschließlich die neue Mutterschutz-Kalenderachse. **Diese Werte ändern nicht rückwirkend die vereinfachte finanzielle Mutterschutz-Anrechnung.**
- `npm run axes:sync` erzeugt den HTML-Snapshot, `npm run axes:check` verhindert Quellcode-Drift im CI.

## Abnahmen und Folgearbeiten

Tests: normale Lebensmonate, ungültige Datumseingaben, Schaltjahr, überschneidende Intervalle ohne doppelte Tageszählung, individuelle Teilmonate, abweichender Entbindungstermin, Elternzeit ohne Elterngeld, Teilzeit ohne Elterngeld, DOM-Initialisierung. Bestandstests auf Finanzbeträge bleiben grün.

**Issue #3 ist noch nicht vollständig abgeschlossen:** Es fehlen die volle Entkopplung des Mutterschutz-Zahlungsmodells und der UI für beliebig viele Intervalle, eine unabhängig fachlich geprüfte Monatsende-/ET-Logik sowie tatsächliche Arbeitgeber-/Kalendertermine. Das Ergebnis ist ein vorbereitendes modularisiertes Standardfall-Modell, keine rechtsverbindliche Zeit- oder Finanzentscheidung.

Quellen zur fachlichen Weiterprüfung: [BEEG §15](https://www.gesetze-im-internet.de/beeg/__15.html), [BEEG §16](https://www.gesetze-im-internet.de/beeg/__16.html), [Bundesfamilienportal: Elternzeit anmelden](https://familienportal.de/familienportal/familienleistungen/elternzeit/faq/wann-und-wie-muss-ich-elternzeit-beantragen--124810), [Bundesfamilienportal: Mutterschutz](https://familienportal.de/familienportal/familienleistungen/mutterschutz/faq/wie-lange-dauert-der-mutterschutz--124780).
