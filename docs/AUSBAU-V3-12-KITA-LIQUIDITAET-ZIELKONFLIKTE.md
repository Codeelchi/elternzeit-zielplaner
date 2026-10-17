# V3.12 – Kita-Finanzszenario, Geld-Zeit-Zielkonflikte, erfasste Liquidität

Stand: 17.10.2026. **Entwicklungszweig, noch keine öffentliche Freigabe.**
Die amtliche Regelbasis bleibt die bereits gekennzeichnete V3.10-Modellbasis. Diese Erweiterung ersetzt weder eine unabhängige Rechtsprüfung noch eine amtliche Elterngeld-Nettoermittlung.

## 1. Kita-Verzögerung finanziell verstehen

Der 0–6-Monats-Verzögerungsplaner aus V3.11 kann jetzt **ausdrücklich angegebene** hypothetische monatliche Änderungen übernehmen:

- weniger Erwerbsnetto in betroffenen Lebensmonaten (keine automatische Arbeitszeitannahme);
- zusätzliche Überbrückungsbetreuung in betroffenen Lebensmonaten;
- bisher vorgesehene Kita-Kosten dürfen **nur nach bewusst gesetztem Häkchen** wegfallen – niemals automatisch.

Das unabhängige Modul `src/care-impact.cjs` führt centgenaue Monats-Differenzen auf Grundlage des vorhandenen Lebensmonatsbudgets aus. Wenn Haushaltsausgaben unbekannt sind, zeigt es nur die **Differenz**, keinen fiktiven verfügbaren Überschuss. Die Anzeige weist Monate außerhalb des 36-Lebensmonats-Horizonts explizit aus. Unzulässige Werte werden abgewiesen. Die ursprünglichen Einkommens- und Elterngeldberechnungen sowie die persönliche Monatsaufteilung werden nicht verändert.

**Grenze:** Weniger Arbeitslohn kann Elterngeld, Steuern, Versicherungen oder andere Leistungen ändern. Diese Folgerechnung findet bewusst **nicht** statt. Kita-Gebühren können selbst bei verspätetem Start anfallen; ein gesetzlicher Erstattungsanspruch wird nicht unterstellt. Ein Monatsbetrag ist kein Bank-Zahlungseingang.

## 2. Finanz- und Zeit-Kompromisse verständlich darstellen

`src/goal-ranking.cjs` enthält jetzt `tradeoffFrontier`: ein schneller 2D-Paretovergleich **innerhalb der von der bestehenden Engine tatsächlich geprüften und zugelassenen Kandidaten**.

Die beiden Achsen sind:
- modelliertes verfügbares Gesamtbudget über denselben Planungshorizont (mehr ist besser);
- Summe vollständiger Elternmonate ohne Erwerbsarbeit beider Eltern einschließlich Mutterschutz (mehr ist besser; überlappende Monate werden doppelt gezählt).

Ein Vorschlag wird „nicht übertroffen“ genannt, wenn im geprüften Suchraum **kein** Kandidat bei beiden Größen mindestens gleich gut ist und bei mindestens einer besser. In allen anderen Fällen benennt die UI eine dominierende **andere geprüfte** Alternative; sie behauptet **kein mathematisch vollständiges/globales Optimum**. Unter nicht bekannten Haushaltsausgaben bleibt diese finanzielle Einordnung unsichtbar; dann verwendet die UI wie zuvor den Warnhinweis für Zeitvergleiche ohne zuverlässiges Netto-Budget.

Die vorhandene Prioritäten-, Rechts- und Kandidatenfilterung bleibt unverändert, und keine Alternative wird automatisch übernommen. Die neue Einordnung berücksichtigt keine Balance/Fairness in der Verteilung, Kita-Stunden, psychische Belastung, Stundenlöhne oder Steuerfolgen; dafür sind zusätzliche Achsen und Nutzertests notwendig.

## 3. Tatsächliche Bankbuchungen von Ansprüchen trennen

Auf der bestehenden Zeitachsen-Seite wird das bereits vorhandene manuelle Buchungsjournal nach **Kalendermonat** ausgewertet, unabhängig vom Lebensmonatsanspruch:

- Kalendermonate zwischen den ersten und letzten Einträgen ohne Buchung werden ausdrücklich als **„Keine Buchungen erfasst“** gekennzeichnet – nicht als tatsächlicher Null-Euro-Kontoumsatz.
- Eine angenommene Anfangsrücklage ist **optional**, wird nicht gespeichert oder exportiert und erlaubt einen illustrativen Rechensaldo der **erfassten** Buchungen.
- Ohne explizite Anfangsrücklage gibt es keine Saldoprognose oder „zu wenig Geld“-Behauptung.
- Ein negativer illustrativer Saldo ist kein Nachweis einer wirklichen Kontoüberziehung, da unvollständige Buchungen möglich sind.
- Die Einträge selbst bleiben wie bisher nur bei ausdrücklich aktivierter lokaler Speicherung erhalten. Der hypothetische Anfangsbetrag wird bei Zurücksetzen und Planimport verworfen.

Die reine Logik liegt in `src/recorded-liquidity.cjs`. Ansprüche aus dem Elterngeldrechner werden **nicht** als tatsächliche Zahlung gebucht oder aus einem Tag automatisch abgeleitet.

## Qualitätsprüfung

- Neue negative und positive Unit-Tests für Kita-Szenarien, Pareto-Vergleich und erfasste Kalendermonats-Buchungen.
- Neue JSDOM-Integrationstests für hypothetische Eingaben, Gebührenentscheidung, Unbekannt-vs-Null, Sitzungsdaten, Reset und Verbot der automatischen Planübernahme.
- Mobile Browser-E2E-Tests inkl. Axe auf 320/390 px; vorhandene Zielsuche und Kassenbuch in Chromium geprüft.
- **320/320 Node-/DOM-Tests bestanden**, inklusive negativer Eingabeprüfungen und Reset.
- **32/32 Chromium-Browser-E2E-Tests bestanden**, inklusive vollständiger Desktop-/Mobil-Accessibility-Prüfung, 2027-Sperrfällen, Zielsuche und alter Zeitachsen-/Kassenbuch-Funktionen.
- **3/3 neue V3.12-Browserfälle über lokale file://-Dateien bestanden**, ohne dass die Anwendung über einen Webserver bezogen wurde.
- Beim Gesamtlauf wurde eine abweichende Kassenbuch-Nulltextmeldung entdeckt und behoben; der betroffene alte E2E-Fall und die vollständige Wiederholung bestanden.
- Generierte QA-Berichte ersetzen keine früheren abgenommenen Snapshots und werden nicht unbeabsichtigt in diesen Feature-Commit übernommen.

## Offene weitere Arbeiten – weiterhin keine öffentliche Freigabe

1. Wirklich rechtlich/geprüftes Elterngeld-Netto und die amtlich widersprüchliche Mutterschutz-Tagesanrechnung unabhängig auflösen.
2. Änderungsregeln für echte Arbeitszeit/Teilzeit, Elterngeldhöhe und Kita-Betreuung **mit** neuer Prüfung je Rechtskohorte umsetzen. Bis dahin ausdrücklich nur Differenzszenarien.
3. Zahlungsfälligkeiten/Verzögerungen nur mit nutzerbestätigten Geldterminen modellieren und fehlende Eingänge nicht erraten.
4. Steuer-/Versicherungsfolgen, Geschwister-/Mehrlings-/Sonderfälle und KiZ-/Wohngeld-Hinweise mit datierten, unabhängig nachprüfbaren Quellen ausbauen.
5. Unabhängige Rechts-, Fach-, Datenschutz- und Nutzerabnahmen sowie Betreiber-/Impressumsprüfung vor öffentlicher Veröffentlichung.

**Release-Gate:** `data/release-gates.json` bleibt unverändert BLOCKED.
