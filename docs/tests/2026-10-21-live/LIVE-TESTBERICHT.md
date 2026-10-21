# Elternzeit-Zielplaner: erneuter Live-Test des ausgerollten Stands

> Einordnung dieser Repo-Kopie: Der Bericht und seine vier Belege gelten ausschließlich für Live-Commit `e5c085bc32b6ac2146ba6540ea0dd965e6cf22f8`, Deployment-Lauf `39550095252`. Sie belegen nicht den Design-PR-HEAD. Interne Übergabeangaben wurden für die Repo-Kopie neutralisiert; historische Vergleichskennungen, Testergebnisse und Einschränkungen bleiben unverändert. R01–R03 sind redaktionelle Folgepunkte und werden in diesem Design-PR nicht im UI umgesetzt.

## Ergebnis für den Design-PR

**Die erneut geprüften Kernabläufe funktionieren im Desktop-Live-Browser. Der wichtigste Fehler vom 20. Oktober ist im jetzigen Test nicht mehr reproduzierbar:** Das Jahres-zvE kann oberhalb 100.000 Euro eingegeben werden. Exakt 175.000 Euro bleibt im synthetischen Standardfall technisch plausibel; 175.000,01 Euro und 180.000 Euro führen zum ausgewiesenen Einkommens-Regelkonflikt. Auch die Trennung zwischen Einnahmen vor Kosten und Rest nach Kosten ist in den zentralen geprüften Ansichten jetzt wesentlich eindeutiger.

Schnellstart, alle fünf Vorlagen, eigene Planung, Monatsänderung, 32-/33-Stunden-Prüfung, Zielsuche, ausdrückliche Übernahme, JSON-/CSV-Export, beschädigter Import und gültiger Roundtrip wurden erneut live getestet. Der Hauptfall stimmt in Monatsdetail, CSV, Cashflow und Robustheitsanzeige überein. **Dies ist keine fachliche, rechtliche, datenschutzrechtliche oder vollständige Accessibility-Freigabe.**

Ein redaktioneller Restpunkt ist sichtbar: Die ElterngeldPlus-Erklärseite fragt noch „Was landet monatlich auf eurem Konto?“, obwohl die angezeigten Beträge Modelleinnahmen und keine datierten Zahlungseingänge sind. Die Fachansichten enthalten außerdem weiterhin dynamisch unpassende Formulierungen wie „Testperson Alpha bist …“ und teilweise geschlechtlich festgelegte Texte.

**Abgrenzung der Prüfung:** Dieser Bericht dokumentiert ausschließlich den unten bezeichneten Live-Stand. Während dieses Live-Tests wurden kein Repository geändert, kein Commit erstellt, kein PR bearbeitet, kein Merge und kein Deployment ausgelöst. Ein späterer PR-HEAD wurde nicht unabhängig mit dem Live-Stand abgeglichen. Die Ablage dieses Berichts im Design-PR ist keine Prüfung oder Freigabe des PR-HEADs.

## Tatsächlich getesteter Stand

Der erneute interaktive Test fand am **21. Oktober 2026 ungefähr von 07:49 bis 07:55 Uhr deutscher Ortszeit** statt. Getestet wurden der [öffentliche Rechner](https://codeelchi.github.io/elternzeit-zielplaner/) und die verlinkte [Familienstart-Seite](https://codeelchi.github.io/elternzeit-zielplaner/start.html).

| Live angezeigte Kennzeichnung | Im aktuellen Test abgelesener Wert |
|---|---|
| Preview | Öffentliche Testvorschau; kein amtlicher Elterngeldrechner; nur fiktive Daten |
| Paket | `3.10.0` |
| Rechtsquellenstand | `15.10.2026` |
| Code-Commit | `e5c085bc32b6ac2146ba6540ea0dd965e6cf22f8` |
| Deployment-Lauf | `39550095252` |
| Freigabe | Keine Fach- oder Produktfreigabe |
| Zusätzliche Einordnung | V3.15/V3.16 sind historische Funktionsbereiche, nicht der gesamte Build |

Beide geöffneten Seiten zeigten dieselben Commit-/Deployment-Angaben. Nach Reset und erneutem Laden zeigte der Rechner weiterhin dieselben Identifikatoren. Die Seiten verlinken den [Commit](https://github.com/Codeelchi/elternzeit-zielplaner/commit/e5c085bc32b6ac2146ba6540ea0dd965e6cf22f8) und den [Deployment-Lauf](https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/39550095252). Das sind **live abgelesene Seitenauszeichnungen**, keine unabhängig verifizierte Pipeline-Attestierung oder bestätigte Identität mit dem späteren PR-HEAD.

Der Bericht vom **20.10.2026** betraf dagegen Commit `71a45eec251b6dd93b489a748d282792fee14856` und Lauf `39401843893`. Seine Ergebnisse dienen nur als Vergleich. Sie sind nicht der aktuelle Testnachweis.

## Aussagekraft der Prüfung

**Live bestanden** heißt: Die beschriebenen Schritte wurden in der neu geöffneten Live-Anwendung ausgeführt und das Ergebnis kontrolliert. **Teilprüfung** heißt: Nur die ausdrücklich genannten Aspekte wurden geprüft. **Offenes Gate** heißt: Es gibt keine positive Abnahme. Eine angezeigte Laufzeit, Mustermenge oder fachliche Plausibilitätsklassifikation ist eine Ausgabe des Produkts, nicht automatisch eine unabhängige Bestätigung ihrer inhaltlichen Richtigkeit.

Bedient wurde ein Desktop-Browser. Screenshots sind 1265 × 649 Pixel groß; die DOM-Abfrage meldete 1280 × 649 Pixel inneren Bereich einschließlich Scrollbar und 1265 Pixel Dokumentbreite. Es wurden keine echten Smartphones, keine kleine mobile Breite, keine Safari-/Firefox-Matrix und kein Screenreader getestet. Der verfügbare Browserzugang bot keine hier verwendbare Viewport-Emulation; ein Mobile-PASS wird nicht behauptet.

Die meisten Aktionen liefen über beschriftete Felder und Schaltflächen. Für Datumsfelder sowie einzelne reaktiv neu gerenderte Werte wurden beobachtete DOM-Eingabefelder gesetzt und deren `input`- oder `change`-Ereignisse ausgelöst. Die Übernahme wurde anschließend in anderen Ansichten bzw. Exporten geprüft. **Keine internen Berechnungsfunktionen und keine internen Zustandsobjekte wurden aufgerufen oder verändert.** Beim Monats-Arbeitsnetto und nachgeburtlichen EG-Netto war das `change`-Ereignis für die Übernahme erforderlich; ein bloßes `input` blieb nicht erhalten. Daraus wird kein Produktfehler abgeleitet, sondern eine Grenze der Eingabemethode dokumentiert.

Werkzeugunterbrechungen wurden nach Zustandserfassung fortgesetzt. Insbesondere war der gültige Import trotz einer Werkzeugunterbrechung bereits ausgeführt; er wurde nicht wiederholt. Dynamische Feldnamen nach Umbenennung der Testpersonen verursachten zwei zunächst erfolglose Selektorzugriffe; die tatsächlichen neuen Beschriftungen wurden danach verwendet. Auch das ist kein belegter Produktdefekt.

## Nur erfundene Daten

Es wurden keine echten Familien-, Geburts-, Einkommens-, Gesundheits-, Versicherungs-, Arbeitgeber-, Konto- oder Dokumentdaten eingegeben. Die frei erfundene Buchung ist ein lokaler Testdatensatz, keine Bankverbindung oder ausgeführte Zahlung. Die importierte Datei wurde in dieser Sitzung aus diesen Testdaten erzeugt.

| Hauptfall | Synthetischer Wert |
|---|---|
| Geburtstag | 17.06.2026 |
| Bezeichnungen | Testperson Alpha / Testperson Beta |
| Auszahlungsnetto | 3.100 / 2.400 Euro monatlich |
| Separates EG-Netto vor Geburt | 2.800 / 2.200 Euro |
| Haushalt | 2.800 Euro monatlich |
| Bestätigte Modellkonstellation | Zwei abhängig beschäftigte Eltern, reguläre Einzelgeburt, gemeinsamer Haushalt, keine Sonderfälle |
| Jahres-zvE | 68.000 Euro außerhalb der Grenztests |
| Betreuungsziel | 18 LM |
| Plan / Vergleich | 36 LM / 24 LM |
| Kita | Ab LM 19, 300 Euro monatlich; NRW/Köln als Testszenario |
| Individuelle Dauer | Alpha ab LM 3 für 16 Monate |
| LM 3 | Alpha Plus + Teilzeit, 28 Stunden, 1.700 Euro Arbeitsnetto, 1.550 Euro EG-Netto nach Geburt |
| Testbuchung | 875 Euro, 20.08.2026, Kategorie Elterngeld |
| Zahlungserwartungen | 950 Euro Eingang 21.08.2026; 1.200 Euro Ausgabe 25.08.2026; 30 Tage Verzögerung |
| Zielsuche | 500 Euro Mindestrest je LM, beide Aufteilungen, höchster Gesamtrest, höchstens 2 gemeinsame volle Auszeitmonate, Teilzeit zulassen, Betreuung ganz frei bis Zielalter |

Zusätzlich wurden 0 / 100.000 / 100.001 / 174.999,99 / 175.000 / 175.000,01 / 180.000 Euro Jahres-zvE, −1 Euro Schnellstart-Netto, 32/33 Stunden sowie Geburtstage 31.05.2027, 31.01.2026 und 20.05.2026 geprüft. Nach der Suchübernahme wurde für den Fachwert-Erhaltungstest das Auszahlungsnetto Alpha bewusst auf **3.200 Euro** geändert; diese spätere Variante ist nicht die Grundlage der zuvor gesicherten Hauptfall-Exporte. Für die anschließende Kita-Teilprüfung galten ebenfalls 3.200 Euro.

## 1. Einstieg, Vorlagen und Navigation

| ID | Schritte und Erwartung | Beobachtetes Ergebnis | Status |
|---|---|---|---|
| N01 | Neu öffnen, Preview, Build und Speicherzustand lesen | Aktueller Build wie oben; `DATEN_UNVOLLSTAENDIG`; Speichern aus; lokale Schlüssel leer | Live bestanden |
| N02 | Leeres Schnellstartformular berechnen | „Bitte einen gültigen Geburtstermin eintragen.“ | Live bestanden |
| N03 | Alle fünf Beispielvorlagen einzeln laden | Jeweils eigene Zusammenfassung, Zeitraum und Einschränkungen; siehe Tabelle unten | Live bestanden für Laden/Einordnung |
| N04 | Hauptfall mit eigenen Testzahlen berechnen | Angepasstes Beispiel; Betreuungslücke und abweichender Vorlagenzeitraum bleiben sichtbar | Live bestanden |
| N05 | −1 Euro Monatsnetto berechnen | „Bitte einen gültigen Eurobetrag von 0 bis 100.000 eingeben.“ | Live bestanden für Abweisung |
| N06 | Fachansichten einblenden und alle 16 Menüpunkte öffnen | Alle 16 erreichbar; kein toter Navigationspunkt beobachtet | Live bestanden für Erreichbarkeit, nicht alle Unterfunktionen |

Die fünf unveränderten Vorlagen lieferten erneut diese Anzeigen:

| Vorlage | Zeitraum | Niedrigste Einnahmen vor Kosten / LM | Einnahmen vor Kosten gesamt | Betreuung |
|---|---:|---:|---:|---|
| Klassisch: 12 + 2 Monate | 14 LM | 4.549,00 € | 65.384,66 € | Rechnerisch ja |
| 18 Monate zu Hause | 18 LM | 2.859,00 € | 76.820,66 € | Rechnerisch ja |
| ElterngeldPlus & Teilzeit | 18 LM | 4.549,00 € | 88.900,66 € | Lücke ab LM 11 |
| Gemeinsam aufteilen | 14 LM | 4.549,00 € | 65.384,66 € | Rechnerisch ja |
| Früher zurück in den Beruf | 14 LM | 4.549,00 € | 74.484,66 € | Lücke ab LM 5 |

Die Werte stimmen mit den dokumentierten Vorlagenausgaben vom 20.10. überein. Das belegt eine Anzeige-Regression, keine amtliche Euro-Sollprüfung. Bei fehlenden Ausgaben werden ausdrücklich Einnahmen statt frei verfügbarem Budget ausgewiesen.

Beim angepassten Hauptfall auf Basis „Früher zurück in den Beruf“ erschienen über 18 LM **1.659,00 Euro niedrigster Rest** und **50.553,61 Euro Gesamtrest nach eingegebenen Kosten**. Die Anwendung erklärte, dass die Vorlage 14 LM umfasst und nicht automatisch auf das 18-LM-Ziel verlängert wurde.

Alle geöffneten Fachansichten: Überblick, Grundlagen, Modelle, Dauer & Aufteilung, Zeitplan, Zeitachsen, Cashflow, Monatsdetail, Vergleich, ElterngeldPlus, Nächste Schritte, Plan prüfen, Zielsuche, Robustheit, Leistungen vor Ort, Recht & Marktvergleich. Die zusätzlichen Fachmodelle wurden diesmal nur angezeigt, nicht alle einzeln geladen. Aufgabenstatus und ICS wurden diesmal nicht neu ausgeführt.

## 2. Jahres-zvE: früherer Blocker im aktuellen UI behoben

**Reproduktion:** Grundlagen bestätigen, in „15 Leistungen vor Ort“ jeweils den Jahreswert setzen, danach „12 Plan prüfen“ öffnen und Status lesen. Die Grenztests liefen mit Geburt 17.06.2026 und bestätigtem Standardfall. Das Feld wies nun eine explizite technische Obergrenze von `1000000000` aus.

| Eingabe | Feldübernahme / Fehler | Planprüfung |
|---:|---|---|
| 0 € | Übernommen; kein Feldfehler | `PLAUSIBEL_STANDARD` |
| 100.000 € | Übernommen; kein Feldfehler | `PLAUSIBEL_STANDARD` |
| 100.001 € | Übernommen; kein Feldfehler | `PLAUSIBEL_STANDARD` |
| 174.999,99 € | Übernommen; kein Feldfehler | `PLAUSIBEL_STANDARD` |
| 175.000 € | Übernommen; kein Feldfehler | `PLAUSIBEL_STANDARD` |
| 175.000,01 € | Übernommen; kein Feldfehler | `REGELKONFLIKT`, `BE-2025`, gemeinsame Anspruchsgrenze überschritten |
| 180.000 € | Übernommen; Regelprüfung erreichbar | `REGELKONFLIKT`, `BE-2025`, gemeinsame Anspruchsgrenze überschritten |

**N07: Live bestanden.** Der aktuelle UI-Pfad reproduziert den alten 100.000-Euro-Blocker nicht. Exakt/über 175.000 wird im geprüften Modell unterschieden. Der Status „plausibel“ ist ausdrücklich keine Gesamtbewilligung.

Nicht getestet wurden hier die Import-Grenzwerte, die gesamte historische 200.000-Euro-Kohorte, alle April-/Mai-Stichtage, einzelne Berechtigte gegenüber zwei Berechtigten und die technische Maximalgrenze. Der UI-Test ist keine vollständige Abnahme der BEEG-Versionierung.

## 3. Planung, Monatswerte und Regelstatus

**N08 – Dauer und unbezahlte Zeit: Live bestanden.** Alpha auf 16 Monate ab LM 3 setzen und „Meine Aufteilung berechnen“ betätigen. Der Zeitplan zeigte Basis bis LM 14 und unbezahlte Elternzeit in LM 15–18. Zusätzliche Auszeit wurde nicht pauschal zu zusätzlichen Geldmonaten.

**N09 – Einzelmonat: Live bestanden.** LM 3 auf Plus + Teilzeit, 28 Stunden, 1.700 Euro Arbeitsnetto und 1.550 Euro EG-Netto nach Geburt setzen. Nach überprüfter `change`-Übernahme blieben diese Werte im Monatsdetail und Export erhalten. Der JSON-Monat enthält `f: T`, `hf: 28`, `wf: 1700`, `ef: 1550`; LM 4 blieb Basis, LM 15–18 blieben unbezahlt.

**N10 – Monatsdetail: Live bestanden für Konsistenz.** Alpha-Lohn 1.700 Euro, Alpha-EG 793 Euro, Beta-Lohn 2.400 Euro, Beta-EG 0 Euro, Kindergeld 259 Euro; zusammen **5.152 Euro Modelleinnahmen**, nach Haushalt **2.352 Euro**. Dieselben Beträge stehen in der CSV. Die 793 Euro sind kein unabhängig amtlich bestätigter Betrag.

**N11 – Stunden: Live bestanden für die getesteten konstanten Monatswerte.** Bei 32 Stunden blieb der Standardstatus plausibel. 33 Stunden erzeugten `REGELKONFLIKT`, `BE-32`, Alpha, LM 3 und den Hinweis auf höchstens 32 Stunden im Lebensmonatsdurchschnitt. Danach wurden 28 Stunden wiederhergestellt. Wechselnde Wochenstunden und die gesonderte Elternzeit-Durchschnittsregel sind nicht geprüft.

**N12 – Abweichender Haushalt: Live bestanden für Kennzeichnung.** „Unsere Konstellation weicht ab / noch unklar“ führte zu `NICHT_UNTERSTUETZT` und „Fall außerhalb des bestätigten Standardmodells“. Anschließend wurde der Standardfall wiederhergestellt.

**N13 – Geburt 31.05.2027: Live bestanden für Vorsichtshinweis.** Angezeigt wurden „Nur unverbindliche Zukunftsprognose“, `NICHT_UNTERSTUETZT`, außerhalb der Standardkohorte und Rechtsstand nach Quellenprüfjahr nicht bestätigt. Dies wird als Produktunterstützung verstanden, nicht als gesetzlicher Anspruchsausschluss. Eine PAP- oder §-2f-Implementierung wurde nicht geprüft.

**N14 – Geburt 31.01.2026: Teilprüfung.** Zeitachsen zeigten LM 1 31.01.–28.02.2026 und LM 2 01.03.–30.03.2026. Das entspricht der früher dokumentierten Produktanzeige. Diese vollständige LM-Folge erhält hier ausdrücklich **keine rechtliche Richtigkeitsfreigabe**; die Vergleichsmatrix gibt dafür kein vollständiges amtliches Soll vor.

**N15 – Geburt 20.05.2026: Beobachtung, Fach-Gate offen.** Die aktuelle Zeitachse zeigte Schutzfrist nach Geburt **20.05.2026 bis 15.07.2026**, erläutert als 56 Tage nach Geburt zuzüglich Geburtstag. LM 1: 31/31 Tage; LM 2 20.06.–19.07.: 26/30 Tage als Mutterschutz markiert. Daraus wird weder ein amtlicher Endtag noch eine freigegebene Geldanrechnung abgeleitet. **Der Konflikt 14./15. Juli und fünf/vier Resttage wird nicht aufgelöst.**

## 4. Einnahmen, Kosten und Exportabgleich

**N16 – Cashflow/Vergleich/Robustheit: Live bestanden für die geprüfte Anzeige-Konsistenz.** Cashflow und aktiver eigener Plan im Vergleich zeigten über 24 LM **110.784 Euro Einnahmen vor Haushalts- und Kita-Kosten**, niedrigste Einnahmen **2.659 Euro**, vier Einnahmenmonate unter 2.800 Euro Haushaltsausgaben. Robustheit zeigte als realistischen Rest nach eingetragenen Kosten **41.784 Euro**, niedrigsten Rest **−141 Euro**, vorsichtig **15.050 Euro**, günstig **68.518 Euro**.

Die Beschriftungen sind gegenüber dem alten Bericht klar verbessert: Cashflow heißt „Modelleinnahmen“, Vergleich nennt „Einnahmen vor Haushalts- und Kita-Kosten“, der Kopfbereich „Rest nach eingetragenen … Kosten“. Im Monatsdetail wird ausdrücklich „nach Haushaltsausgaben, vor Kita-Kosten“ geschrieben. Die Zeitachsen verwenden ebenfalls „Modelleinnahmen vor … Kosten“. Der alte pauschale Befund „Budgetbegriff uneindeutig“ ist daher nicht unverändert als aktueller Fehler fortzuschreiben.

**N17 – JSON: Live exportiert und Datei geprüft.** `fileType=elternzeit-offline-v3`, Schema 1, Version 3.10.0, Rechtsstand 2026-10-15, Exportzeit `2026-10-21T05:52:02.814Z`. 36 Planmonate, getrennte Nettoarten, fiktive Bezeichnungen und Testbuchung vorhanden. `storageConsent=false`; `legallyVerified=false`, `independentlyReviewed=false`, `publicReleaseApproved=false`. Der Export benennt den offenen Mutterschutzkonflikt und erklärt, dass JSON Eingaben, keine berechnete Einnahmen-/Restsumme enthält. Flüchtige Zahlungs- und Kita-Szenarien sind nicht enthalten.

**N18 – CSV: Live exportiert, unabhängig mit Python/Decimal geprüft.** 36 Datenzeilen, Semikolon-Trennung. Einnahmensumme LM 1–24 **110.784 Euro**, Rest nach Kosten **41.784 Euro**. Für **36/36 Zeilen** galt:

`Familieneinkommen − Kita_Kosten − 2800 = Frei_nach_Kosten`

Für **36/36 Zeilen** entsprach außerdem die Summe der sechs Komponenten Netto Vater, Netto Mutter/Mutterschutz, EG Vater, EG Mutter, Kindergeld und Sonderzahlung dem Familieneinkommen. LM 3 stimmt mit dem Monatsdetail überein. Das sind Export- und Additionsprüfungen; die einzelnen gesetzlichen Leistungsbeträge werden dadurch nicht fachlich bestätigt.

Die unabhängige Prüfung nutzte `csv.DictReader(..., delimiter=';')`, `json.loads(...)` und `decimal.Decimal`, mit Assertions für 36 Zeilen, 36 JSON-Monate, beide Identitäten und Summenbildung über `rows[:24]`. Es wurde kein Anwendungscode ausgeführt oder nachimplementiert. Die CSV kennzeichnet `Amtliche_Freigabe=NEIN` und `Mutterschutz_Referenz=4_oder_5_Resttage_offen`.

## 5. Buchung, Liquidität und Import

**N19 – Fiktive Buchung: Live bestanden.** 875 Euro am 20.08.2026 erfassen. Die Übersicht zeigte August 2026 mit 875 Euro erfassten Ein-/Ausgängen. Ohne ausdrückliche Anfangsrücklage blieb ein Rechensaldo „Nicht berechnet“. Die Buchung steht separat im JSON-`bankLedger`; keine Bank wurde verbunden.

**N20 – Verzögerte Zahlungserwartung: Live bestanden für den einfachen Test.** 950-Euro-Eingang am 21.08., 1.200-Euro-Ausgabe am 25.08., 30 Tage Verzögerung. Eingang im Szenario am 20.09.2026. Theoretische Zwischenfinanzierung pünktlich **250,00 Euro**, verspätet **1.200,00 Euro**, Änderung **950,00 Euro**. Ohne Anfangsrücklage wird keine tatsächliche Konto-Unterdeckung behauptet. Die vorhandene 875-Euro-Buchung blieb getrennt.

**N21 – Beschädigtes JSON: Live bestanden für Abweisung und kontrollierte Stichprobe des Erhalts.** Synthetische Datei mit absichtlich unvollständiger JSON-Syntax über das Datei-UI wählen. Alert: „Die Datei enthält kein gültiges JSON … Der bisherige Plan bleibt erhalten.“ Nach Bestätigung blieben das zuvor gesetzte Januar-Datum im Kopfbereich, die 875-Euro-Buchung und die Zahlungserwartungen sichtbar. Kein vollständiger Hash-Vergleich des gesamten In-Memory-Plans wurde vorgenommen.

**N22 – Gültiger Roundtrip: Live bestanden.** Den in dieser Sitzung erzeugten Hauptfall-Export mit Buchung importieren. Sichtbare Bestätigung: „Import erfolgreich. Temporäre Zahlungs-, Kita- und Risiko-Szenarien wurden zurückgesetzt. Vorherige Browserkopien gelöscht.“ Wiederhergestellt: Juni-Datum, LM-3-Rest 2.352 Euro, Standardstatus und 875-Euro-Buchung. Zahlungserwartungen waren leer. Die Erfolgsmeldung ist im Desktopbeleg gesichert.

Größenlimits, fremde Schema-/Produktversionen, gezielt manipulierte vollständige Imports und alle optionalen Importfelder wurden nicht systematisch geprüft. Es wurden keine Injection-Payloads gegen die öffentliche Seite gesendet.

## 6. Zielsuche und Fachwert-Erhaltung

**N23 – Vollständige Zielsuche: Live bestanden für Ablauf und Ausgabe.** Im beschriebenen Hauptfall mit 500 Euro Mindestrest startete die Suche sichtbar; Fortschritt und Abbruchschaltfläche wurden angezeigt. Der bisherige LM-3-Rest blieb bis zur ausdrücklichen Übernahme 2.352 Euro.

Produktseitig gemeldetes Endergebnis: **167.636 unterschiedliche Muster**, **2.461 technisch und zur Betreuung plausible, nicht unabhängig freigegebene Vorlagen**, **drei materiell unterschiedliche Vorschläge**, **19,4 Sekunden gemessene Laufzeit**. Mustermenge und Klassifikation sind nicht unabhängig nachgezählt. Die Laufzeit ist kein Leistungsversprechen. Der frühere Lauf hatte 19,3 Sekunden; daraus folgt kein belastbarer Performancevergleich.

| Vorschlag | Realistischer Rest / 24 LM | Niedrigster realistischer Rest / LM | Volle Monate Alpha / Beta |
|---|---:|---:|---:|
| 1, Rest im Fokus | 47.191 € | 1.274 € | 2 / 16 |
| 2, Zeitaufteilung | 44.881 € | 559 € | 9 / 9 |
| 3, vorsichtiges Szenario | 46.861 € | 1.274 € | 3 / 15 |

Die Oberfläche erläuterte begrenzte Vorlagensuche, kein globales Optimum, fehlende unabhängige Freigabe und offene taggenaue Mutterschaftsanrechnung.

**N24 – Vorschlag 2 übernehmen: Live bestanden.** Die beobachtete Schaltfläche des zweiten Vorschlags betätigen. „Vorschlag 2 übernommen“, Wechsel in Cashflow, dort **113.881 Euro Einnahmen vor Kosten / 24 LM**, niedrigste Einnahmen **3.359 Euro**. Die unterschiedlichen Zahlen gegenüber der Karte sind explizit unterschiedlich beschriftete Vor-/Nach-Kosten-Größen, kein hier bewiesener Rechenfehler.

Suchabbruch wurde nicht betätigt; alle Optimierungsziele und Suchkombinationen wurden nicht getestet. Die frühere Suche ohne zvE wurde nicht neu wiederholt und erhält hier keinen aktuellen PASS.

**N25 – Fachwerte bei geändertem Schnellstart-Netto: Live bestanden für Abfrage und „beibehalten“.** Nach vorhandenem separatem EG-Netto bzw. Import Alpha-Auszahlungsnetto auf 3.200 Euro ändern und Schnellstart berechnen. Die Anwendung verlangte ausdrücklich die Entscheidung „beibehalten / als Schätzung ersetzen / löschen“. Ohne Auswahl erschien die Entscheidungsaufforderung. Mit „Bisherige Fachwerte unverändert beibehalten“ und erneutem Berechnen zeigten die Grundlagen **3.200/2.400 Euro Auszahlungsnetto und weiterhin 2.800/2.200 Euro EG-Netto**. Die Optionen „ersetzen“ und „löschen“ wurden nicht separat ausgeführt.

## 7. Kita-Szenario und Informationsseite

**N26 – Eingewöhnung: Live bestanden für die ausgewählte Szenarioanzeige.** Nach der späteren 3.200-Euro-Variante „2 Wochen später + 4 Wochen“, 28 Arbeitsstunden, 18 Euro angenommener Ersatzbetreuungspreis, 450 Euro Nettoausfall pro voll ausfallender Arbeitswoche, keine Zusatzbetreuung. Anzeige: Kita ab **31.12.2027**, volle Betreuung ab **28.01.2028**, **95 Stunden** rechnerisch unbetreut in sechs Übergangswochen; angenommene Mehrbelastung **1.527 Euro**, vollständig hypothetischer Einkommensausfall. Aufteilung in LM 19 und LM 20, Regelwoche ausdrücklich nur Vorschau. Keine fachliche Abnahme des gesamten Wochenmodells; der gemeinsame Wochenplan wurde nicht systematisch bearbeitet.

**N27 – Familienstart: Live Teilprüfung bestanden.** Dieselbe Buildkennzeichnung, Hinweis auf synthetische Daten, GitHub-Pages-Zugriffsprotokolle und fehlende Freigabe. Themenfilter nacheinander betätigt: Schwangerschaft, vor Geburt und erste Zeit zeigten jeweils die passenden zwei Themenkarten; „Alle Themen“ stellte alle sechs wieder her. Die ausgewählte Schaltfläche hatte jeweils `aria-pressed=true`, die anderen `false`. Unabhängige Beratungskarten blieben sichtbar.

Die Datenschutz-FAQ wurde geöffnet und erklärte lokale Rechnerverarbeitung, separat steuerbare Speicherung und fehlende Speicherung der Phasenauswahl. Beratungs-/Behördenlinks und Rechnerziele wurden als sichtbare Linkziele gelesen, nicht alle extern geöffnet oder inhaltlich erneut geprüft. Telefonlinks wurden nicht betätigt. Die Seite kündigt noch ausstehende Betreiber-/Impressumsangaben vor Veröffentlichung an; eine rechtliche Bewertung oder Freigabe wurde nicht durchgeführt.

## 8. Design und Accessibility: begrenzte positive Evidenz, offene Abnahme

**N28 – Desktopdarstellung: Teilprüfung.** Der gesicherte Screenshot zeigt lesbare Build-/Preview-Hinweise, Bedienkopf, Importbestätigung, Speicherhinweis und aktiven Tab. Die Fachnavigation hat einen eigenen horizontalen Scrollbereich; außerhalb des ersten sichtbaren Ausschnitts liegende Tabs waren über ihre Bedienelemente erreichbar. Ein vollständiger visueller Vergleich aller Ansichten, Breiten oder Zustände ist das nicht. Keine numerische Kontrastmessung.

**N29 – Fokus-Stichprobe: Teilprüfung bestanden.** Im Grundlagenformular den beobachteten Alpha-Bezeichnungsinput fokussieren; zweimal real `Tab` senden. Fokus wechselte nach Beta-Bezeichnung und danach zur Einkommens-Einstiegswahl. Für beide Folgezustände meldete die berechnete Darstellung eine **3px durchgezogene Kontur** in `rgb(138, 216, 199)`. Das belegt nur diese zwei Übergänge; keine vollständige Tastaturabnahme und kein Screenreader-Test.

**N30 – Konsolen-Stichprobe:** Eine Abfrage während der Zielsuche lieferte keine erfassten Fehlernachrichten (`returned=0`, `dropped=0`). Dies ist kein lückenloses Fehler-/Netzwerkmonitoring und kein Sicherheitsnachweis.

Offene Accessibility-Gates bleiben: vollständige Tastaturstrecke einschließlich Dialoge und Fokus nach Neurendering; Screenreader mit dynamischen Ergebnissen und Tabellen; Fehlerzuordnung und Vorlesen; mobile Touch-/Zahlentastatur; kleine Breiten und Reflow; 200-/400-Prozent-Zoom; Kontrastmessung; Browsermatrix. Es wurde kein automatisierter WCAG-/axe-Scan ausgeführt. Ein WCAG-Konformitätsurteil ist nicht möglich.

## Aktuell beobachtete Restpunkte

### R01 – Modelleinnahmen werden in der Plus-Erklärung noch als Kontogeld angekündigt

**Fundstelle:** „10 ElterngeldPlus“, Überschrift „Beispiel: Was landet monatlich auf eurem Konto?“ Darunter werden die pauschalen Monatsmodelle gezeigt. **Einordnung:** redaktionelle Inkonsistenz mittlerer Priorität, kein nachgewiesener Additionsfehler. Gerade die übrigen Ansichten trennen Modelleinnahmen, erwartete Zahlungen und tatsächliche Buchung inzwischen ausdrücklich. **Vorschlag für den Coder:** auch hier „Welche Modelleinnahmen ergeben sich je Lebensmonat vor Haushalts- und Kita-Kosten?“ o. ä. schreiben; keine Kontozusage.

### R02 – Dynamische Namen sind sprachlich nicht sauber integriert

**Fundstellen:** Modellkarten und Plus-Erklärung, etwa „Testperson Alpha bist …“, „Testperson Alpha übernimmst …“, außerdem „Sie arbeitet Vollzeit“. **Einordnung:** niedrige bis mittlere redaktionelle Priorität; kein Beweis für falsche Rollenberechnung. **Vorschlag:** konsequent dritte Person oder neutrale Elternteil-Bezeichnungen verwenden und Name/Rolle getrennt halten.

### R03 – Vergangenes Testdatum bleibt als „zukünftiges Datum“ beschrieben

**Fundstelle:** „16 Recht & Marktvergleich“ zeigte zum Hauptfall „Voraussichtliche Geburt Juni 2026“ und „Zukünftiges Datum, Änderungen möglich“, obwohl am 21.10.2026 getestet wurde. **Einordnung:** niedrige redaktionelle Priorität; die Zukunfts- und Kohortenwarnung ist nicht dasselbe. **Vorschlag:** neutral „Eingegebener Geburtstermin“ oder die Zeitrelation tatsächlich aus dem Prüf-/Kalenderdatum ableiten.

## Fach- und Freigabe-Gates bleiben offen

Die zugängliche Vergleichsmatrix vom 20.10. wurde gelesen und für diese Abgrenzung verwendet. Ihre amtlichen Quellen wurden in diesem Funktionstest nicht erneut recherchiert. Die folgenden Punkte sind deshalb **keine neu unabhängig bestätigten Rechtsbefunde** und keinesfalls durch grüne UI-Tests erledigt:

1. **Mutterschutz 14./15. Juli:** Der bekannte Portal-/Modellkonflikt für Geburt 20. Mai bleibt offen. Endtag je Leistungsart, vier/fünf Resttage, Leistungshöhe, Differenzanspruch, Basis-Monatsverbrauch und Rundung bedürfen unabhängiger fachlicher Entscheidung. Keine eigenständige Auflösung in diesem Bericht.
2. **Tagesnenner und Leistungsarten:** Der in der Matrix dokumentierte 7/31-Anker ist nicht durch diesen Live-Test vollständig gegen 28/29/30/31-Tage-Fälle, BAS-Ausnahme, Arbeitgeberzuschuss oder Mehrfachleistungen abgenommen. Die technische Tagesanzeige ist kein Euro-Sollorakel.
3. **Historische Kohorten:** April/Mai 2025 und die 200.000-Euro-Übergangsgrenze wurden nicht neu durchgeprüft. Das aktuelle 175.000-Euro-Grenzverhalten ersetzt diesen Test nicht.
4. **2027:** Produktprognose und gesetzlicher Anspruch müssen getrennt bleiben. Laut Vergleichsmatrix ist der PAP-Anker für Geburt 2027 nicht schlicht „PAP 2027“, und die verkündete §-2f-Verweisänderung ist eine eigene Versionsachse. Keine Implementierungsfreigabe durch die hier beobachtete Produktsperre.
5. **Monatsendgeburten:** Die komplette Folge für 31.01. bleibt separat fachlich abnahmebedürftig; die allgemeine BGB-Monatsendregel liefert nicht automatisch das vollständige BEEG-LM-Schema.
6. **Betragsreferenzen und Bemessung:** Amtliche vereinfachte Basis-/Plus-Beispiele D01–D03, Nettoermittlung, Sonderfälle, Progressionsvorbehalt und Sozial-/Versicherungslogik wurden nicht unabhängig abgenommen.
7. **Bescheidstatus:** Vorläufigkeit, endgültige Festsetzung und Widerrufsvorbehalt sind nicht vollständig getestet. Es wurde kein echter Bescheid genutzt und kein vollständiger amtlicher Bescheid-Goldstandard behauptet.
8. **Öffentliche Freigabe:** Fach-, Rechts-, Datenschutz-, Betreiber-/Impressums- und Nutzertest-Gates sowie Accessibility bleiben eigenständige Entscheidungen. Ein PR kann diese Testdokumentation aufnehmen, ohne daraus eine Produktfreigabe abzuleiten.

## Nur gemeldet, nicht durch diesen Test bewiesen

| Aussage | Herkunft / Status |
|---|---|
| Die Seite wurde soeben mit aktuellem Stand neu ausgerollt | Meldung des Owners; abgelesener Live-Stand oben bestätigt, Deployment-Prozess nicht ausgeführt |
| Der Design-PR wird gerade erstellt | Auftragskontext; PR-Nummer, Branch und HEAD hier nicht geprüft |
| Paket-/Rechtsstand und Commit-/Deployment-Zuordnung | Seitenauszeichnung; keine Pipeline-Attestierung |
| Anzahl plausibler Suchmuster und Suchdauer | In diesem Lauf sichtbare Produktausgabe; nicht unabhängig vollständig nachgerechnet |
| Amtliche Quellen und ungeklärte Referenzfälle der Vergleichsmatrix | Dokumentierter Vorbefund vom 20.10.; keine neue Rechtsrecherche |
| „Ohne Telemetrie“, lokale Verarbeitung, keine externen Ressourcen | Sichtbare Produktangaben; kein vollständiger Netzwerk-/Datenschutz-Audit |
| Frühere ICS-/Aufgaben-, Zusatzkosten- und Fachmodell-Einzelergebnisse | Nur im Bericht vom 20.10.; kein aktueller PASS in diesem Lauf |

## Abschluss und Belege für die PR-Übernahme

**N31 – Reset und Reload: Live bestanden für die kontrollierte Testsitzung.** „Zurücksetzen“ betätigt und Dialog bestätigt, danach vollständig neu geladen. Lokale Schlüssel erneut `[]`, Speicherschalter aus, keine Testperson Alpha im sichtbaren Text, `DATEN_UNVOLLSTAENDIG`. Das Grundlagenfeld zeigte wieder das Beispiel-Startdatum 28.05.2026. Der Build blieb `e5c085b…` / `39550095252`. Nur die neu angelegte Testsitzung wurde zurückgesetzt; andere bereits vorhandene Browser-Tabs wurden nicht bearbeitet.

Die folgenden Dateien enthalten ausschließlich synthetische Daten bzw. Ansichten davon und liegen in dieser Repo-Kopie getrennt vom Produktcode im Belegunterordner dieses Berichts:

- [Hauptfall-JSON mit Testbuchung](belege/hauptfall_mit_testbuchung.json): neu exportierte 36-Monats-Eingaben und Freigabehinweise.
- [Hauptfall-CSV](belege/hauptfall_36_monate.csv): tatsächlich heruntergeladene 36 Zeilen für den Summenabgleich.
- [Desktopbeleg Importbestätigung](belege/importbestaetigung_desktop.png): aktuelle Buildkennung, Importerfolg, ausgeschaltetes Speichern und LM-3-Zusammenfassung.
- [Desktopbeleg nach Reset/Reload](belege/abschluss_reset_desktop.png): zurückgesetzte öffentliche Testsitzung mit aktueller Buildkennung.

Die relativen Belegpfade verweisen auf den zugehörigen Belegunterordner. Die Belege sind keine Beweisdateien einer amtlichen Berechnung. Die Vergleichsdokumente wurden nur gelesen und nicht überschrieben:

- `Elternzeit-Zielplaner_Ausfuehrlicher_Live-Testbericht_2026-10-20.md`
- `Elternzeit-Zielplaner_Testfallmatrix_Bescheidquellen_2026-10-20.md`

## Priorisierte nächste Entscheidungen

1. **PR-Zuordnung sichern:** Den geprüften Live-Commit dem tatsächlichen PR-HEAD gegenüberstellen; spätere Änderungen oder anderes HEAD nicht als durch diesen Lauf getestet ausgeben.
2. **R01 korrigieren:** Die verbliebene Kontoformulierung in der Plus-Erklärung an die klare Modell-/Kosten-Terminologie angleichen; R02/R03 redaktionell mitnehmen.
3. **Design-Abnahme ergänzen:** Mobile Breiten, echte Touch-Eingabe, Reflow/Zoom, Kontrast, vollständige Tastatur- und Screenreader-Strecke prüfen. Aktuell kein vollständiges Accessibility-Green.
4. **Fach-Gates offen halten:** Insbesondere 14./15.-Juli-Konflikt und 2027-/Monatsendversionierung unabhängig entscheiden lassen; keine Produktfreigabe aus diesem Regressionstest ableiten.
