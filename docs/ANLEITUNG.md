# Elternzeit-Zielplaner 2027 – Version 3.1.0

**Stand der Quellen:** 14. Oktober 2026 · **Offline im Browser** · **Rechtsraum:** Bundesrecht + exemplarisch NRW/Köln, Bayern, Sachsen.

## Start

Die Datei `Elternzeit_Zielplaner_2027_v3_1.html` in einem aktuellen Webbrowser öffnen (Doppelklick). Es wird kein Server benötigt und keine Daten an einen Dienst übertragen. Die Planwerte liegen im lokalen Browser und können mit **Plan speichern** als JSON exportiert und mit **Plan laden** wiederhergestellt werden. **CSV** gibt Einkommen, Kindalter, Bezugsart, Stunden und Kosten pro Lebensmonat aus.

## Eure Ausgangswerte

- Voraussichtliche Geburt am 28.05.2027, Wohnort Köln (NRW)
- Beide Eltern etwa 4.000 € brutto pro Monat, Steuerklasse IV/IV
- Auszahlungsnetto jeweils beispielhaft 2.600 €; Elterngeld-Netto ebenfalls nur ein vorläufiger Näherungswert
- Der Vater soll möglichst viel Betreuung übernehmen; Beispielkontingent: Mutter zwei Monate Mutterschutz, Vater zwölf Monate Basiselterngeld
- Kindergeld wird mit **259 € geltendem Wert 2026** gerechnet; 267 € für 2027 sowie 272 € für 2028 können im Rechner als **Gesetzentwurf-Szenario**, nicht als geltendes Recht, ausprobiert werden.

## Bedienung

1. **01 Eingaben**: Tatsächliches Netto und insbesondere elterngeldrechtliches Netto getrennt pflegen; Teilzeit-Netto bei 28 Stunden eintragen.
2. **12 Zielsuche**: Betreuung bis zum gewünschten Kindesalter, Mindestmonate Vater, maximales gemeinsames Freihaben und optional ein Mindestbudget wählen. Zwischen höchstem Gesamteinkommen, maximaler Vaterzeit, stabilstem Monat und ungünstigem Szenario wählen. Mit **Plan übernehmen** wird ein Ergebnis in den editierbaren Monatsplan kopiert.
3. **04 Konfigurator / 05 Zeitplan**: Dauer beider Eltern getrennt setzen und bei Bedarf einzelne Lebensmonate auf Basis (B), Basis + Teilzeit (BT), Plus (P), Plus + Teilzeit (PT), Bonus (PB), nur Teilzeit (TZ), unbezahlte Elternzeit (EZ) oder Vollzeit (V) setzen. Individuelle Wochenstunden pro Lebensmonat sind möglich.
4. **13 Robustheit**: Pessimistische, zentrale und optimistische Bandbreite verändern. Die Szenarien rechnen Teilzeitlöhne, die Elterngeld-Nettobasis und Kita-Kosten gleichzeitig neu.
5. **14 Wohnort**: Einzelgeburt/Mehrlinge, NRW/BY/SN/andere, Beginn Betreuung und tatsächliche Kita-Kosten prüfen. **Kölner 2025-Gebühren** sind nur optionales historisches Vergleichsszenario, abhängig vom Kindesalter, der gewählten Betreuungsdauer (25/35/45 h) und dem kommunal maßgeblichen Jahreseinkommen. Essen kommt gesondert hinzu. Es handelt sich **nicht** um eine garantierte 2027er Gebühr. Andere Länder erfordern eine manuelle Anspruchsprüfung.
6. **15 Recht & Marktvergleich**: Gesetzliche Quellen, versionsgebundene Gültigkeitsmarker, Wettbewerbsbeschreibungen und offene Grenzen überprüfen.

## Was der Algorithmus leistet – und was nicht

Die Zielsuche erzeugt **strukturierte Kandidaten** (inzwischen auch ungerade Basis- und Plus-Monatszahlen, 2–4 Bonusmonate), bewertet sie an den eingegebenen Kriterien und filtert nach modellierten Standardregeln. Das ist **keine vollständige mathematische Suche** über sämtliche denkbaren Monatskombinationen und keine Bewilligungsentscheidung. Eine als plausibel markierte Variante kann von einer Elterngeldstelle wegen weiterer individueller Tatbestände anders beurteilt werden.

Die Finanzrechnung ist eine **Planungsschätzung**, keine Amtssimulation: Mutterschaftsleistungen werden für den regulären 56-Tage-Fall taggenau innerhalb der Lebensmonate angenähert; Teilzeit-Einkommen wird pro Leistungsart für die Elterngeldberechnung separat gemittelt. Netto-Umrechnungen zwischen 28 Stunden und anderen Stunden sind linear angenähert und sollten durch Arbeitgeber-/Elterngeld-Netto-Werte ersetzt werden. Kindergeld wird trotz kalendermonatlicher Auszahlung vereinfachend Lebensmonaten zugeordnet.

**Nicht automatisch berechnet** werden u.a. Steuerprogressionsvorbehalt und mögliche Nachzahlungen, Kirchensteuer-Sonderfälle, KV-Beiträge während Elternzeit, Sonderzahlungen und Bemessungsperiodenverschiebungen, Geschwister-/Mehrlings-/Frühgeburten- oder Behinderungszuschläge, Mischeinkünfte/Selbstständigkeit, Früh-/Mehrlings-Mutterschutz, Sozialleistungen wie Kinderzuschlag und Wohngeld, zukünftige Rechtsänderungen und verbindliche Kita-Tarife 2027/28. Bei Mehrlingen und beim Überschreiten der zvE-Grenze sperrt der Zielalgorithmus bewusst das Standardmodell.

Für **Köln/NRW mit Einzelgeburt** ist auf Basis der recherchierten amtlichen Quellen keine allgemeine zusätzliche laufende NRW-Geldleistung hinterlegt. Der NRW-Drillingsbonus beträgt nach dem veröffentlichten Erlass 1.000 € je Kind einmalig, sofern die spezifischen Voraussetzungen vorliegen; ohne bestätigten Anspruch wird nichts automatisch hinzugerechnet. Bayerisches Familiengeld fällt für Kinder mit Geburtsdatum ab 01.01.2025 weg; sächsisches Landeserziehungsgeld ist individuell einkommens- und betreuungsabhängig.

## Verglichene Rechner

Der **amtliche Elterngeldrechner mit Planer** bietet bereits Monatsaufteilung, Zulässigkeitsprüfungen, Teilzeiteingaben und einen Familienfinanzüberblick – diese Merkmale sind keine einzigartigen Lücken. Auch private Anbieter wie ElterngeldOptimierer und Elterngeldpilot werben mit automatischer Optimierung. Unser ergänzender Fokus ist die **zielbasierte Betreuungsvorgabe mit Mindestmonatsbudget, Robustheitsrechnung, integrierter Alters-/Kita-Kostenplanung und datiertem Quellenregister** in einer lokal nutzbaren Datei. Die Gegenüberstellung beruht auf veröffentlichten Funktionsbeschreibungen, nicht auf einem vollständigen technischen Audit der Konkurrenzprodukte.

## Rechtsquellen, Quellenstand und QA

Siehe `Elternzeit_Rechtsregeln_2026-10-14_v3_1.json` mit Links je Regel. Einige Einträge nennen das Datum der **zugrunde gelegten Regelfassung**; dies ist ausdrücklich keine vollständige rechtswissenschaftliche Norm-Historisierung jeder Einzelklausel. Aktuelles Landesrecht für eine tatsächliche Geburt 2027 ist **vor Antragstellung erneut zu bestätigen**. Testergebnisse stehen in `Elternzeit_QA_Bericht_v3_1.json` (Browser- und Rechentests); positive Tests ersetzen nicht die sachliche Bearbeitung durch die Elterngeldstelle.

**Relevante amtliche Links:**

- Bundes-Familienportal, amtlicher Planer: https://familienportal.de/familienportal/meta/egr
- BEEG § 4: https://www.gesetze-im-internet.de/beeg/__4.html
- BEEG § 4b: https://www.gesetze-im-internet.de/beeg/__4b.html
- BEEG § 2: https://www.gesetze-im-internet.de/beeg/__2.html
- Stadt Köln, Kita-Gebühren: https://www.stadt-koeln.de/service/produkte/00405/index.html
- NRW, Mehrlingsgeld: https://recht.nrw.de/lrmb/bekanntmachung/01012019-bekanntmachung-der-einfuehrung-einer-ehrenpatenschaft-des/
- Bayern, Familiengeld: https://www.zbfs.bayern.de/familienleistungen/familiengeld/
- Sachsen, Landeserziehungsgeld: https://revosax.sachsen.de/vorschrift/5132.11

Alle Angaben vorbehaltlich des zur tatsächlichen Geburt und Antragstellung gültigen Rechtsstands.

## V3.3-Ergänzung

Beginne mit „Eure Daten“ und bestätige den unterstützten Standardfall ausdrücklich. Trage das gemeinsame zu versteuernde Einkommen des Kalenderjahres vor der Geburt ein. Zukunftskohorten ohne bestätigten Quellenstand bleiben vorläufig. Unter „Zeitachsen“ können mehrere arbeitsrechtliche Abschnitte, Arbeitsstunden und Leistungsarten unabhängig geändert werden. Die separaten Arbeits-/Leistungsmonate verändern die Einkommensprojektion; Kalender-Elternzeit allein tut dies nicht. Tatsächliche Zahlungen werden separat als Bankbuchungen erfasst.

„Ziele & Varianten“ zeigt bis zu drei unterschiedlich begründete Vorschläge aus begrenzten Vorlagen. Eine leere Ergebnismenge ist möglich. Bei Robustheit muss das Mindestbudget im vorsichtigen Fall halten. Der Budgetbereich zeigt notwendige Anfangsrücklagen aus kumulierten Fehlbeträgen; verspätete Bankzahlungen sind damit nicht prognostiziert.

Lokales Speichern muss ausdrücklich aktiviert werden. „Lokale Daten löschen“ entfernt Browserkopien aller bekannten Planversionen. Der geöffnete Plan bleibt bis zum Schließen erhalten. JSON-Export/-Import enthält Finanzdaten und sollte privat aufbewahrt werden. Historische Kölner Tarife und unbestätigte Zusatzleistungen sind Informationen, keine automatisch addierten Ansprüche.
