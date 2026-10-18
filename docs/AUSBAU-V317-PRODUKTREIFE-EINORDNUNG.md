# V3.17-A: Erkennen, ob der Familienfall zum Modell passt

**Interner Funktionsausbau vom 17. Oktober 2026.** Basis ist der am selben Tag nach grüner GitHub-CI gemergte Hauptzweig (PR #20, SHA `19f047d`); alle hier genannten Ergänzungen liegen zunächst in einem separaten Entwicklungszweig. **Kein rechtlicher Review, keine bestätigte Berechnung und kein öffentlicher Release.**

## Problemstellung

Das Modell hatte bereits einen umfassenden Regelvalidator mit vier Statuscodes und einer technikseitig klaren Standardfallannahme. Die einzelnen Findings standen jedoch im Spezialabschnitt „Plan prüfen“, während neue Nutzer im Schnellstart und im Monatsbudget unmittelbar Eurobeträge sehen konnten. Der Begriff „Standardmodell plausibel“ war außerdem für Laien nicht zwingend von „behördlich geprüft“ zu unterscheiden.

## Erste Umsetzung V3.17-A

Die erste mobile Visualisierung wurde nach einer Layoutprüfung überarbeitet: Der ursprünglich dauerhaft sichtbare Hinweisblock war bei 320 px rund 875 px hoch und verdrängte den Schnellstart. **Jetzt bleibt nur der 90 px hohe Kernstatus sichtbar**, die Einzelheiten öffnen sich per nativer Tastatur-/Touch-geeigneter Klappansicht; ein geöffnetes Detail bleibt bei Eingabeänderungen offen. Die Schnellstart-Vorlagen beginnen damit wieder im ersten Smartphone-Viewport.

Ein reines CommonJS-Modul `src/model-scope.cjs` erzeugt ausschließlich eine **lesbare Einordnung aus dem bestehenden Validatorstatus** und den aktuellen Eingabe-/Quellenmetadaten. Es führt keinerlei zusätzliche BEEG-/MuSchG-Regeln ein und ändert keine Leistung, keinen Leistungsmonat, keine Rücklage und keine Bankbuchung. Die neue Einordnung erscheint direkt bei „Überblick“ und erneut bei „Plan prüfen“.

| Klassifikation | Konsequenz im Text, nicht im Leistungsmodell |
| --- | --- |
| `INPUTS_INCOMPLETE` | Standardfall, Geburtstag oder andere Eingaben fehlen; nächste Schritte zur Bestätigung |
| `OUTSIDE_SCOPE` | Unbestätigter bzw. nicht unterstützter Fall oder Kohorte; keine positive modellierte Freigabe |
| `FORECAST_ONLY` | Nur bei der **bereits vom Validator ausdrücklich zugelassenen** 2027-Vorschau und ausschließlich mit seinen Vorbedingungen; nie positive Rechtszusage |
| `RULE_CONFLICT` | Bestehende Findings und Monatshinweise im bisherigen Prüfbereich öffnen |
| `PLAUSIBLE_MODEL` | Der begrenzte Standardfall ist **technisch plausibel**, aber weder unabhängig fachlich geprüft noch öffentlich freigegeben |

Zusätzlich werden angezeigt:

- Technisch dokumentierte Standard-Geburtskohorte **01.04.2025–31.12.2026** und Quellenprüfdatum **aus dem bestehenden Katalog**, nicht aus einer separat gepflegten UI-Liste.
- Herkunft der Werte: fiktive Schätzung, eigene bekannte Nettoangaben oder **als extern eingetragen gekennzeichnete** Werte. Auch bei „amtlicher Quelle“ wird der tatsächlich genannte Bescheid **nicht** überprüft.
- **Unbekannte Haushaltsausgaben** sind nicht null; auch explizit eingegebene Beträge sind keine geprüften amtlichen Kosten.
- Bestehende Validator-Findings werden im Kurztext begrenzt angezeigt und für Details an den vorhandenen Regelprüfbereich weiterverwiesen.
- Explizit weiterhin offene Berechnungs-/Rechts-/Datenschutz-/Nutzerabnahme und der widersprüchliche Mutterschutz-Referenzfall.
- Direkter Weg aus dem Überblick zu „Grundlagen“ und „Plan prüfen“, ohne neuen Zustandswechsel oder automatisches Bewerben von Vorlagen.

**Sicherheits-/Persistenzgrenze:** Die Ausgabe nutzt `textContent`; eingegebene Elternnamen oder Findings werden nicht als HTML interpretiert. Das Modul ist nur eine Leseansicht, hält keine personenbezogenen Daten zwischen Berechnungen zurück und ändert weder `s` noch das bestehende Export-Schema 1. `publicReleaseApproved=true` wird bewusst nicht als implizites OK akzeptiert; eine echte spätere Freigabe muss durch das separate Releaseverfahren belegt werden.

## Tests und Nachweise

- `tests/model-scope.test.mjs`: Positive technische Standardfälle **ohne öffentliche Freigabe**, fehlende Daten, ausdrücklich abweichender Fall, 2027-Prognose, Regelkonflikt, ungültiger Geburtstag, Netto-Herkunft, unbekannte versus null Kosten, begrenzte Finding-Liste, ungültige Kataloge und verweigerte Bypass-Versuche.
- `tests/v317-scope.test.mjs`: Die echte Offline-HTML-Einbettung und DOM-Rerender nach Eingangsdaten; zusätzlich 2027, geänderte Einkommensarten, sichere Textknoten, Buttonnavigation und keinerlei lokale Speicherwirkung.
- `tests/e2e/browser.spec.mjs`: Aktualisierung über echte Desktop-/Mobil-Eingaben (320 px), Accessibility-Automation, wechselnde Familienfälle, bestätigte/externe Nettoannahmen und den unveränderten JSON-Import-/Export-Roundtrip.
- **Vollständige Regression am 17.10.2026:** 468/468 Node-/DOM-Tests (`npm test`), 56/56 komplette Chromium-Browser-E2E über HTTP und 3/3 neue V3.17-Chromiumfälle zusätzlich direkt über `file://` bestanden. Der `file://`-Lauf verwendet die lokale index.html als `BROWSER_APP_URL`, kein Anwendungs-Backend. Automatische Axe-Kontrollen sind Teil der Browserfälle; manuelle Screenreader-/Familientests stehen aus. Keine unabhängige fachliche Freigabe.

## Warum keine öffentliche Freigabe daraus folgt

Das bestehende `data/release-gates.json` bleibt **unverändert** und `npm run release:check` meldet weiterhin **BLOCKED**. Das fachliche 4/5-Tage-Mutterschutzproblem wird in diesem Paket bewusst nicht geändert. Die vorbereiteten zehn synthetischen Referenzfamilien haben weiter **keine unabhängig bestätigten vollständigen Monats-Sollwerte**. Eine verständlichere Hinweiskarte oder ein grüner Unit-Test ersetzt weder eine qualifizierte Fachperson noch einen echten Familien-/Accessibility-Nutzertest.

## Nächste unabhängige Arbeitspakete

1. **V3.17-B:** Export-/Ergebniskennzeichnung und Quellenstand konsistent machen; nur rückwärtskompatibel, ohne Erfindung einer Behördenrechnung.
2. **V3.17-C:** [Neutrales Reviewformular](FACHABNAHME-V317-REFERENZFALL-VORLAGE.md) ist vorbereitet, tatsächliche externe Soll-/Reviewer-Felder bleiben **leer**. Eine später maschinenprüfbare Evidence-Matrix ist noch auszuarbeiten.
3. **V3.17-D:** Mit synthetischen Beispielen testen, ob Eltern „technisch plausibel“ von „amtlich bestätigt“, Elterngeld-Netto von Gehaltsnetto und Anspruch von tatsächlichem Geldeingang unterscheiden.

[Operative Roadmap](ROADMAP.md) · [Externer Audit-Abgleich](PRODUKTREIFE-ABGLEICH-V317-2026-10-17.md) · [öffentliche Freigabegates](../data/release-gates.json).
