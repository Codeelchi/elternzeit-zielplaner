# Paket 2C – Was-wäre-wenn-Rechner mit expliziten Annahmen

**Stand:** 22.10.2026 · **Technischer Arbeitsbranch:** `feat/paket2c-was-waere-wenn-20261022` · **Freigabe:** technischer PR/CI-Nachweis vor Merge erforderlich; öffentlicher Produktrelease weiterhin **NO-GO**.

## Ziel und Bedienung

Der zusätzliche Block **„Was wäre, wenn sich eure Planung ändert?“** befindet sich im Hauptschritt **Cashflow**, unter dem Paket-2-Familienzeitstrahl und dem flüchtigen Drei-Varianten-Vergleich. Nutzer sehen *Ausgangsplan* und *eine hypothetische Alternative* parallel. Eine ausklappbare Tabelle stellt die Monatsunterschiede LM 1–18/24/32/36 dar. Die Parameter verändern **keine** Eingabe, Monatsstatus, Sozialleistung, gespeicherte Buchung, ursprüngliche Vergleichsmomentaufnahme oder lokale Speicherzustimmung.

### Eingaben mit Sicherheitsgrenzen

| Parameter | Grenzen | Wirkung und Abgrenzung |
| --- | --- | --- |
| Kita-Start später | **0–6 Lebensmonate** nach dem bisher *modellierten* Start | Ruft das bestehende `CareImpact.projectDelayedCareScenario` auf; ohne im Plan vorhandenen Kita-Start ist die Verzögerung **nicht berechenbar**. Ein verlegter Start ist keine Platzzusage |
| Erwerbsnetto-Ausfall während der Kita-Verzögerung | 0–10.000 €/LM, **explizit** einzutragen, auch wenn Null | Nur die betroffenen Lebensmonate. Keine automatische Lohn- oder Elterngeldberechnung |
| Zusätzliche Ersatzbetreuung während der Verzögerung | 0–10.000 €/LM, **explizit** einzutragen, auch wenn Null | Nur die betroffenen Lebensmonate; ein tatsächlich verfügbarer Platz wird nicht versprochen |
| Originale Kita-Beiträge wegfallen lassen | standardmäßig **aus**, bewusstes Opt-in | Nur bei ausgewähltem Häkchen werden die modellierten Beiträge für die Verzögerungsmonate aus der Alternative herausgerechnet; keine automatische Erstattungszusage |
| Teilzeitstunden Elternteil 1/2 | Optional **1–32 Wochenstunden**, ausschließlich in bereits modellierten Teilzeitmonaten | Die Erwerbs-/Leistungsart bleibt gleich. Ohne **ausdrücklich angegebenen** Nettoeffekt werden die hypothetischen Finanzwerte als *nicht berechenbar* markiert |
| Manuelle monatliche Teilzeit-Nettoänderung | Optional −10.000 bis +10.000 €/LM, inklusive **0** | Nur bereits vorhandene Teilzeitmonate; kein automatisch aus Stunden geschätztes Gehalt und keine neue Elterngeldhöhe |
| Haushaltsausgabenänderung | −10.000 bis +10.000 €/LM, Alternative darf nie unter 0 € liegen | Der Betrag wird nur gegen **bekannte** Basisausgaben zu einem neuen Monatsrest verarbeitet. Fehlen die Basisausgaben, bleibt die Restsumme unbekannt |
| Vorsichtiges Nettolohn-Risikoband | **0–30 %** (5-%-Schritte) | Wird auf modelliertes Erwerbsnetto angewandt. **Nicht** auf pauschales Mutterschaftsgeld, Elterngeld oder Kindergeld. Folgewirkungen auf Leistungsansprüche werden **nicht** simuliert |

Alle neuen Einträge sind **rein flüchtig und nicht exportierbar**. Der Button „Nur diese Annahmen zurücksetzen“ ändert den Familienplan nicht. Ein bestätigter Planreset oder erfolgreicher JSON-Import verwirft Szenarioannahmen; ein verworfener Reset oder abgewiesener Import lässt sie unberührt. Nach Browserreload verschwinden sie. Die bestehende JSON-Schemaversion **1**, das CSV-Format und das Speicher-Opt-in bleiben unverändert.

**Wichtig:** Der historische Kita-Verzögerungsdialog im V3.8-Schnellstart existiert weiterhin als eigenständige Kurzorientierung. Seine Annahmen und die neuen Paket-2C-Eingaben sind **absichtlich nicht synchronisiert**; ein Ergebnis aus beiden Ansichten ist nur dann vergleichbar, wenn die Eingaben und Horizonte bewusst gleich gewählt werden.

## Rechenstruktur, Transparenz und Fehlerverhalten

Die reine Berechnungsfunktion `src/what-if-scenarios.cjs` verwendet:
- `CareImpact.projectDelayedCareScenario` für die expliziten Monatseffekte verzögerter Kita-Aufnahme.
- `FamilyOverview.buildFamilyView` für gleichwertige monatliche Status-/Finanzübersichten von Ausgang und Alternative.
- Bestehende `evaluate(...).rows` als einzigen unveränderlichen Ausgang; keine Neuberechnung der Elterngeld-/Rechtsregeln.

Statt eines neuen Optimierungsalgorithmus werden **nur eingegebene und ausdrücklich gekennzeichnete** monatliche Änderungen auf bereits gerechnete Monatswerte addiert/subtrahiert. Der Quellwert einer unveränderten Zeile bleibt exakt bestehen – auch wenn die bisherige Stundeninterpolation weitere Nachkommastellen erzeugt. Die neuen manuellen Geldbeträge sind auf Centgenauigkeit beschränkt; negative individuelle Erwerbseinkommen und negative Haushaltssummen werden **nicht** still auf 0 gesetzt, sondern abgelehnt.

Die Vergleichsübersicht zeigt Kita-Modellbeginn, **nicht zugeordnete Betreuung im Monatsmodell**, Einnahmen vor Kosten, niedrigsten/gesamten Rest nach **bekannten** Kosten und theoretische kumulierte Monatsunterdeckung. Bei fehlenden Nettoeffekten bleibt die hypothetische Einkommenssumme **nicht berechenbar**. Bei unbekannten Haushaltskosten bleiben der Rest und die Unterdeckung **unbekannt**. Der Monatsvergleich hat eindeutige Spaltennamen und ist via Tastatur und Horizontal-Scroll zugänglich.

**Es wird niemals behauptet**, dass geänderte Teilzeitstunden erlaubt, Elterngeldbeträge angepasst, Kita-Plätze zugesichert oder Auszahlungstermine rechtlich verbindlich seien. Die Familien-/Plan-Lebensmonatsmodelle sind **keine Konto-Liquiditätsprognose**. Es gibt **keinen** „Plan übernehmen“- oder „besten Plan“-Knopf. 2027 und der Mutterschutz-Streitfall sind fachlich ungeprüft.

## Test- und Übergabenachweis

Ergänzte Testdateien:
- `tests/what-if-scenarios.test.mjs`: reine Mathematik, 0/1/6-Monats-Grenzen, Centdarstellung, explizite fehlende Werte, dynamische Teilzeitstunden, Risiko, Mutter-/Elternleistungen, abgewiesene negative Werte und keine Mutation.
- `tests/paket2c-whatif-ui.test.mjs`: DOM/Planinvarianz, selektiver Reset, Import/Reset-Lebenszyklus, Statusanzeige, unveränderte Paket-2-Momentaufnahmen.
- `tests/e2e/paket2c-whatif.spec.mjs`: echter Chromium, Smartphone- und Desktopbreiten, 200-%-Schrift, Tastatur, automatisierte axe-Prüfungen, negatives JSON und lokale Nichtpersistenz.

Reproduzieren:
```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run modules:check
npm run quickstart:check
npm run docs:check
npm run privacy:technical-check
node --test tests/what-if-scenarios.test.mjs tests/paket2c-whatif-ui.test.mjs
npx playwright test tests/e2e/paket2c-whatif.spec.mjs
npm test
npm run release:check  # weiterhin erwarteter NO-GO, kein Release-Bypass
```

Das Browser-CI-Job-Limit wurde wegen der erweiterten Matrix von 15 auf 20 Minuten erhöht. Der PR-39-Vorgänger mit 136 Fällen benötigte rund 14 Minuten Joblaufzeit; die zusätzlichen Paket-2C-Fälle sollen nicht zufällig an einem Workflow-Zeitlimit scheitern. **Alle Browsertests und Gates bleiben unverändert aktiv.**\n\nCommitgebundene GitHub-CI, PR-Nummer, gesamter Browser-/Node-Nachweis und Merge werden erst nach tatsächlich bestandenem CI-Abschluss ergänzt. Kein automatisches GitHub-Pages-Deployment.

## Noch offen

**Paket 3:** A4-Druck-/PDF-fähige Planübersicht, lokale Aufgabenplanung, echte moderierte Nutzer-/Screenreaderprüfung. **Externe Freigaben:** 4/5-Mutterschutztage, 10/10 unabhängige vollständige Familienfälle, 2027er Rechts-/Netto-Prüfung, Datenschutz/Recht und formeller Betreiberentscheid.
