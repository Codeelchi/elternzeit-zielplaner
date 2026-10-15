# V3.8 Schnellstart – UX-Konzept, Umsetzung und Freigabegrenzen

**Version:** 3.8.0 · **Quellenstand Recht:** unverändert 15.10.2026 · **Status:** interne Testversion; keine öffentliche Beta-Abnahme.

## Ziel und tatsächliche Bedienung

Der erste Nutzungsschritt ist keine Rechtsprüfung, sondern ein bewusst **fiktives** Rechenbeispiel. Eine Person ohne Vorwissen kann auf der Startseite eine von fünf Karten auswählen und sieht ohne Registrierung und ohne Angabe eigener Daten:

- ob die gewählte Monatsaufteilung das voreingestellte Betreuungsziel unter den aktuellen Modellannahmen abdeckt;
- die niedrigsten modellierten **Einnahmen vor Haushaltsausgaben**, sofern Ausgaben unbekannt sind;
- die Summe der entsprechenden modellierten Einnahmen über die gewählte Anzahl von Kindeslebensmonaten;
- einen expliziten Rechtsstatus und Warnungen bei Betreuungslücken, Zukunftsgeburten und unsicherem Elterngeld-Netto.

Der Schnellstart verwendet **die bereits vorhandene V3.7-Berechnungsengine** (inklusive 36 LM, RuleValidator und TimeAxes), nicht eine zweite Elterngeldformel.

### Fünf vorgefertigte Modelle

| Karte | Vorhandenes Monatsmodell | Voreingestelltes Betreuungsziel |
|---|---|---:|
| Klassisch: 12 + 2 Monate | `father12` | 14 LM |
| 18 Monate zu Hause | `father18` | 18 LM |
| ElterngeldPlus & Teilzeit | `hybridWork` | 18 LM; erkennbare Betreuungslücke möglich |
| Gemeinsam aufteilen | `mother4father10` | 14 LM |
| Früher zurück in den Beruf | `quickReturn` | 14 LM; zusätzliche Betreuung erforderlich |

Eine sechste **interne** Vorlage `father24` steht für passende Verlängerung auf 24 Lebensmonate bereit, ohne die Startseite mit weiteren gleichwertigen Karten zu überladen.

**Achtung:** Auch ein nach Regeln formal plausibler Modellplan kann den gewünschten Familien-Betreuungsumfang nicht erfüllen. Der Schnellstart markiert eine Betreuungslücke mit dem ersten nicht abgedeckten Lebensmonat; er erklärt die Betreuungslücke nicht weg.

### Angaben für den persönlichen Einstieg

Der Assistent verlangt zunächst nur Geburtstermin, Auszahlungsnetto beider Eltern und gewünschte Betreuungsdauer. Haushaltsausgaben sind optional. `0 €` eingetragen und *keine Angabe* werden verschieden behandelt:

- **Keine Angabe**: Einnahmen vor Haushaltskosten, keine behaupteten Überschüsse, Engpässe oder verlässliche Rücklagen.
- **0 € bewusst eingetragen**: gesetzte Haushaltskostenannahme; trotzdem nur modellierte Einnahmen nach eingegebenen Kosten und sonstigen Annahmen.

**Wichtig:** Das für das Elterngeld maßgebliche pauschalierte Netto wird zur schnellen Orientierung nur provisorisch mit dem Auszahlungsnetto gleichgesetzt. Das ist **keine behördliche Brutto-/Netto-Berechnung**. Die Standardfallbestätigung sowie ein unbekanntes Vorjahres-zvE werden **nicht** automatisch erfunden.

### Datenschutz

Aufruf und Auswahl einer Beispielkarte lösen kein Konto und keine externe Datenübertragung aus. Die bislang freiwillige Speicherung bleibt Opt-in. Wird aus einem bereits lokal gespeicherten persönlichen Plan eine fiktive Beispielkarte geladen, bleibt die vorherige gespeicherte Datei unangetastet; das Beispiel ist ausdrücklich nicht zur automatischen Speicherung freigeschaltet. Die Exportfunktion der Fachansichten ist unverändert.

### Navigation

Im Anfänger-Modus sind sechs Kernbereiche direkt sichtbar: Überblick, Grundlagen, Modelle, Cashflow, Plan prüfen und Zielsuche. Die übrigen Fachansichten sind über **Fachansichten einblenden** zugänglich. Die Darstellung der Zielsuche wird nicht geändert. Bereits bestehende Experten-Tests aktivieren die volle Navigation vor dem Durchlauf.

## Technische Integration

Dateien:
- `src/v38-quickstart.html`: Vorlagen-Karten, kurzer Assistent, Schnellstart-Kennzahlen und Fehlermeldungen.
- `src/v38-quickstart.css`: lokaler responsiver Stil für Desktop/Mobil.
- `src/v38-quickstart.js`: UI-Orchestrierung über bestehende Funktionen `chooseModel`, `evaluate`, `isCaredFor`, `renderAll`, `showSlide`; Daten werden bei der Auswahl neu bewertet.
- `scripts/embed-quickstart.mjs`: synchronisiert die drei Quellen mit der weiterhin **einzeldateifähigen** `index.html`-App; `--check` blockiert CI bei Drift.
- `tests/quickstart-v38.test.mjs`: gezielte Regressionen für fünf Vorlagen, Care-Gap, unbekannte Kosten, User-Eingaben, Fehlerfälle, Datenschutz und Navigation.
- `tests/e2e/browser.spec.mjs`: zusätzlicher Real-Browser-Test für mobilen Einstieg sowie Übergang zum persönlichen Szenario.

Befehle:

```sh
npm ci
npm run quickstart:sync
npm test
npm run test:e2e
```

## Nach wie vor ungelöste Punkte

- Für Geburten 2027 gibt es **keine bestätigte vollständige Rechts-/Leistungsberechnung**. Die neue UI behauptet dies nicht.
- 2027er Kindergeldbeträge werden nicht automatisch als geltende Beträge gesetzt; die fiktive Vorlage verwendet weiterhin den bekannten 2026er Referenzwert, bis Quellenstand und Gesetzeslage geprüft sind.
- Die veröffentlichte Mutterschutz-Beispielabweichung (4 statt 5 Tage) bleibt ein fachlicher Release-Blocker.
- Steuerliche Effekte, Sozialversicherung, Rückforderungen und tatsächlicher Auszahlungstermin gehören nicht zur Schnellstart-Schätzung.
- Bei 30 oder 36 Monaten besteht im Schnellstart keine garantierte Betreuungsvorlage. Ein unvollständiger Plan wird nicht als „Ziel erreicht“ markiert.
- Einfache Bedienung ist hier durch automatisierte UX-Smoke- und Browserprüfungen belegt, **nicht** durch echte Beobachtung neuer Nutzer. Für eine positive Usability-Abnahme mindestens 6–8 externe Tests ohne Vorkenntnisse nachreichen.

Die öffentliche Freigabesperre bleibt bestehen.