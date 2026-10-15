# Wettbewerbs- und MVP-Audit – 15. Oktober 2026

## Urteil

**Der Zielplaner entwickelt sich in eine sinnvolle Richtung, besitzt aber noch kein nachgewiesenes exklusives Alleinstellungsmerkmal und keine öffentliche Beta-Abnahme.** V3.6 bietet einen technisch belegbaren Kern für ziel- und risikoorientierte Familienplanung. Ein allgemeiner „Elterngeldrechner mit Optimierung, Budget, Quellen und Datenschutz“ ist als Positionierung bereits zu breit und im untersuchten Markt mehrfach besetzt.

Die stärkste Positionierung ist die konkrete Entscheidung: **Wie organisieren wir die gewünschte Betreuung, ohne unser Mindestbudget zu unterschreiten – und welche Rücklage brauchen wir, wenn das Einkommen niedriger ausfällt?** Der Wettbewerbsvorteil muss anhand dieser Aufgabe nachgewiesen werden. Mehr Funktionen oder eine größere Testanzahl allein belegen ihn nicht.

## Gegenstand und Methode

- Tatsächlich untersuchte Codebasis: **V3.6.0, `main` `a26a5e4`**, einschließlich des inzwischen gemergten PR #13. Frühere V3.4-Aussagen wurden nicht ungeprüft übernommen.
- Aktuelle Hauptbranch-CI [Run 38698287170](https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/38698287170): **186 Node-Tests, 13 Browserfälle bestanden**. `npm test` wurde für dieses Audit erneut ausgeführt: **186/186**. Diese Zahlen sind keine unabhängige fachliche Abnahme.
- Neue Websuche, Primärseiten der Anbieter, direkte HTTP-Abrufe, ausgewählte Browseroberflächen und zwei öffentlich ausgelieferte JavaScript-Module untersucht. Keine Anmeldung, kein Kauf, keine privaten Familienangaben und keine Kontaktaufnahme mit Dritten.
- Befundklassen: **Anbieterbeschreibung**, **direkt betrachtete Oberfläche**, **isolierte Formelprobe**, **eigener Code-/Testnachweis**. Diese Klassen sind nicht gleichwertig.
- Nicht geprüft: Vollständige private Rechenengines, native Premium-Apps, sämtliche geschützten Abläufe oder eine vollständige vergleichende Behördenberechnung. Keine Vollständigkeit des Marktüberblicks und kein Beweis, dass eine nicht gefundene Funktion anderswo fehlt.
- Bei Elterngeldpilot und ReturnWorth gelang der direkte HTTP-Abruf nicht (403); dort wurden öffentliche Such-/Seitenansichten verwendet. Eine abgewiesene Direktanfrage ist kein Beleg für eine generelle Nichtverfügbarkeit. Bei der L-Bank war nur die Einstiegshülle zugänglich.
- Quellen-/Abrufmetadaten und Formelproben: [maschineller Auditnachweis](../qa/wettbewerb-audit-2026-10-15.json). Fremde HTML-Seiten oder vollständige fremde Programmmodule werden nicht ins Repository kopiert.

## 1. Markt und öffentlich nachvollziehbare Logiken

### Bundes-Elterngeldrechner / DigitalService

[Rechner](https://familienportal.de/familienportal/meta/egr), [Projektbeschreibung](https://digitalservice.bund.de/projekte/elterngeldrechner), [Weiterentwicklungsbericht](https://digitalservice.bund.de/blog/elterngeldrechner-optionen-aufzeigen-und-fehlern-vorbeugen).

Beschrieben werden ein geführter Eingabeteil, Monatsaufteilung, Gültigkeitsprüfung, Teilzeit und ergänztes Einkommen. Vorgefertigte Planungshilfen vermeiden einen leeren Start; der Bonus wird als weiterer Schritt eingeführt. Datenübernahme in den bundeseinheitlichen PDF-Antrag ist dokumentiert. Der Betreiber berichtet über umfangreiche Forschung mit Eltern und Verwaltungsmitarbeitenden.

**Einordnung:** Wichtigster Referenzpunkt für Fachlogik, Eingabeführung und Anschluss an den Antrag. Varianten, Prüfung und verständliche Planung sind dort bereits Produktziel. Wir müssen den zusätzlichen Nutzen unserer Budget-/Betreuungsentscheidung zeigen. Auch der amtliche Rechner gibt keine verbindliche Bewilligung.

### Einfach Elterngeld

[Rechner und Erklärung](https://einfach-elterngeld.de/rechner).

Die Seite trennt eine schnelle Nettoschätzung vom ausführlichen Rechner. Dessen beschriebener Ablauf ermittelt Bemessungszeitraum und pauschaliertes Netto aus Einkommens-/Steuer-/Versicherungsangaben und bietet einen Bezugszeitraum-Konfigurator. Breitere Erwerbs- und Familienkonstellationen werden angeboten. Auf der Seite ist eine ausdrückliche Einwilligung für besonders geschützte Angaben beschrieben.

**Einordnung:** Relevanter Vergleich für fachliche Eingabetiefe. Keine automatische Behauptung, dass sämtliche beworbenen Sonderfälle unabhängig korrekt sind. Der Schnellrechner und die detaillierte Software dürfen im Vergleich nicht gleichgesetzt werden. Unser enger Standardfall ist eine vertretbare MVP-Grenze, jedoch kein Funktionsvorsprung.

### elterngeld-planung.de

[Planer und Rechenbeschreibung](https://elterngeld-planung.de/planner/).

Die Oberfläche hat Situation, Einkommen und Planung/Ziel als Schritte. Beschrieben werden unterschiedliche Zielvarianten, Teilzeit, Steuerklasse und Mutterschutz. Die normale Berechnung soll im Browser laufen; Speicherung/Teilen sind gesonderte Funktionen.

Im direkt geladenen Modul `index-dBDNnsTk.js` sind Ersatzrate, Differenzberechnung und Plus-Deckelung erkennbar. Die Bruttoableitung nutzt unter anderem eine Lohnsteuertabelle mit Interpolation, pauschale Sozialabzüge und einen Ersatzpfad für nicht hinterlegte Jahre. Ein zusätzliches Szenariomodul erzeugt und prüft Kandidaten. **Das ist keine von uns bestätigte exakte amtliche Nettoermittlung oder vollständige Optimierung.**

**Einordnung:** Besonders deutliche Überschneidung mit unserem Zielvergleich. Aus „läuft im Browser“ folgt nicht „keine weiteren Netzwerkdienste auf der Seite“. Unser Urteil betrifft die untersuchten Berechnungsteile, keine vollständige Datenschutzprüfung des Wettbewerbers.

### Elterngeldpilot

[Produktbeschreibung](https://elterngeldpilot.com/).

Der Anbieter bewirbt automatische Aufteilungsvergleiche, eine an amtlichen Steuerverfahren orientierte Berechnung sowie Anschlussleistungen für Antrag, Arbeitgeber-Schreiben und Erinnerungen. Die Basisberechnung wird ohne Anmeldung angeboten. Die behauptete vollständige Betrachtung erlaubter Aufteilungen wurde hier **nicht** algorithmisch oder durch Zahlenbeispiele unabhängig nachgewiesen.

**Einordnung:** Optimierung plus Antragsunterstützung ist bereits eine angebotene Produktkategorie. „Wir optimieren automatisch“ genügt nicht zur Differenzierung. Wir sollten keine konkurrierenden Vollständigkeits- oder Genauigkeitsbehauptungen übernehmen.

### elternzeit.app

[Öffentliche Oberfläche](https://elternzeit.app/).

Die aktuelle Startseite wurde im Browser geöffnet: Bruttoregler, Steuerklasse, Bundesland und weitere Optionen sind vorhanden. Beschrieben werden Szenarien, Haushaltseinkommen und Steuer-/Versicherungswirkungen. Die weitergehenden Rechen- und Antragsfunktionen sind in diesem Audit nicht vollständig durchgespielt worden.

**Einordnung:** Ein Finanz- und Familienplaner statt eines reinen Leistungsrechners ist ebenfalls keine unbesetzte Kategorie. Unsere Vorteile müssen enger und messbar formuliert werden. Sichtbare Steuerversprechen sind kein hinreichender Beleg für deren finanzielle Vollständigkeit.

### fam-calc

[Webrechner](https://fam-calc.net/elterngeldrechner.html), [Android-Produktbeschreibung](https://app.fam-calc.net/).

Der Webrechner berechnet Basis/Plus aus Netto und zeigt den Rechenweg. Im Browser ergibt die synthetische Eingabe 2.000 Euro ohne Zuschläge 1.300 Euro Basis und 650 Euro Plus. Der Anbieter beschreibt für Android Offline-Betrieb, Quellenbezug und einen weitergehenden Monatsplaner. Die native App wurde nicht installiert oder fachlich auditiert; Web- und App-Umfang unterscheiden sich.

**Einordnung:** Offline, kein Konto und erklärter Rechenweg sind belegte Wettbewerberangebote bzw. öffentliche Anbieterbeschreibungen. Diese Eigenschaften bleiben wertvoll, sind allein aber kein exklusives Merkmal unseres Produkts.

### ReturnWorth

[Deutsche Produktseite](https://returnworth.com/de).

Die Seite beschreibt private monatliche Elternzeit-/Budget-/Wiedereinstiegsplanung. Leistungsbeträge werden aus offizieller Berechnung, Bescheid oder Arbeitgeberauskunft übernommen; ein eigener Elterngeldanspruch wird ausdrücklich nicht berechnet. Ein kompletter interaktiver Ablauf konnte hier nicht geprüft werden.

**Einordnung:** Ein Planer mit extern bestätigten Leistungswerten ist ein ernst zu nehmender enger Produktschnitt. Auch wir dürfen die für den MVP erlaubte manuelle Elterngeld-Netto-Eingabe als bewussten, verständlich unterstützten Weg anbieten. Eine vollständige Bruttoengine ist nicht automatisch Voraussetzung jedes sinnvollen Planungs-MVP.

### ElterngeldKlar und Eltern-Fristen

[ElterngeldKlar-Hilfe](https://elterngeldklar.de/app/elterngeldklar/hilfe/), [Eltern-Fristen-Rechner](https://www.elternfristen.de/optimierer).

ElterngeldKlar dokumentiert feste Szenarien, eine editierbare Monatstabelle, Regelhinweise und einen Antragspfad. Es benennt ausdrücklich Grenzen bei Mutterschaftsanrechnung und Selbstständigkeit. Eltern-Fristen beschreibt eine lokale Nettomodellrechnung und schließt Teilzeit/Bonus sowie weitere Rechenteile aus.

**Einordnung:** Quellen, Checklisten, Warnungen und offengelegte Grenzen sind ebenfalls keine exklusiven Ideen. Die methodische Transparenz eignet sich als Vergleichsmaßstab. Beworbene Szenarien nicht mit umfassender Optimierung verwechseln.

### Ergänzende Sichtung

[Elterngeld Planer im App Store](https://apps.apple.com/de/app/elterngeld-planer/id1491928245) beschreibt Haushaltsnetto, mehrere Pläne, Hinweise und Exporte. [L-Bank-Planer](https://elterngeldplaner.l-bank.de/) wurde erreicht, sein innerer Ablauf hier aber nicht geprüft. Beide sind Kandidaten für einen nächsten strukturierten Bedienvergleich, keine Grundlage für unbelegte Detailbewertungen.

## 2. Formelproben statt bloßer Werbeaussagen

Aus den beiden öffentlich ausgelieferten Modulen von fam-calc und elterngeld-planung.de wurden unveränderte reine Hilfsfunktionen isoliert mit synthetischen Zahlen ausgeführt. Keine vollständigen Produktabläufe oder Backendberechnungen. Vergleich gegen die tatsächlichen `basis`-/`plus`-Funktionen unseres geladenen HTML.

| EG-Netto vor Geburt | EG-Netto im Bezug | Unser Basiswert | Unser Pluswert | Vergleich |
| ---: | ---: | ---: | ---: | --- |
| 650 € | 0 € | 549,25 € | intern 274,625 € | Beide fremden Basishilfen gleich; fam-calc rundet Plus bereits auf 274,63 € |
| 1.000 € | 0 € | 670 € | 335 € | Beide Hilfen stimmen überein |
| 2.000 € | 0 € | 1.300 € | 650 € | Beide Hilfen stimmen überein; fam-calc-Weboberfläche zusätzlich geprüft |
| 2.000 € | 500 € | 975 € | 650 € | elterngeld-planung.de-Hilfen stimmen überein |
| 2.000 € | 1.200 € | 520 € | 520 € | elterngeld-planung.de-Hilfen stimmen überein |

**Befund:** Die zentrale Ersatz-/Differenzformel ist kein Alleinstellungsmerkmal. Unterschiede entstehen bei Eingabegrundlagen, Teilzeitgruppen, Rundung, Mutterschaft, Regeln, Zielauswahl und Bedienung. Die Rundungsbeobachtung begründet einen unabhängigen Abgleich unserer Cent-/Summenpolitik; sie beweist hier weder einen Produktfehler noch eine amtliche Überlegenheit eines Anbieters.

Rechtsreferenz bleibt [§ 2 BEEG](https://www.gesetze-im-internet.de/beeg/__2.html) bzw. der passende amtliche Fall, nicht der Wettbewerbercode. Einzelne fremde Hilfsfunktionen können Mindestbeträge oder Prüfungen an ihre Aufrufer delegieren. Ein isoliert fehlender Schritt ist daher kein Beweis für eine falsche Gesamtanwendung. Es wurde kein fremder Code in unser Produkt übernommen.

## 3. Abgleich mit unserem geplanten MVP

| Kriterium | Stand V3.6 | Bewertung |
| --- | --- | --- |
| A01: getrennte Zeitachsen und Datumsbezug | Eigene Modelle und UI für Mutterschutz, Elternzeit, Arbeit, Bezug und tatsächliche Buchungen | Implementiert, unabhängige Datums-/Fachabnahme bleibt offen |
| A02: regelgeprüfte Varianten und erklärbare Konflikte | Vier Statuscodes, Quellen, betroffene Eltern/Monate, Alternativen, konservative Lohnarten-/Sonderfallsperre | Deutlich fortgeschritten; Nutzerbestätigung ersetzt keine Anspruchsprüfung |
| A03: Schätzcharakter und prüfbare Annahmen | Globale Kennzeichnung, getrennte Nettofelder, manuelle Monatswerte | Modell transparent; Einstieg mit unbekanntem EG-Netto noch erklärungsbedürftig |
| A04: unabhängige Referenzen | 48 überwachte Geldwerte, zusätzlicher L-Bank-Verlauf und historische Dokumentbeziehungen | Mehr Evidenz als V3.4; keine vollständige aktuelle Bescheid-/Bruttonetto-Reproduktion, Tageswiderspruch offen |
| A05: versionierte Regelquelle | Rechtskatalog und separater Rechtsereigniskatalog, Snapshot-Checks | Technisch vorhanden; Aktualität und rechtliche Freigabe sind externe Arbeitsprozesse |
| A06: Zielsuche und Grenzen | Budget-/Betreuungsfilter, Rollenvarianten, Profile, Zählung, Übernahmeprüfung | Begrenzte Vorlagensuche. 2027 nur getrennt gekennzeichnete Prognose, weiterhin `valid=false` |
| A07: drei Robustheitsfälle | Personenbezogene Einkommensbänder, Leistung/Kosten, Engpässe, Rücklagen | Guter Differenzierungskern; kein Wahrscheinlichkeitsmodell und keine Zahlungsliquiditätsgarantie |
| A08: geprüfte regionale Summen | Unbestätigte Zuschläge ausgeschlossen; NRW-/Köln-Kontext | Konservative Verarbeitung; aktuelle tatsächliche Tarife/Ansprüche nicht flächig abgenommen |
| A09: lokale Bedienung/Export/Mobil | Single-HTML, Opt-in, Löschen, Import-/Export- und Browserregressionen | Technisch belegt; generische Sprache, Assistenztechnik und echte Nutzertests fehlen |
| A10: datierte nächste Schritte | Behörden-/Dokumentenpfad, Elternzeit-/Antrags- und NRW-Kita-Termine | Vorhanden; keine automatisch erzeugten/übermittelten amtlichen Anträge |

Die [MVP-Spezifikation](MVP-2026-10-14.md) erlaubt geschätztes, ausdrücklich gekennzeichnetes EG-Netto. Eine vollständige Bruttoengine ist eine wichtige Wettbewerbs-/Ausbaufrage, aber nicht rückwirkend ein zusätzlich erfundenes Muss dieses engen MVP. Für den Beta-Gate bleiben unabhängige Prüfung der tatsächlich angebotenen Finanzlogik und verständliche Eingabe trotzdem erforderlich.

## 4. Alleinstellungsmerkmale: tragfähiger und unzulässiger Claim

| Merkmal | Urteil | Konsequenz |
| --- | --- | --- |
| Basis/Plus/Bonus, Teilzeit, Monatsplan | Verbreitet | Pflichtfunktion, kein USP |
| Automatischer Variantenvergleich | Mehrfach angeboten | Suchziel und nachgewiesenen Nutzen erklären |
| Haushaltseinkommen und Szenarien | Mehrfach beschrieben | Mindestbudget, Kosten und Engpässe konkret zeigen |
| Offline, lokal, ohne Konto | Auch andernorts angeboten | Wichtige Produkteigenschaft; nicht „einziger privater Rechner“ behaupten |
| Quellen und Rechenweg | Ebenfalls im Markt | Tiefe, Nachvollziehbarkeit und tatsächlichen Quellenstatus beweisen |
| Zielbindung + vorsichtiges Szenario + Anfangsrücklage | Im eigenen Code implementierte Kombination | Stärkste Hypothese; gleichwertige Konkurrenzabdeckung hier nicht vollständig untersucht |
| Getrennte Arbeitgeber-Elternzeit, Erwerb, Bezug und tatsächliche Buchungen | Im eigenen Modell vorhanden | Konkrete Fehlplanungen verhindern und im Nutzertest messbar machen |
| Fachlich unbekannte Fälle erkennbar sperren | Eigene Stärke der Modell-/Evidenzführung | Vertrauenskalibrierung testen; keine größere Genauigkeit allein aus Vorsicht ableiten |
| NRW/Köln-Entscheidungspfad | Zielgerichteter Einstieg | Erst durch aktuelle lokal verwendbare Daten dauerhaft wertvoll |

Empfohlener sachlicher Produkttext: **„Vergleicht Elternzeitpläne nach Betreuungszeit, Mindestbudget und finanziellen Risiken – lokal, nachvollziehbar und mit klaren Berechnungsgrenzen.“** Dieser Text beschreibt vorhandene Funktionen, ohne Exklusivität oder behördliche Genauigkeit zu behaupten.

Nicht verwenden: „einziger Offline-Planer“, „amtlich exakt“, „garantiert bester Plan“, „alle Varianten geprüft“ oder „rechtssicher für 2027“. In den untersuchten Angeboten und unserer Implementierung fehlt dafür ein entsprechender Nachweis.

## 5. Konkrete Befunde im eigenen Code

1. **Vorbelegte Familienkonstellation im Produkttext.** Noch vorhanden sind unter anderem „deine Frau“, die feste IV/IV-Zusammenfassung und der Hinweis auf zwei Einkommen von rund 4.000 Euro. Das ist ein Überbleibsel eines persönlichen Rechners. Vor öffentlicher Beta: neutrale Elternbezeichnungen, veränderbare Namen/Rollen und aus Eingaben abgeleitete Zusammenfassungen. Nicht durch pauschales Vertauschen des Mutterschutz-Elternteils lösen.
2. **Zu viele gleichzeitige Einstiegspunkte.** Die Drei-Schritt-Einführung führt in 16 Ansichten. Die fachliche Vollständigkeit allein beweist keinen leicht verständlichen Ablauf. Der amtliche Entwicklungsbericht stützt schrittweises Heranführen und spätere Bonuserklärung als sinnvolle UX-Hypothese.
3. **Eingabewissen wird vorausgesetzt.** Bruttofelder sind derzeit Referenzwerte. EG-Netto, Auszahlungsnetto und Teilzeitnetto müssen unterschieden werden. Ein expliziter geführter Weg „Werte bekannt“ bzw. „Werte aus offizieller Berechnung übernehmen“ wäre ehrlicher und nutzbarer als ein optisch vollständiger Bruttorechner ohne entsprechende Engine.
4. **Suchraum bleibt strukturell begrenzt.** `runGoalSearch` erzeugt unter anderem ausgewählte Startpunkte, begrenzte mütterliche Zusatzmonate und zwei Teilzeitstartoptionen; keine freie Wochen-/Tagesplanung. Rollen-Spiegelung erweitert Vorlagen, macht sie aber nicht vollständig.
5. **Drei Profile garantieren keine starke inhaltliche Verschiedenheit.** `rankCandidates` entfernt identische Monatsfolgen und wählt nach unterschiedlichen Kennzahlen. Eine Mindestdistanz oder ein eindeutiger wirtschaftlicher Unterschied zwischen Plänen ist nicht erzwungen. Nutzerrelevante Unterschiede gesondert messen.
6. **Das zentrale Risikoargument ist im Direktvergleich noch zu schwach sichtbar.** Karten zeigen Gesamtbudget, tiefsten Monat und Profilbegründung; Rücklagen und Engpässe liegen gesondert. Für die Positionierung sollten jede Variante und ihr vorsichtiges Szenario direkt nebeneinander stehen.
7. **Betreuungs- und Finanzziel nur näherungsweise.** Volle freie Monate sind keine tatsächlich verteilten Betreuungsstunden. Der Stressanspruch ist kein Zahlungseingang. Eine Kontoumsatzliste macht noch keine Auszahlungsvorhersage. Diese Grenzen ausdrücklich erhalten.
8. **QA-Dokumente haben Versionsdrift.** CI belegt V3.6 mit 186/13, aber `qa/browser-environment.json` und `directFileEvidence` nennen V3.4/11. Das ist kein Gegenbeweis zur grünen V3.6-CI, aber eine konkrete Evidenz-/Dokumentationslücke. Nicht ungeprüft als aktualisierten lokalen V3.6-Offline-Nachweis ausgeben.

## 6. Empfohlene nächste Schritte

| Reihenfolge | Paket | Abnahme |
| --- | --- | --- |
| 1 | Fachliche Kerndifferenz und Referenzketten schließen | Mutterschutzdelta unabhängig geklärt oder Produktfunktion entsprechend fachlich begrenzt; passende Standardfälle reproduziert |
| 2 | Öffentliche Eingabeoberfläche entpersonalisieren und Netto-Einstieg führen | Keine feste Familien-/Gehaltsannahme im Ergebnis; Testpersonen finden die richtigen Eingaben und erkennen deren Schätzstatus |
| 3 | Unser Kernversprechen in einer Vergleichsansicht ausarbeiten | Je Plan Betreuung, tiefster Monat, Rücklage, Engpassmonate und vorsichtiger Fall; verständliche Euro-/Zeitdifferenzen |
| 4 | Suchraum/Ergebnisvielfalt und Reaktionsfähigkeit nachweisen | Unterschiede messbar, Filtergründe sichtbar, Suche abbrechbar; keine falsche Optimalität |
| 5 | Konsistente QA-/Quellenstände und externe Abnahmen | Nachweise zur konkreten Version; Datenschutz, Assistenztechnik und Nutzertests dokumentiert |
| Danach | Bruttoengine, umfangreiche Sonderfälle, zusätzliche Länder und automatische Antragsdokumente | Jeweils eigene fachliche Abnahme; Offline-Verteilung und Kernnutzen erhalten |

Die bestehende [Roadmap](ROADMAP.md) bleibt Grundlage. Diese Reihenfolge ergänzt ihre Produktpriorisierung und macht die Entscheidung „manuelle transparente Nettoeingabe für engen MVP oder Ausbau zur amtlichen Nettoengine“ ausdrücklich sichtbar. Keine rechtliche Regel wurde durch diese Marktanalyse geändert.

## 7. Geplanter Vergleichstest zur Validierung der Differenzierung

Für einen ersten formativen Test beispielsweise sechs bis acht Elternpaare mit synthetischen Daten einsetzen. Das ist eine qualitative Lernrunde, kein repräsentativer Marktbeweis. Reihenfolge der Werkzeuge wechseln; dieselben Aufgaben und Ausgangswerte verwenden.

Aufgabe: 24 Monate Betreuung organisieren, nach allen Haushalts-/Kita-Kosten einen festgelegten Mindestbetrag erhalten, Teilzeit ab einem definierten Alter, für einen Elternteil 20 % Einkommensabschlag. Je Testperson vorgeben, ob Nettowerte bekannt sind oder zuerst ermittelt werden müssen.

Vergleichen: Bundesrechner plus Budgetblatt, ein relevanter integrierter Wettbewerber und unser Planer. Gemessen werden Zeit bis zu einem akzeptierten Plan, Eingabefehler, erkannte Engpassmonate, benötigte Hilfe, Verständnis der Schätzungen und Erklärung des Unterschieds zweier Pläne. Eine reine Geldhöhen-Rangliste wäre für unseren Nutzen die falsche Messung.

Zielhypothesen: mindestens 80 % können eine Planabweichung und eine Modellgrenze korrekt erklären; keine nicht unterstützte Konstellation wird im Test als amtlich bestätigt verstanden. Diese Schwellen sind vorgeschlagene Abnahmewerte, noch keine erzielten Ergebnisse. Ein beobachteter Nutzenvorsprung muss anschließend mit weiteren Nutzern und Fällen bestätigt werden.

## Ergebnis für die Produktentscheidung

**Weiterentwicklung bejahen, den Umfang aber auf die verlässliche Entscheidung konzentrieren.** Unser Vorteil soll das Verstehen und Einhalten persönlicher Familienziele unter Unsicherheit sein. Die wesentlichen nächsten Schritte sind fachliche Verlässlichkeit, verständliche Eingaben und ein überzeugender Direktvergleich. Ein noch breiterer Rechner ohne diese Nachweise würde die stärkste Differenzierung eher verwässern.
