# Paket 2 – Familienzeitstrahl und Variantenvergleich

**Technischer Umsetzungsstand:** 22.10.2026 · **Branch:** `feat/paket2-familienzeitstrahl-vergleich-20261022` · **PR-/Release-Status:** technische Review/CI vor Merge erforderlich, öffentlicher Produktrelease weiterhin **NO-GO**.

## Funktionen

### 2A – Gemeinsame Lebensmonatsachse (implementiert)

Im bisherigen Kernschritt **Cashflow** steht zusätzlich zur unveränderten Einnahmengrafik eine horizontale, per Tastatur zugängliche Tabelle für die Lebensmonate 1 bis zur aktiven Vergleichsgrenze. Sie verwendet ausschließlich die bereits berechneten Werte `current.rows` und das bestehende `TimeAxes/dateFor`. Die fünf Zeilen zeigen:

1. Elternteil 1: Modellstatus (zuhause, Teilzeit, Arbeit).
2. Elternteil 2: Modellstatus einschließlich ausdrücklich als **pauschal** gekennzeichnetem Mutterschutz.
3. Betreuungszuordnung: **„Elternteil zu Hause“**, **„geplante Kita“** oder **„nicht zugeordnet“**.
4. Modelleinnahmen **vor** Haushalts- und Kita-Kosten pro Lebensmonat.
5. Rest **nach** eingetragenen Haushalts- und Kita-Kosten – oder **„Unbekannt“**, wenn Haushaltsausgaben fehlen.

Jede Monatsüberschrift ist ein Button mit `aria-pressed`; Pfeiltasten und Pos1/Ende wählen den Monat. Ein Detailbereich nennt Kalenderintervall, Kindesalter, Eltern-/Betreuungsannahmen, modellierte Kita-Kosten und den verfügbaren Rest. Ohne Farben bleibt alles lesbar, und auf dem Smartphone scrollt nur die breite Monatsachse horizontal.

**Strikte Semantik:** „Kita angenommen“ ist **keine Platzgarantie**, „Elternteil zu Hause“ **kein geprüfter Wochenstunden-Nachweis**, und „nicht zugeordnet“ ist **keine amtlich festgestellte Betreuungslücke**. Die Monatsbeträge sind **keine datierten Bankeingänge** oder bewilligten Leistungen. Die Teilmonats-/Mutterschutz-Rechtsfragen werden von der neuen Darstellung nicht entschieden.

### 2B – Variantenvergleich im selben Browser-Tab (implementiert)

Der aktive Plan kann bis zu **dreimal als Momentaufnahme** unter einer optionalen Bezeichnung vorgemerkt werden. Die Tabelle zeigt stets **den aktuellen aktiven Plan und die maximal drei gespeicherten Vergleichsstände**. Alle Stände werden über denselben aktuell gewählten Horizont (LM 1 bis LM 18/24/32/36) angezeigt.

Verglichen werden Einnahmen vor Kosten, niedrigster Monatsrest, Gesamt-Rest, eine rein **theoretische kumulierte Modellunterdeckung** aus Monatsrest-Summen, ein fehlender Betreuungsnachweis im Modell, zugeordnete vollständige Zuhause-Monate beider Elternteile und der bestehende Prüfstatus. Ein nicht eingetragener Haushaltskostenwert erzeugt ausdrücklich **„Nicht vergleichbar“/„Nicht berechenbar“**, niemals 0 €.

Jede Momentaufnahme speichert **nur die abgeleiteten Monatsstatus-/Geldwerte, den Szenariostatus, ein Modell-Kita-Startdatum und die optionale Beschriftung** als reine JavaScript-Laufzeitspeicher-Daten. Es werden **keine Namen, Bankbuchungen, Zugangsdaten, Originalimporte oder Konten** in eine neue Persistenz übernommen. Geänderte aktive Eingaben wirken nicht rückwirkend auf den gespeicherten Stand. Es gibt **keine Übernehmen-/Zurückspielen-Funktion**, damit ein Snapshot nicht still das Rechts-/Finanzmodell ändert.

- Beim **Zurücksetzen nach Bestätigung**, beim **erfolgreichen JSON-Import** und beim **Browser-Neuladen** werden die Momentaufnahmen verworfen.
- Ein **abgebrochener Reset** oder **abgewiesener Import** darf sie nicht verwerfen.
- Die Variante erscheint nicht im bestehenden JSON-/CSV-Export und verändert weder `s.schedule`, `s.bankLedger`, `storageConsent` noch die gespeicherten `localStorage`-Keys.
- Die Variante bekommt auch dann **keinen positiven Anspruchsstempel**, wenn sie in einem internen Rechenmodell plausibel ist.

## Technische Umsetzung

| Datei | Zweck |
| --- | --- |
| `src/family-overview.cjs` | Reine, testbare Ableitung aus bestehenden Monatswerten. Keine rechtliche Leistungsberechnung und keine Schreiboperation |
| `src/v42-familienzeit.html` | Semantische Tabelle, Monatsdetail, flüchtige Vergleichskontrollen |
| `src/v42-familienzeit.css` | Zugängliche mobile/desktop Darstellung, Farben **plus** Text |
| `src/v42-familienzeit.js` | Browseransicht und maximal drei vollständig flüchtige Momentaufnahmen |
| `scripts/embed-modules.mjs`, `scripts/embed-quickstart.mjs` | Synchronisierung der Bestandteile in der offline lauffähigen `index.html` |
| `tests/family-overview.test.mjs` | Grenz-, Budget- und Betreuungssemantik |
| `tests/paket2-family-ui.test.mjs` | Reproduzierbarer Snapshot-, Fokus-, Reset- und Import-Lebenszyklus |
| `tests/e2e/paket2-family-view.spec.mjs` | Echter Chromium-Test einschließlich mobiler Darstellung, Accessibility, 200 % Schrift, importiertem JSON und XSS-sicherer Variante |

**Tests zur Wiederholung:**

```bash
npm ci
npm run modules:check
npm run quickstart:check
node --test tests/family-overview.test.mjs tests/paket2-family-ui.test.mjs
npx playwright test tests/e2e/paket2-family-view.spec.mjs
npm test
npm run release:check
```

Die tatsächliche erfolgreiche CI und der PR-/Merge-Commit müssen nach der abschließenden GitHub-Abnahme ergänzt werden. Automatisierte Accessibility-Prüfungen sind **keine** unabhängige manuelle Screenreader-Abnahme.

## Nicht umgesetzt / nachfolgende Pakete

- **2C – Was-wäre-wenn-Regler** sind inzwischen im gesonderten [technischen Review-Branch dokumentiert](UMSETZUNG-PAKET2C-WAS-WAERE-WENN-2026-10-22.md): manuelle Kita-/Netto-/Ausgaben-/Risikoband-Annahmen ohne Rechts-Neuberechnung oder Planübernahme. Eine **selektive Variantenübernahme und dauerhafte Speicherung** sind bewusst weiter nicht vorgesehen; sie erfordern separate Fach-/Sicherheits-/Schema-Abnahme.
- **Paket 3** bleibt geplant: kompakter Druck-/PDF-Bericht, lokale Aufgabenübersicht, echte unmoderierte/moderierte Nutzer- und manuelle Screenreader-Tests.

**Unveränderte externe Sperren:** Mutterschutz 4/5-Resttage, unabhängige vollständige 10 Paar-/Familienfälle, Rechtsstand 2027, Elterngeld-Netto, echte Nutzertests und die rechtlichen, Datenschutz- sowie Betreiberfreigaben. Kein amtliches Produkt und keine öffentliche Release-Entscheidung durch diese UI-Erweiterung.
