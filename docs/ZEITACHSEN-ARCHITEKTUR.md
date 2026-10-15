# Zeitachsen-Architektur (Issue #3, Kalenderprüfung 14.10.2026)

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


## Kalenderkorrekturen und Quellenabgleich am 14.10.2026

Amtliche Normtexte wurden am 14.10.2026 direkt abgerufen:

- [BGB §187 Abs. 2](https://www.gesetze-im-internet.de/bgb/__187.html): Der Geburtstag wird bei der Berechnung des Lebensalters mitgerechnet.
- [BGB §188 Abs. 2 und 3](https://www.gesetze-im-internet.de/bgb/__188.html): Bei Beginn am Tagesanfang endet die Frist am vorhergehenden entsprechenden Tag; fehlt der maßgebliche Tag, am letzten Tag des Monats.
- [MuSchG §3 Abs. 2](https://www.gesetze-im-internet.de/muschg_2018/__3.html): Schutz bis zum Ablauf von acht Wochen **nach** der Entbindung. Die Ereignisfrist nach BGB §187 Abs. 1 beginnt am Folgetag. Das Intervall der geschützten Tage schließt den Geburtstag zusätzlich ein.

Die Umsetzung berechnet Grenzen immer vom ursprünglichen Geburtstag, nicht iterativ aus dem verkürzten Vormonat. Beispiel: Geburt 31.01.2027 → LM1 endet 28.02.2027, LM2 beginnt 01.03.2027 und endet 30.03.2027, LM3 beginnt 31.03.2027. Geburt 29.01.2028 → LM2 beginnt am 29.02.2028. Diese Normableitung ist automatisiert geprüft, ersetzt aber keine unabhängige fachliche Freigabe des vollständigen Rechners.

Die reguläre Schutzfrist endet nun einschließlich `Geburt + 56 Tage`, exklusives Ende `Geburt + 57 Tage`. Die bisherige Projektion zählte nur 56 geschützte Kalendertage einschließlich Geburtstag und endete einen Tag zu früh. Bei früherer Geburt wird die Verlängerung auf den nicht verbrauchten Anteil der vorgeburtlichen Frist begrenzt; Frühgeburten und andere Sonderfälle benötigen weiterhin individuelle Prüfung.

### Nicht aufgelöste Abweichung in einem amtlichen Beispiel

[Familienportal: Elterngeld und Mutterschaftsleistungen](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/kann-ich-elterngeld-und-mutterschaftsleistungen-bekommen--124776), abgerufen am 14.10.2026, nennt für Geburt **20. Mai** ein Ende der acht Wochen am **14. Juli** und **5/30** Elterngeld im zweiten Lebensmonat. Die Kalenderdifferenz vom 20. Mai bis zum 15. Juli beträgt jedoch 56 Tage; die Normableitung ergibt Ende **15. Juli** und **4/30** Resttage. Diese Abweichung wird ausdrücklich nicht als bestätigtes fachliches Referenzergebnis umetikettiert. Die rechnerische Kalenderableitung ist separat getestet; eine fachliche Klärung der amtlichen Beispielabweichung bleibt Release-Gate.

## APIs für unabhängig editierbare Achsen

`buildTimeAxes` unterstützt zusätzlich zum kompatiblen Monatsstatus:

```js
{
  leaveOverrides: {father: [{id:'leave-1', startDate:'2027-08-15', endDate:'2027-10-14'}], mother: []},
  employmentOverrides: {father: [{lm:3, weeklyHours:24}]},
  benefitOverrides: {father: [{lm:3, type:'plus'}]},
  bankLedger: [
    {id:'bank-1', paymentDate:'2027-09-01', amount:700, category:'elterngeld', parent:'father'},
    {id:'bank-2', paymentDate:'2027-09-12', amount:-300, category:'childcare'}
  ]
}
```

`[]` bei Elternzeit bedeutet ausdrücklich keine Arbeitgeber-Elternzeit; fehlende Einträge werden weiterhin aus Monatsstatus abgeleitet. Arbeitszeit-/Leistungs-Overrides sind dünn besetzte Listen: Nicht genannte Lebensmonate behalten den Legacy-Status. Doppelte oder ungültige Lebensmonate, unbekannte Typen und nicht endliche Zahlen werden abgewiesen. Die neuen Arbeitszeit-/Leistungsobjekte besitzen `source: 'user'` oder `'derived'`. Leistungsarten: `none`, `basis`, `plus`, `partnership_bonus`, `maternity_offset_basis`. Ein Override bestätigt keinen Leistungsanspruch; nachfolgend muss der Regelvalidator sämtliche Achsen konsistent prüfen.

`recordedTransfers` enthält ausschließlich explizit eingegebene Ist-Buchungen. `calendarCashflow` summiert diese nach tatsächlichem Kalendermonat. Es werden **keine** Buchungen aus modellierten Anspruchsbeträgen erzeugt. Negative Beträge sind Auszahlungen des Haushalts, positive Beträge Einnahmen. Kategorien: `wage`, `elterngeld`, `maternity`, `kindergeld`, `childcare`, `household`, `other`. IDs, Kalenderdaten und endliche Beträge werden geprüft; keine Bankverbindung oder Namen werden benötigt. Eine leere Liste sagt nichts über ausgebliebene amtliche Auszahlung aus. Der Lebensmonats-Finanzanspruch bleibt separat mit `actualPaymentDate: null` gekennzeichnet.

Die Kernmodelle sind damit unabhängig bearbeitbar. UI-Integration aller Overrides sowie die unabhängige fachliche Freigabe sind gesonderte Abnahmepunkte. Ein Anspruch oder Zahlungsdatum darf aus der Eingabe niemals als behördlich bestätigt dargestellt werden.
