# Änderungen

## V3.19 – Browser-Speicherresilienz und CI-Qualität (interner Kandidat, 18.10.2026)

- Fehlgeschlagenes localStorage-Speichern deaktiviert die bisher irreführend aktive Opt-in-Auswahl und zeigt eine dauerhafte, screenreaderfreundliche Warnung.
- Browserkopien werden nur nach bestätigtem Entfernen als gelöscht gemeldet; Reset des laufenden Plans funktioniert auch bei blockierter Persistenz; JSON-Import bleibt flüchtig möglich, ohne alte Browserkopien fälschlich als gelöscht anzugeben.
- Vier DOM- und vier Chromium-Negativ-/Offlinefälle; GitHub-Jobs node, browser, staging und fail-closed Schlussjob test. Keine neue fachliche Logik, kein Release-Gate-Umschalten, keine Schemaänderung. [Prüfnotizen](docs/PRIVACY-ROBUSTNESS-V319-2026-10-18.md).

## V3.17-D – fiktiver Verständlichkeitscheck und Reviewvorbereitung (intern)

- Acht interaktive synthetische Fragen zu Standardkohorte, Elterngeld-Netto, Leistungs-/Zahlungsmonat, Bankbuchung, unbekannten Kosten, Mutterschutz 4/5, Zielsuche und lokalem Speicher. Erklärendes, nicht bewertendes Feedback, vollständig ohne Familienplan- oder Persistenzwirkung.
- Eigene dokumentierte Moderator-/Barrierefreiheits-Prüfvorlage und SHA-gebundene Null-Evidenzmatrix mit `npm run usability:check`. Gefälschte Teilnehmer- und Freigabeangaben werden abgewiesen; echte Teilnehmer wurden **nicht** beobachtet.
- Technische Gesamtabnahme: **495/495** Node-/DOM-, **63/63** vollständige Chromium-Regressionen und **3/3** zusätzliche direkte V3.17-D-`file://`-Fälle bestanden.
- [Umsetzung und Testgrenzen](docs/PRODUKTREIFE-V317D-NUTZERPRUEFUNG.md). Release-Gates, Mutterschutz-Referenz und 0/10 externe Referenzfälle bleiben offen.

## V3.17-B/C – Exporttransparenz und Referenzevidenz (intern, keine Fachfreigabe)

- JSON-Schema 1 / Exportversion 3.10.0 behalten; erläuternde, **nicht signierte** Top-Level-`planningDisclosure`-Metadaten, die beim Import bewusst ignoriert werden. Echte/alte JSON-Dateien weiterhin kompatibel.
- CSV um sieben maschinenlesbare Scope-/Schätz-/Quellenfelder rechts erweitert, alte 17 Spalten behalten; bei unbekannten Ausgaben kein fiktiver `Frei_nach_Kosten`-Betrag.
- Neuer aufklappbarer UI-Bereich erklärt Export-Grenzen; reine Modulvalidierung stoppt Exporte bei fehlendem Status statt falsche Freigabe vorzutäuschen.
- Zehn externe Prüffälle in SHA256-gebundenem Manifest angelegt; `npm run independent-evidence:check` prüft Struktur, behauptete Freigaben und fehlende Quellen. **0/10 extern bestätigt, Release-Gates unverändert.**
- Vollständige Softwaretests: 481/481 Node-/DOM-, 60/60 Chromium-Regressionen, 4/4 neue echte `file://`-V3.17-B-Fälle grün. Rechts- und Datenschutzreview sowie unabhängige Referenzfälle nicht erledigt.
- [Umsetzung und Grenzen](docs/AUSBAU-V317B-C-EXPORTE-EVIDENZ-2026-10-17.md).

## V3.17 – Produktreife-/Scope-Orientierung (interner Entwicklungszweig; noch kein öffentlicher Release)

- Dokumentation neu geordnet: [aktuelle operative Roadmap](docs/ROADMAP.md), [archivierte Vorgängerroadmap](docs/ROADMAP-HISTORIE-BIS-V316-2026-10-17.md), [Audit-Abgleich](docs/PRODUKTREIFE-ABGLEICH-V317-2026-10-17.md) und modernisierte [Nutzeranleitung](docs/ANLEITUNG.md).
- V3.15–V3.16 liegen nach erfolgreicher GitHub-CI und PR #20 unter Merge 19f047d auf main (alte Branch-Hinweise nur noch historisch).
- V3.17-A technisch implementiert: unverbindlicher Status vor der Planung und im Regelcheck; kompakte aufklappbare Mobilansicht, Validator-Wiederverwendung ohne neue Rechtsregel, Schätz-/Kohorten-/Freigabehinweise. 468/468 Node-/DOM-, 56/56 Chromium- und 3/3 direkte V3.17-file://-Tests bestanden. [QA](docs/AUSBAU-V317-PRODUKTREIFE-EINORDNUNG.md).
- Mutterschutz 4/5, null unabhängig abgenommene vollständige Familienreferenzen, Rechts-/Datenschutz-/Nutzerreview und öffentlicher Release bleiben **offen/gesperrt**.

## V3.16 – Gemeinsamer Betreuungs- und Wiedereinstiegsplan (interner Entwicklungsstand)

- Parallele Eltern-Arbeitszeiten nicht mehr als einfache Stundenaddition: 15-Minuten-Überlappungsprüfung für fünf beispielhafte Wochentage, individuelle Arbeitsstarts/-Rückkehrtermine, gemeinsame Kita-Stunden.
- Eingewöhnungsbegleitung durch A/B oder tageweise abwechselnd, Elternfreistellungs-Konflikte und freie Ersatzbetreuung transparent getrennt. Drei Begleitungsvarianten als rein hypothetischer Vergleich.
- Euroangaben pro Elternteil nur explizit und ohne gesetzliche Finanzzusage; Wochen außerhalb der Eingewöhnung werden nie zu einmaligen Übergangskosten addiert.
- Alles nur Sitzungsszenario: auch bei opt-in-Speicherung werden Arbeitszeit-/Eingewöhnungs-Eingaben nicht in Plan-JSON oder Bankdaten übernommen.
- Amtliche Hinweise auf höchstens 32 Wochenstunden während der Elternzeit und auf zusätzliche Voraussetzungen beim Partnerschaftsbonus, ohne vermeintliche Anspruchsprüfung.
- [Technik, fachliche Grenzen und Tests](docs/AUSBAU-V316-GEMEINSAME-BETREUUNG-2026-10-17.md). Öffentliche Freigabe weiterhin gesperrt.

## V3.15.2 – Unverbindlicher Robustheitsvergleich beim Kita-Start (interner Entwicklungszweig)

- Drei klar begrenzte Verzögerungsvarianten direkt in der bestehenden Eingewöhnungsansicht: eigene Annahme, +2 und +4 Wochen (maximal zwölf Wochen insgesamt).
- Gleiche Wochenstunden, Arbeitsrückkehr und Geldannahmen in allen Varianten; ausgegeben werden zusätzlich ungedeckte Übergangsstunden, vorläufige Euro-Unterschiede und bei vollständigen Haushaltsannahmen der schwächste betroffene Lebensmonat.
- Kein automatisches Ranking als beste Familienstrategie, keine Prognose der Platzvergabe, keine verdeckte Planübernahme und keine Berechnung veränderter Löhne/Elterngeldansprüche.
- Bei fehlendem Netto, fehlenden Haushaltskosten oder Überschreitung der Modellgrenze werden die Lücken explizit gezeigt.
- Neue reine Unit-Tests und DOM-/Chromium-Mobile-Regressionen. [Dokumentierte Grenzen](docs/AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md).

## V3.15.1 – Wiedereinstiegs- und Liquiditätsdarstellung korrigiert (interner Branch)

- Die reguläre Kita-Woche ist keine zusätzliche Übergangswoche mehr: null Eingewöhnungs-/Wartewochen ergeben null einmalige Übergangsmehrkosten.
- Dauerhafte fehlende Betreuungsstunden nach Arbeitsrückkehr werden getrennt angezeigt, statt als einmaliger Einkommensverlust zu verschwinden.
- Arbeitsrückkehr um 0–24 Wochen verschiebbar, unabhängig von Kita-Start und NRW-Tarifstunden; kein fiktiver Lohnausfall vor Arbeitsbeginn.
- Rein hypothetische Übergangskosten werden centgenau auf Kinder-Lebensmonate verteilt. Unbekannte Werte und Teile außerhalb der 36-Monatsansicht bleiben sichtbar.
- Alle Ergänzungen temporär und ohne Import-/Export-Schemaänderung, Bankbuchungs- oder Elterngeldmodell-Änderung. Siehe [Nachbesserung V3.15.1](docs/AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md).

## V3.15 – Eingewöhnung und geprüfte Kita-Zukunftsfassungen (interner Branch, 17.10.2026)

- NRW-KiBiz-Fassung 01.08.2026–31.07.2027 vs. verkündete künftige Fassung ab 01.08.2027 werden nach gewähltem Betreuungstag unterschieden; inklusive sechsmonatiger Anzeige, optionaler örtlicher früher Vormerkung und nur vorläufigem Beitragsfreiheits-Hinweis.
- Neuer wochenweiser, rein hypothetischer Kita-Eingewöhnungs-/Wiedereinstiegsplan: Verzögerung, Stundenrampe, zusätzliche Betreuung und optionaler expliziter Nettoausfall, ohne Elternzeit-, Leistungs- oder Bankbuchungsänderung.
- Lokale Antragsstatusmarkierungen samt Ausschluss selbst als erledigt markierter Aufgaben aus dem vorläufigen ICS; KiZ-Unterlagenfenster für sechs Kalendermonate, amtliche Wohngeld-/BuT-Wege ohne automatische Zusatzleistungen.
- Einfachere Übersicht der Zielsuche nach freier Zeit, modelliertem Budget und vorsichtiger Rücklage, ausschließlich unter den bereits dargestellten Varianten.
- Neue versionierte Quellenmetadaten und Unit-/DOM-/Browser-Negativtests; neue Eingaben standardmäßig nur Sitzungsszenarien, JSON-Schema v1 bleibt erhalten. Keine automatische Brutto-Elterngeld-Netto-Engine.
- **Fach- und öffentliche Release-Gates bleiben gesperrt.** Verschlüsselte private Mehrgeräte-Übergabe ist mangels unabhängig geprüftem Sicherheitskonzept bewusst nicht enthalten.
- Dokumentation und Tests: [V3.15 Ausbau/Abnahme](docs/AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md).

## V3.14 – interner Ausbau und Review-Vorbereitung, 17.10.2026 (kein Release-Tag)

Enthält die aufeinander aufbauenden V3.12-, V3.13- und V3.14-Arbeitspakete aus den Feature-Branches. Das technische Paket sowie der aktuelle Export behalten Version 3.10.0 bis zu einer separaten Freigabe-/Versionsentscheidung. **Eine Zusammenführung nach main bedeutet keine öffentliche Freigabe.**

- **V3.12:** Kita-Verzögerungen mit nur manuell belegten Finanzannahmen; Vergleich Budget gegen volle Elternmonate; tatsächliche Kalenderbuchungen und nur für die Sitzung angenommene Anfangsrücklage. Keine automatische Zahlungserfindung.
- **V3.13:** Angenommene taggenaue Zahlungen mit 0–90 Tagen Verzögerung, Versicherungs-/Steuerhinweise, offizielle KiZ-/Wohngeld-/DRV-Wege, historischer Kölner Gebührenvergleich, transparente Zähler der Vorlagensuche, Quellenstatus, vorläufiger ICS-Export und explizite JSON-Schemaversion. Komponentenweise Cent-Rundung und Warnung für Zuschläge außerhalb des Planungshorizonts.
- **V3.14:** Optionaler manueller Versicherungs-/Steuer-Kostenpuffer (ohne fingierte Beitragshöhe), separate datierte Kölner Tabelle für alle drei Altersgruppen, beschränkter aber vollständig enumerierter synthetischer Suchprüfraum mit 256 Varianten (127 plausibel, 129 Regelkonflikt), größere abbrechbare Suchschritte (512 statt 64 erzeugte Varianten), Entfernung überschatteter Alt-Controller, neue Tests für Speicher-/Offline-Schutz und rekonstruierbare Reviewer-Fallmatrix.
- **Fachgrenzen:** Widersprüchliche Mutterschutz-Behördenreferenzen (4 statt 5 Resttage), keine unabhängig geprüfte Brutto-zu-Elterngeld-Netto-Engine, keine zehn unabhängigen vollständigen Familienreferenzen und keine externe Rechts-, Datenschutz- oder Nutzertestfreigabe. Die Datei data/release-gates.json bleibt blockiert.
- **Technische Abnahme im Workbench (17.10.2026):** 375/375 Node-/DOM-Tests, 39/39 gesamte Browser-E2E, 3/3 zusätzliche file://-V3.14-E2E. Automatisches Axe ersetzt keine echte Screenreaderprüfung. Dokumentation: [V3.14-Fachreview-Paket](docs/ROADMAP-FACHABNAHME-V314-2026-10-17.md) und [Roadmap-Status](data/roadmap-status-2026-10-17.json).


## 3.10.0 – Familienstart, Wissenskarten und centgenaues Budget, 16.10.2026

- **Design-Nachbesserung 17.10.2026:** redaktionelle Typografie, warmer Farbklang, differenzierte Themenkarten, zwölf lokale SVG-Symbole, klarere Rechner-/Beratungsbereiche und mobile Filter. Fünf Portaltests und acht zusätzliche Axe-Scans bei vier Breiten erfolgreich; [Nachweis](docs/DESIGN-2026-10-17.md).

- Neue kleine Infowebseite `start.html`: Schwangerschaft, Vorbereitung und erste Familienzeit, kuratierte offizielle Beratungswege sowie direkter Zugang zum bestehenden Rechner. Gegenseitige Verlinkung, lokal ohne Account, Tracker oder externe Laufzeitassets.
- Acht datierte Wissenskarten ergänzen Lebensmonate, Einkommensarten, Teilzeit, Steuer, Krankenversicherung, Antragsrückwirkung, Arbeitgeber-Elternzeit und Kita-Eingewöhnung. Auswahl nach Planungskontext, konkrete Lebensmonatsdaten und amtliche Quellen; keine zusätzlichen Geldbuchungen.
- Schnellstart mit konkreten nächsten Schritten aus zentralen Validatorbefunden, Haushaltsausgaben und Betreuung. Direkter Sprung samt Eingabefokus, ohne Werte oder Monatspläne umzuschreiben. Nettohilfe erklärt manuelle Schätzungen und den externen amtlichen Rechner.
- Familienbudget bucht Komponenten und kumulierte Rücklagen centgenau. Ausgeglichene Monate erzeugen keine Fließkomma-Phantomengpässe. Exakte Dezimal-Prozentrechnung erhält Halb-Cent-Grenzen; begrenzte numerische Caches halten die Suche schnell. Ungültige Betragstypen und Container werden explizit abgewiesen.
- Basis: tatsächliches main V3.9 (`e8bb586`), PRs #14–#16 bereits gemergt; 246 bestehende Node-Tests grün. Neue Regressionen und Browsernachweise siehe QA-Bericht.
- **QA:** 279 Node-/Modul-/DOM-Tests und 27 echte file://-Browserfälle bestanden; finale Desktop-/Mobil- und Quellenberichte versioniert.
- Ungeklärte Mutterschutzanrechnung und unabhängige Fach-/Rechts-/Datenschutz-/Nutzerabnahmen bleiben offen. Keine Veröffentlichung und keine pauschale 2027-Freigabe.


## 3.9.0 – UX-Datenintegrität und Ergebnisverständlichkeit, 15.10.2026

- **Datenintegrität:** Wiederholte Schnellformular-Eingaben überschreiben weder individuelle Monatspläne noch zuvor manuell ermittelte Elterngeld-Netto-Werte, Steuerangaben oder Standardfall-Klärungen. Nur noch nachvollziehbar vom Kurzassistenten stammende Netto-Näherungen werden aktualisiert.
- **Reset-Schutz:** Der Schnellstart wird ausschließlich nach bestätigtem Zurücksetzen auf Anfang gesetzt. Ein abgebrochener Reset verändert weder Daten noch sichtbaren Modus.
- **Vorlagenklarheit:** Unterschied zwischen ausgewähltem 18-Monats-Modell und persönlichem 14-Monats-Auswertungshorizont wird erklärt; ausdrückliche Synchronisations-Schaltfläche. Individuelle Monatspläne werden nicht durch Vorlagen ohne Bestätigung ersetzt.
- **Haushaltsbudget:** Ohne eingegebene Ausgaben werden keine falschen Anfangsrücklagen oder verfügbaren Stress-Budgets dargestellt. Zielplanvergleich ist zunächst auf Zeitaufteilung beschränkt. Die Monatskopfzeile verwendet bei bekannten Kosten den tatsächlich berechneten Wert nach Kosten.
- **Mobil:** Export- und Fachaktionen über „Weitere Optionen“, Datenschutzhinweise aufklappbar, zentrale Schnellstartvorlage oberhalb der ersten Bildschirmkante selbst bei 320 × 740 px; keine horizontale Überbreite.
- **Zugänglichkeit:** Kein unbeabsichtigtes Präsentations-Blättern beim PageDown einer Vorlagenkarte; konkrete Formularfehler fokussieren und markieren das betroffene Eingabefeld.
- **Transparenz:** Berechnungsannahmen (Nettolöhne, pauschalierte Netto-Näherungen, Kindergeldansatz, fehlende Ausgaben) sind im Schnellstart ausklappbar. Teilweise geänderte Beispieldaten werden als solche gekennzeichnet. Planexport eindeutig als Download benannt.
- **Abnahme:** 246/246 Unit-/DOM-Tests, 22/22 HTTP- und 22/22 direkte file://-Browserfälle, 53 Axe-Prüfungen ohne gemeldete Verstöße; exakte V3.9-Datei durch SHA256 nachgewiesen. Keine unabhängige Rechts-/Steuerfreigabe und keine echte Nutzerstudie; öffentlicher Release bleibt bewusst blockiert.


## 3.8.0 – Schnellstart und vereinfachte Navigation, 15.10.2026

- Fünf Vorlagen aus den bereits bestehenden Monatsplänen auf der Startseite: fiktives Beispiel nach einem Klick, ohne vorher persönliche Werte eingeben zu müssen.
- Geführter Kurzassistent für Geburtstermin, Netto beider Eltern, Betreuungsziel und optionale Haushaltsausgaben; die vorläufige Gleichsetzung des Elterngeld-Netto ist klar als Schätzung gekennzeichnet.
- Betreuungslücken werden bei jeder Vorlage sichtbar erklärt; verlängerte Alternativen für 18/24 LM und explizite Warnung für 30/36 LM ohne passende Vorlage.
- Fehlende Haushaltsausgaben werden strikt von absichtlich eingetragenen 0 Euro unterschieden. Ohne Ausgaben keine Zusage über frei verfügbare Mittel oder sichere Rücklagen.
- Sechs Kern-Navigationsbereiche, weitere Fachansichten per Opt-in; bisherige erweiterte Funktionen und Offline-Berechnung bleiben erreichbar. Im Experten-Modus ist auch die klassische Monatsdetail-Navigation schon vor der ersten Beispielwahl verfügbar.
- Bereits gespeicherte persönliche Pläne werden bei der Auswahl eines fiktiven Beispiels nicht überschrieben. Änderungen in Fachansichten, andere Modellvorlagen und erfolgreiche JSON-Importe aktualisieren die Bezeichnung in der Schnellstart-Übersicht.
- Eigenes synchronisiertes HTML/CSS/JS-Snapshot-System mit Browser-/Negativtests und Dokumentation.
- **Öffentliche Beta bleibt gesperrt**, insbesondere Mutterschutz-Delta, Elterngeld-Netto und unabhängige Nutzer-/Fachreviews sind offen.

## 3.7.0 – Zielbudget, verständlicher Einstieg und geprüfte Cent-Rundung, 15.10.2026

- Persönliche Ehe-/Gehaltsannahmen durch neutrale, anpassbare Elternbezeichnungen und echte Eingabezusammenfassungen ersetzt; rechtliche Mutterschutzrolle bleibt unverändert.
- Unbekannte Nettoangaben bleiben leer und sperren die Standardbewertung/Suche; explizit null Euro werden davon unterschieden.
- Geführter Netto-Einstieg mit Beispiel-, Bekannt- und manueller Übernahmeroute, striktem Import und ausbleibender HTML-Ausführung bei Namen.
- Realistischer/vorsichtiger Planvergleich mit gemeinsamen Annahmen, freien Monaten, Engpässen, Anfangsrücklage und erklärten Deltas.
- Vorschlagsüberschriften nach dem tatsächlich gewählten Vergleichsschwerpunkt und messbaren Kennzahlen benannt, statt nur identische volle Auszeitmonate zu wiederholen. Regressionstest auch für unterschiedliche Budgets bei gleicher Zeitaufteilung. Die Ergebnis-Schnittstelle liefert die Überschrift konsistent für Browser- und API-Vergleiche mit.
- Weitere Vorschläge benötigen materielle Unterschiede; erste Zielpriorität bleibt lexikografisch erhalten.
- Suche in unterbrechbaren Schritten, Fortschritt, Ausschlussgründen und Abbruch bei Eingabeänderung; keine Übernahme unvollständiger Ergebnisse.
- Amtlich belegte Cent-Rundung auch für Zwischen-/Monatsbeträge und Summen ergänzt; ursprüngliche Mutterschutzabweichung bleibt offen und sichtbar.
- 217 Node-Tests, 16 echte Offline-Browserfälle, 52 Axe-Prüfungen und aktuelle QA-/Screenshotnachweise; Nutzertestprotokoll vorbereitet, keine externen Freigaben behauptet.

## Erneute Wettbewerbs- und MVP-Begutachtung – 15.10.2026

- Aktuellen V3.6-main-Stand, Anbieter-Primärseiten, ausgewählte Browseroberflächen und öffentliche Rechenmodule erneut verglichen.
- Formelproben und Abrufmetadaten dokumentiert; Marktüberschneidungen von belegbaren eigenen Funktionen und noch zu testenden Differenzierungshypothesen getrennt.
- MVP-Kriterien, UX-/Netto-Einstieg, Ergebnisvielfalt, Risikovergleich und QA-Versionsdrift bewertet; Produktprioritäten ergänzt. Keine Berechnungs- oder Rechtsregel geändert.

## 3.6.0 – gerichtliche Bescheidfälle und 2027er Rechtsereignisse, 15.10.2026

- Vier veröffentlichte anonymisierte Verwaltungs-/Gerichtsverfahren mit ursprünglichen, geänderten und teilweise nur probeweise berechneten Bescheidbeträgen quellengebunden erfasst. Historische Zahlenbeziehungen gesondert getestet; keine vollständigen 2027er Replays behauptet.
- Der Berliner Provisionsstreitfall überprüft Basis/Plus-Umrechnung und 1.082,85 € Mehrleistungsdifferenz. BW, BSG und Bayern dokumentieren schwankende Einnahmen, Mutterschaftsleistungen, Bemessungsdaten und unvollständige Nachweislage.
- Wahl der Lohnzusammensetzung je Elternteil ergänzt: variable Provisionen/Einmalzahlungen/mischende Einkünfte blockieren positive Standardvalidierung und 2027-Prognosepläne.
- Zentraler datierter Rechtsereignis-Katalog für Steuer-/Kindergeldentwürfe, beschlossene Kindergeld-Verwaltungsvereinfachung, verkündete NRW-KiBiz-Fassung ab August 2027 und unverbindliche Elterngeldreformdiskussion.
- Neuer NRW-Kita-Bedarfsanzeigetermin sechs Kalendermonate vor Start im Antragsassistenten; Kindergeld-Antragsweg wird nur bedingt als automatisch beschrieben.
- §2c BEEG: Arbeitnehmer-Pauschbetrag-Datum des Vorjahres explizit im Antragsassistenten. Kein versehentliches Vorziehen geplanter Steuerwerte.
- Die öffentliche Release-Sperre bleibt unverändert, Mutterschutz-Referenzabweichung weiterhin offen.


## 3.5.0 – zusätzliche Behördenwerte und vorsichtige 2027-Prognose, 15.10.2026

- Zwei zusätzliche monatliche, amtlich veröffentlichte Geldbeträge und acht vollständige 12-/24-Monatssummen unabhängig gegen die bestehende 36-LM-Finanzprojektion überprüft (insgesamt 48 Geldbetragskontrollen).
- Mutterschutzreferenzen des Bundesfamilienportals, des NRW-Arbeitsschutzes, SGB V und MuSchG nebeneinander dokumentiert. Ein-Tages-Widerspruch bleibt ausdrücklich offen und hält die öffentliche Freigabe gesperrt.
- Geburten 2027 können nach vollständiger Eingabe unverbindlich mit einer begrenzten Modellvorlagensuche durchgerechnet werden. Diese Prognosen **bleiben NICHT_UNTERSTUETZT / valid=false** und sind als solche im Ergebnis gekennzeichnet.
- Individuelle Erwerbsnettos und Elterngeld-Netto-Werte je Lebensmonat als manuelle Eingaben; getrennte Berechnung, Importvalidierung und L-Bank-Integrationsfall mit sechs wechselnden Teilzeitgehältern.
- Gesetzesentwurf zur Kindergelderhöhung 2027/28 als geplante, nicht geltende Zukunftsleistung dokumentiert. Ohne externe Prüfungen keine Freigabestatusänderung.
- Sicherungstests für Prognose-Abgrenzung, Zukunftssonderfälle und offizielle Referenzen; Playwright-Port für isolierte Testumgebungen konfigurierbar.

## Dokumentation und Integrationsvorbereitung – 15.10.2026

- Ausführliches Buildlog mit Commit-Historie, reproduzierbaren Befehlen, Prüfnachweisen und Merge-Verfahren.
- Entwickler-Handoff mit Modulkarte, Dateninvarianten, Datenschutz, bekannten Grenzen und nächstem Auftrag.
- Priorisierte Roadmap mit Abhängigkeiten und Abnahmekriterien; Nutzerauftrag zum Merge dokumentiert, öffentliche Freigaben unverändert offen.

## 3.4.0 – fortgesetzter interner Prüfstand, 15.10.2026

- Bewiesene Eingabelücken bei Sonderfallflags, Elternschlüsseln und Quellenzeiträumen geschlossen.
- Importverlust bei Arbeits-/Leistungsmonaten und Bankbuchungen repariert; numerische Eingabegrenzen sowie Speicherentscheidung durchgängig geprüft.
- Einkommensbänder je Elternteil und einheitliche Szenarien für Diagramm, Rücklagen und robuste Zielsuche.
- Mütterliche/väterliche Schwerpunktvarianten mit Erhaltung der Mutterschutzmonate, individuellen Regelprüfungen und kompakteren Suchschlüsseln.
- Gewöhnliche 35-Stunden-Teilzeit ohne Elterngeld und ohne Elternzeit von Teilzeit während Elternzeit getrennt.
- Neue vollständige Browser-Roundtrips und vertiefte amtliche Quellprüfung dokumentiert; öffentliche Freigabe weiterhin gesperrt.

## 3.3.0 – interner Prüfstand, 14.10.2026

- Konsolidierte Feature-Basis aus PR #10/#11 und Dokumentation aus PR #9; `main` bleibt unverändert.
- Eigenständiger Regelvalidator mit vier Statuscodes, Eltern-/Monatsbezug, Quellenmetadaten und Alternativen. Fehlendes zvE, unbestätigter Standardfall und unbestätigte Zukunftskohorten erhalten keine positive Aussage.
- Gemeinsame Datumsrechnung für Kalender, Validierung und Finanzprojektion; Monatsenden und Acht-Wochen-Frist korrigiert. Konkrete Abweichung vom amtlichen Mutterschutzbeispiel bleibt sichtbar und blockiert öffentliche Abnahme.
- Mehrere editierbare Elternzeitabschnitte, unabhängige Arbeits- und Leistungsmonate mit Anschluss an die Finanzprojektion sowie tatsächliche Bankbuchungen.
- Drei erläuterte Suchprofile, Dublettenprüfung, echte Null-Ergebnisse, vollständiger Vergleichszeitraum für Mindestbudget und vorsichtiges Szenario beim Robustheitsziel.
- Drei unabhängige Budget-Stresstests mit Engpassmonaten und erforderlicher Anfangsrücklage; NRW-/Köln-Antragscheckliste mit datierten Fristen und Unterlagen.
- Dreischritt-Einstieg, korrigierte Navigation, mobile Layoutprüfung, Kontrast-/Tastaturverbesserungen, optionale lokale Speicherung, vollständige Löschung und geprüfter JSON-Import.
- Acht Chromium-Browserprüfungen mit 50 Axe-Scans und ausdrücklichem öffentlichen Release-Gate ergänzt. CI-Artefaktupload bleibt bei erschöpfter Quote separat dokumentiert. Alle Haushaltsdaten in Prüfungen synthetisch.

## 3.2.0

Erster getrennt testbarer Zeitachsen-Prototyp in PR #11; 59 Tests.

## 3.1.1

Zentraler versionierter Rechtskatalog und amtliche Betragsfixtures in PR #10; 51 Tests.

## V3.18 (18.10.2026) – interne Sicherheits- und Staging-Vorbereitung

Importstatus-Codes sind auf eigene erlaubte Einträge begrenzt; privater, nur loopback-gebundener Staging-Build mit gehashtem Skript-CSP und reproduzierbarer Header-Vorlage ist vorbereitet. **Keine öffentliche Bereitstellung und keine neue externe Freigabe.** [Prüf- und Betriebsdokument](docs/STAGING-UND-FREIGABE-V318-2026-10-18.md).

## Amtliche BEEG-Richtlinien Juli 2026 – zusätzliche Teilreferenz

Die 07/2026-Richtlinien bestätigen an einem veröffentlichten **7/31-Beispiel** die taggenaue Anrechnung nach BEEG § 3. Eine neue, explizit **nicht als vollständiger Familien-Review gezählte** Zeitachsenregression prüft den veröffentlichten Teilfall; die 4/30-gegen-5/30-Frage vom 20.05., **0/10 externe Familienreferenzen** und alle externen Freigaben bleiben offen. Details: [Fachquellen-Abgleich](docs/FACHABNAHME-RICHTLINIEN-2026-10-18.md). Die 2027er-KiBiz-Fassung ist getrennt von der nicht freigegebenen BEEG-Prognose zu behandeln.

## V3.20 – Nachweisgebundene Release-Sperre (18.10.2026)

Der Release-Direktbefehl prüft neben Administrations-Flags jetzt die unabhängig validierten Familien-/Nutzer-Evidenzen, Mutterschutz-Fachentscheid, aktuelle SHA-256-Hashes der Offline-HTML-Seiten und einen echten extern kontrollierten Betreiberentscheid. Manipulierte Freigabe-Flags allein lösen **keine** Produktfreigabe mehr aus. Bestehende Referenzfamilien: **0/10**, reale Nutzertests: **0**, 4/30-gegen-5/30-Differenz und externe Rechts-/Datenschutz-/Betreiberfreigaben offen. **Keine Änderung an Berechnung, Paketversion, JSON-Schema oder den echten Freigabedateien.** [Tests und Nachweise](docs/RELEASE-EVIDENZ-SPERRE-V320-2026-10-18.md).

## GitHub Pages – öffentliche, ausdrücklich unfreigegebene Testvorschau

Ein ausschließlich manuell ausgelöster GitHub-Actions-Workflow stellt für Tests **nur zwei HTML-Seiten** als öffentlich abrufbare Pages-Vorschau bereit. Beide Seiten tragen eine sichtbare Warnung, Noindex und ein JavaScript-SHA-CSP. Das Repository bleibt privat; die Vorschau ist **öffentlich**, erfordert fiktive Testdaten und ist kein rechts- oder datenschutzgeprüftes Produkt. Die eigentliche öffentliche Produkt-Release-Sperre bleibt BLOCKED; **keine** automatische Veröffentlichung bei Push auf main. [Testanleitung](docs/GITHUB-PAGES-TESTVORSCHAU-2026-10-18.md).

## Pages-Testseiten-Review: nachvollziehbarer Build und synthetische Daten

Die nächste **manuell ausgelöste** öffentliche Pages-Testvorschau zeigt nun die Paketversion 3.10.0, den getrennten Stand der Rechtsquellen (15.10.2026), den exakten Git-Commit samt Link und – im GitHub-Workflow – die Ausführungs-ID. Historische V3.15/V3.16-Modulnamen werden getrennt erklärt. Alle Eingabe-, Zeitachsen-/Buchungs- und Ergebnisansichten verweisen in dieser Vorschau ausdrücklich auf **ausschließlich synthetische Testdaten**. Die Original-Offline-Quellen bleiben unverändert; JSON-Schema 1 und Rechenlogik ebenfalls. Die NRW-KomNet-Fachauskunft stärkt die eigenständige Schutzfrist-Herleitung, **löst die 4/5-Tage-Anrechnung nicht abschließend**. P0-A/B/D/E und Betreiberfreigabe bleiben offen. Die Vorschau wird nicht automatisch beim Merge veröffentlicht. [Externer Review-Abgleich, Prüfergebnisse und Rollout-Grenzen](docs/PAGES-REVIEW-ABGLEICH-2026-10-18.md).
