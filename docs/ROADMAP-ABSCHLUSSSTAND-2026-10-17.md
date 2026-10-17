# Roadmap-Prüfung und technische Nacharbeiten – 17. Oktober 2026

**Produkt:** Elternzeit-Zielplaner, V3.13-Entwicklungsstand über V3.12

**Keine öffentliche Produktfreigabe.** Code-/Browser-/Unit-Tests belegen Softwarefunktionalität, keine unabhängige Berechnung von amtlichem Elterngeld oder ein erfolgreiches Datenschutz-/Rechtsgutachten.

## Fertig implementierte Ausbaupakete

### 1. Zahlungskalender mit bewusst eingegebenen Annahmen

Modul: src/expected-payments.cjs. In der Ansicht Zeitachsen können erwartete Einnahmen und Ausgaben mit selbst gewählten Kalendertagen eingetragen und gegen 0/7/14/30/60/90 Tage verspätete Einnahmen verglichen werden. Der Hinweis benennt ein nur für diese Posten erforderliches Zwischenfinanzierungsvolumen mit Vorsichtsannahme „Ausgaben vor Einnahmen am selben Tag“. Die optionale Anfangsrücklage ist eine manuelle Annahme. Keine Daten werden aus dem Lebensmonatsanspruch oder dem tatsächlichen Bankjournal übernommen; sie werden weder gespeichert noch exportiert und bei Reset/Import verworfen.

**Nicht abgedeckt:** fehlende Rechnungen und Einkünfte, Bank-Sollsaldo, echte Zahlungszusage und tatsächliche Elterngeld-Bewilligung. Eine Zahlung nur wegen eines rechnerisch entstandenen Leistungsanspruchs wird nicht vorgetäuscht.

### 2. Steuern und Krankenkasse transparent als offene Ausgaben markieren

Modul: src/finance-guidance.cjs. In der Ansicht Robustheit können GKV-Pflichtmitgliedschaft, freiwillige GKV, PKV, Familienversicherung und „unbekannt“ unterschieden werden. Eine eigene Angabe kennzeichnet, ob Beiträge in den bereits erfassten Haushaltsausgaben enthalten sind. Die Quellenhinweise erklären den Progressionsvorbehalt und mögliche Steuererklärungspflicht sowie Unterschiede bei der Versicherung im Elternzeitbezug. Keine Versicherungssumme oder fiktive Einkommensteuer wird automatisch hinzugefügt. Vor dem öffentlichen Start sind Einzelfälle unabhängig fachlich zu prüfen.

### 3. Offizielle Leistungen und Kölner Gebühren als strikt getrennte Hinweise

Die regionalen Ergebniskarten verlinken zum offiziellen KiZ-Angebot der Bundesagentur für Arbeit, dem Wohngeld-Rechner des Bundes, der Deutschen Rentenversicherung und dem Kölner Vormerkverfahren. Weder KiZ, Wohngeld noch Rentenpunkte werden in das Lebensmonatsbudget addiert.

Die Ansicht für Köln zeigt bei Auswahl der historischen Gebührentabelle eine illustrative Beitragsgröße auf Basis der bereits hinterlegten Tabelle seit August 2025 mit Altersgruppe und eigenem Essensgeld. **Sie überschreibt die manuelle Kita-Ausgabenannahme nicht.** Ausnahmen sowie 2027/2028 bleiben unabhängig zu bestätigen.

### 4. Suche und Buchungsmodell robuster

- Neu im Suchmuster: ein um einen Lebensmonat verzögerter Teilzeit-Wiedereinstieg nach geplantem Kita-Start; die bestehenden fachlichen Regeln prüfen weiterhin jede erzeugte Variante.
- Modul src/search-coverage.cjs zeigt eindeutige/erzeugte/ausgeschlossene/geeignete Vorlagen mit ersten Ablehnungsgründen und warnt vor fehlendem globalen Vollständigkeitsbeweis.
- src/family-budget.cjs rundet die simulierten Elterngeldbeträge je Elternteil separat auf Cent, bevor sie addiert werden. Bestätigte Zusatzleistungen außerhalb der betrachteten Lebensmonate erscheinen als nicht berücksichtigte Leistung statt still zu verschwinden.

### 5. Nachvollziehbare Quellen- und Fristenkontrolle

- Datierte Metadaten für 14 amtliche Fundstellen in data/official-source-review-2026-10-17.json.
- scripts/sources-check.mjs: erlaubte offizielle HTTPS-Domains, Datumslogik, nächste Prüfzeitpunkte, Konflikt und Gesetzentwurf bleiben als nicht freigegebene Regeln gekennzeichnet. Der Check beweist **nicht**, dass jede externe Webseite zum nächsten Prüfdatum unverändert blieb.
- src/calendar-export.cjs: vorläufige Aufgaben aus der bestehenden Checkliste als Kalenderdatei mit Status TENTATIVE. Schriftliche Fristbestätigung und Abgabe eines Antrags bleiben Aufgaben des Nutzers.
- JSON-Export mit expliziter schemaVersion 1; ältere Exporte ohne Versionsfeld bleiben lesbar. Unbekannte zukünftige Schemata werden mit Fehlermeldung abgewiesen; keine stille Datenmigration.

## Formell offener Teil der Roadmap

| Kennung | Aktueller Status | Was den Punkt tatsächlich abschließt |
|---|---|---|
| P0-R1 | extern offen | Amtlicher, unabhängiger Nachweis zur widersprüchlichen 4-/5-Tage-Anrechnung beim Mutterschutz; vorhandene schriftliche Klärungsfrage im Referenzbericht noch nicht versandt |
| P0-R2 | extern offen | Mindestens zehn vollständige, unabhängig nachvollziehbare Familienfall-Sollwerte inklusive Monats- und Bezugslogik; einzelne publizierte Beträge zählen nicht als vollständiger Fall |
| P0-R3 | extern offen | Unabhängig überprüfte pauschalierte Brutto-zu-Elterngeld-Netto-Ermittlung je Rechtskohorte, Steuer- und Sozialversicherungsmerkmalen; manuelle EG-Nettoeingabe bleibt bewusst erhalten |
| P0-R4 | extern offen | Rechts-/Standardfallreview durch qualifizierte unabhängige Person mit Datum, Kohorten und Freigabeentscheidung; 2027 bleibt unverbindlich |
| P1-R5 | teilweise | Nachweis für kleine vollständig enumerierbare Suchteilräume und nachvollziehbarer Smartphone-Benchmark; größere Teilzeitvielfalt validieren |
| P1-R6 | teilweise | Unabhängig überprüfte echte Monatsfälle mit Steuer-/Versicherungsauswirkungen statt nur finanziellen Hinweistexten |
| P1-R7 | teilweise | Neue Gültigkeitsprüfung der kommunalen Tarife und Satzungen vor ihrer Verwendung für spätere Stichtage |
| P1-R8 | extern offen | Echte Probanden, unabhängige Datenschutzbewertung, manuelle Screenreader-/Zoom-/Tastatur-Prüfung und Bearbeitung der Befunde |
| P2 Offline-Module | technisch umgesetzt | Regression pro künftigem Build wiederholen |
| P2 Versionierte Importe | technisch umgesetzt | Migrationsprüfung beim nächsten Formatwechsel |
| P2 Quellen-Statusprüfung | technisch umgesetzt | Regelmäßige inhaltliche erneute Quellenlektüre, keine automatische Genehmigung |
| P2 alte Doppeldefinitionen | teilweise | Risikoarmer Refactor des alten HTML-Controllers mit vollständigen E2E-Prüfungen |

Maschinenlesbarer Stand: data/roadmap-status-2026-10-17.json. Konsistenzcheck: npm run roadmap:check. Für künftige Änderungen sind Quell-, Rechts- und Freigabevalidierung unabhängig von einer erfolgreichen CI notwendig.

## Konkreter Übergabeplan an unabhängige Reviewer

**Elterngeldstelle/Fachreview:** Synthetischen 20.05.2026-Fall zur Frist/Anrechnung inklusive beiden publizierten Behördenbelegen prüfen. Den schriftlichen Auskunftstext aus docs/AMTLICHE-REFERENZPRUEFUNG-2026-10-15.md verwenden; die Anfrage ist noch nicht versendet. Mindestens zehn weitere vollständige Referenzfälle auf identischen Ausgangsdaten mit unabhängigem Sollwert ermitteln, darunter Wechsel Basis/Plus, Partnerschaftsbonus, Teilzeit, Geschwister, Monatsendgeburt und Sonderfälle.

**Recht:** BEEG-Standardkohorte, Textform und Fristen nach Alter, 2027-Entwürfe versus geltendes Recht, Ausnahmen und Quellenstand abzeichnen. Nur genau bestätigte Felder der separaten Freigabesperren später ändern.

**Datenschutz:** Browserbetrieb ohne Serverübertragung, Opt-in-Speicherung, lokale Geräte mit mehreren Nutzern, Export/Import, externer Link, Barrierefreiheit der Warnungen und Datenlöschung prüfen. Die nicht gespeicherten Szenarioannahmen gesondert im Test kontrollieren.

**Usability und Accessibility:** Mindestens sechs bis acht nicht eingewiesene Personen mit unterschiedlicher Familiensituation testen. Aufgaben: einen Beispielplan erstellen, eigenes Einkommen erfassen, mögliche Betreuungslücke erkennen, Kita-Verzögerung durchspielen, Lebensmonatsanspruch von tatsächlicher Zahlung unterscheiden, Zielsuche abbrechen, Plan exportieren und löschen. Erfasst werden Bearbeitungsdauer, Fehlermeldungen und Verständnis; private Testergebnisse gehören nicht ins Git-Repository. Für Touch, Screenreader und hohe Vergrößerung auch echte Geräte/Nutzer einbeziehen. Automatisches Axe allein reicht nicht.

**Betreiber:** Impressum, Verantwortlichkeit, redaktionelle Prüfung und öffentlicher Veröffentlichungsentscheid. Ohne diese Freigabe nicht öffentlich live schalten.

## Quellen und Gültigkeitsgrenzen

- Amtliches Bundesrecht: BEEG §§ 2, 2a, 2b, 2e, 4, 4b, 7 und 16; MuSchG § 3 (gesetze-im-internet.de)
- Familienportal: Versicherung und Elterngeld, Progressionsvorbehalt (familienportal.de)
- Stadt Köln: Beiträge ab 01.08.2025 und Betreuungsvermittlung (stadt-koeln.de)
- Bundesagentur für Arbeit: Kinderzuschlag/KiZ-Lotse (arbeitsagentur.de)
- BMWSB: Wohngeld-Rechner (bmwsb.bund.de)
- DRV: Kindererziehungszeiten (deutsche-rentenversicherung.de)
- BMF: Einkommensteuerreformgesetz 2027, ausdrücklich **Entwurf** (bundesfinanzministerium.de)

Die konkreten URLs, Prüftage und Statuswerte stehen in der datierten JSON-Quellenliste. Die Liste ist Quelleninventar, keine unabhängige vollständige Rechtsabnahme.

## QA und Veröffentlichung

Abnahme im Workbench am 17.10.2026, lokaler Entwicklungszweig:

- **357/357 Node-/DOM-Tests bestanden** (einschließlich Quellen-/Roadmap-Integrität, unabhängigen reinen Modulen und negativen Eingaben).
- **36/36 Chromium-E2E-Browserfälle bestanden**, einschließlich aller Desktop- und Mobilansichten sowie neuer V3.13-Szenarien mit Axe A/AA.
- **4/4 neue V3.13-Browserfälle zusätzlich per file:// bestanden**, ohne externen Dienst für die Anwendungsinhalte.
- **Source- und Roadmap-Metadatencheck bestanden**, Offlinemodul-/Schnellstart-Einbettung synchron.
- **release:check bleibt erwartungsgemäß BLOCKED**: unabhängige Fach-/Rechts-/Datenschutz-/Nutzertests, amtlicher Referenzabgleich sowie öffentliche Betreiberfreigabe offen.
- Automatisierte Axe-Checks ersetzen ausdrücklich keine manuelle Prüfung mit Screenreader und realen Nutzern.

Das öffentliche Release-Gate in data/release-gates.json bleibt unverändert. Ein erfolgreicher Commit oder Merge erfüllt keine unabhängige Freigabe.
