# Nachvollziehbarer Planvergleich

`src/plan-comparison.cjs` exportiert `comparePlans(candidates, options)`. Die reine Funktion verändert keine Eingaben und verarbeitet keine Bankbuchungen. Sie bestätigt keine rechtliche Zulässigkeit; dafür muss die aufrufende Suche jeden Kandidaten vorher validieren.

```js
const comparison = comparePlans(candidates, {
  horizon: 24,
  expenses: 1800,
  minimum: 200,
  assumptions: {wagePercent: 15, elterngeldPercent: 5, costPercent: 20},
  confirmedGrants: []
});
```

Jeder Kandidat besitzt `calc.rows` mit den komponentenweisen Monatsbeträgen der Berechnung. Elterncodes und Wochenstunden stammen bevorzugt aus diesen effektiven Zeilen, ersatzweise aus `schedule`. Alle Kandidaten müssen den vollständigen Vergleichszeitraum ab Lebensmonat 1 enthalten. Weitere Monate werden identisch abgeschnitten. Ein unvollständiger oder ungültiger Kandidat führt zu einem Fehler; er verschwindet nicht still aus dem Vergleich.

Für jeden Plan liefert `plans`:

- `freeMonths.father` und `.mother`: volle Monate ohne Erwerbsarbeit nach den Codes B/P/U/MS; positive tatsächliche Wochenstunden verhindern die Zählung. Mutterschutz ist enthalten. Daraus werden keine tatsächlichen Betreuungsstunden abgeleitet.
- `realistic` und `conservative`: `totalAvailable` nach Betreuungs- und Haushaltskosten, `lowestAvailable`, `bottleneckMonths` unter dem gemeinsamen Mindestbetrag und `requiredReserves` als höchster kumulierter anfänglicher Fehlbetrag.
- `delta`: vorzeichenbehaftete Differenzen zum ersten dargestellten Vorschlag. Ein positiver Budgetunterschied bedeutet mehr verfügbares Budget; ein positiver Rücklagen- oder Engpassunterschied bedeutet höheren Finanzbedarf. Der erste Plan hat Nulldifferenzen.

Die Geldkennzahlen und Szenarien stammen ausschließlich aus `FamilyBudget.projectFamilyBudget`. Haushalt, Mindestbetrag, Risikobänder, bestätigte Zusatzleistungen und Vergleichshorizont sind für alle Kandidaten gleich. Ein eventuell vorhandenes `adverse` wird bewusst nicht übernommen: Ein separat berechnetes Szenario könnte andere Annahmen enthalten. Fehlende, leere oder `null`-Beträge folgen den Null-/Standardwerten des Budgetmoduls; negative oder nicht endliche Beträge und ungeeignete Datentypen werden abgewiesen.

Bei nur einem Vorschlag enthält `comparisonNote` eine verständliche Aufforderung, Ziele oder Teilzeitbeginn für weitere Varianten zu ändern. Geldwerte bleiben ungerundet; die Oberfläche sollte Rücklagen bei einer Darstellung in ganzen Euro aufrunden, damit ein positiver Restbedarf nicht als 0 Euro erscheint.

Die Ausgabe bleibt eine modellierte Anspruchs- und Budgetprojektion (`bankReceiptsPredicted: false`). Sie enthält weder Auszahlungstermine noch zusätzliche regionale Leistungen ohne bestätigte Grundlage. Warnhinweise des Budgetmoduls bleiben erhalten.

Tests: `node --test tests/plan-comparison.test.mjs` prüft unter anderem Anfangsrücklage, Engpassmonate, Differenzen, effektive Arbeitszeiten, gemeinsame Vergleichshorizonte und ausgeschlossene ungeprüfte Leistungen.
