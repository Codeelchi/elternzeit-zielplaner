# V3.14 – technische Nacharbeit und unabhängige Fachabnahme

Stand: 17. Oktober 2026. Interner Entwicklungszweig. **Kein amtliches Gutachten und keine öffentliche Produktfreigabe.**

## P0-R1 – Mutterschutz: 4 statt 5 Tage

Synthetischer Fall: Geburt und errechneter Termin 20.05.2026, acht Wochen Nachgeburtsfrist; LM 2 vom 20.06. bis 19.07.2026 (30 Tage).

- Bundesfamilienportal: Ende der Mutterschaftsleistungen 14.07. und fünf Resttage. Quelle: https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/kann-ich-elterngeld-und-mutterschaftsleistungen-bekommen--124776
- NRW-KomNet und kalendarische Fristberechnung nach MuSchG: Ende 15.07. und vier Resttage. Quellen: https://www.komnet.nrw.de/_sitetools/dialog/4244 und https://www.gesetze-im-internet.de/muschg_2018/__3.html
- Programm: Schutzfrist bis einschließlich 15.07., 26 geschützte Tage und vier unbedeckte Tage im zweiten LM.

Reproduktion: npm run maternity:check. Evidenzdatei: data/maternity-delta-evidence-2026-10-17.json. Die bislang dokumentierte Klärungsanfrage wurde **nicht versendet**. Eine schriftlich nachvollziehbare behördliche Entscheidung zu Leistungsende UND Geldanrechnung ist erforderlich. Kein stiller Rechenfix.

## P0-R2 – Zehn vollständige unabhängige Referenzfamilien

Die Datei data/independent-case-requests-2026-10-17.json beschreibt zehn **synthetische** Abnahmefälle: Basis, Plus, zwei Teilzeitvarianten, Geringverdienst, Höchstbetrag, Partnerschaftsbonus, Monatsendgeburt, Geschwister und Mutterschutzdelta.

**Status: zehn Fälle vorbereitet, null unabhängig als vollständige Familienfälle mit Monatsbeträgen bestätigt.** Bestehende veröffentlichte Einzelbeträge, L-Bank-Erklärbeispiele und anonymisierte historische Auszüge gelten als Teilprüfungen, nicht als zehn behördlich bestätigte komplette Familienverläufe.

Prüfung: npm run independent-cases:check. Für einen echten Soll-Ist-Vergleich sind je Fall Geburtskohorte, alle relevanten Einkommens-/Steuer-/Versicherungsdaten, Monatsfolge, unabhängig publizierte oder geprüfte Monats-Sollwerte, Gültigkeitszeitraum, zulässige Toleranz und qualifizierte Prüferentscheidung erforderlich. Implementierungswerte dürfen nie ihre eigene externe Referenz sein.

## P0-R3 – Brutto-zu-Elterngeld-Netto, Spezifikationsgrenze

Die Berechnung des Elterngeld-Nettos ist vom tatsächlichen Auszahlungsnetto verschieden. Bundesportal: https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-wird-das-elterngeld-netto-berechnet--124606 und BEEG § 2e: https://www.gesetze-im-internet.de/beeg/__2e.html

Für eine belastbare standardisierte Implementierung sind notwendig: einschlägige Bemessungsmonate; laufende steuerpflichtige Bezüge und ausgeschlossene Sonderbestandteile; Arbeitnehmerpauschbetrag des relevanten Referenzjahres; Lohnsteuerprogrammablaufplan vom 1. Januar des Jahres vor der Geburt; Steuerklasse/Faktor, Kirchensteuer, ggf. Kinderfreibeträge; Pflichtversicherungsmerkmale (Bundesportal nennt je nach Pflicht 9 % KV/PV, 10 % RV, 2 % ALV), Mini-/Midijob und Mischeinkünfte; rechtskonforme Zwischenrundungen und Sondermonate.

Es gibt weiter die transparente **manuelle Eingabe des Elterngeld-Nettos**. Ein unvollständiger automatischer Brutto-Netto-Rechner wird nicht als amtlich korrekt beworben. Für 2027 bloß vorgeschlagene Steuerwerte werden nicht automatisch als geltend übernommen. Fachliche Implementierung erst nach unabhängiger Referenzfallmatrix.

## P0-R4 – Rechts- und Kohortenfreigabe

Unabhängig abzuzeichnen sind insbesondere BEEG §§ 1–4b, 7 und 16, MuSchG § 3, Fristen/Arbeitszeit/Kontingente/Parallelbezug/Bonus, Elternzeit als Arbeitgebermeldung versus Leistungsmonate, Steuer-/Versicherungsdaten und Sonderfälle. 2027-Entwürfe dürfen nicht als beschlossene Berechnungsgrundlage behandelt werden.

Quelleninventar mit Prüftagen: data/official-source-review-2026-10-17.json, Konsistenzprüfung npm run sources:check. Der Check bestätigt Metadaten und Status, aber keine unabhängige juristische Abnahme. Die Release-Gates bleiben offen.

## P1-R5 – Suchraum und Geschwindigkeit

Eine unabhängige **technische** Mini-Suche zählt 256 von 256 Kombinationen für die vier Stati Vollzeit/Basis/Plus/unbezahlt beider Eltern in LM 3 und 4: 127 plausible und 129 mit Regelkonflikten. Synthetische Geldwerte dienen ausschließlich der Test-Orakelrangfolge und sind **keine gesetzlichen Beträge**. Reproduktion: npm run search:micro-proof; Datei src/microspace-proof.cjs.

Die große Zielsuche behält ihre fachlichen Filter, arbeitet aber in 512er statt 64er asynchronen Suchschritten. Derselbe Chromium-Lauf eines 18-Monats-Ziels sank in der Workbench von rund 72 auf 28 Sekunden. Kein global vollständiger Suchraum, keine garantierte Handyleistung. Weitere Realgeräte- und Suchraumtests sinnvoll.

## P1-R6 – Versicherung, Steuern und Geldpuffer

src/manual-cost-impact.cjs erlaubt eigene Zusatzkosten für Versicherungsbeiträge und eine **frei gewählte** Steuerrückstellung. Gleicher Zeitraum und identische Stressparameter wie die bestehende Rücklagenrechnung; eigener Plan bleibt unverändert. Bereits in Ausgaben enthaltene Versicherungsbeiträge dürfen nicht doppelt verrechnet werden. Unbekannte Haushaltskosten liefern ausdrücklich keine verfügbare Rücklage. **Keine amtliche Steuer- oder Beitragsberechnung.** Fachabnahme echter Fälle noch offen.

## P1-R7 – Köln und offizielle Leistungsberatung

src/cologne-fees.cjs dokumentiert die drei Altersgruppen unter 2, 2 bis unter 3, ab 3 Jahren mit 25/35/45 Stunden aus der Kölner Tabelle gültig seit 01.08.2025, nachgesehen am 17.10.2026: https://www.stadt-koeln.de/service/produkte/00405/index.html

Die historische Referenz setzt keinen automatischen Kita-Betrag in den Budgetrechner; Befreiung/Geschwister und Essensgeld sind individuell, zukünftige Tarifjahre nicht automatisch bestätigt. KiZ und Wohngeld bleiben Links zu amtlichen Prüfstellen, keine erfundenen Geldzuschläge.

## P1-R8 – Datenschutz, Nutzertests und Barrierefreiheit

Technische Vorprüfung: npm run privacy:technical-check und npm run legacy:check. Sie prüfen statisch fehlende eingebettete Netzwerk-/Drittmedien-Technik, Opt-in bei lokaler Speicherung, Löschung und eindeutige Controller-Funktionen. Browser-E2E prüfen 320/390 Pixel, Axe, Tastatur und Offline-Import/Export.

Vor einer öffentlichen Freigabe sind weiterhin **echte 6–8 nicht eingewiesene Testpersonen** und eine unabhängige Datenschutz-/Rechts-/Accessibility-Prüfung nötig. Acht Aufgaben: Beispieldatenplan; unbekannte versus Null-Kosten; Kita-Verschiebung; Lebensmonatsanspruch gegen tatsächliche Bankzahlung; doppelte Versicherungskosten vermeiden; Suche abbrechen/Variante anwenden; Export/Löschung; Screenreader/200 %-Zoom/Touch. Protokoll: synthetische Daten, Erfolg, Verständnismängel, Fehler, erneuter Test. Keine echten privaten Testergebnisse im Repository.

Betreiber/Impressum, verantwortliche redaktionelle Stelle, Datenschutz und Produktionsfreigabe bleiben externe Entscheidungen.

## P2 – alte Controller entfernen

Zuvor überschattete alte Versionen von evaluate, builderSchedule, renderInputs, ptNet, renderPlus, renderAll, persist, restore, downloadCsv, downloadJson und importJson wurden entfernt. Der statische Check meldet nun **96 eindeutige Controller-Funktionen**, keine aktiven alten Speicher-Lesepfade. Offline-Single-HTML und ausdrücklich gewählte lokale Speicherung bleiben erhalten.

## Verifikation und Freigabestopp

Auszuführen: npm test, npm run test:e2e, npm run search:micro-proof, npm run maternity:check, npm run independent-cases:check, npm run privacy:technical-check, npm run roadmap:check und npm run release:check.

Der letzte Befehl soll **BLOCKED** melden, bis unabhängige Berechnungs-, Rechts-, Datenschutz- und Nutzerreviews sowie eine gesonderte Betreiberentscheidung tatsächlich vorliegen. Technischer Commit, grüne Regression und Quellenmetadaten dürfen diese Freigabe nicht ersetzen.

## Abnahmeprotokoll des V3.14-Feature-Zweigs

Technische Regression am 17.10.2026 im isolierten MCP-Workbench-Projekt:

- npm test: **375/375** Node-/DOM-Tests bestanden (neue Module, Quellen- und Roadmapchecks eingeschlossen).
- Chromium-Browser-Gesamtlauf: **39/39** Tests bestanden, inklusive Desktop- und Mobil-Accessibility, aller bisherigen V3.8-V3.13-Fälle und drei V3.14-Fälle.
- Direkte file://-Regression der drei V3.14-Browserfälle: **3/3** bestanden.
- Der erste gleichzeitig mit der Node-Suite ausgeführte volle Browserlauf erreichte einmal das 120-Sekunden-Zeitlimit im Desktop-Axe-Test. Der isolierte Desktop-Test bestand anschließend nach rund 42 Sekunden; die vollständige Wiederholung ohne parallele Node-Last bestand 39/39. Der ursprüngliche Timeout wurde also nicht als erfolgreiche Abnahme gewertet.
- Quellen-, Mutterschutz-, unabhängige Familienmatrix-, Legacy-, technische Privacy- und 256er-Mikro-Suchraumchecks bestanden mit expliziten weiterhin offenen Fachstatus.
- Release-Check: erwartungsgemäß **BLOCKED**. Recht, externe Elterngeld-Netto-Referenzen, externe Datenschutz-/Nutzerreviews und Betreiberfreigabe bleiben ausstehend.

Automatisches Axe ist keine manuelle Screenreaderprüfung. Softwaretests ersetzen keine amtliche Bewilligung, keine persönliche Steuerauskunft und keine unabhängige Rechtsentscheidung.
