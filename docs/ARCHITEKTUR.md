# Architektur – interner Code-Stand V3.14, historisch aus V3.7 erweitert

Der verteilbare Rechner bleibt eine einzelne lokale index.html; die optionale Familienstartseite start.html wird daneben verteilt. Es gibt kein Backend, Konto, Laufzeitpakete oder Telemetrie. Node-Abhängigkeiten dienen ausschließlich Entwicklung und Tests. Diese Entscheidung erhält die Offline-Verteilung und vermeidet die Übertragung privater Haushaltsdaten.

## Fachlicher Datenfluss

1. Der datierte JSON-Rechtskatalog ist die Quelle für Rechtsparameter. `rules:sync` erzeugt den HTML-Snapshot; `rules:check` blockiert Drift.
2. `src/time-axes.cjs` erzeugt Lebensmonate, taggenauen Mutterschutz, Kalender-Elternzeit, Arbeits- und Leistungsachsen sowie separat validierte tatsächliche Buchungen.
3. `src/planning-model.cjs` übersetzt unabhängig erfasste Arbeitsstunden und Leistungsarten in Eingaben der bestehenden Finanzformel. Elternzeitintervalle verändern keine Löhne oder Leistungsarten. Die alten Monatscodes bleiben als kompatible Eingabe erhalten.
4. `src/rule-validator.cjs` prüft die Planung gegen den Katalog. Nur `PLAUSIBEL_STANDARD` erlaubt ein positives Standardlabel. Quellenlücken, fehlende Angaben und nicht unterstützte Fälle verhindern es.
5. Die bestehende Finanzformel berechnet geschätzte Ansprüche und Einkommen nach Lebensmonat. `src/family-budget.cjs` erstellt zusätzlich drei Stresstests mit Engpässen und kumulierten Rücklagen. Budgetdiagramm, Rücklagen und robuste Zielsuche verwenden dieselbe Komponentenprojektion; persönliche Erwerbsbänder und konstante Mutterschaftsleistungen werden getrennt behandelt.
6. Die begrenzte Vorlagensuche filtert Regeln, Betreuung und Mindestbudget. `src/candidate-patterns.cjs` ergänzt unabhängig geprüfte Rollenvarianten. `src/goal-ranking.cjs` wählt unterschiedliche Finanz-, Betreuungs- und Robustheitsprofile. Die Auswahl ist lexikografisch; kein globales Optimum wird behauptet.
7. `src/application-guide.cjs` erzeugt datierte Aufgaben und NRW-/Köln-Antragswege. Historische Kommunalbeträge und manuelle Zusatzleistungen ohne geprüften Nachweis werden nicht automatisch addiert.

Die Module bleiben mit CommonJS direkt unabhängig testbar. `axes:sync` und `modules:sync` erzeugen die Inline-Bundles. Die Tests kontrollieren die Übereinstimmung mit dem Modulquelltext.

## Datenhaltung und Import

Standardmäßig bleiben Eingaben im Arbeitsspeicher. Erst ausdrückliches Aktivieren speichert einen Plan im Browser-`localStorage`. Diese Speicherung ist unverschlüsselt; das UI erklärt dies. Ein Ausschalten entfernt alle bekannten Versionsschlüssel. Die Löschaktion entfernt lokale Kopien und behält den derzeit geöffneten Plan bis zum Schließen. Alte ohne Einwilligung gespeicherte Pläne werden nicht automatisch geladen.

JSON-Import begrenzt Dateien auf 1 MB, verwendet bekannte Felder, prüft Datums-/Zahl-/Stunden-/Monatswerte und die unabhängigen Achsen. Ein Export darf die Speicherung nicht aktivieren. Sonderfallangaben dürfen durch Import nicht zu einer positiven Standardbestätigung werden. Manuelle Zusatzbeträge und Zustimmungsschalter stellen keinen amtlichen Anspruchsnachweis dar. CSV enthält Monatsdaten ohne freien Nutzereingabetext.

Bankbuchungen verwenden tatsächliche Kalendertage. Sie werden niemals aus einem Leistungsanspruch erfunden oder als Bewilligungsnachweis verwendet. Geburtsdatum und erwarteter Termin werden getrennt gehalten.

## Fachliche Grenzen

Schätzcharakter und strukturierter Prüfstatus sind in jeder Ansicht direkt unter der Budgetübersicht sichtbar. Die vollständige amtliche Brutto-Netto-Ermittlung fehlt weiterhin; eingegebenes Elterngeld-Netto und Stunden-Netto sind Schätzwerte. Der Mutterschutzvergleich weist eine konkrete amtliche Referenzabweichung auf, siehe Zeitachsen-Dokumentation und Abnahmebericht. Steuerwirkung, Kranken-/Pflegeversicherung, Rückforderungen und Sonderfälle brauchen unabhängige Prüfung. Daher bleiben auch die bis V3.14 entwickelten Erweiterungen ein interner Prüfstand und kein fachlich freigegebener öffentlicher Release Candidate.

Ab V3.4 verwenden Budgetdiagramm, Rücklagen und vorsichtige Zielsuche dieselbe Komponentenprojektion mit getrennten väterlichen/mütterlichen Einkommensbändern. Die historische Sensitivitätsrechnung auf der Elterngeld-Einkommensbasis wird nicht mehr parallel als gleichnamiger Stresstest angezeigt.

## V3.7: Entscheidungsoberfläche und Suche

`src/money.cjs` rundet Geldbeträge auf Cent nach amtlich dokumentierter Zwischenschrittregel. `src/plan-comparison.cjs` verwendet für alle Vorschläge ausschließlich die gemeinsame FamilyBudget-Projektion. Der Offline-Embed platziert abhängige Module nach ihren Abhängigkeiten.

Eine Generatorfunktion ist die gemeinsame Kandidatenquelle für synchrone Regressionstests und schrittweise Browserauswertung. Im aktuellen V3.14-Controller werden nach je **512 erzeugten Rohvarianten** Zwischenstände an den Event-Loop zurückgegeben; Abbruch und suchrelevante Eingabeänderung veröffentlichen keinen Teilplan. Fortschritt und erste Filtergründe werden getrennt erfasst. Die Rankingauswahl bewahrt die erste Zielpriorität und fordert materielle Unterschiede gegenüber allen vorigen Vorschlägen.

Bezeichnungen und Einkommenseinstieg sind streng validierte Zusatzfelder des JSON-Plans. Textknoten und Beschriftungen zeigen Namen ohne HTML-Interpretation; interne Elternschlüssel bleiben stabil. Die Einkommensherkunft ist nur eine Benutzerangabe. Der manuelle MVP-Pfad berechnet kein amtliches Netto aus Bruttoreferenzen. Details: [Umsetzungsbericht](UMSETZUNG-ZIELBUDGET-V3.7.md).


## Erweiterung V3.10: Infowebseite und Kontextwissen

`start.html` ist ein buildloser redaktioneller Einstieg und verweist auf den bestehenden Einzeldatei-Rechner `index.html`. Alle Laufzeitassets sind inline/lokal; Beratungsangebote werden als externe Links geöffnet. Kein neues Backend, Konto, Tracking oder medizinischer Datenspeicher. Beide Dateien zusammen verteilen; `index.html` bleibt eigenständig benutzbar.

`planning-knowledge.cjs` enthält kuratierte, datierte amtliche Hinweise und eine reine kontextbezogene Auswahlfunktion. Die HTML-Integration rendert escaped Texte, sichere externe Quellenlinks und native aufklappbare Elemente. Konkrete Lebensmonatsbeispiele delegieren an `time-axes.cjs`. Die Auswahl besitzt ausdrücklich keine Budgeteffekte und trifft keine Anspruchsentscheidung.

Budgetprojektionen runden einzelne Szenariokomponenten mit `money.cjs` und rechnen Summen/Präfixsalden als Integer-Cent. Das ist eine technische Buchungskonvention für Schätzbudgets, keine Behauptung einer amtlichen Lohn- oder Kontorechnung. Schnellstartaufgaben werden aus bestehenden Validatorbefunden/Planungsannahmen abgeleitet und führen nur zur passenden Eingabe.

## V3.12 bis V3.14: Finanztransparenz, Metadaten und Prüforakel

- Die Quellen für Zahlungen aus angenommener Zukunft, tatsächliche Bank-Buchungen und in Lebensmonaten modellierte Ansprüche sind strikt getrennt. Das Modul src/expected-payments.cjs darf keine Bankeingänge aus dem Leistungsplan ableiten. src/calendar-export.cjs produziert nur ausdrücklich vorläufige Fristaufgaben.
- src/manual-cost-impact.cjs vergleicht von Nutzern ausdrücklich eingegebene zusätzliche Beiträge und freiwillige Steuerreserve in denselben FamilyBudget-Stresstests, ohne Beiträge oder Steuern automatisch zu berechnen. Versicherungsbeiträge, die schon in den Haushaltseingaben stecken, dürfen nicht doppelt berücksichtigt werden.
- src/cologne-fees.cjs liefert eine **historische** Gemeinde-Gebührenreferenz mit drei Altersgruppen. Das Modul verändert das manuelle Kostenbudget nicht und enthält keinen automatischen Rechtsnachweis für künftige Beitragsjahre.
- src/search-coverage.cjs zählt erzeugte, eindeutige und ausgeschlossene Suchvorlagen. src/microspace-proof.cjs enumeriert einen synthetischen 256er-Prüfraum vollständig und überprüft die technische Rangfolge. Weder der kleine Prüfraum noch die 512er-Schritte machen die gesamte 36-Monats-Suche vollständig.
- Der Controller hat keine sich überschattenden doppelten Top-Level-Funktionen mehr. Ein statischer Guard überwacht diesen Zustand. Die Offline-HTML-Snapshots müssen nach jeder Moduländerung über npm run modules:sync und npm run quickstart:sync aktualisiert werden.
- Daten bleiben standardmäßig im Arbeitsspeicher; lokale Speicherung verlangt explizite Zustimmung. Die session-only-Varianten für Zahlungs- und Kostenpuffer werden nicht exportiert. Quellenstatus- und Privacy-Metadatenchecks ersetzen ausdrücklich keinen unabhängigen Fach-, Rechts-, Datenschutz- oder Nutzertestbericht.

**QA-Stand am 17.10.2026:** 375/375 Node-/DOM-Tests; 39/39 Browser-E2E und drei zusätzliche direkte file://-V3.14-Browserfälle. Für die offene Fachabnahme den Bericht ROADMAP-FACHABNAHME-V314-2026-10-17.md und data/roadmap-status-2026-10-17.json heranziehen. Das öffentliche Freigabe-Gate bleibt BLOCKED.

## V3.15: versionierte KiBiz-Fristen, Wochen-Eingewöhnung, local-only Status

- src/kibiz-cohorts.cjs ordnet das Betreuungsdatum der geltenden 2026er oder der ab 01.08.2027 verkündeten KiBiz-Fassung zu. Der Status PROMULGATED_FUTURE_EFFECTIVE wird nicht als geltende Elterngeld-Regel oder bestätigte kommunale Kita-Gebühr behandelt. Rechtliche Sechsmonats-Anzeige, mögliche örtliche frühe Vormerkung und vorläufige §50-Beitragsfreiheitsindikation werden getrennt ausgegeben.
- src/settling-in.cjs modelliert mit Siebentageintervallen rein hypothetische Kita-Verzögerung, Eingewöhnungs-Stundenrampe, fehlende Betreuungszeit, selbst angenommene Ersatzbetreuung und möglichen Arbeitsnettoausfall. Das Modul verändert weder s.schedule, Elterngeld-Netto, s.bankLedger noch gespeicherte s-Felder.
- src/benefits-navigator.cjs bildet nur offizielle Prüf- und Unterlagenwege ab. Der sechsmonatige Vorantragszeitraum für einen KiZ-Erstantrag wird kalender-, nicht lebensmonatsbezogen ermittelt. Folgeanträge erhalten ausdrücklich keine pauschale Vormonatsreihe.
- Antragsstatus offen / Unterlagen vorhanden / selbst erledigt ist ein ausschließlich temporärer Map-Wert im UI, dessen Identität vom Geburtsdatum, der Region, dem Wohnort, der konkreten Frist, dem Kitastart und dem Aufgabenstatus der Rechtskohorte abhängt. Eine geänderte Frist darf die erledigte Markierung einer alten Aufgabe nicht übernehmen. Die ICS-Datei exportiert nur noch nicht selbst erledigte Aufgaben und deklariert sie weiterhin als TENTATIVE.
- SchemaVersion des JSON-Plans bleibt 1. Die V3.15-Parameter sind nicht im Planmodell enthalten und werden bei Import/Reset neu initialisiert. Damit bleibt ein alter Elternzeitplan unabhängig von optionalen Szenarioanzeigen.

Details und offene unabhängige Prüfung: [V3.15 Ausbau](AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md). Insbesondere keine öffentliche Freigabe ohne die bisherigen Fach-, Rechts-, Datenschutz- und Nutzertests.


### V3.15.1 – Kein Durchmischen von Regellücke und Eingewöhnungsaufwand

Die Core-Funktion compareSettlingIn verarbeitet geplanten Kita-Start und tatsächlich geplanten Arbeitsbeginn getrennt. Die Wochen des tatsächlichen Übergangs tragen countsTowardTransition=true; die anschließende Regelwoche trägt previewOnly=true und wird weder summiert noch als Dauerleistung fortgeschrieben. Eine möglicherweise dauerhaft unzureichende Betreuung wird ausschließlich als Wochenstunden-Differenz angezeigt.

Die ebenfalls reine Funktion transitionLifeMonthBridge übernimmt ausschließlich die expliziten Übergangswochen und weist deren Kosten proportional zu den betroffenen *Kalendertagen* den Lebensmonaten des Kindes zu. Ganze Eurocent bleiben erhalten (größter Rest), auch an Monats-/Jahresgrenzen und bei außerhalb des 36-Monatsmodells liegenden Wochen. Ohne bekannte Haushaltsausgaben wird kein verfügbares Restbudget behauptet. Keine Modell-, Export-, Behörden- oder Kontomutation.
