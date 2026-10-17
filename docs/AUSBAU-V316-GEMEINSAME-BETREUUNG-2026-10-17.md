# V3.16 – Gemeinsamer Kita-/Arbeitswochenplan für beide Elternteile

**Stand:** 17.10.2026, interner Entwicklungszweig; keine öffentliche Freigabe. **Voraussetzung:** V3.15.2 mit datierter NRW-KiBiz-Ansicht, auf Wunsch geändertem Kita-Start und ausdrücklich hypothetischer Eingewöhnungsrechnung. Technisches Paket und JSON-Schema bleiben absichtlich Version 3.10.0 bzw. Schema 1 bis zu einer separaten Freigabe.

## Warum ein eigener gemeinsamer Wochenplan?

Die Summe von 28 + 28 Wochenarbeitsstunden sagt nichts darüber aus, ob Eltern gleichzeitig abwesend sind. Das neue reine Modul src/parent-coordination.cjs prüft daher eine **angenommene, gleichmäßig auf Montag bis Freitag verteilte Arbeitswoche in 15-Minuten-Schritten**. Es erfindet weder tatsächliche Arbeitstage noch einen frei verfügbaren Kita-Platz.

Ein eigenes, erst auf Wunsch geöffnetes Detail im regionalen Kita-Bereich ergänzt:
- **Elternteil A und B:** unabhängig geplante Wochenarbeitsstunden (0–40 Stunden in Viertelstunden), tägliche Arbeitsbeginnzeit und erster Arbeitseinsatz 0–24 Wochen nach der ursprünglich geplanten Kita-Aufnahme. Der Rückkehrzeitpunkt ist ein vom Benutzer erstelltes, nicht arbeitsvertraglich bestätigtes Datum.
- **Eigenes Wochen-Netto-Risiko** pro Elternteil, optional; nicht aus vorhandenen Bruttobeträgen oder Elterngeld geschätzt.
- **Begleitung während der Eingewöhnung:** A, B oder Wechsel über Montag bis Freitag, mit selbst eingetragener Begleitungszeit der ersten Kita-Woche und stufenweiser Reduzierung. Die Begleitung blockiert bei Überschneidung hypothetisch Arbeitsstunden der begleitenden Person.
- **Wenn beide während einer Kita-freien Zeit gleichzeitig arbeiten:** Die vom Benutzer angegebene, als flexibel verfügbare Ersatzbetreuung wird zuerst auf den gleichzeitigen Konflikt angerechnet. Danach muss nach der ausgewählten Verteilung A, B oder abwechselnd Arbeitszeit freimachen. Damit wird ein **Arbeits-/Betreuungskonflikt** gezeigt, aber weder ein Arbeitgeberanspruch noch eine bestätigte Betreuung behauptet.
- **Ergebnis:** chronologische Wochenübersicht, separate Arbeitsfreistellungs-/Begleitungsstunden je Elternteil, tatsächliche Überschneidung beider Arbeitszeiten, gegebenenfalls hypothetische Geldkosten; auswählbare Beispielwoche mit fünf Tageszeilen; zusätzlicher Vergleich aller drei Möglichkeiten, wer die Eingewöhnung begleitet.
- **Grenzen:** Die begleitende Person wechselt im Modus „abwechselnd“ in dieser Version nach **Wochentag**, nicht nach frei verschiebbaren Viertelstunden; alle Arbeitsstunden werden gleichmäßig auf fünf Arbeitstage verteilt. Kita- und Arbeitsbeginn sind jeweils an allen fünf Tagen identisch. Feiertage, Wochenenden, Pendelzeiten, Urlaub, Schichtdienst und Krankheit sind nicht simuliert.

### Trennung der Geldmodelle

Die kombinierte Darstellung beider Eltern ist eine **Alternative** zur V3.15.1-Ein-Eltern-Eingewöhnungsrechnung und darf damit **nicht addiert** werden. Die allein von Nutzern gesetzten Nettoannahmen werden proportional zu hypothetisch nicht leistbaren Arbeitsstunden je Elternteil verteilt; Beträge sind in Eurocent gerundet. Fehlende Werte bleiben null-unterschiedliche **unbekannte** Kosten, solange der Elternteil betroffen ist. Nicht betroffene Eltern verursachen bei unbekanntem Netto dennoch keine erfundenen Kosten.

Die begleitende Person hat auch dann möglicherweise einen Arbeitskonflikt, wenn die Kita zu diesem Zeitpunkt bereits „geöffnet“ ist. Nach Ablauf von Verzögerung/Eingewöhnung sind weitere reguläre Arbeitswochen **ausschließlich Vorschau** und fließen nicht in einmalige Übergangskosten ein.

## Rechts-/Quellenkontext (nur Information)

Bei Teilzeit **während** Elternzeit gelten grundsätzlich bis zu 32 Wochenstunden im Durchschnitt des Lebensmonats für die aktuelle Kohorte, nach der Elternzeit kann eine andere vertragliche Arbeitszeit gelten. Die Eingaben bleiben deshalb bis zu 40 Stunden als Arbeitszeitvergleich zulässig, aber ein höherer Wert als 32 erzeugt einen deutlich sichtbaren Prüfungshinweis.

Der **Partnerschaftsbonus** kann unter weiteren Voraussetzungen bei beiden Eltern mit 24–32 Wochenstunden im **Durchschnitt des jeweiligen Lebensmonats** über zwei bis vier unmittelbar aufeinanderfolgende Lebensmonate relevant sein. Diese frei gestaltete typische Fünf-Tage-Woche prüft weder Rechts-/Geburtskohorten, Lebensmonatsdurchschnitte, Monate des Bezugs noch vertragliche Vereinbarungen und bescheinigt **keinen Bonusanspruch**.

Amtliche Quellen, geprüft am 17.10.2026:
- [Bundesfamilienportal: Teilzeit während Elternzeit](https://familienportal.de/familienportal/familienleistungen/elternzeit/faq/kann-ich-waehrend-der-elternzeit-teilzeit-arbeiten--124794)
- [Bundesfamilienportal: Partnerschaftsbonus](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/was-ist-der-partnerschaftsbonus--155198)

Keine automatische Änderung an BEEG-Berechnungen, Renten-/Versicherungsfolgen, Arbeitgeberanträgen, Rechtsstatus, echten Bankbuchungen oder erwarteten Zahlungstagen.

## Technische Umsetzung

- **Core:** src/parent-coordination.cjs, Funktionen planJointCare und compareEscortChoices. Verwendet src/settling-in.cjs zur gleichen Kita-Kohorte und übernimmt die explizit angegebenen Betreuungs- und Wartewochen. Keine Speicher- oder Netzwerkzugriffe.
- **Browser:** Eigenständiger, barrierearm beschrifteter, zunächst geschlossener Bereich in index.html innerhalb „Regionale Leistungen/Kita“. Tages- und Wochenlisten sind horizontal scrollbar, ohne die mobile Seite zu verbreitern; optionaler Wochendetailschalter setzt den Tastaturfokus nach Neurendering wieder.
- **Offline-Einbettung:** scripts/embed-modules.mjs bindet ParentCoordination nach SettlingIn und CareResilience ein; eine lokale index.html benötigt keine externen Skripte, Konten oder Netzverbindung.
- **Zustand:** Nur lokale In-Memory-Eingaben, bewusst **keine** neuen JSON-Schema-1-Felder oder persistierte Finanzdaten. Reset und Import löschen sämtliche neuen Optionen, der eigene Zurücksetzen-Knopf nur den gemeinsamen Wochenplan. Auch bei ausdrücklich aktiviertem lokalem Speichern oder JSON-Export werden die gemeinsamen Netto-/Arbeitszeitvarianten nicht gespeichert.
- **Schutz:** Unbekannte Netto-Beträge bleiben unbekannt, überlange tägliche Zeitfenster und ungültige Viertelstunden werden abgewiesen; überhohe eingegebene Eingewöhnungsbegleitung wird sichtbar auf tatsächlich angenommene Kita-Zeit begrenzt. Verbleibende Arbeitszeitkonflikte werden einem Elternteil nur als **Hypothese** zugeordnet.

## Tests / Abnahme

- src/parent-coordination.cjs: 15 reine Tests einschließlich 80 datierter synthetischer Kohorten-Kombinationen, Viertelstunden, gegenseitiger Arbeitsüberdeckung, begleitungsbedingter Arbeitskonflikte, A/B/wechselnder Übernahme, fehlender Daten, manueller Ersatzbetreuung, maximal 32-Stunden-Hinweis und unverändertem Arbeits-/Bank-/Elterngeldplan.
- tests/v316-parent-coordination.test.mjs: DOM-/Offline-Tests für Live-Wechsel, Rückkehrtermine, Tastaturfokus, Zurücksetzen, fehlende Werte und getrennte Geldmodelle.
- tests/e2e/browser.spec.mjs: HTTP- und direkte file://-Chromium-Prüfungen der neuen mobilen Ansichten (320/390 px), Axe, getrennter Arbeitszeiten, zugelassenen/ungültigen Eingaben, des bewussten Speicher-Opt-in und des echten JSON-Roundtrips.
- Die bereits bestehenden V3.8–V3.15.2-Fälle bleiben Bestandteil der vollständigen Node- und Browser-Regressionspipeline.

**Noch offen:** Unabhängige rechtliche, behördliche Netto-, Datenschutz- und echte Nutzerabnahmen einschließlich Konflikt zur Mutterschutz-Anrechnung. Release-Status **BLOCKED**. Der Merge in main ändert dies ausdrücklich nicht.


### Verifizierter technischer Abnahmeabschluss

- **452/452** vollständige Node-/DOM-Tests bestanden, einschließlich 15 neuer reiner Elternkoordinations-Tests, sieben ergänzter DOM-/Resetfälle und sämtlicher historischer Rechts-, Planer- und Budgetregressionen.
- **53/53** Chromium-Browsertests bestanden (Desktop- und Mobil-Accessibility; Szenarioeingaben; fehlerhafte Viertelstunden; Wechsel der begleitenden Elternperson; manuelle Geldannahmen; freiwillige Speicherung und echter JSON-Roundtrip).
- **4/4** neue V3.16-Browserfälle zusätzlich direkt als **file://-Datei ohne App-Webserver** bestanden, darunter 320-/390-Pixel-Ansichten, reine Browser-Lokalität und Rücksetzen nach Import.
- Quellen-/Roadmap-/Legacy-/Offline-/statische Datenschutz-/Release-Gate-Checks wurden erneut überprüft; automatisierte Accessibility-Checks ersetzen keine echten manuellen Screenreader- oder Nutzertests.
- Der öffentliche Releasecheck ist absichtlich **BLOCKED**. Den Status weder durch grüne Tests noch durch Merge oder neue Quellenhinweise überschreiben. Unabhängige Berechnung, Rechts-, Datenschutz- und Nutzerfreigaben bleiben ausstehend.
