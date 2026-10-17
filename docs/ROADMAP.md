# Geplante Roadmap zur öffentlichen Beta

Stand der aktiven Arbeitspakete: **17. Oktober 2026 / interner V3.14-Code** (technische Paket-/Exportversion noch 3.10.0, keine öffentliche Beta). Die aktuelle [Review- und Evidenzmatrix](../data/roadmap-status-2026-10-17.json) zählt **vier technisch umgesetzte, drei teilweise umgesetzte und fünf extern offene Prüfpakete**. Reihenfolge nach Abhängigkeit und Priorität; keine zugesagten Termine. Repository-Integration und öffentliche Freigabe sind getrennte Entscheidungen. Implementiert bedeutet noch nicht unabhängig fachlich abgenommen.

**Ergänzung V3.5.0:** Acht zusätzliche publizierte 12-/24-Monats-Summen, zwei Mindest-/Geringverdienstfälle und vier amtliche Familienbeträge mit variierenden Teilzeitgehältern sind gegen die echte Programmprojektion getestet. Das Mutterschutz-Delta ist nun quellenübergreifend als widersprüchliche Behördenaussage belegt, **nicht** behoben. Für 2027 besteht eine mit Warnung und strikter Validierungssperre gekennzeichnete Prognosesuche, nicht eine gesetzliche Freigabe. [Vollständiger Abgleich](AMTLICHE-REFERENZPRUEFUNG-2026-10-15.md).

**Erweiterung V3.6.0:** Vier echte anonymisierte historische Bescheidverfahren als quellengebundene Dokumentreferenz, ohne behauptete vollständige Berechnung. Einkommensarten einschließlich Provisionen/Einmalzahlungen werden in der UI unterschieden und für die Standard-Fachfreigabe konservativ blockiert. Kindergeldentwurf/Antragsautomatisierung und KiBiz NRW 2027 sind getrennt datiert; die Kita-Bedarfsanzeigefrist wird aus Lebensmonat und Geburtsdatum berechnet. [Detaillierte Evidenzgrenzen](HISTORISCHE-BESCHEIDE-UND-RECHTSSTAND-2027.md).

**Ergänzung V3.8:** Fünf direkt auswählbare Beispielvorlagen, kurzer Eingabeassistent und strikte Kennzeichnung unbekannter Haushaltsausgaben. Bereits dokumentierte rechtliche Freigabelücken bleiben offen. [Details und Prüfumfang](SCHNELLSTART-V3.8.md).

**Stand V3.9 (interner Kandidat):** Datenverlust-/Reset-/Vorlagenhorizontfehler behoben, Kostenwarnungen über Schnellstart und Robustheitsansicht vereinheitlicht, mobile Einstiegshürde deutlich verringert, Tastatur- und Fehlerführung verbessert. [Details/Tests](UX-NACHBESSERUNG-V3.9.md). Externe Nutzer- und Fachabnahmen weiterhin offen.

**V3.11 (separater Entwicklungszweig, ohne Release-Anspruch):** Geführter Einstieg in die vorhandene Zielsuche sowie 0–6-Monate-Kita-Verzögerungsanzeige und bessere Monatslückenhinweise implementiert. Finanzielle Kita-Folgeberechnung, unabhängige Fachfreigaben und vollständiger Pareto-Suchraum folgen getrennt. [Arbeitsstand](AUSBAU-V3-11-FAMILIENUEBERGANG.md).

**V3.12 (lokaler Entwicklungszweig):** Kita-Verzögerung mit ausdrücklich gesetzten Kosten-/Einkommensannahmen und nur manuell bestätigtem Wegfall bereits eingeplanter Kita-Gebühren; 2D-Pareto-Erklärung unter den validierten Suchmustern; kalenderbasierte Darstellung nur erfasster Bankbuchungen und eine nicht gespeicherte, optionale Anfangsrücklage. Kein automatisches Elterngeld- oder Zahlungsreforecast, keine Rechtsfreigabe. [Technische Grenzen und offene Schritte](AUSBAU-V3-12-KITA-LIQUIDITAET-ZIELKONFLIKTE.md).

**Statusreview V3.13 vom 17.10.2026:** Technische Zusatzpakete für manuell erwartete Kalendertagszahlungen und Verzögerungen, Versicherungs-/Steuerhinweise, amtliche Leistungslotsen, historische Kita-Gebührenorientierung, Nachweise der eingeschränkten Suche, Quellenstatusprüfung, Fristen-ICS und versionierte JSON-Exporte sind implementiert. Die unabhängigen P0- und P1-R8-Abnahmen bleiben offen. Die aktualisierte überprüfbare Matrix trennt technische Fertigstellung von externer Freigabe: [Roadmap-Abschlussstand](ROADMAP-ABSCHLUSSSTAND-2026-10-17.md).

**Nacharbeit V3.14 vom 17.10.2026:** Manuelle Versicherungskosten-/Steuerrücklagen-Szenarien, alle drei Kölner Gebühren-Altersgruppen als datiertes Referenzmodul, technischer 256er-Mikro-Suchraum, optimierte schrittweise Suche, Bereinigung überschriebener Controller-Funktionen und ausführbare Prüfnachweise für Privatsphäre, Mutterschutzdelta und zehn vorbereitete externe Fachfälle. Die Rechts- und Nutzerabnahmen bleiben ausdrücklich offen. [V3.14 Fachreview-Paket](ROADMAP-FACHABNAHME-V314-2026-10-17.md).

## Erreichter Stand

| Bereich | Implementiert | Noch offen |
| --- | --- | --- |
| Regeln / #2 | Versionierter Katalog, Quellen, Prüfdaten, Gültigkeit, Snapshot-CI | Wiederprüfung veränderlicher Regeln und 2027; restliche Legacy-Parameter |
| Zeitachsen / #3 | Taggenauer Mutterschutz, Lebensmonate, mehrere Elternzeitabschnitte, unabhängiger Erwerb/Bezug und Bankbuchungen | Unabhängige Abnahme der Datumsgrenzen und Mutterschutz-Anrechnung |
| Validator / #4 | Vier Statuscodes, erklärbare Findings, konservative Eingabe-/Quellenprüfung | Fachreview, vollständige Referenzfamilien |
| Zielsuche / #5 | Mutter-/Vater-Schwerpunkte, drei Profile, strenge Filter, veraltete Empfehlungen gesperrt | Quantifizierte Abdeckung, Reaktionsfähigkeit, breitere Arbeitsmuster |
| Budget / #6 | Drei Szenarien, persönliche Erwerbsbänder, Rücklagen und Engpässe | Amtliches Netto, unabhängige Teilzeitfälle, Steuer-/Versicherungseinordnung |
| Region / #7 | Datierte NRW-/Köln-Antragswege, Checkliste, unbestätigte Zuschläge ausgeschlossen | Aktuelle Tarif-/Anspruchsnachweise mit Wiederprüfverfahren |
| UX/QA / #8 | Responsiv, Offline, Speicher-Opt-in/Löschung, Import/Export, aktuelle Tests und Browsernachweise im [QA-Bericht V3.10](QA-V3.10.md) | Datenschutz-/Rechtsreview, Nutzertests, Assistenztechnik, weitere Browser |
| Referenzen / #1 | Acht veröffentlichte Beträge, vier Grenzen, 22 Formelableitungen, sichtbarer Tagesdelta | Mindestens zehn vollständige unabhängige Standardfamilien; Kerndifferenz klären |

Issues #1–#8 bleiben bis zur jeweiligen Abnahme offen. Ursprung: [MVP-Spezifikation](MVP-2026-10-14.md). Historische Fortschritte: [Changelog](../CHANGELOG.md), [Buildlog](BUILDLOG.md), [Abnahmebericht](MVP-ABNAHME-2026-10-15.md).

## P0 – Fachliche Voraussetzungen

### P0-R1: Taggenaue Mutterschutz-Anrechnung klären

**Bezug:** #1, #3, #4. **Blockiert:** öffentliche Fachfreigabe.

- Geburt 20. Mai mit tatsächlichem/erwartetem Termin, Schutzfrist und betroffenem Lebensmonat vollständig dokumentieren.
- Kalenderrecht und Anrechnung der Mutterschaftsleistungen getrennt belegen. Bundesrechner-Kalenderfunktion allein beweist keinen Restgeldbetrag.
- Amtliche Richtlinie oder unabhängigen Behördenfall zum Teilmonat prüfen. Bei Widerspruch Fachentscheidung dokumentieren und Sperre erhalten.
- Erst nach bestätigter Grundlage Code/Referenz ändern; Originalquelle und frühere Abweichung historisch erhalten.

**Abnahme:** Unabhängiger Reviewer kann Tage und Geldbetrag aus Quellen reproduzieren; begründeter Delta-Bericht. Ungeklärte Abweichung bleibt Release-Blocker.

### P0-R2: Vollständige Referenzmatrix erweitern

**Bezug:** #1, #4, #5. **Abhängigkeit:** parallel zu R1 vorbereitbar; Geldabnahme braucht geklärte Formeln.

- Mindestens zehn vollständige synthetische Standardfamilien mit unabhängig amtlich belegten Eingaben/Ergebnissen dokumentieren.
- Basis/Plus-Wechsel, beide Eltern, Teilzeit, Bonus, Einkommensgrenzen, minimale/maximale Beträge und Monatsendgeburten abdecken.
- Je Fall Herkunft, Gültigkeit, Prüftag, Bemessungsannahmen und monatliche Sollbeträge erfassen. Publizierte Einzelwerte nicht als vollständige Familien umetikettieren.
- Vergleich mit Bundesrechner nur bei gleichartigen Brutto-/Steuer-/Versicherungsdaten; eingegebenes Elterngeld-Netto ist kein identischer Ausgangsfall.

**Abnahme:** Reproduzierbare Soll-/Ist-Deltas mit begründeter Toleranz; unabhängiger Fachreview der wichtigsten Finanzfälle. Keine Erwartungen an unerklärte Implementierungswerte angleichen.

### P0-R3: Amtliche Nettoermittlung spezifizieren und absichern

**Bezug:** #1, #2, #6. **Abhängigkeit:** Spezifikation vor Umsetzung; R2 begleitet Entwicklung.

- Beschäftigungs-/Bemessungsfall definieren: laufende Bezüge, ausgeschlossene Bestandteile, relevante Monate, Steuerklasse, Pauschalen, Versicherungsmerkmale.
- Nicht unterstützte Einkommen/Unterbrechungen sperren oder transparent manuelle Elterngeld-Netto-Eingabe anbieten.
- Erwerbsnetto, Elterngeld-Netto, Mutterschaft und tatsächliche Zahlung getrennt benennen.
- Reine Berechnungsmodule mit datierten Parametern ergänzen; bestehende manuelle Planung erhalten.

**Abnahme:** Unabhängige vollständige Standardfälle innerhalb begründeter Toleranz. Oberfläche unterscheidet berechnete und manuell geschätzte Werte. Keine Scheingenauigkeit bei Sonderfällen.

### P0-R4: Rechts-/Standardfallreview abschließen

**Bezug:** #2, #3, #4. **Abhängigkeit:** geklärte Grundlagen; Quellenpflege parallel möglich.

- Jede relevante Regel auf amtliche Quelle, tatsächliches Prüfdatum, Gültigkeit und Kohorte kontrollieren.
- Kontingente, gleichzeitigen Bezug, Bezugsgruppen, Bonusstunden, Mutterschutz und unabhängige Arbeitgeber-Elternzeit systematisch prüfen.
- Fehlende Daten, Typfehler, Sonderfälle und unbekannte Quellen in UI und Engine prüfen.
- Geburten 2027 nur nach eigener Rechtsprüfung freigeben; Softwaredatum ist kein Nachweis.

**Abnahme:** Unabhängiger Fach-/Rechtsreview mit Scope, Einschränkungen und Reviewerentscheidung. Nur tatsächlich bestätigte Gates in `data/release-gates.json` ändern.

## P1 – Planung und Bedienung

### P1-R5: Suchraum und Reaktionsfähigkeit

**Bezug:** #5. **Parallel möglich:** ohne Änderung ungeklärter Rechtsformeln.

- Erzeugte/eindeutige/ausgesonderte/geeignete Kandidaten und Ausschlussgründe verständlich ausweisen.
- Lange Suche unterbrechen/abbrechen können; Worker oder schrittweise Auswertung mit weiter bestehender Einzeldatei-Verteilung prüfen.
- Weitere Teilzeitstarts/Wiedereinstiegsmodelle ergänzen; Abdeckung an kleinen vollständig enumerierbaren Teilräumen messen.
- Gleichmäßige Betreuung nachvollziehbar bewerten. Monatscodes nicht als exakte Betreuungsstunden darstellen.

**Abnahme:** Dokumentierter Benchmark, bedienbar auf Smartphone, Abbruch ohne Zustandsverlust. Alle Ergebnisse passieren denselben Validator. Keine unbelegte globale Optimalität.

### P1-R6: Budget und Liquidität vertiefen

**Bezug:** #6. **Abhängigkeit:** genaue Leistungsberechnung braucht P0; Anzeige unabhängig verbesserbar.

- Steuer-/Jahreswirkung und individuelle Versicherungsbeiträge fachlich abgrenzen oder nach geprüfter Grundlage modellieren.
- Anspruchsszenarien von einer optionalen ausdrücklich angenommenen Zahlungsplanung trennen.
- Kita-Einstieg, Eingewöhnung, Betreuungskosten und sonstige Ausgaben besser vergleichbar machen.
- Mindestbudget, Engpassmonate und Rücklagen direkt zwischen Varianten vergleichen.

**Abnahme:** Keine doppelte Mutterschaft, keine erfundenen Bankeingänge; identische Stressannahmen in Karte/Diagramm/Suche; unabhängige Monatsfälle geprüft.

### P1-R7: NRW/Köln-Daten aktualisieren

**Bezug:** #7. **Parallel möglich:** keine pauschalen Zuschläge freischalten.

- Aktuelle amtliche Tarife/Leistungen mit Anspruchsdatum, Gültigkeit, Einkommen und Betreuungskonstellation erfassen.
- Regeladapter pro Region, Wiederprüfdatum und zuständige Behörde pflegen.
- Checkliste um geprüfte dokumentabhängige Varianten ergänzen; Fristen mit Datum erklären.
- Historische Tarife informativ erhalten; nur bestätigte Werte optional ins Budget übernehmen.

**Abnahme:** Quellen-/Datumsbeleg pro Zahl; abgelaufene/unbestätigte Regel addiert null. Offizielle Links/Zuständigkeit geprüft.

### P1-R8: Nutzertests, Datenschutz und Barrierefreiheit

**Bezug:** #8. **Abhängigkeit:** vor öffentlicher Beta zwingend, parallel zum Fachreview organisierbar.

- Mit repräsentativen Testpersonen Einstieg, Begriffe, Suche, Engpassverständnis und Export prüfen; keine privaten Daten im Repository.
- Datenschutzinformationen und lokale Speicherung unabhängig prüfen, einschließlich geteilter Geräte und Exporte.
- Tastatur, Fokus, Screenreader, Vergrößerung und Touch manuell prüfen; weitere Browser berücksichtigen.
- Kritische Befunde beheben und nachtesten; Unsicherheit verständlich darstellen.

**Abnahme:** Protokoll mit Scope/Befunden, keine kritischen offenen Probleme, echte Reviewentscheidung. Axe allein genügt nicht.

## P2 – Wartung und Architektur

- Legacy-Doppeldefinitionen/Events schrittweise in eindeutige UI-/Importmodule überführen; Offline-Single-HTML erhalten.
- Datenformatschema/Migrationen versionieren; alte/neue Export-Roundtrips und Privatsphäre prüfen.
- Actions auf unterstützte Laufzeiten migrieren; Artefaktquote verwalten, ohne fremde Nachweise ungefragt zu löschen.
- Stabile visuelle Regressionen mit synthetischen Fixtures und nachvollziehbarer Freigabe ergänzen.
- Weitere Regionen/Sonderfälle erst als eigene validierte Pakete nach Standardfallabnahme.

**Abnahme:** Kleine überprüfbare PRs, keine Funktionsverluste, synchroner Offline-Build und relevante Regressionen grün. Architekturwechsel begründen und einfach verteilbare Version erhalten.

## Release-Gates: Definition „Beta bereit“

1. Verbindliche P0-Funktionen implementiert und unabhängig geprüft.
2. Wichtige Finanz-/Datumsfälle reproduzierbar belegt; keine ungeklärte kritische Kerndifferenz.
3. Rechtsquellen/Kohorten eindeutig, Sonderfälle und Schätzungen transparent.
4. CI, Browser, Offline, Import und Datenschutzprüfungen grün; keine kritischen Befunde.
5. Fach-, Rechts-, Datenschutzreview und Nutzertests dokumentiert und freigegeben.
6. README, Anleitung, Buildlog, Handoff, Quellen und Einschränkungen aktuell.
7. Release Candidate mit exaktem Commit; gesonderte Entscheidung zur öffentlichen Veröffentlichung.

`npm run release:check` bleibt derzeit rot. Merge, grüner CI-Lauf und Versionsnummer erfüllen diese Liste nicht automatisch.

## Ablauf pro Paket

GitHub-Stand/amtliche Grundlage prüfen → Feature-Branch → implementieren → relevante automatische/visuelle Prüfungen → Delta/Quellen/Dokumentation → PR mit Evidenz und Grenzen → Review/Merge gemäß Auftrag. Bei Fachblockern parallel unabhängige Pakete bearbeiten. Historische Nachweise nicht umdeuten und Dritte nicht ungefragt kontaktieren.

## Produktreview nach erneuter Wettbewerbsrecherche

Der [Audit vom 15.10.2026 gegen V3.6](WETTBEWERB-MVP-AUDIT-2026-10-15.md) bestätigt Marktüberschneidungen bei Optimierung, Budget, lokalem Betrieb und Quellen. Priorität für den Nutzenbeleg: Eingaben entpersonalisieren und Netto-Einstieg führen; Betreuung/Mindestbudget/Rücklage samt vorsichtigem Fall direkt zwischen Plänen vergleichen; Suchvielfalt und Verständlichkeit testen. Die ursprüngliche MVP-Spezifikation erlaubt transparente manuelle EG-Netto-Werte. Eine vollständige Bruttoengine ist eine bewusst zu entscheidende Ausbaustufe, kein durch den Wettbewerbsvergleich nachträglich bewiesenes Muss. Fachfreigaben und Referenzabweichung bleiben unverändert offen. Zusätzlich QA-Metadaten zur tatsächlichen Version konsolidieren: CI V3.6 belegt 186/13, lokaler eingecheckter Browserumgebungsnachweis nennt noch V3.4/11.

## Umsetzung der Produktprioritäten V3.7

Neutraler Netto-Einstieg, materielle Ergebnisvielfalt, direkter realistischer/vorsichtiger Budgetvergleich und bedienbar unterbrechbare Suche sind umgesetzt; siehe [Abschlussnachweis](UMSETZUNG-ZIELBUDGET-V3.7.md). Die Cent-Rundung ist amtlich belegt und implementiert. 217 Node-Tests sowie 16 Dateiprotokoll-Browserfälle mit 52 Axe-Scans bestehen.

P0-R1 bleibt hinsichtlich des Mutterschutz-Eurobetrags offen. P0-R3 ist für den ausdrücklich erlaubten manuellen MVP-Eingabeweg technisch umgesetzt; eine vollständige automatische Bruttoengine bleibt gesonderter Ausbau und wird nicht vorgetäuscht. Fachreview der tatsächlichen Monats-/Nettoeingaben bleibt erforderlich. P1-R5/R6 sind hinsichtlich Vielfalt, Abbruch und Direktvergleich verbessert; globale Suchvollständigkeit und Zahlungsliquidität bleiben ausgeschlossen. P1-R8: [Nutzertestprotokoll](NUTZERTEST-PROTOKOLL-V3.7.md) vorbereitet, Durchführung und unabhängige Reviews offen. Keine öffentliche Freigabe.


## Fortsetzung V3.10: kleine Infowebseite und nächste Abnahme

`start.html` bündelt Schwangerschafts-/Familienstarttipps, amtliche Beratung und Rechnerzugang. Kontextwissen und direkte Korrekturschritte verbessern die Entscheidungsführung; centgenaue Budgetbuchungen beseitigen Phantomdefizite. Diese Produktarbeit ersetzt keine der offenen P0-Fachabnahmen.

Nächste priorisierte Pakete:

1. P0-R1 und P0-R2: Mutterschutz-Eurobetrag unabhängig klären und vollständige Referenzfamilien verbreitern.
2. Öffentliche Anbieter-/Impressumsangaben sowie Rechts-/Datenschutz-/Redaktionsreview für beide Seiten klären; Freigaben dokumentieren.
3. Echte formative Tests auf Smartphone: Informationsbedarf finden, eigene Werte verstehen, Betreuungslücke erkennen und passende Beratung erreichen.
4. Quellenwartung für Schwangerschafts-/Beratungslinks und Geburtskohorten; regionale Vertiefung Köln/NRW belegen. Neue medizinische Inhalte nur mit belastbarer redaktioneller Grundlage.
5. Assistenztechnik und weitere Browser prüfen. Keine behauptete globale Suchoptimalität, medizinische Empfehlung oder 2027-Freigabe.
