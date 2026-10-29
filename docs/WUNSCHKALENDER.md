# Wunschkalender und Modellvergleich

Der Wunschkalender ist über „Monatsplaner öffnen“ direkt vom Rechner-Einstieg sowie über die Familienzeitübersicht erreichbar. Er ordnet 36 Lebensmonate den zugehörigen Kalenderdaten zu und gruppiert sie nach Lebensjahren. Je Lebensmonat lassen sich Arbeit für Elternteil 1 und Elternteil 2 sowie die Betreuung des Kindes getrennt auswählen. Ein Punkt am Monat zeigt einen vorhandenen Wunsch. Nicht gewählte Angaben sind offen und werden beim Vergleich nicht gewertet.

Die Eingaben sind **flüchtige Wünsche**, keine Änderung am aktiven Plan; sie werden weder automatisch gespeichert noch in JSON oder CSV exportiert und beim Neuladen, Reset oder erfolgreichen Planimport gelöscht. Eine gewählte Vorlage wird erst nach Bestätigung übernommen und ersetzt die bestehende Monatsaufteilung sowie individuelle Arbeits- und Leistungsachsen. Eine Kita-Annahme des Wunschkalenders wird dabei nicht übernommen.

„Zu Hause“ beschreibt fehlende modellierte Erwerbsarbeit, nicht automatisch Elternzeit, Elterngeld oder eine Stundenabdeckung. Mutterschutz bleibt beim gebärenden Elternteil fachlich gesondert. Kita/Tagespflege ist eine Planannahme und keine Platzzusage. Für den Vergleich gilt ein einziger durchgehender Kita-Beginn; einzeln gesetzte Kita-Wünsche vor diesem Beginn sind Abweichungen. Die Vergleichsannahme verändert weder die tatsächliche Kita-Einstellung noch das Budget des aktiven Plans.

Der Vergleich berücksichtigt ausschließlich die neun vorhandenen Modellvorlagen und prüft sie mit der bestehenden Regel- und Berechnungslogik. Nur technisch zulässige oder ausdrücklich als unverbindliche Prognose gekennzeichnete Vorlagen erscheinen. Es zählt zuerst die Zahl passender Wünsche; Abweichungen werden benannt. Bei gleicher Übereinstimmung kann optional nach Gesamt- oder niedrigstem Monatsrest sortiert werden, wenn Haushaltskosten bekannt sind und der Vergleich denselben Kita-Beginn wie der aktive Plan nutzt. Andernfalls erfolgt kein Finanzvergleich. Fehlende Kosten sind nicht null. Es wird weder globale Optimalität noch ein behördlich bestätigter Anspruch behauptet.

Die Modellübernahme erfolgt nur nach einer eigenen Bestätigung. Die vorhandenen externen Fach-, Rechts-, Datenschutz- und Nutzertest-Freigaben bleiben unverändert offen.

## Technische Prüfung

Am 29.10.2026 führte der Nutzer auf Windows den Direktdatei-Nachweis (4/4) und `npx playwright test --config=playwright.wunschkalender.config.mjs` (5/5) für den aktuellen Stand aus. Der zweite Lauf prüfte den direkten Einstieg, den fiktiven Vergleich und mobile/desktop Breiten 320, 390 und 1280 Pixel einschließlich automatisierter Axe-Prüfungen. Diese automatisierten Ergebnisse ersetzen keine moderierte Nutzerstudie und keine manuelle Screenreaderprüfung.
