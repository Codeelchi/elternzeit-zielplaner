# Neue externe Produkt- und Rechtsrecherche – Elternzeit-Zielplaner

**Recherche- und Dokumentationsstand:** 17. Oktober 2026. **Codebasis:** main nach PR #19 (interner V3.14-Ausbau). Dies ist eine quellenbasierte Entwicklungspriorisierung, **keine** rechtliche Abnahme. Nur direkt belegte bestehende Funktionen werden als vorhanden gezählt. Eine externe Leistungsprognose wird nicht still in das Berechnungsmodell übernommen.

## Wesentlicher neuer Rechtsfund: NRW-KiBiz für 2027 bereits verkündet

Das offizielle Portal RECHT.NRW veröffentlicht zwei datierte Fassungen des Kinderbildungsgesetzes. Die Fassung **01.08.2026 bis 31.07.2027** und die Fassung **ab 01.08.2027** enthalten Änderungen aus dem Gesetz vom **21.07.2026, GV. NRW. S. 525**. **Die zweite Fassung ist beschlossen und verkündet, hat aber einen zukünftigen Inkrafttretenszeitpunkt** – nicht nur ein politischer Entwurf.

- [2026er Fassung](https://recht.nrw.de/lrgv/gesetz/01082026-gesetz-zur-fruehen-bildung-und-foerderung-von-kindern-kinderbildungsgesetz/)
- [2027er Fassung](https://recht.nrw.de/lrgv/gesetz/01082027-gesetz-zur-fruehen-bildung-und-foerderung-von-kindern-kinderbildungsgesetz/)

§ 5 der 2027-Fassung nennt grundsätzlich sechs Monate Vorlauf für die Bedarfsanzeige und ein zusätzlich mögliches, örtliches Neunmonatsverfahren. Die Einschätzung für konkrete Kalenderfälle muss die richtige Rechtsfassung, örtliches Verfahren und vorhandene Bestandsanmeldungen berücksichtigen. § 50 der 2027-Fassung regelt die landesrechtliche Beitragsfreiheit mit Geburts-/Stichtagsbezug; eine pauschale altersabhängige Beitragsbefreiung ohne Jahres-/Stichtagsprüfung wäre falsch. Die Kölner veröffentlichte kommunale Beitragstabelle gilt seit dem 01.08.2025 und zeigt Einkommen, Altersgruppen und Betreuungsumfang; die Stadt erläutert kostenpflichtiges Essen sowie Beitragsbefreiungen. Konkrete Tarife späterer Jahre müssen kommunal nachgelesen werden.

**Priorität P0 für die nächste Runde:** eigenständige Kohorten- und Stichtagsregeln für die Familien- und Kita-Timeline (ohne automatische Übertragung von historischem Tarif auf 2027/2028). Rechtsquellen datieren als **promulgated_future_effective**, niemals als bloßer Entwurf und niemals als unabhängig geprüfter Elterngeldanspruch markieren. Bereits implementierte §-5-Fristen zunächst gegen die neue Fassung und echte Kölner Verwaltungsabläufe abgleichen.

## Markt- und Nutzerforschung

### Bundesrechner bleibt das zentrale Vergleichsangebot

Der [Bundes-Elterngeldrechner mit Planer](https://familienportal.de/familienportal/rechner-antraege/elterngeldrechner) kann schon Leistungsmonate verteilen und eine unverbindliche Höhe vorhersagen. Beim DigitalService wurden laut [Projektseite](https://digitalservice.bund.de/projekte/elterngeldrechner) **390 Eltern und 160 Verwaltungsmitarbeitende** einbezogen. Die Projektseite berichtet von mehr als 2,6 Millionen Nutzenden seit Projektbeginn (Stand der online eingesehenen Seite).

Im [Forschungsbeitrag vom 09.10.2025](https://digitalservice.bund.de/blog/elterngeldrechner-optionen-aufzeigen-und-fehlern-vorbeugen) wird als Kernproblem beschrieben, dass viele Eltern Kombinationen nicht richtig verstehen, unsicher sind und im Zweifel zu bekannten 12:2-Mustern greifen. Der Bund bietet auch Fehlerprüfung und Übernahme von Planungsergebnissen in PDF-Antragsunterlagen. Deshalb ist weder ein einfacher Monatsrechner noch eine ungeprüfte „Optimierung“ ein belastbares Alleinstellungsmerkmal.

**Differenzierung:** Betreuung **bis zum tatsächlichen Arbeitswiedereinstieg**, Kita-Verzögerung plus Eingewöhnung, bedarfsorientierte Reserve und zusammenhängende Familienaufgaben – verständlich begründet, ohne Rechtsanspruch oder Bankeingang vorzutäuschen.

Der [Servicestandard-Zwischenbericht](https://digitalservice.bund.de/transparenz/zwischenreport-servicestandard-bericht-online-dienst-elterngeldrechner) regt Tests mit Menschen mit geringen digitalen Vorkenntnissen, anderen Muttersprachen und Behinderungen sowie die Prüfung der Journey **nach** Nutzung des Rechners an. Das spricht gegen einen weiteren Expertenbereich als Standardbildschirm und für konkrete Bedienungstests mit Alltagssituationen.

### Digitale Anträge und Unterlagen

Das [Bundesfamilienportal](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-kann-ich-elterngeld-beantragen--124762) bestätigt: Antrag erst nach Geburt; Leistung maximal drei Lebensmonate rückwirkend; bei abhängig Beschäftigten unterscheiden sich typische Lohnabrechnungszeiträume für Mutter und Vater. Die [Antragsübersicht](https://familienportal.de/familienportal/rechner-antraege/elterngeld-digital) weist bundeslandspezifische Wege und unterschiedliche elektronische bzw. druckbasierte Verfahren aus.

**Chance:** nicht selbst unverlässlich einen Behördenantrag generieren; stattdessen einen Quellen- und Kohortencheck für die benötigten Unterlagen, nach Geburtsdatum sortierte persönliche Aufgaben und direkten Sprung in den offiziellen Landesantrag. Bestehende ICS-Checklisten können um interaktive „benötigt / liegt vor / erledigt“-Zustände erweitert werden, lokal und freiwillig speicherbar, ohne Dokumente oder Passnummern ins Repository zu übernehmen.

### Betreuungseingewöhnung ist kein fixes Enddatum

Pädagogische Beiträge vom September 2026 weisen auf **individuelle statt garantierte Eingewöhnungsdauer** hin, siehe [Kita.de](https://www.kita.de/wissen/neu-in-der-kita/) und [KitaZentrale](https://kitazentrale.de/wissen/eingewoehnung/). Ein fester „Kita ab Tag X = beide Eltern wieder voll verfügbar“-Schalter wäre für den Nutzer irreführend.

**Chance:** Eingewöhnung als frei anpassbares **Intervall** und Betreuungsstunden-Rampe, mit Elternverfügbarkeit, Arbeitsstunden, Übergangskosten und ungeplanter Verschiebung. Als eindeutig **manuelle Planungsannahme**, niemals als medizinische oder garantierte Betreuungsvorhersage.

### Kinderzuschlag: Wechselnde Betrachtungszeiträume statt erfundener Sofortzahlung

Die [Bundesagentur für Arbeit](https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-verstehen/kinderzuschlag-anspruch-hoehe-dauer) erklärt, dass die letzten **sechs Monate** vor Antragstellung für das Einkommen relevant sein können, Elterngeld mit berücksichtigt werden kann und der KiZ typischerweise für **sechs Monate bewilligt** wird. Ein Antrag ist gesondert erforderlich. [Bildungs- und Teilhabeleistungen](https://www.arbeitsagentur.de/familie-und-kinder/informationen-zum-bildungspaket) können für berechtigte Familien weitere Entlastung bieten, unter anderem Kita-Mittagessen.

**Chance:** lokaler „offizielle Leistungsprüfung sinnvoll?“-Wegweiser nach Finanzlücken, inklusive sechsmonatiger Einkommenshistorie als Dokument-Checkliste. Ohne fachlich validierten KiZ- oder Wohngeldanspruch **keine** zusätzliche Einnahme automatisch ins Budget eintragen.

### Elterngeldreform 2027 bleibt keine belegte neue Rechenformel

Die [Regierungserklärung zum Haushalt 2027](https://www.bundesregierung.de/breg-de/service/newsletter-und-abos/bulletin/bmbfsfj-haushaltsgesetz-2027-2452382) formuliert Vereinfachung, Digitalisierung und mehr Partnerschaftlichkeit als politische Ziele mit Vertrauensschutz. Daraus folgt **keine konkrete, gültige Elterngeldformel für 2027**. Hier die bestehende konservative Prognose-Sperre erhalten, bis genaue Inkrafttretensdaten und Rechtsgrundlagen verifiziert sind.

## Umsetzungsvorschläge nach Nutzen und Risiko

| Rang | Paket | Zielbild | Voraussetzungen und Absicherung |
|---|---|---|---|
| **1** | KiBiz-2027-Kohortenstatus | Zukunftsfassung vom 01.08.2027 getrennt von 2026 und kommunalen 2025-Tarifen anzeigen; präzise Hinweislogik für Fristen/Beitragsfreiheit | Rechtsquellen versionieren; externen Fachreview vor positiven Anspruchsaussagen |
| **2** | Eingewöhnungs- und Wiedereinstiegs-Intervall | Kita-Beginn, 1–6 Wochen angenommene Eingewöhnung, flexible Arbeitstage und Einkommensausfälle transparent nebeneinander | Nur manuelle Annahmen, keine Automatikaussage zur Entwicklung eines Kindes |
| **3** | Antrags- und Nachweisnavigator | Nach Geburtskohorte und Bundesland fällige Anträge, erforderliche Dokumente, Zuständigkeiten, lokale Checklisten und optionale ICS-Erinnerungen | Quellen mit Prüftag; niemals ohne echte Behördenfreigabe automatisch absenden |
| **4** | Entscheidungsansicht „Warum dieser Plan?“ | Drei verständliche Plan-Karten: mehr gemeinsame Zeit, bester erwarteter Monats-Puffer, robustere Wiedereinstiegsoption; kurze Begründungen und erkennbare Tradeoffs | Vorhandenen Ranking-Kern verwenden, nie globales Optimum behaupten |
| **5** | Rechtsquellen-Driftwarnung | Die Benutzung historischer Annahmen oder geänderter Gebührenjahre sichtbarer markieren und Redaktion an Review-Termine binden | Ausdrückliche Kohorten- und Quellenversion; keine stillen Werteupdates |
| **6** | Finanzhilfe-Wegweiser | KiZ-/Wohngeld-/BuT-Prüfung als seriöse Entscheidungshilfe mit Dokumentenliste bei Budgetlücken | Keine modellierte Leistung ohne Bescheid, Antrag, Gültigkeit und geprüfte Werte |
| **7** | Barrierefreier einfacher Modus | Weniger gleichzeitige Entscheidungen, kontextuelle Erklärungen, Sprachklarheit und Tastatur-/Screenreader-Prüfung | Test mit 6–8 echten Eltern und Personen mit Accessibility-Anforderungen |
| **8** | Datenschutzbewusste Planübergabe | Optionaler, offline verschlüsselter Plan-Export für zweiten Elternteil statt Kontozwang | Bedrohungsmodell, Datenverlust-/Passwortwarnung, unabhängiger Sicherheitsreview |

**Nicht priorisieren:** unbestätigte Brutto-Elterngeld-Netto-Berechnung, autonomes Antragseinreichen, KI-generierte Rechtsauskünfte, „garantierte Auszahlungstermine“ oder ein unbegrenzter globaler Optimierer. Diese Funktionen würden die derzeit offenen P0-Gates verschleiern.

## Konkrete Entwicklungsdefinition für V3.15 (Vorschlag)

Erster sicherer Entwicklungsschnitt: Rechts-/Datenquellen-UI trennt rechtlich **verkündet, künftig gültig** von **Gesetzentwurf**, von **historischer kommunaler Beitragstabelle** und von **extern nicht abgenommen**. Dazu eine rein hypothetische Eingewöhnungs-Rampe als Erweiterung der vorhandenen Kita-Deltaszenarien, die standardmäßig **keinen** bestehenden Plan überschreibt. Browserfälle für 2026/2027-Rechtsgrenze, Ende-2027-Betreuungsstart, variable Wochen-Dauer und bekannte/ungewisse Kita-Gebühren sowie fehlende Ausgaben.

Abnahmekriterien: npm test, Desktop-/Mobil-E2E, direkte file://-Tests, bestehende Schemadaten export-/importierbar, keinerlei neue positive Elterngeld-Zusage und **release:check weiterhin BLOCKED**, bis sämtliche externen Fachabnahmen vorliegen.

**Daten- und Versionsregel:** Diese Recherche wurde **nach** dem Merge von PR #19 ausgearbeitet. Sie ist ein eigenständiger nächster Plan, keine rückwirkend als getestet deklarierte Funktion des gemergten V3.14-Codes.
