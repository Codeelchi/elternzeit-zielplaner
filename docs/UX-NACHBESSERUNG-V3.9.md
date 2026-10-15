# UX- und Datenintegritätsprüfung – V3.9

**Datum:** 15.10.2026 · **Status:** Interner Entwicklungsbranch (nicht öffentlich freigegeben).
**Vorgängerversion:** `main` V3.8.0, Commit `311d1f5`.

## Motivation

Die Browser-/DOM-Analyse der V3.8-Schnellstartnutzung ergab mehrere **reproduzierbare** UX-Mängel. Der Fokus der Weiterentwicklung liegt auf der Erhaltung individueller Eingaben und der Vermeidung irreführender Budgetaussagen, nicht auf neuen Leistungsansprüchen.

## Umgesetzte Verbesserungen

| Vorher V3.8 | V3.9 – implementierte Maßnahme |
|---|---|
| Die erneute Schnellformularabgabe setzte manuelle Elterngeld-Netto-Werte, `zve` und `standardCaseConfirmed` zurück | Danach werden **ausschließlich fünf eingegebene Kurzfelder** und nur nachweislich aus dem Assistenten stammende Netto-Näherungen aktualisiert. Manuelle Fachangaben bleiben erhalten. |
| Bereits bearbeitete Monatsfolgen wurden beim Ändern der Haushaltsausgaben auf eine Vorlage zurückgesetzt | Ein weiterer Kurzformular-Durchlauf erhält `schedule`, `model` und weitere Fachachsen unverändert. Bei bewusstem Modellwechsel aus einer individuellen Monatsfolge ist eine Bestätigung erforderlich. |
| Ein abgebrochener Reset stellte die Startüberschrift trotzdem um | Die Schnellstart-Rücksetzung wird **nur nach erfolgreicher Bestätigung** des zentralen Resets ausgelöst. |
| Vorlagenüberschrift „18 Monate“ bei nur 14 berechneten Lebensmonaten | Zeitlicher Auswertungshorizont und Vorlagenzeitraum werden beide sichtbar genannt. Ein Schalter übernimmt den Vorlagenzeitraum nur auf ausdrücklichen Klick. |
| Die Robustheitsansicht errechnete eine „Anfangsrücklage von 0 €“ ohne bekannte Haushaltsausgaben | Bei unbekannten Kosten erscheint **„nicht berechenbar“**; Budgetband, Stress-Verfügbarkeiten und Rücklagenausgabe entfallen. Nach expliziter Eingabe werden die bisherigen Szenarien weiterhin berechnet. |
| Zielsuche zeigte finanzielle Rangfolgen bei unbekannten Kosten | Ergebnisübersicht zeigt in diesem Fall **nur Zeitaufteilungen**, weist auf unvollständige Annahmen hin und behauptet keine finanzielle Empfehlung. |
| Die Monats-Kopfzeile nannte den reinen Einnahmenbetrag teilweise „Budget nach Kosten“ | Bei bekannten Ausgaben wird `cashAfter` angezeigt; andernfalls `income` und ein eindeutiger Hinweis. |
| Auf 320-Pixel-Smartphones war die erste Vorlagenkarte 838 px von oben | Sekundäre Werkzeuge und Datenschutzinformationen werden mobil aufklappbar. Die erste Karte beginnt bei **394 px** (320 × 740) bzw. **320 px** (390 × 844). Keine horizontale Überbreite bei diesen Testgrößen. |
| PageDown blätterte trotz Fokus auf einem Schnellstart-Button in die nächste Fachansicht | Präsentationskürzel nur im Expertenmodus und nicht auf beliebigen fokussierten Bedienelementen. |
| Ungültige Kurzformulardaten erzeugten eine allgemeine Fehlermeldung ohne Markierung des Felds | Das fehlerhafte Feld erhält Fokus, `aria-invalid` und eine Zuordnung zur verständlichen Fehlermeldung. |
| Die Beispiel-Ergebnisansicht zeigte Zahlen ohne unmittelbar nachvollziehbare Grundlage | „Welche Zahlen und Annahmen stecken dahinter?“ erläutert Einkommen, verwendete Elterngeld-Netto-Annahmen, Kindergeldansatz, Kostenstand und Modellgrenzen. |
| Ein einzelnes angepasstes Beispielgehalt konnte wie eine vollständig eigene Planung wirken | Die Übersicht kennzeichnet teilweise bearbeitete Beispiele ausdrücklich als weiterhin auf fiktiven Annahmen beruhend. |
| Unklare Bezeichnung „Plan speichern“ für JSON-Download | Umbenannt in „Plan herunterladen“, mit separater und klar benannter freiwilliger lokaler Speicherung. |

## Tests

- [x] **246/246** automatisierte Tests der Gesamtanwendung erfolgreich, darunter **14 neue UX-/Negativtests**.
- [x] **14** gezielte Negativ-/Usability-Tests: keine versehentliche Überschreibung genauer Werte, Monatspläne und Steuerangaben; Reset bestätigt/abgebrochen; Vorlagenwechsel mit Zustimmung; Kosten unbekannt; erneutes Öffnen der Schnelleingabe und Schutz unfertiger Formulardaten.
- [x] Chromium-Smoke Desktop 1440 × 900, kleine Smartphones 320 × 740 und 390 × 844: DOM geladen, kein gemeldeter JavaScript-Konsolenfehler, keine horizontale Überbreite.
- [x] Layoutmessung der ersten Vorlagenkarte im Browser – 320 px: vorher 838 px, nachher 394 px; 390 px: vorher 734 px, nachher 320 px.
- [x] **22/22** echte Playwright-Browsertests mit Chromium bestanden (Desktop, Smartphone, Zeitachsen, Import/Export, Offline-Funktion, Zielsuche und vier neuen V3.9-Interaktionsfällen), inklusive grundlegender Axe-Accessibility-Prüfungen. Lokaler Testbrowser in der Workbench installiert; gespeicherte Ergebnisse unter `qa/browser-results.json` und `qa/browser-accessibility-models.json`.
- [ ] Nutzerstudie mit 6–8 Personen ohne Fachvorkenntnisse – weiterhin **nicht durchgeführt**; Voraussetzung für öffentliche UX-Freigabe.

**Bewusste Grenze:** Diese Änderungen verbessern Darstellung, Benutzbarkeit und Datenintegrität. Keine amtliche, rechtliche, steuerliche oder sozialversicherungsrechtliche Berechnung wurde dadurch bestätigt. Die öffentliche Release-Sperre bleibt aktiv (Mutterschutz-Tagesabweichung, Elterngeld-Netto, Rechts-/Datenschutz-/Nutzerfreigaben).

## Folgefragen für externe Nutzertests

1. Finden Menschen ohne Elterngeldkenntnisse in einem Smartphone-Viewport innerhalb des ersten Screens die erste Beispielkarte?
2. Können sie nach Änderung eines Spezialwerts und erneuter Korrektur des Kurzformulars bestätigen, dass nichts verloren ging?
3. Können sie den Unterschied zwischen **Einnahmen vor Kosten**, **nach eingegebenen Kosten** und noch nicht berechenbaren Rücklagen erklären?
4. Verstehen sie, warum ein längeres Vorlagenmodell nicht automatisch ihr persönliches Betreuungsziel überschreibt?
5. Erkennen sie den Unterschied zwischen **fiktivem Beispiel**, **teilweise angepasstem Beispiel**, **eigener Schätzung** und einem rechtlich überprüften Bescheid?

Ein positiver browser- oder automatisierter Accessibility-Test allein ersetzt keine dieser Beobachtungen.