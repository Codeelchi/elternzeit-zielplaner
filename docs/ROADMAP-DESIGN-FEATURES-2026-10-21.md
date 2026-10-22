# Produkt- und Design-Roadmap nach Paket 1

**Stand:** 21.10.2026 · **Repository:** Elternzeit-Zielplaner · **Basis:** `main` nach PR #37 (`8c6d3b7`)

## Produktleitbild

Eltern sollen mit fiktiven oder bewusst selbst eingegebenen Angaben verstehen können, wie **Familienzeit, Betreuung, verfügbare Mittel und Rücklagen** zusammenwirken. Der Zielplaner ist ein **Offline-Familien-Szenario- und Budgetplaner**, **kein amtlicher Elterngeldrechner** und keine nachgewiesene globale Optimierung.

**Trennung der Freigaben:** Technischer Merge und grüne CI bedeuten weder fachliche Bewilligungsprüfung noch öffentliche Produktfreigabe. Externe P0-Gates aus [ROADMAP.md](ROADMAP.md) und dem Release-Check bleiben verbindlich.

## Paket 1 – Design, Navigation und Verständlichkeit

**Status: technisch umgesetzt in PR #38; vollständige commitgebundene CI und Merge-Review sind die technischen Abnahmekriterien. Öffentliche Produktfreigabe bleibt separat gesperrt.** Dieses Paket ist von den folgenden Ausbaustufen unabhängig.

| Baustein | Konkrete Änderung | Technische Abnahme |
| --- | --- | --- |
| Klarer Navigationspfad | Sechs häufige Ansichten als **01–06** statt Sprungnummern; Zurück/Weiter überspringen Fachansichten im vereinfachten Modus. Die 16 Fachansichten bleiben bei explizitem Umschalten erreichbar. Ein geöffneter Detailbereich bleibt als zusätzlicher Schritt navigierbar. | Node-/Chromium-Tests für Nummernfolge, Vor/Zurück, Fokus, Fortschritt und Expertenmodus |
| Vier Ergebnisfragen | Nach einer Vorlage vier Karten: Betreuungsziel, erste rechnerische Betreuungslücke, niedrigster Monatsrest nur bei bekannten Kosten, unverbindlicher Prüfstatus. Gesamt-Einnahmen vor Kosten ausdrücklich separat. | Fehlende Kosten dürfen **nie** als verfügbares Budget erscheinen; Eingabe 0 ist von leer zu unterscheiden |
| 2027- und Beispielhinweise | Sichtbare, unmissverständliche Vorwarnung zu nicht bestätigtem Rechtsstand; vollständige Validatorcodes und Einschränkungen weiterhin aufklappbar. | Kein positiver Bewilligungsstatus; Negativtest für 2027, unveränderte Release-Sperre |
| Datenqualität | Eingaben sichtbar als **fiktiv**, **selbst eingegeben/geschätzt**, **als übernommen gekennzeichnet (nicht extern geprüft)** oder **fehlend** kennzeichnen. Keine neue automatische Vertrauensbewertung. | Auswahl, Wechsel, Rücksetzen und Import dürfen keine amtliche Prüfung behaupten und das Finanzmodell nicht verändern |
| Responsives Layout | Karten auf Desktop mehrspaltig, auf kleinen Displays gestapelt; Tastaturfokus, 200-%-Textvergrößerung, keine horizontale Dokumentüberläufe. | 320/390/768/1265 px, axe-Regressionen und manueller QA-Check |

**Nicht Teil von Paket 1:** neuer Rechtsentscheid, Netto-Rechenformeln, 2027-Freigabe, Export-Schema, Cloudkonto, automatische Datenspeicherung, tatsächliche Optimierung oder Anbindung an Behörden. Offline-Laufzeit und Speicher-Opt-in bleiben gleich.

## Paket 2 – Interaktiver Zeitstrahl und Was-wäre-wenn-Vergleich

**Status 22.10.2026: Paket 2A (zugänglicher Monatszeitstrahl) und 2B (bis zu drei flüchtige Varianten) im Review-Branch implementiert, CI und Merge noch offen. Paket 2C wird im eigenen Review-Branch technisch umgesetzt; GitHub-PR/CI vor Integration notwendig.** Die technischen Grenzen und Tests beschreibt [Umsetzung Paket 2](UMSETZUNG-PAKET2-FAMILIENZEIT-2026-10-22.md). Ursprung: Paket 1 und bestehende `TimeAxes`-/Budgetmodulen.

### 2A. Gemeinsamer Familienzeitstrahl (erste Monatsversion technisch umgesetzt)

- Darstellung aller relevanten Kind-Lebensmonate auf **einer gemeinsamen Achse**: Elternteil 1/2, rechtliche Elternzeit, tatsächlich modellierte Arbeit/Teilzeit, Leistungsarten, Betreuungsannahmen und monatsbezogene Einnahmen/Kosten; Zahlungsbuchungen bleiben davon separat.
- Kein erfundener Kita-Platz: bekannte Betreuung, angenommene Unterstützung und rechnerische Lücken visuell und textlich unterscheiden. Gestaffelte Betreuungskohorten und Elternwechsel erkennbar machen.
- Pro Monat ein Detailbereich mit Herkunft der Werte, *vor Kosten* versus *nach eingegebenen Kosten* sowie erwarteter Leistung versus separatem Zahlungstermin.
- **Abnahme:** jede Darstellung lässt sich vollständig über Tastatur erreichen, hat gleichwertige zugängliche Tabellen-/Textansicht und ist bei 320 px und 200 % Schrift lesbar. Für zwölf synthetische Übergangs-/Grenzfälle keine Inkonsistenz zur bestehenden Zeitachsenberechnung. Mutterschutz-P0 nicht als gelöst markieren.

### 2B. Bis zu drei flüchtige Varianten festhalten und vergleichen (technisch umgesetzt)

- Nutzer können **maximal drei Entwürfe** als lokale Vergleichs-Snapshots markieren. Aktiven Plan, Vergleichssnapshots und tatsächlich eingetragene Buchungen eindeutig voneinander trennen.
- Vergleich nach **Betreuungszeit**, **erster Betreuungslücke**, **niedrigstem Rest**, **benötigter Rücklage** und **offenen Nachweisen**; fehlende Kosten führen zu „nicht vergleichbar“, nicht zu 0 €.
- Ein Snapshot überschreibt den aktiven Plan **nicht**. Eine Übernahmefunktion gehört nicht zu diesem Paket; erfolgreiche Importe und bestätigte Resets leeren die flüchtigen Vergleiche, Fehlimporte und abgebrochene Resets nicht.
- **Abnahme:** Node-/Chromium-Tests für Modellwechsel, Monatswahl, maximal drei Snapshots, unbekannte Werte, Import/Reset, temporäre Nichtpersistenz und HTML-Escaping. Für spätere dauerhafte Speicherung oder Planübernahme erst gesonderte Freigabe und Schema-Versionierung.

**Ausbaugrenzen von 2A/2B:** Die erste Ansicht zeigt vorhandene Status- und Geldwerte je Lebensmonat, aber noch keine juristisch geprüfte Zuordnung sämtlicher Elternzeitabschnitte oder echte wöchentliche Betreuungsabdeckung. Die Begriffe Kita angenommen / nicht zugeordnet sind ausdrücklich keine Platzzusage bzw. amtliche Betreuungslücke. Die automatisierten A11y-Tests ersetzen keine manuelle Screenreader-Abnahme. Weitere fachlich abgenommene Übergangs-/Grenzfälle bleiben offen.

### 2C. Was-wäre-wenn-Regler (technisch im Review-Branch umgesetzt)

- Parameter ausschließlich als **ausdrücklich hypothetische** Alternative: Kita-Start um 0–6 Monate verschieben, Teilzeitstunden, Ausgaben und vorsichtige Einkommensbandbreiten. Vorhandene Regeln/Modelle wiederverwenden statt neue Leistungshöhen zu erfinden.
- Side-by-side Ausgangsplan und Alternative mit klarer Beschriftung und eventuell veralteter Berechnung. Keine heimliche Änderung von Monatsplan, bestätigten Buchungen oder Speicherzustimmung.
- **Abnahme:** deterministische Grenztests für 0–6 Monate, bekannte/fehlende Ausgaben, Cent-Werte und Teilzeit-Netto; DOM-/Chromium-Nachweise für Import, Reset, Tastatur, 320–1280 px und Nichtpersistenz. Die neue Ansicht zeigt **keine Optimierungs- oder Übernahmeempfehlung**. [Implementierung und Grenzen](UMSETZUNG-PAKET2C-WAS-WAERE-WENN-2026-10-22.md).

**Sicherheitsgrenzen:** 2027-Szenarien als unverbindlich, 4/5-Mutterschutztage und Netto-Fachfragen weiterhin offen; keine Ergebnisfreigabe durch Rendering.

## Paket 3 – Bericht, Aufgaben und echte Nutzerabnahme

**Status 22.10.2026: 3A (zwei A4-Druckseiten) und 3B (quellenbasierte Sitzungsaufgaben) sind im eigenen Review-Branch technisch umgesetzt. 3C (echte Nutzer- und manuelle Screenreader-Abnahme) ist nur als [Studienprotokoll](PAKET3C-NUTZER-A11Y-ABNAHME-2026-10-22.md) vorbereitet – noch nicht durchgeführt.** [Umsetzungsbericht Paket 3](UMSETZUNG-PAKET3-DRUCK-AUFGABEN-2026-10-22.md). Alle externen Freigaben bleiben gesperrt.

### 3A. Kompakte druck-/PDF-fähige Planübersicht (technisch im Review umgesetzt)

- **Ein bis zwei druckbare A4-Seiten**, keine 16-Fachansichten-Druckkopie: Familienzeit, gekennzeichnete Einnahmen-/Kostenannahmen, erste Lücke, relevante Unsicherheiten und nächste Prüfaufgaben.
- Kopfzeile enthält „Fiktives Beispiel“ oder „Eigener ungeprüfter Entwurf“, Berechnungsstand und **keine** amtliche Bewilligungswirkung. Fehlende Werte ausdrücklich leer/nicht berechenbar.
- Rein lokal per Browser-Druck/PDF; keine serverseitige PDF-Verarbeitung und keine automatische Übertragung sensibler Daten.
- **Technische Abnahme:** Echte Chromium-PDF-Testausgaben sind auf genau 2 A4-Hochformatseiten bei 24 und 36 LM geprüft; semantische HTML-Vorschau, Textwarnungen und unbekannte Beträge vorhanden. **Noch offen:** unabhängige visuelle Drucker-/Schwarzweiß-/Screenreader-Abnahme aus 3C, keine amtliche Bestätigung.

### 3B. Persönliche, aber lokal bleibende Aufgabenübersicht (technisch im Review umgesetzt)

- Aus bestehendem Antrags-/Fristenmodul nur **quellengeprüfte und im unterstützten Fall passende** Aufgaben ableiten: vor Geburt, nach Geburt, Kita-/Betreuungsübergang, Rückkehr zur Arbeit.
- „Offen“, „persönlich erledigt“ und „durch Regelprüfung noch ungeklärt“ trennen. Kein voreiliges „amtlich erledigt“; Fristen mit Ursprungsquelle, Datenannahmen und Änderungswarnung.
- Abweichende und unklare Fälle benötigen Nichtunterstützt-Hinweis statt erfundener Pflicht oder Frist.
- **Technische Abnahme:** reine Datums-/Quellen-/Aufgabenstatusprüfungen, HTML-/Chromium-Sync, Tastaturfokus, Reset/Import und flüchtiger Speicher. Der neue Kurzüberblick benutzt ausschließlich bestehende Aufgaben und Fristen; **keine** neuen, ungesicherten Pflichten zur Rückkehr in den Beruf. Manuelle Nutzerprüfung weiterhin offen.

### 3C. Nutzertest, manuelle Accessibility und Abnahme (Studienplan vorbereitet; Durchführung offen)

- Moderierte Aufgaben mit **ausschließlich synthetischen Daten**: erstes Beispiel verstehen, zwei Varianten vergleichen, „Einnahmen“ von „frei verfügbarem Rest“ unterscheiden, Rechtsstatus und fehlende Angaben erklären, Plan drucken.
- Auch Testpersonen ohne Finanz-/Elterngeld-Vorkenntnisse, Mobilgeräte sowie Screenreader/Tastatur erfassen. Fehler, Verständnisprobleme, Abbrüche und Bearbeitungszeit dokumentieren; persönliche Familien- oder Gesundheitsdaten nicht erfassen.
- Kritische Missverständnisse und Accessibility-Blocker vor weiterem Rollout beheben, danach unabhängige Fach-/Rechts-/Datenschutz- und Betreiberentscheidung als **separate** Gates.
- **Abnahme:** nachvollziehbare Testprotokolle und signierte/zugewiesene Fach- und Betreiberentscheidungen; `release:check` darf erst nach tatsächlichen Evidenzen auf PASS gestellt werden.

## Reihenfolge und Definition of Done

1. **Paket 1:** UI/Navigation/Testschutz/README im PR überprüfen, Node- und Chromium-CI grün; kein automatisches Pages-Deployment.
2. **Paket 2A → 2B → 2C:** 2A/2B sind seit PR #39 auf Main; 2C ist als eigenständiger, nicht rechtlich bindender Review-Branch implementiert. Vor der Integration commitgebundene CI und separater Merge.
3. **Paket 3A/3B → 3C:** A4-Bericht und lokale Aufgabenübersicht im separaten Review-Branch; 3C als Studienplan vorbereitet, noch **0 echte Nutzer- und Screenreader-Durchführungen**, unabhängige P0-Fach- und externe Betreiberfreigaben fehlen.

**Nicht automatisch durch diese Roadmap geschlossen:** P0-Mutterschutz-Frist-/Resttagekonflikt, 10/10 unabhängige vollständige Familienfälle, ungeprüfter Elterngeld-Netto-/2027-Rechtsstand, manuelle Screenreader- und Datenschutznachweise sowie endgültiger Betreiberentscheid.
