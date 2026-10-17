# Elternzeit-Zielplaner

**Interner Funktionsstand V3.15 (17. Oktober 2026)** – kleine Infowebseite für werdende Eltern mit Schwangerschafts- und Beratungstipps sowie offlinefähigem Elternzeit-/Familienbudgetplaner. Die technischen Paket- und Export-Versionsangaben bleiben vorerst bei **3.10.0**, weil die V3.12–V3.14-Ausbaustufen noch **kein öffentlicher Produkt-Release** sind.

**Keine öffentliche Beta-Freigabe:** Mutterschutz-Referenzabweichung und unabhängige Fach-/Rechts-/Datenschutzreviews sowie Nutzertests bleiben Release-Gates. Der eingegrenzte MVP verwendet transparente manuelle Nettoangaben; eine automatische amtliche Brutto-Netto-Ermittlung ist nicht enthalten. 2027 erhält keine positive Standardbewertung.

**Technische V3.15-Abnahme (17.10.2026):** 403/403 Node-/DOM-Tests, 45/45 gesamter Chromium-Browserlauf und nach abschließender Navigationskorrektur jeweils 6/6 V3.15-Browserfälle über HTTP und direkte Offline-Datei. Diese technischen Ergebnisse sind keine unabhängige Fach-/Rechtsfreigabe. [Nachweise](docs/AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md).

**V3.15.1 technische QA:** 418/418 Node-/DOM-Tests; vollständiger Chromium-Lauf 47/47; direkte file://-Prüfung aller 8 V3.15-/V3.15.1-Browserfälle bestanden. Keine unabhängige Rechts-/Fachabnahme. [Abnahme und Grenzen](docs/AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md).

**Nachbesserung V3.15.1:** Der Kita-Vergleich unterscheidet jetzt ausdrücklich einmalige Eingewöhnungsbelastungen von dauerhaft offenen Betreuungsstunden. Arbeit kann erst Wochen nach Kita-Start beginnen; hypothetische Zusatzkosten werden separat und centgenau auf Lebensmonate verteilt. Es werden weder Leistungsansprüche noch gespeicherte Pläne still geändert. [Fachliche Grenzen](docs/AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md).

**Neu in V3.15 (separater Entwicklungszweig):** Wochenweiser Kita-Eingewöhnungs- und Wiedereinstiegsplan mit manueller Verzögerung und Ersatzbetreuung; getrennte NRW-KiBiz-Fassungen für 2026 und ab 01.08.2027; nach Geburtsdatum bestimmte Anzeige- und mögliche Beitragsfreiheits-Hinweise; Aufgabenfortschritt, vorläufiger Kalenderexport, KiZ-Unterlagenfenster und verständlichere Suchperspektiven. **Kein festgestellter Rechtsanspruch, keine automatische Änderung von Plan/Bank und keine neue öffentliche Freigabe.** [V3.15 Umsetzung und Grenzen](docs/AUSBAU-V315-KITA-WIEDEREINSTIEG-NAVIGATOR.md).

**V3.14 (interner Entwicklungsstand):** Eigene Versicherungs-/Steuerpuffer im Finanzvergleich, Kölner historische Gebührentabelle in drei Altersgruppen, technisch vollständiger kleiner Suchraum, schnellere abbrechbare Vorlagensuche, eindeutige UI-Handler und maschinenlesbarer Fachreview-Übergabesatz. Keine unabhängige Rechts-/Datenschutz-/Nutzerfreigabe. [Details und Übergabe](docs/ROADMAP-FACHABNAHME-V314-2026-10-17.md).

**Historie V3.13:** Manuell angenommene Tageszahlungsplanung, Versicherung-/Steuerhinweise, offizielle KiZ-/Wohngeld-/DRV-Verweise, explizit nur historischer Kölner Kita-Tarifvergleich, Quellen- und Roadmapchecks, Fristen-Kalenderexport, versionierter JSON-Import und zusätzliche Suche-/Cent-Sicherungen. **Keine amtlich geprüfte Brutto-Netto-Engine; keine unabhängigen Freigaben.** [V3.13 Status und verbliebene Aufgaben](docs/ROADMAP-ABSCHLUSSSTAND-2026-10-17.md).

**Historie V3.12:** Manuell nachvollziehbares Kita-Finanzdeltaszenario, Geld-/Auszeit-Zielkonfliktvergleich im tatsächlich geprüften Suchraum und illustratives Kassenbuch auf Basis ausschließlich eingegebener Bankbuchungen. Keine Änderung amtlicher Ansprüche, keine öffentliche Rechtsfreigabe. [Details und Grenzen](docs/AUSBAU-V3-12-KITA-LIQUIDITAET-ZIELKONFLIKTE.md).

**Historie V3.11:** Der Schnellstart bekommt einen geführten Rückwärts-Zielplaner und einen variablen Kita-Verzögerungsvergleich. Es wird nur die vorhandene Regel- und Suchengine verwendet; keine neue Fachfreigabe. [Umsetzung, Tests und Grenzen](docs/AUSBAU-V3-11-FAMILIENUEBERGANG.md).

**V3.9 (auf main integriert):** Schutz individueller Monatspläne und genauer Elterngeld-Eingaben vor ungewolltem Überschreiben im Schnellassistenten; keine falschen Rücklagen bei fehlenden Kosten; mobile Karten früher sichtbar und bessere Tastatur-/Formularbedienung. [UX-Abnahme V3.9](docs/UX-NACHBESSERUNG-V3.9.md). Öffentliche Freigabe bleibt gesperrt.

**Neu in V3.10:** [Familienstart](start.html) bündelt Orientierung, offizielle Beratung und den [Rechner](index.html). Der Rechner ergänzt kontextbezogene Wissenskarten, konkrete nächste Eingabeschritte und centgenaue Budgetbuchungen. [Umsetzung und Grenzen](docs/UMSETZUNG-V3.10.md).

**Historischer Prüfstand V3.10:** 279 Node-Tests und 27 direkte file://-Browserfälle bestanden; Nachweise und Grenzen im [QA-Bericht](docs/QA-V3.10.md).

**Aktueller technischer Prüfstand V3.14:** 375/375 Node-/DOM-Tests, 39/39 Chromium-E2E-Browserfälle und 3/3 zusätzliche V3.14-Datei-Tests direkt per file:// bestanden (Workbench, 17.10.2026). Die Suche ist auf Vorlagen begrenzt, die 256er-Vollständigkeit betrifft ausschließlich einen synthetischen Zweimonats-Prüfraum. Es gab keine unabhängige juristische, behördliche, steuerliche oder personenbezogene Usability-Abnahme. [V3.14-Abnahme und externe Übergabe](docs/ROADMAP-FACHABNAHME-V314-2026-10-17.md).

**Design-Nachbesserung 17.10.:** wärmere Farben, klarere Typografie, thematische Symbole und bessere mobile Karten/Filter. [Gestaltung und gezielte QA](docs/DESIGN-2026-10-17.md). Der historische V3.10-Gesamtlauf stammt vom 16.10.; die Portalanpassung erhielt zusätzlich eine eigene Prüfung bei vier Bildschirmbreiten. Die oben angegebene V3.14-Regression stammt vom 17.10.

## Dokumentation und Übergabe

- [Schnellstart V3.8](docs/SCHNELLSTART-V3.8.md): fünf fiktive Beispielvorlagen, persönlicher Kurzassistent, Betreuungslücken, unbekannte Ausgaben, Datenschutz und Nutzertestgrenzen.

- [Umsetzung des Audits V3.7](docs/UMSETZUNG-ZIELBUDGET-V3.7.md): neutraler Netto-Einstieg, direkter Risikovergleich, Suchvielfalt, Abbruch und belegte Cent-Rundung.
- [Fachliche Nachprüfung](docs/FACHPRUEFUNG-FORTSETZUNG-2026-10-15.md) und [vorbereitetes Nutzertestprotokoll](docs/NUTZERTEST-PROTOKOLL-V3.7.md).

- [Aktueller Wettbewerbs- und MVP-Audit](docs/WETTBEWERB-MVP-AUDIT-2026-10-15.md): Primärquellen, Formelproben, Marktüberschneidungen, Differenzierung und offene MVP-Lücken (V3.6).

- [Buildlog und Integrationsnachweis](docs/BUILDLOG.md): Entwicklungshistorie, Build-/Testbefehle, Fehlerkorrekturen und Merge-Verfahren.
- [Entwickler-Handoff](docs/HANDOFF.md): Einstieg, Modulkarte, Dateninvarianten, bekannte Grenzen und nächster Arbeitsauftrag.
- [Geplante Roadmap](docs/ROADMAP.md): P0/P1/P2-Pakete mit Abhängigkeiten und konkreten Abnahmekriterien.
- [Fachprüfung und technische V3.14-Abnahme](docs/ROADMAP-FACHABNAHME-V314-2026-10-17.md): laufende Quellkonflikte, Abnahmeunterlagen, negative Gates, tatsächliche Testumgebung.
- [Maschinenlesbare Roadmap-Matrix](data/roadmap-status-2026-10-17.json): vier technische Arbeitspakete fertig, drei teilweise umgesetzt, fünf externe Prüfungen ausstehend; keine öffentliche Freigabe.
- [Technische Architektur](docs/ARCHITEKTUR.md), [aktueller V3.14-Abnahmebericht](docs/ROADMAP-FACHABNAHME-V314-2026-10-17.md) und [historische MVP-Abnahme](docs/MVP-ABNAHME-2026-10-15.md).

**Neue V3.5-Funktionen:** 48 monetäre Vergleiche (darunter 4 L-Bank-Werte bei variierenden Teilzeitmonaten) und amtliche 12-/24-Monats-Gesamtsummen; zusätzliche amtliche Quellen mit nachvollziehbarem Widerspruch zur Mutterschutz-Tagesgrenze; auf **2027 beschränkte, unverbindliche Szenariosuche** unter Weitergeltungsannahmen. **Kein 2027er Szenario gilt als rechtlich validiert** und die öffentliche Beta-Sperre bleibt aktiv. Siehe [amtlicher Referenzabgleich](docs/AMTLICHE-REFERENZPRUEFUNG-2026-10-15.md).

**V3.6.0 ergänzt:** Historische echte Bescheid-/Gerichtsbeträge aus vier anonymisierten Entscheidungen als **quellenbasierte Dokument-Regression**, neue Eingaben für variable Provisionen/Einmalzahlungen mit bewusst konservativem Rechtsvalidator, 2027er Gesetzentwurfs-/Inkrafttretensstatus und eine datierte NRW-Kita-Bedarfsanzeige. **Keine vollständige Nachrechnung der vier realen Bescheide.** Siehe [Bescheidnachweise und 2027-Recht](docs/HISTORISCHE-BESCHEIDE-UND-RECHTSSTAND-2027.md).

## Start

Das Projekt besteht aus zwei **lokal nutzbaren HTML-Dateien ohne Backend**. Öffnet [`start.html`](./start.html) für die Infowebseite oder [`index.html`](./index.html) direkt für den Rechner. Beide benötigen keine externen Schriftarten oder Laufzeitskripte. Für die gegenseitigen Links beide Dateien im selben Ordner behalten; der Rechner funktioniert weiterhin einzeln. Offizielle externe Beratungsangebote brauchen beim Aufruf Internet. Zur Entwicklung (Node.js 22, npm und Python 3 für die Testinfrastruktur):

```bash
git clone https://github.com/Codeelchi/elternzeit-zielplaner.git
cd elternzeit-zielplaner
npm ci
npm test
npx playwright install --with-deps chromium
npm run test:e2e
```

Zum lokalen HTTP-Test genügt zum Beispiel `python3 -m http.server 8080` im Repository-Verzeichnis, dann `http://localhost:8080/start.html` öffnen. Die App benötigt zur Laufzeit keinen Build-Schritt und keine Netzwerkverbindung.

## Funktionen (interner Stand V3.15)

- Fünf fiktive Schnellstart-Vorlagen mit unmittelbarem Ergebnis, Betreuungsabgleich und reduzierbarer Fachnavigation
- Kurzer persönlicher Eingabeassistent mit getrennter Behandlung unbekannter Ausgaben und 0 Euro
- 36 Lebensmonate, Geburtsdatum und Kindesalter samt konkreten Monatsdaten
- Elternzeit und Elternteilzeit getrennt für beide Elternteile konfigurieren
- Basiselterngeld, ElterngeldPlus, Partnerschaftsbonus und unbezahlte Elternzeit
- Unterschiedliche Brutto-, Netto-, Elterngeld-Netto- und Teilzeit-Annahmen
- Zielbasierte Suche über eine *begrenzte Menge erzeugter zulässiger Monatsmuster*
- Drei Stresstests mit getrennten Erwerbsnetto-Bändern beider Eltern, Leistungshöhe und Haushalts-/Betreuungskosten
- Ortsabhängige Modellkosten am Beispiel Köln/NRW mit datierter Tariftabelle
- Rechtsregelkatalog, Plausibilitätsmeldungen, JSON/CSV-Export
- Getrennte Zahlungsannahmen pro Kalendertag, mögliche Einzahlungsverzögerungen und tatsächliche Buchungen ohne erfundene Bankeingänge
- Manuelle Versicherungs-/Steuerrücklagen und Abgleich des zusätzlichen Rücklagenbedarfs ohne doppelt berechnete Kosten
- Kölner Kita-Gebühren als ausdrücklich historischer Vergleich seit August 2025 für unter 2, 2 bis unter 3 und ab 3 Jahre; manuell gesetzte Kita-Ausgaben bleiben maßgeblich
- Vorläufige Checklistenfristen per ICS exportieren; JSON-Formatversion kontrollieren und unbekannte Versionen ablehnen
- Quantifizierte Abdeckung der Vorlagensuche, technische 256er-Mikrosuchraumprüfung und asynchrone, abbrechbare Variantenprüfung

## Struktur

| Pfad | Inhalt |
| --- | --- |
| `index.html` | Vollständige ausführbare Offline-App (HTML + CSS + JavaScript) |
| `data/rechtsregeln-de-nrw-2026-10-14.json` | Rechtliche Quellen, Prüfdaten und Gültigkeitsfenster |
| `docs/ANLEITUNG.md` | Bedienungs- und Fachanleitung der V3.1-Basis |
| `docs/ROADMAP.md` | Bekannte Grenzen und nächste Entwicklungsschritte |
| `qa/qa-bericht-v3.1.json` | Historischer QA-Stand aus der Erstellung |
| `tests/*.test.mjs` | Regression, Integration und 34 Referenz-Betragsfälle via jsdom |
| `data/referenzfaelle-bund-2026-10-14.json` | 8 amtliche Beispielwerte, 4 amtliche Grenzen, 22 gesetzlich hergeleitete Werte |
| `docs/REFERENZFAELLE-UND-GRENZEN.md` | Herkunft, Grenzen und offene fachliche Prüfungen |
| `scripts/embed-rules.mjs` | Erzeugt und kontrolliert den Offline-Snapshot der zentralen Rechtsregeln |
| `src/time-axes.cjs` | Reine Kalender-/Zeitachsenlogik für Lebensmonate, Mutterschutz, Elternzeit, Arbeit und Leistungsart |
| `docs/ZEITACHSEN-ARCHITEKTUR.md` | Architektur und aktuell unterstützte Zeitachsen sowie explizite Grenzen |
| `scripts/embed-time-axes.mjs` | Synchronisiert die Offline-App mit dem Zeitachsen-Modul |
| `.github/workflows/ci.yml` | Pull-Request-Prüfung für Rechtsregeln und Tests |
| `package.json` / `package-lock.json` | Node-Testumgebung und reproduzierbare Abhängigkeiten |

## Qualitätssicherung

`npm test` prüft zunächst die Übereinstimmung der eingebetteten Rechtsregeln mit dem JSON-Quellkatalog und anschließend die reale, aus `index.html` geladene Applikationslogik u. a. auf Elterngeld-Äquivalente, Bonusstunden, Bezugsgrenzen, zeitabhängige Kinderdaten, Rechtsquellen und Ergebnisgültigkeit der automatischen Suche. Die zusätzliche Referenztestsuite umfasst veröffentlichte Beträge des Familienportals, daraus abgeleitete Grenzwerte und vereinfachte vollständige Monatsmodelle. Die frühere QA-Auswertung bleibt gesondert archiviert. **Die neue Testsuite ersetzt weder Behördenberechnungen noch eine individuelle rechtliche Prüfung.**

## Rechtsprechung und Änderungen für 2027 prüfen

- `npm run historical:report` kontrolliert die nachprüfbaren Rechenbeziehungen aus vier echten, historisch veröffentlichten Bescheiden. **Keine unabhängige Gesamtnettoermittlung** und kein 2027er Vollreplay.
- `npm run legislation:sync` bzw. `npm run legislation:check` betten datierte Rechtsereignisse (Gesetzentwurf, beschlossene Verwaltungsumstellung, künftig geltendes NRW-Gesetz, politische Diskussion) in die Offline-App ein.
- Die 2027er Kindergelderhöhung bleibt eine **Planungsannahme**. Für unbekannte Provisionen oder gemischte Erwerbseinkünfte gibt es bewusst keinen positiven Standardfall-Status.

## Rechtliche Quellen aktualisieren

Alle redaktionellen Rechtsregeländerungen erfolgen ausschließlich in `data/rechtsregeln-de-nrw-2026-10-14.json`. Die HTML-App enthält nur den daraus erzeugten Offline-Snapshot. Nach Rechtsregeländerungen `npm run rules:sync`, nach Zeitachsenänderungen `npm run axes:sync` und anschließend immer `npm test` ausführen. **Ein Prüftag 2026 bestätigt noch keine Ansprüche bei Geburt 2027.** Weitere Einzelheiten: [Referenzfälle und Prüflimits](docs/REFERENZFAELLE-UND-GRENZEN.md).

## MVP und Wettbewerbsabgleich

- [MVP-Spezifikation, Release-Gates und Abnahmekriterien](docs/MVP-2026-10-14.md)
- [Wettbewerbs- und Code-Abgleich mit Hypothesen und Evidenzgrenzen](docs/WETTBEWERB-UND-CODE-ABGLEICH.md)
- [Offene Aufgaben in GitHub Issues](https://github.com/Codeelchi/elternzeit-zielplaner/issues)

## Architektur / Weiterentwicklung

Aktuell ist `index.html` aus Gründen der Offline-Nutzung bewusst selbsttragend. Mittelfristig sollten Modell, Rechtsregel-Engine, Optimierer, Rendering und Datenpersistenz unabhängig voneinander testbar werden. Die im HTML angebotene Suchfunktion prüft nur erzeugte Muster und erhebt keinen Anspruch auf vollständige kombinatorische Optimierung. Weitere Schritte: siehe [Roadmap](docs/ROADMAP.md).

## Datenschutz

Es gibt kein Backend und keine nutzerseitige Anmeldung. Berechnete Familienpläne können lokal im Browser gespeichert bzw. als JSON/CSV exportiert werden. Keine echten Steuer- oder Einkommensbelege ins Repository einchecken. GitHub-Repository bleibt **privat**; für eine Veröffentlichung müssen außerdem Datenschutz-, Quellen- und Lizenzfragen geprüft werden.

## Rechtlicher Hinweis

Alle Beträge sind **Modellrechnungen**, keine Bewilligung. Das tatsächliche Elterngeld-Netto kann vom Auszahlungsnetto abweichen; Mutterschutz-Zeiträume, Steuerprogression, Elternzeitrecht, Sonderfälle und zukünftige Gesetzesänderungen erfordern Einzelfallprüfung. Der Rechtskatalog hat Quellenstand **15. Oktober 2026**; die neuen Fach- und redaktionellen Recherchen sind auf **16. Oktober 2026** datiert. Die jeweiligen Regeln und Quellen müssen vor der Verwendung für eine Geburt 2027 neu verifiziert werden. Keine Zusage über landesrechtliche Leistungen oder kommunale Gebühren.

## Projektstatus

**Interner V3.10-Entwicklungsstand.** Aktuelle Ergebnisse und Nachweisgrenzen stehen im [QA-Bericht](docs/QA-V3.10.md). Änderungen bitte mit Tests absichern und vorzugsweise per Feature-Branch / Pull Request integrieren. Nicht geprüfte Rechtsänderungen dürfen nicht als geltendes Recht in den Rechner übernommen werden.

## Neuer Stand und Nachweise

- [Architektur](docs/ARCHITEKTUR.md), [Regelvalidator](docs/REGELVALIDATOR.md), [Budget und Antragswege](docs/BUDGET-APPLICATION-GUIDE.md)
- [Abnahme und offene Release-Gates](docs/MVP-ABNAHME-2026-10-15.md), [Changelog](CHANGELOG.md)
- `npm run rules:sync`, `npm run axes:sync`, `npm run modules:sync` aktualisieren die verteilbare HTML-Datei nach Modul-/Katalogänderungen. `npm test` prüft Regel-, Rechtsereignis-, Zeitachsen-, Modul- und Schnellstart-Snapshots.
- Browser-Tests verwenden Chromium aus `CHROMIUM_PATH`, `/usr/bin/chromium` oder der Playwright-Installation. Die aktuelle Browserprüfung öffnet die HTML-Datei direkt über `file://`; die Anwendung benötigt keinen Server.
- Lokale Speicherung ist standardmäßig ausgeschaltet, optional und unverschlüsselt. Exporte enthalten private Finanzdaten. Im Browser bleibt die Berechnung ohne Konto und ohne Netzwerkaufrufe.

`npm run references:report` schreibt den unabhängigen Delta-Bericht. `npm run release:check` ist derzeit bewusst gesperrt; erfolgreiche Entwickler-Tests ersetzen die ausstehenden öffentlichen Release-Freigaben nicht.

V3.4 ergänzt getrennte Einkommensrisiken beider Eltern, Schwerpunktvarianten mit längerer mütterlicher oder väterlicher Auszeit und vollständige Wiederherstellung der unabhängigen Achsen samt Bankbuchungen. Die Robustheitsgrafik und Zielsuche verwenden dieselben Stresstests.

V3.7: 217 automatisierte Tests, 16 Offline-file-Browserfälle und 52 Axe-Prüfungen bestanden. Vorschläge zeigen realistische/vorsichtige Budgets, Engpässe und Rücklagen unmittelbar. Die schrittweise Suche ist abbrechbar, unterscheidet Ausschlussgründe und zeigt nur materiell verschiedene Alternativen. Freie Elternbezeichnungen ändern keine rechtlichen Rollen.
