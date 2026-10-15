# Wettbewerbs-, Produkt- und Code-Abgleich – V3.1

> Historischer Abgleich gegen V3.1 vom 14.10.2026. Für den erneut recherchierten Markt- und Codevergleich gegen V3.6 siehe [Audit vom 15.10.2026](WETTBEWERB-MVP-AUDIT-2026-10-15.md). Die damaligen Codegrenzen und ungeprüften Anbieterangaben sind keine aktuelle Zustandsbeschreibung.

**Erstellt:** 14.10.2026 · **Repository:** `Codeelchi/elternzeit-zielplaner` · **Codebasis:** `main` / V3.1 · **Status:** Evidenzgestütztes internes Audit, keine Zertifizierung
**Input:** Vom Nutzer bereitgestellte „Wettbewerbs- und Lückenanalyse: Deutscher Elternzeit-/Elterngeldrechner“.

> **Wichtige Evidenzgrenze:** Wir haben Code, Referenz-JSON, die UI-Struktur und die neun im Repo ausführbaren Tests geprüft. Wir haben **keine vollständige Fachvalidierung gegen den amtlichen Elterngeldrechner** durchgeführt. Marketingversprechen anderer Anbieter sind nicht als unabhängig nachgewiesene Leistungen zu behandeln. Fehlende Implementierung im heutigen eigenen Code ist **keine** nachgewiesene Marktlücke.

## A. Vorgehen und Belegstärke

- **I – Implementierung nachgewiesen:** Der aktuelle Code enthält nachvollziehbare Funktionen/Eingaben.
- **T – Technischer Test:** Ein Rechentest im Repository führt die reale HTML-Logik aus und vergleicht mit einem internen Erwartungswert; das ist **kein** amtlicher Ergebnisvergleich.
- **B – Beschrieben:** Mitbewerberfunktion laut offizieller Seite, öffentlicher Beschreibung oder Store-Eintrag. Keine unabhängige Berechnungsprüfung.
- **H – Hypothese:** möglicher Nutzen für Nutzer, noch nicht empirisch oder marktweit validiert.
- **F – Fachliche Sperre:** Wenn ein Input nicht vollständig oder zuverlässig bearbeitet werden kann, darf das Produkt keine sichere finanzielle/rechtliche Zusage liefern.

Vergleichsmaßstab: **Kann eine Familie mit einem einzigen, nachvollziehbaren Standardfallplan Entscheidungen zwischen verfügbarer Zeit, finanzieller Belastung und nächsten Schritten treffen, ohne Zeitachsen oder Regelqualität zu verwechseln?**

## B. Tatsächlicher eigener Implementierungsstand

| Element | Befund im Code | Status / Grenze | MVP-Konsequenz |
| --- | --- | --- | --- |
| Basiselterngeld, Plus, Bonus, Teilzeit | `index.html`: `STAT`, `makeSchedule`, `evaluate(schedule, mod)` | **I + T**; internes Modell mit pauschal/vereinfachtem Elterngeld-Netto, keine externe Zahlreferenz | Beträge *als Schätzung* und mit Rechenherkunft zeigen; unabhängige Fixtures P0 |
| Lebensmonate / Kindesalter / Daten | `dateFor`, `ageSpan`, `renderTimeline`, 36 Zeilen | **I + T**; Lebensmonatsorientierung, keine eigenständige Arbeitgeber-/Fristenzeitachse | 4 getrennte, verknüpfte Achsen P0 |
| Elternzeit vs. Bezug und Arbeitszeit | Status pro Elternteil und Lebensmonat (`W`, `MS`, `B`, `R`, `P`, `T`, `Q`, `K`, `U`) | **I, teilweise**; eine Statusauswahl vereint mehrere juristisch unterschiedliche Zustände | Datenmodell nach Zeitachsen trennen, ohne Nutzer durch Doppelerfassung zu belasten |
| Mutterschutz | `makeSchedule`, `matDaysAt`, `evaluate` | **I, F:** 56 Tage nach Geburt angenähert; erste zwei Lebensmonate der Mutter im Modell erzwungen; individuelle Abweichungen fehlen | Geburts-/Schutzfristen und Anspruch getrennt modellieren; Sonderfall aktiv ablehnen |
| Zielbasierte Suche | `runGoalSearch`, `goalCandidates`, `goalInputsFingerprint` | **I + T**; generierte Muster, kein Vollständigkeitsbeweis/optimaler globaler Plan | Search-Coverage und Begründung / Ablehnungsgründe sichtbar machen |
| Einkommensunsicherheit | `riskScenarios` mit Teilzeit-, Elterngeld-Netto- und Kostenfaktoren | **I + T**; statische Abweichungsfaktoren, keine statistisch belastbare Prognose | Faktoren/Resultate erläutern, Liquidität sowie unbekannte Nettoannahmen sichtbar machen |
| Rechtliche Plausibilität | `evaluate` mit Textfehlern; `rulesV3` im HTML | **I + T**; Sonderfälle teils erkannt, aber keine allgemeine, unabhängige Gültigkeits-Engine | Strukturierte Regelcodes und Begründungen; kein `valid` für ungeprüfte Sonderkonstellationen |
| Versionierte Regeln | `data/rechtsregeln-de-nrw-2026-10-14.json` **und** `index.html` `rulesV3` | **I, F:** doppelte Regelpflege; teilweise `from`, aber keine durchgängigen Gültigkeitsenden, Prüfungstermine und Rechtsstatus je Regel | Single Source of Truth P0, Build/Prüf-Workflow |
| Haushaltseinkommen | `evaluate`: Lohn + modellierte Leistung + Kindergeld + bestätigter Zuschuss minus Kosten | **I, F:** keine verbindliche Lohnsteuer-/Sozialversicherungsberechnung; Progressionsvorbehalt nicht quantitativ | Einzelposten und Nettohinweise sichtbar; keine irreführenden Konto-/Steuerzusagen |
| Regionale Leistungen | `renderRegion`, lokale Kita-Tarifschätzung `cologneFee2025`, Landesinformationen | **I, teilweise**; kein vollständiger 16-Länder-Anspruchsentscheid; Kölner Tabelle 2025 nicht 2027 | Nur geprüfte Leistungen in Geldsumme; Datum/Kohorte/Behörde erforderlich |
| Fristen und Antragsweg | `slide-9`, offizielle Links, allgemeine Schritte | **I, teilweise**; keine berechnete individuelle Aufgabenliste für konkretes Datum | Datierter Fristen-Assistent P1 |
| Export / lokale Speicherung | `downloadCsv`, `downloadJson`, `localStorage` | **I**, ohne Backend; kein nachgewiesener PDF-Report aus dem Live-Modell | Export-/Import-Roundtrip, Speicher-/Löschinformation und Barrierefreiheit testen |
| Qualität | `tests/planner.test.mjs` (9 Tests), `qa/qa-bericht-v3.1.json` (historischer Bericht) | **T:** 9/9 am 14.10.2026 bestanden. Hauptsächlich interne Invarianten | Externe Referenzwerte, Fehlereingaben, Browser-E2E und visuelle QA ergänzen |

**Technische Risiken:** `index.html` enthält eine ältere und eine V3-`evaluate`-Definition sowie einen gewachsenen UI-/Logik-Monolithen. Die später definierte JavaScript-Funktion überschreibt dieselbe benannte Funktion. Das funktioniert derzeit in Tests, erschwert aber die Wartung und den Nachweis, **welche** Regel in welcher Version verwendet wurde. Mutterschutz wird explizit für den zweiten Elternteil auf den ersten zwei Monaten vorbelegt; ohne individuelle Voraussetzungen sind abweichende Konstellationen nicht zuverlässig.

## C. Marktvergleich und belastbare Aussagegrenzen

| Angebot | In übermittelter Analyse beobachtet/beworben | Belegstärke | Konsequenz |
| --- | --- | --- | --- |
| [Bundes-Elterngeldrechner](https://familienportal.de/familienportal/meta/egr) | Monatsaufteilung, Gültigkeitscheck, Teilzeit, Finanzübersicht | **B**, offizieller Anbieter; kein in dieser Analyse verifizierter Referenzausdruck | Grundfunktionen sind **keine** Alleinstellungsmerkmale. Externe Testfälle vorbereiten |
| [Einfach Elterngeld](https://einfach-elterngeld.de/rechner) | Detailrechnung, Sonderfälle, gesonderter Elternzeit-/Fristenrechner | **B**, Sonderfallgenauigkeit nicht unabhängig bestätigt | „Sonderfälle komplett abgedeckt“ nicht ohne fachliche Beweisführung versprechen |
| [AOK Elternzeitrechner](https://www.aok.de/pk/leistungen/schwangerschaft-geburt/elternzeitrechner/) | Elternzeitbeginn/-ende und Fristen | **B** | Eigenen arbeitsrechtlichen Zeitpfad schaffen, aber kein Alleinstellungsmerkmal behaupten |
| [Barmer Mutterschutzrechner](https://www.barmer.de/gesundheit-verstehen/familie/schwangerschaft/gesunde-schwangerschaft/mutterschutzrechner-1054066) | Mutterschutzdaten | **B** | Fachliche Mutterschutzdaten als separate Achse |
| [ZBFS Bayern Lebensmonatsrechner](https://www.zbfs.bayern.de/familienleistungen/elterngeld/lebensmonatsrechner/) | Lebensmonatsermittlung | **B**, offizielle Stelle | Monatsberechnung an unabhängigen Daten prüfen |
| [elterngeld-planung.de](https://elterngeld-planung.de/planner/) und Elterngeldpilot | Planung / Optimierung beworben | **B**, teilweise Anbieterclaim | Zielsuche ist als Kategorie **nicht neu**; erklärbare Such-/Trade-off-Logik testen |
| [Elternzeit.app](https://elternzeit.app/) und [Elterngeld Planer, Google Play](https://play.google.com/store/apps/details?id=be.rottenrei.elterngeld&hl=en_US) | Organisation, Teilzeit, Export / Varianten laut Anbieter-/Store-Text | **B**, keine Berechnungsaudits | PDF/Erinnerungen ggf. sinnvoll, aber kein nachgewiesener Wettbewerbsvorteil |

**Nicht belegbar aus diesen Daten:** Alleinstellungsmerkmal „ohne Account“, Marktführerschaft, genauere amtliche Berechnung als Wettbewerber, exklusiver Algorithmus, einzigartige Optimierung, Vollabdeckung regionaler Leistungen.

## D. Überarbeitete Hypothesen für Nutzerforschung

1. **H1 – Erklärbare Entscheidung statt Einzelformel:** Nutzer bewerten „was ist anders und warum?“ höher als 20 ungewichtete Varianten. Experiment: 3 begründete Ergebnisse vs. 20 ungeordnete Ergebnisse; Verständnistest.
2. **H2 – Getrennte, synchrone Zeitachsen:** Mutterschutz/Elternzeit/Elterngeld/Arbeitszeit/Haushaltsbudget in einer visualisierten Kalender- und Lebensmonatsansicht reduzieren Fehlannahmen. Experiment: Zeitplan-Fragen vor/nach Ansicht.
3. **H3 – Mindestbudget und Stress-Szenarien:** Der schlechteste plausible Monat ist für Planung wertvoller als maximale Gesamteinnahmen. Experiment: Aufgaben mit Mindestbudget, Betreuungsziel und Teilzeitunsicherheit.
4. **H4 – Belegte Antragswege:** Eine klare, datierte To-do-Liste führt häufiger zum richtigen amtlichen Formular als reine FAQ-Links. Experiment: Wegfindung mit Landkreis/Bundesland.
5. **H5 – Nachvollziehbare Sonderfälle:** Offen angezeigte Eingabe-/Berechnungsgrenzen schaffen mehr Vertrauen als eine undokumentierte Genauigkeitsbehauptung. Experiment: Ergebnisverständnis und Vertrauenskalibrierung.

**Regel:** Eine Hypothese wird erst nach Nutzertests, Vergleichsmessungen und ggf. Wettbewerbertests als bestätigt bezeichnet.

## E. MVP-Schnitt und Priorisierung

| Priorität | Paket | Umfang | Abnahme |
| --- | --- | --- | --- |
| **P0** | Referenzfälle und fachliche Korrektheit | 20+ dokumentierte Standard-/Grenzfälle, Vergleich amtlicher Beispiele, taggenauer Mutterschutz, Durchschnittsbildung bei Teilzeit | Keine unbelegte amtliche Genauigkeitsbehauptung; Ergebnisse mit Rechenbelegen |
| **P0** | Regel- und Zustandsmodell | JSON-Regeln als eindeutige Quelle; `effective_from/to`, `checked_at`, Quelle, Kohorte; strukturierte `REGELKONFLIKT`-`NICHT_UNTERSTUETZT`-`DATEN_UNVOLLSTAENDIG`-Zustände | Einzige versionsführende Regelquelle, keine falsche „zulässig“-Aussage |
| **P0** | Zeitachsen und Betreuungsplan | Mutterschutz in Tagen, Elternzeit in Kalenderabschnitten, Elterngeld in Lebensmonaten, Arbeitszeit, Einkommen | Jahres-/Monatswechsel geprüft, auch ungewöhnliche Geburtstage |
| **P0** | Zielsuche erklären | Suchraum, Filter, Grenzen, Begründung; manuelle Eingaben kompatibel | Keine unbestätigte „beste/optimale“ Aussage; kein unzulässiger Standardfall in Ergebnissen |
| **P1** | Robustes Budget | Bedarfsbudget, negative Monate, Stress-Szenarien und Teilzeit-Netto-Eingaben | Nutzer versteht Unterschiede und erkennt Engpassmonate |
| **P1** | Regionale Leistungen und Antragswege | Datierte Kohortenlogik/Quellen; exemplarisches Bundesland; nächster amtlicher Antragsschritt | Nur bestätigte, individuell plausible Leistungen eingerechnet |
| **P1** | MVP UX und Datenschutz | 3-Schritt-Zielführung, mobile Formulare, CSV/JSON-Roundtrip, Datenlöschung, Accessibility-Check | Keine erforderliche Registrierung/Cloud; Einwilligungen nicht vorgetäuscht |
| **P2** | Erweiterter Fallraum | Selbständige, Mischeinkommen, mehrfach Beschäftigte, Frühgeburt, Mehrlinge, Steuer-/Versicherungswirkungen | Gesonderte Fachfreigabe für jede Konstellation |

## F. Offene Fachfragen / vorsichtige Aussagen

- **Kohorte und Rechtsstand:** §4/§4a/§4b BEEG, aktuelle Übergangsregeln und Länderangebote müssen gegen das konkrete Geburtsdatum neu geprüft werden. Eine Seite von 2026 kann 2027 veraltet sein.
- **Bayern/Sachsen/NRW:** Familiengeld, Landeserziehungsgeld, Mehrlingsgeld und kommunale Gebühren haben eigene Anspruchsvoraussetzungen. Ohne amtlichen Daten- und Gültigkeitsabgleich **keinen positiven Geldanspruch berechnen**.
- **„Netto“:** Auszahlungsnetto, Elterngeld-Netto und nachgelagerte Steuerfolgen sind unterschiedliche Größen. Eine Monatsübersicht muss diese Begriffe unterscheidbar ausgeben.
- **Fristen:** Gültige Formvorgaben nach Geburts-/Antragsdatum prüfen; Textform für relevante Elternzeiten nicht ohne Datumskohorte auf historische Fälle übertragen.
- **Rechnerstatus:** „9/9 Tests grün“ bedeutet technische Konsistenz, nicht korrekte bewilligungsfähige Auszahlung.

## G. Konkrete nächste Schritte

1. **MVP-Scope und Akzeptanz** in [MVP-2026-10-14.md](MVP-2026-10-14.md) verbindlich als Arbeitsgrundlage nutzen.
2. GitHub-Issues nach P0/P1 erstellen und Abhängigkeiten aufnehmen; vor der ersten Funktionsänderung Referenzfall-Datensatz und Rule-Registry entwerfen.
3. Für jede P0-Rechenregel mindestens einen Positiv-, Negativ- und Datumsgrenzfall schreiben; Quellen-URL plus Abruf-/Prüfdatum eintragen.
4. Erst nach bestandener Fach- und UX-Prüfung mit öffentlicher Beta experimentieren. Andernfalls bleibt der Rechner intern als **unverbindliche Schätzung** nutzbar.

### Wesentliche Quellen

- [Bundesfamilienportal – Elterngeldrechner](https://familienportal.de/familienportal/meta/egr)
- [Gesetzesfassung BEEG](https://www.gesetze-im-internet.de/beeg/BJNR274810006.html)
- [Elterngeld: berücksichtigtes Einkommen](https://www.familienportal.de/familienportal/familienleistungen/elterngeld/faq/welches-einkommen-wird-fuer-die-berechnung-des-elterngelds-beruecksichtigt--229542)
- [ElterngeldDigital](https://www.elterngeld-digital.de/ams/Elterngeld)
- [Sächsisches Landeserziehungsgeld](https://www.familie.sachsen.de/landeserziehungsgeld.html)
- [Bayerisches Familiengeld](https://www.zbfs.bayern.de/familienleistungen/familiengeld/)
- [Elternzeit anmelden](https://familienportal.de/familienportal/familienleistungen/elternzeit/faq/wann-und-wie-muss-ich-elternzeit-beantragen--124810)

_Externe Funktionsbehauptungen stammen aus der Nutzervorlage und orientierenden öffentlichen Quellen; eigene vertiefte Wettbewerber- und amtliche Zahlenprüfungen sind ausdrücklich noch offen._
