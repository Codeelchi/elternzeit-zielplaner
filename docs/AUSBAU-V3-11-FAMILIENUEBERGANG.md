# V3.11 – Familienübergang und geführte Rückwärtsplanung (Entwicklungszweig)

Stand: 17.10.2026. **Vorab-Implementierung, keine eigenständige öffentliche Beta- oder Rechtsfreigabe.** Die bestehende Engine und der geprüfte Versionsstand 3.10.0 bleiben die Berechnungsbasis. Für eine neue Release-Version ist eine separate Abnahme erforderlich.

## Bereits implementiert

### Betreuung und Kita-Verschiebung

- Schnellstart-Zusammenfassung zeigt alle zusammenhängenden Betreuungslücken bis zum gewählten Zielmonat statt nur den ersten problematischen Monat.
- Negative Lebensmonatsbudgets werden nur ausgewiesen, wenn persönliche Ausgaben bekannt sind. Leere Ausgaben und ausdrücklich eingegebene 0 Euro bleiben unterscheidbar.
- Ein wählbares **0–6-Lebensmonate-Szenario** simuliert die Verschiebung des bereits eingegebenen Kita-Starts. Es nennt alle ungeklärten Monate und zusätzlich gegenüber dem Basisplan entstehende Lücken.
- Der simulierte Kita-Start wird auch über LM 36 hinaus korrekt als außerhalb des Planungsfensters erkannt und nicht fälschlich auf LM 36 begrenzt.
- Das Szenario verändert weder die Monatsaufteilung noch persönliche Daten oder lokale Speicherung. Nur das Ergebnisfeld wird aktualisiert, damit die Eingabe beim Wechsel der Auswahl fokussiert bleibt.
- Kita-Beiträge, Teilzeitgehälter, Elterngeldanspruch und tatsächliche Zahlungszeitpunkte werden **noch nicht** als Folge der Verschiebung neu berechnet; dies steht ausdrücklich in der Oberfläche.

### Rückwärts-Zielplanung – geführter Einstieg

- Der Schnellstart enthält ein separat erreichbares Zielpanel mit fünf Prioritäten (ausgewogene Aufteilung, stabiler Monatsbetrag, Gesamtbudget, vorsichtiges Szenario, Elternteil-1-Freizeit), Betreuungsziel, optionaler monatlicher Budgetuntergrenze, Teilzeit- und Betreuungsannahmen.
- Das Formular greift ausschließlich auf die **bestehende** Zielsuche und deren Validierung zurück. Es berechnet kein eigenständiges Elterngeld und nimmt niemals ohne explizite Auswahl einen Vorschlag an.
- Finanzprioritäten bzw. ein positives Mindestbudget benötigen zuerst eingegebene Haushaltsausgaben. Zeitbezogene Suchanfragen lassen sich auch als transparent unvollständige Beispielvergleiche ausführen.
- Eingaben werden vor Übernahme vollständig geprüft. Negative, übergroße oder mehr als zweistellig nach dem Komma angegebene Budgetgrenzen werden abgewiesen. Noch ungespeicherte Änderungen im persönlichen Kurzformular blockieren den Suchstart.
- Nach dem Start öffnet sich die bereits vorhandene Zielsuche mit zugänglichem Fokus auf der Ergebnisüberschrift. Die Suchfunktion unterstützt weiterhin Fortschritt, Abbruch und kennzeichnet unbestätigte 2027er Rechtsstände als unverbindlich.
- Eine neue direkte Schnellstart-Schaltfläche führt zur Zielplanung. Der Ergebnisblock erscheint vor dem Zielformular, sodass nach der Beispielauswahl der nächste Schritt sichtbar wird.

## Test- und Verifikationsstand

- Node/DOM-Tests: **292/292 bestanden** (gegenüber 279/279 auf V3.10).
- Neu abgedeckt: Betreuungslücken, verspäteter Kita-Start 0–6 LM, unveränderte gespeicherte Planannahmen, fehlende vs. bekannte Nullkosten, Validierung der Finanzuntergrenze, keine stille Monatsplanübernahme, Navigation zur gemeinsamen Suchengine, Prüfung auf ausstehende persönliche Eingaben.
- Die zwei neuen Browser-E2E-Fälle auf 320/390 px **bestanden**, inklusive gezielter axe-Prüfungen auf WCAG A/AA und Nachweis unveränderter Plandaten. Ebenfalls bestanden: bestehender V3.10-Navigationstest zusammen mit beiden V3.11-Fällen über lokales `file://` (3/3). Die vollständige Browser-Regression mit bestehendem Testprogramm und den zwei neuen V3.11-Fällen ist **29/29 bestanden** (Chromium, 17.10.2026, lokale HTTP-Auslieferung). Die neuen Fälle wurden zusätzlich erfolgreich direkt mit `file://` ausgeführt. Ein unabhängiger manueller Nutzertest ist damit nicht ersetzt.
- Der bekannte öffentliche Release-Gate-Check schlägt weiterhin **absichtlich** fehl: unabhängige Fach-, Rechts-, Datenschutz- und Nutzertests sowie der amtliche Referenzabgleich sind offen.

## Nächste getrennte Arbeitspakete

1. **Kita-Finanzmodell:** Plan mit und ohne Kita-Verzögerung unter explizit neu gewählten Erwerbs-/Betreuungsszenarien vergleichen; Geldflüsse niemals aus dem reinen Kita-Start-Datum ableiten.
2. **Zielsuche V2:** Abdeckung der Suchmuster empirisch prüfen, zulässige Varianten als Pareto-Auswahl statt Schein-Gesamtnote vergleichen, harte/vorzugsweise Ziele separat erfassen.
3. **Zahlungs-Liquidität:** bestätigte echte Zahlungseingänge gesondert von Lebensmonatsansprüchen abbilden, mit Auszahlungslücken und Belastungspuffer.
4. **Freigaben:** Unabhängige amtliche Netto-/Mutterschutzfallprüfung, Rechts-/Datenschutzreviews und echte Nutzertests. Die Gates in `data/release-gates.json` bleiben unverändert.

Wichtig: Die amtlich ungeklärte Mutterschutz-Tagesdifferenz und die fehlenden unabhängigen Freigaben sind weiterhin Release-Blocker.
