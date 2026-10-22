# Roadmap: vom internen Familienplaner zum fachlich abgegrenzten Produkt

**Aktuelle technische Ausgangslage (19.10.2026):** V3.17–V3.20 sowie die Preview-, Eingabe-, Import- und Zielsuche-Verbesserungen aus **PR #21–#30 sind vollständig auf \`main\`**; letztes Software-Merge \`3c837cb\`. [CI des Softwarestands](https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/39162208549) grün, **512/512 Node-/DOM- und 93/93 Chromium-Tests**. Versionsmetadaten **3.10.0**, JSON-Schema **1**.

**Aktuelle Freigabeübersicht und Nachweispfade:** [Technischer Projektstatus 19.10.2026](STATUS-TECHNISCH-2026-10-19.md). **Öffentliche Produkt-Beta/Release GESPERRT**; die gesonderte GitHub-Pages-Testvorschau ist nicht mit \`main\` synchron (Stand 19.10. noch \`ee2bb2d\`). Keine eigenmächtige Änderung der 4/5-Tage-Regel, der externen Null-Evidenzen oder Freigabe-Gates. V3.19 bleibt als **historischer** Datenschutz-/CI-Ausbau unter [V3.19](PRIVACY-ROBUSTNESS-V319-2026-10-18.md) dokumentiert.

**Produktbild:** *Familien-Szenario- und Budgetplaner* für nachvollziehbare Varianten von Familienzeit, Lebensmonatsbudget, Rücklagen, Betreuung und Berufsrückkehr. **Kein** bescheidgenauer amtlicher Elterngeldrechner, keine rechtlich oder finanziell garantierte „Optimierung“, kein belegtes Markt-Alleinstellungsmerkmal.

**Nachweise und Priorität:** Der aktuelle [technische Hand-off](HANDOFF.md), die [Freigabegates](../data/release-gates.json), die [maschinenlesbare Statusmatrix](../data/roadmap-status-2026-10-17.json) und [Fachreview-Vorbereitung](ROADMAP-FACHABNAHME-V314-2026-10-17.md) sind die operative Grundlage. Die als fremde Prüfung übergebene Produktreife-Einschätzung vom 17.10.2026 ist **keine unabhängig durchgeführte Code- oder Rechtsabnahme**; ihre belegbaren Hinweise und Grenzen werden im [Audit-Abgleich](PRODUKTREIFE-ABGLEICH-V317-2026-10-17.md) getrennt bewertet. [Historische vollständige Roadmap bis V3.16](ROADMAP-HISTORIE-BIS-V316-2026-10-17.md).

**Paket 3C / externe Fachfälle, Prüfvorbereitung 22.10.2026:** Das [quellenbasierte Mutterschutz-Dossier](FACHQUELLEN-MUTTERSCHUTZ-2026-10-22.md) und ein neues lokal erzeugbares, SHA-256-gebundenes Review-Paket (`npm run review:kit:write`) stellen eine direkte Handoff-Vorlage für Fachstellen und echte Testmoderation bereit. Es gibt weiterhin **0/10 externe Vollfamilienrechnungen, 0 beobachtete Nutzer, 0 tatsächliche Screenreader-Prüfungen**. Keine Zählung von Paketgenerator-Tests als externe Freigabe.

**Paket 3A/3B, technischer Reviewstand 22.10.2026:** [Zweiseitige lokale A4-Planübersicht und gemeinsame quellenbasierte Aufgaben](UMSETZUNG-PAKET3-DRUCK-AUFGABEN-2026-10-22.md) sind im separaten Paket-3-Branch implementiert. [3C – Studien- und manuelle Accessibility-Vorbereitung](PAKET3C-NUTZER-A11Y-ABNAHME-2026-10-22.md) ist dokumentiert, aber **0 tatsächliche Teilnehmende und keine unabhängige Abnahme**. Commitgebundene CI und PR-Merge vor Integration; alle externen Release-Gates bleiben NO-GO.

**Paket 2C, technischer Reviewstand 22.10.2026:** [Hypothetische Was-wäre-wenn-Regler und explizite Cent-Annahmen](UMSETZUNG-PAKET2C-WAS-WAERE-WENN-2026-10-22.md) wurden mit [PR #40](https://github.com/Codeelchi/elternzeit-zielplaner/pull/40) auf Main integriert. Keine rechtliche Neuberechnung oder öffentliche Produktfreigabe; Paket 3C und sämtliche externen P0-Gates bleiben offen.

**Paket 2, technischer Reviewstand 22.10.2026:** [Familienzeitstrahl und maximal drei flüchtige Vergleichsvarianten](UMSETZUNG-PAKET2-FAMILIENZEIT-2026-10-22.md) wurden mit [PR #39](https://github.com/Codeelchi/elternzeit-zielplaner/pull/39) auf Main integriert. Paket 3A/3B im separaten Review, 3C offen; alle externen Freigaben offen.

**Design- und Feature-Folgeplan (21.10.2026):** [Paket 1 UI/Verständlichkeit und verbindliche Roadmap für Pakete 2 und 3](ROADMAP-DESIGN-FEATURES-2026-10-21.md). Paket 1 ändert keine Berechnungsformeln; Paket 2 (Zeitstrahl, Modelle vergleichen, Was-wäre-wenn) und Paket 3 (Druckbericht, Aufgaben, echte Nutzertests) bleiben getrennte Vorhaben. Externe P0-Freigaben bleiben unberührt.

## 1. Was schon existiert – ohne amtliche Produktfreigabe

| Bereich | Technische Implementierung auf `main` | Explizite Grenze |
| --- | --- | --- |
| Standardfall-/Regelprüfung | `src/rule-validator.cjs`, datierter Rechtskatalog, Statuscodes `PLAUSIBEL_STANDARD`, `DATEN_UNVOLLSTAENDIG`, `NICHT_UNTERSTUETZT`, `REGELKONFLIKT` | „Plausibel“ ist **keine** geprüfte Bewilligung; Geburtsfenster 01.04.2025–31.12.2026 technisch begrenzt, 2027 bloß Vorschau |
| Zeit und Elterngeld | Kind-Lebensmonate, Mutterschutz, Erwerb, arbeitsrechtliche Elternzeit, Bezugsarten getrennt | Nachgeburtliche Mutterschutzanrechnung 4/30 gegen Portalbeispiel 5/30 **ungeklärt** |
| Finanzen | Lebensmonatsbudget, centbasierte Rücklagen-/Bandbreiten; separat manuelle Zahlungstermine und erfasste Bankmonate | Kein automatisches Behörden-Netto oder echter Kontoabruf; Zahlungsannahmen sind keine Gutschriften |
| Ziele | Fünf fiktive Vorlagen, konfigurierbare Monatsfolgen, begrenzte Kandidatensuche und erklärte Zielkonflikte | Kein vollständiger Suchraum, kein bewiesenes globales Optimum |
| Betreuung | KiBiz-Kohorten 2026/2027, Köln-Beiträge als historischer Vergleich, Eingewöhnungs-/Verzögerungs-Szenarien | Kein bestätigter Kita-Platz, keine unverändert garantierte kommunale Gebühr |
| Beide Eltern (V3.16) | Vereinfachter Mo–Fr-15-Minuten-Wochenplan, Begleitung A/B, zeitversetzte Arbeit, Ersatzbetreuung | Keine echten Schichten/Pendelzeiten/Urlaubsrechte; Netto-/Bonussimulation nicht fachlich bestätigt |
| Datenschutz/Technik | Offline-Einzeldatei, Speicher-Opt-in, Löschung, CSV/JSON, Tests | Ein unabhängiger Datenschutzreview fehlt; temporäre Wochenvarianten werden **nicht** exportiert oder gespeichert |

**Technischer letzter Vollnachweis (vor V3.17):** 452/452 Node-/DOM-, 53/53 Chromium- und 4/4 zusätzliche V3.16-`file://`-Tests; GitHub-PR-CI #20 grün. Das ist ein **Software-** und kein unabhängiger Fachnachweis.

## 2. P0: Vor einem extern angebotenen Finanzplaner nachweisen

**Verantwortliche Rollen sind noch zu benennen.** Eine vorbereitete Vorlage, ein automatischer Test und ein grüner Merge dürfen nicht als externe Unterschrift ausgegeben werden.

| ID / Reihenfolge | Entscheidung bzw. Nachweis | Akzeptanz vor Freigabe | Status |
| --- | --- | --- | --- |
| **P0-1** Mutterschutz (blockiert Berechnungsabnahme) | Achtwöchige Nachgeburtsfrist, Mutterschaftsleistung und Elterngeldrest im Beispielfall 20.05. mit amtlicher Auslegung abgleichen | Schriftliche Fach-/Behördenherleitung inklusive Fristbeginn, Entbindungstag, Leistungsende, Resttage und `4/30` vs. `5/30`; danach unabhängiger Solltest | **EXTERN OFFEN** |
| **P0-2** Anwendungsbereich und Ergebnisbedeutung | Technischen Standardfall und **Negativfälle** fachlich entscheiden; Eingabevertrag für gewöhnliches Netto vs. **Elterngeld-Netto** festhalten | Schriftlich bestätigte Positiv-/Negativliste samt Geburtskohorten, offizielle Verantwortungsrolle, sichtbare Warn-/Sperrwirkung in UI und Export | **Fachlich offen; V3.17 UI-Ausbau begonnen** |
| **P0-3** Referenzfamilien | Zehn vorbereitete synthetische vollständige Fälle `data/independent-case-requests-2026-10-17.json` | Je Fall alle Eingaben, Rechtsfassung, Zwischenwerte, LM-Zuordnung, separate Zahlungsannahmen, Quellen, Reviewentscheidung und unabhängiger Soll-/Ist-Abgleich; **derzeit 0/10 extern bestätigt** | **EXTERN OFFEN** |
| **P0-4** Regel-/Elterngeld-Netto-Freigabe | Manuell vorgegebenes Elterngeld-Netto versus automatische Brutto-Netto-Umrechnung abgrenzen; Teilzeit und 2027-Kohorte getrennt | Validierte manuelle Standardfallrechnung oder ausdrückliche Nichtunterstützung; keine ungeprüfte 2027-Berechnung als geltend; juristische Reviewentscheidung je anwendbarer Fassung | **EXTERN OFFEN** |
| **P0-5** Anspruch/Zahlung/Buchung | Gleiche Eingaben auf Lebensmonat, Kalendermonat und Banktag verständlich gegentesten | Prüffälle für Monatsende, Schaltjahr, verspätete Zahlung, manuelle Buchung, keine Doppelzählung und unbekannte Beträge; echte Nutzer verstehen die drei Ebenen | **Technisch vorhanden, fachlich/UX offen** |
| **P0-6** Datenschutz, Barrierefreiheit, Kommunikation | Datenfluss/Netzwerk, lokale Speicherung, Löschung, Export, mobile Bedienelemente; Betreiberinformationen | Unabhängig dokumentierter Datenschutz-/Rechtsreview, manuelle Tastatur-/Screenreader-Prüfung, Impressum/Datenschutzhinweis nach Betriebsform und behobene kritische Befunde | **EXTERN OFFEN** |
| **P0-7** Nutzertest und Betrieb | Moderierte synthetische Aufgaben, Rückfrage-/Fehlerkanal, verantwortliche Freigabe und Rollback | Teilnehmerprotokolle ohne persönliche Echtdaten, verständliche Resultate, Betreiberrolle, Regelpflege, Stop- und Rücknahmeregel; danach *gesonderte* Releaseentscheidung | **EXTERN OFFEN** |

### Fachliche Klärung der Mutterschutztage – keine automatische Korrektur

Offizielle Portalreferenz: Geburt **20. Mai**, Leistungen bis **14. Juli**, **fünf Resttage** des 20.06.–19.07.-Lebensmonats. Die im Projekt implementierte Frist-Herleitung zu MuSchG § 3, BGB §§ 187/188 ergibt **15. Juli / vier Resttage**. **Weder die offizielle Referenz noch die eigene Berechnung wird als abschließend richtig erklärt.** Relevant sind zudem SGB V § 24i und die Anrechnung nach BEEG; Fristende und tatsächliches Mutterschaftsgeld **getrennt** prüfen. Aktenstand/Prüfauftrag: [V3.14-Fachabnahme](ROADMAP-FACHABNAHME-V314-2026-10-17.md). Ohne unabhängige Klärung: Release bleibt **BLOCKED**.

### Kleinste mögliche externe Pilotfreigabe

Vor erfolgreicher P0-Abnahme nur **moderierte UX-Demonstration mit synthetischen Daten**, ausdrücklich ohne individuelle Finanzentscheidung. Ein echter Pilot mit finanzieller Entscheidungswirkung setzt die fachlich bestätigte Eingrenzung und alle dazu nötigen Sicherheits-/Betriebsreviews voraus. **Keine** voraussichtliche Veröffentlichung und kein Beta-Label als Ersatz für Nachweise.

## 3. V3.17 – Jetzt beginnen: Verständlichkeit und Scope-Evidenz (intern)

| Paket | Umsetzung / klare Grenze | Definition of Done | Status |
| --- | --- | --- | --- |
| **V3.17-A** Status vor Zahlen | Unabhängig vom Ergebnis kompakte, klar priorisierte Anzeige: Standardfall-Status, Geburtsfenster, geschätzt/übernommene Werte, offene Prüfungen | Reine Funktion nutzt bestehenden Validator; echte UI-Reaktion auf Eingaben; 2027, Sonderfall, Konflikt, unbestätigter Standardfall und plausibles Beispiel getestet | **TECHNISCH UMGESETZT; externe Abnahme offen** |
| **V3.17-B** Kontext im Ergebnis und Export | [Reine Exportkennzeichnung](AUSBAU-V317B-C-EXPORTE-EVIDENZ-2026-10-17.md): JSON-Top-Level-Metadaten, CSV-Zusatzspalten, fehlende Kosten bleiben leer; alte JSON-Imports bleiben möglich | JSON-Schema 1 unverändert; CSV-Altspalten bestehen, aber neue Gesamtspaltenzahl; Tests gegen Fälschungen und Offline | **TECHNISCH UMGESETZT; keine Fachfreigabe** |
| **V3.17-C** reproduzierbares Fachpaket | [Neutrale Prüffall-Vorlage](FACHABNAHME-V317-REFERENZFALL-VORLAGE.md), [SHA-gebundene maschinenprüfbare Fallmatrix](AUSBAU-V317B-C-EXPORTE-EVIDENZ-2026-10-17.md), zusätzliche negative Evidenztests | Fehlende/gefälschte Nachweise scheitern; keine automatische fachliche Bestätigung, **0/10 extern bestätigt** | **Technischer Nachweischeck umgesetzt; externe Fachabnahme offen** |
| **V3.17-D** Nutzerprüfung vorbereiten | [Acht interaktive synthetische Lernfälle und moderiertes Nutzer-/Accessibility-Protokoll](PRODUKTREIFE-V317D-NUTZERPRUEFUNG.md); formale, SHA-gebundene Null-Evidenzmatrix in `data/usability-review-v317d.json` | Übungen ohne Speicher-/Planmutation; technische Browser-/Offline-/Negativtests; **0 reale Nutzerreviews** und **keine Freigabe** | **Technisch umgesetzt; echte Nutzertests und manuelle Accessibility offen** |

**V3.17-D (18.10.2026):** Die interaktive Verständlichkeitsübung ist für **acht fiktive Themen** implementiert; `npm run usability:check` bestätigt **acht vorbereitete Aufgaben, null reale Beobachtungen und null Freigaben**. [Moderator- und Accessibility-Protokoll](PRODUKTREIFE-V317D-NUTZERPRUEFUNG.md). **Technische Gesamtabnahme: 495/495 Node-/DOM-Tests, 63/63 vollständige Chromium-Browserfälle und 3/3 zusätzliche direkte `file://`-V3.17-D-Tests bestanden.** Der exakte GitHub-PR-CI-Nachweis folgt beim Merge; keine reale Nutzerabnahme. Die Durchführung echter Nutzertests bleibt ein **offener P0-Nachweis**.

**V3.17-B/C technische Abnahme (17.10.2026):** 481/481 Node-/DOM-, 60/60 vollständige Chromium-Browser-Regressionen und 4/4 zusätzliche V3.17-B-`file://`-Browserfälle bestanden. Export- und Evidenzaufbau sind technisch umgesetzt, aber **0/10 Familienfälle unabhängig bestätigt**. Diese Prüfungen stellen keine fachliche und keine öffentliche Freigabe dar. [Nachweise](AUSBAU-V317B-C-EXPORTE-EVIDENZ-2026-10-17.md).

**V3.17-A technische Regression (17.10.2026):** 468/468 Node-/DOM-Tests, 56/56 vollständige Chromium-Browserfälle, 3/3 neue V3.17-Fälle direkt per file:// bestanden. Die aufklappbare Scope-Karte ist auf einem 320-Pixel-Bildschirm geschlossen ca. 90 px hoch und hält den Schnellstart im ersten Viewport. Diese technischen Ergebnisse ändern **keinen** P0-Reviewstatus. [Details](AUSBAU-V317-PRODUKTREIFE-EINORDNUNG.md).

**Technikregeln:** Kein neuer amtlicher Nettorechner; keine Regeländerung zum Mutterschutz ohne unabhängige Quelle; keine Rechte-, Speicher- oder JSON-Schemaänderung allein aufgrund einer neuen Hinweiskarte. Dokumentation vor und während Umsetzung aktualisieren. Neue UI auch mit direktem `file://` testen. Kein PR-Merge oder Push ohne entsprechenden Auftrag.

## 4. P1 nach abgegrenztem Standardfall – bewusst keine automatische P0-Ausweitung

1. **Wochenplanung:** echte Arbeitswochen, Pendelzeiten, Feiertage, individuelle Abholzeiten; vor Nutzung fachlich/organisatorisch prüfen. Optionaler privater Export/Verschlüsselung nur mit gesondertem Recovery- und Datenschutzkonzept.
2. **Automatisierte Brutto-zu-Elterngeld-Netto-Engine:** getrenntes Fachprojekt mit unabhängiger Bemessungs-/Lohnsteuerreferenz und Nutzungsbedingungen für mögliche BMF-Schnittstellen.
3. **Sonderfälle:** Selbstständige/Mischeinkünfte, Mehrlinge, Alleinerziehende, Frühgeburt, Adoption und atypische Mutterschutzfristen jeweils als **eigene** geprüfte Erweiterung.
4. **Regionale Angebote:** aktuelle kommunale Kita-Gebühren/Verfahren, weitere Länderleistungen und unterschiedliche Zuständigkeiten; kein erfundener bundeseinheitlicher Kita-Tarif.
5. **Synchronisierung:** optionaler Multi-Device-/Partneraustausch erst nach unabhängiger Bedrohungsmodell-, Datenschutz- und Schlüsselerholungskonzeption.
6. **Suche:** stärkere Kandidatenabdeckung und echte Performance-Messung auf Smartphones; „bestes gefundenes Szenario“, kein globales Optimum.

## 5. Operative Qualitätsschranken und Zuständigkeiten

- **Vor jedem Merge:** `npm test`, vollständige Chromium-E2E, direkte `file://`-Fälle, `git diff --check`, Quellen-/Roadmap-/Privacy-Checks, keine Secrets/Testartefakte. CI muss gegen den **exakten** Commit bestanden sein.
- **Vor jedem öffentlichen Start:** `npm run release:check` darf ausschließlich nach extern belegten P0-Reviewentscheidungen und verantwortlicher Betreiberfreigabe grün werden. `data/release-gates.json` nicht allein zur Fehlerbehebung verändern.
- **Bei neuen Gesetzen:** Gültigkeitsbeginn, Quellenstatus und Geburtskohorte separat pflegen; parlamentarische Pläne/Entwürfe nicht als heutiges Recht behandeln.
- **Verantwortliche Rollen:** Fach-/BEEG-Reviewer, Rechts-/Betreiberverantwortung, Datenschutzverantwortung, manuelle Accessibility-/UX-Review, technische Pflege und Freigabeverantwortung – **Zuweisung und Nachweise stehen aus.**
- **Reproduzierbarkeit:** unabhängige Referenzwerte im Prüfprotokoll, keine automatisch aus dem getesteten Rechner abgeleiteten Sollwerte; datierte Quellen und Rundungen je Fall.
- **Berichte:** [aktueller Handoff](HANDOFF.md), [detaillierte V3.15/16-Abnahmen](AUSBAU-V316-GEMEINSAME-BETREUUNG-2026-10-17.md), [historische Roadmap](ROADMAP-HISTORIE-BIS-V316-2026-10-17.md). Die maschinenlesbare alte P0/P1-Statusmatrix bleibt bis zur Migration als **historische Zuordnung** erhalten.

**Status: intern technisch fortentwickelbar · fachlich und öffentlich nicht freigegeben.**

## V3.18 (18.10.2026) – interne Sicherheits- und Staging-Vorbereitung

Importstatus-Codes sind auf eigene erlaubte Einträge begrenzt; privater, nur loopback-gebundener Staging-Build mit gehashtem Skript-CSP und reproduzierbarer Header-Vorlage ist vorbereitet. **Keine öffentliche Bereitstellung und keine neue externe Freigabe.** [Prüf- und Betriebsdokument](STAGING-UND-FREIGABE-V318-2026-10-18.md).

## Amtliche BEEG-Richtlinien Juli 2026 – zusätzliche Teilreferenz

Die 07/2026-Richtlinien bestätigen an einem veröffentlichten **7/31-Beispiel** die taggenaue Anrechnung nach BEEG § 3. Eine neue, explizit **nicht als vollständiger Familien-Review gezählte** Zeitachsenregression prüft den veröffentlichten Teilfall; die 4/30-gegen-5/30-Frage vom 20.05., **0/10 externe Familienreferenzen** und alle externen Freigaben bleiben offen. Details: [Fachquellen-Abgleich](FACHABNAHME-RICHTLINIEN-2026-10-18.md). Die 2027er-KiBiz-Fassung ist getrennt von der nicht freigegebenen BEEG-Prognose zu behandeln.

## V3.20 – Nachweisgebundene Release-Sperre (18.10.2026)

Der Release-Direktbefehl prüft neben Administrations-Flags jetzt die unabhängig validierten Familien-/Nutzer-Evidenzen, Mutterschutz-Fachentscheid, aktuelle SHA-256-Hashes der Offline-HTML-Seiten und einen echten extern kontrollierten Betreiberentscheid. Manipulierte Freigabe-Flags allein lösen **keine** Produktfreigabe mehr aus. Bestehende Referenzfamilien: **0/10**, reale Nutzertests: **0**, 4/30-gegen-5/30-Differenz und externe Rechts-/Datenschutz-/Betreiberfreigaben offen. **Keine Änderung an Berechnung, Paketversion, JSON-Schema oder den echten Freigabedateien.** [Tests und Nachweise](RELEASE-EVIDENZ-SPERRE-V320-2026-10-18.md).

## GitHub Pages – öffentliche, ausdrücklich unfreigegebene Testvorschau

Ein ausschließlich manuell ausgelöster GitHub-Actions-Workflow stellt für Tests **nur zwei HTML-Seiten** als öffentlich abrufbare Pages-Vorschau bereit. Beide Seiten tragen eine sichtbare Warnung, Noindex und ein JavaScript-SHA-CSP. Das Repository bleibt privat; die Vorschau ist **öffentlich**, erfordert fiktive Testdaten und ist kein rechts- oder datenschutzgeprüftes Produkt. Die eigentliche öffentliche Produkt-Release-Sperre bleibt BLOCKED; **keine** automatische Veröffentlichung bei Push auf main. [Testanleitung](GITHUB-PAGES-TESTVORSCHAU-2026-10-18.md).

## Pages-Testseiten-Review: nachvollziehbarer Build und synthetische Daten

Die nächste **manuell ausgelöste** öffentliche Pages-Testvorschau zeigt nun die Paketversion 3.10.0, den getrennten Stand der Rechtsquellen (15.10.2026), den exakten Git-Commit samt Link und – im GitHub-Workflow – die Ausführungs-ID. Historische V3.15/V3.16-Modulnamen werden getrennt erklärt. Alle Eingabe-, Zeitachsen-/Buchungs- und Ergebnisansichten verweisen in dieser Vorschau ausdrücklich auf **ausschließlich synthetische Testdaten**. Die Original-Offline-Quellen bleiben unverändert; JSON-Schema 1 und Rechenlogik ebenfalls. Die NRW-KomNet-Fachauskunft stärkt die eigenständige Schutzfrist-Herleitung, **löst die 4/5-Tage-Anrechnung nicht abschließend**. P0-A/B/D/E und Betreiberfreigabe bleiben offen. Die Vorschau wird nicht automatisch beim Merge veröffentlicht. [Externer Review-Abgleich, Prüfergebnisse und Rollout-Grenzen](PAGES-REVIEW-ABGLEICH-2026-10-18.md).

## P1 UX: synthetische Vorschau, Feldfehler und letzte gültige Ergebnisse

Die öffentliche GitHub-Pages-Testvorschau verwendet nun in zusätzlichen statischen und dynamischen Bereichen ausschließlich synthetische Finanz- und Familienangaben; auch die Infoseite erklärt das explizit. Die Vorschau startet mit einem fiktiven Datum 28.05.2026, während die lokale Offline-Fassung ihre bisherige Voreinstellung behält. Negative/ungültige Einnahmen, Datumsangaben sowie Wochenstunden über 40 werden vor Übernahme in die Modellberechnung abgewiesen (feldnahe zugängliche Fehler). Ein noch nicht berechneter oder ungültiger Schnellstart kennzeichnet das bisherige Ergebnis als letzten gültigen Entwurf. Bewusst eingetragene 0 bleibt verschieden von unbekanntem/leerem Betrag. Rechenformeln und JSON-Schema 1 bleiben bestehen.

Fachprüfungen 4/30 gegen 5/30, unabhängige Referenzfälle (0/10), manuelle Screenreader-/Nutzertests und Rechts-/DSGVO-/Betreiberfreigaben bleiben **offen**. Ein Merge aktualisiert die GitHub-Pages-Testvorschau nicht automatisch; der betreiberseitig bestätigte manuelle Pages-Workflow ist weiterhin erforderlich. [Implementierung und Testgrenzen](P1-UX-VALIDIERUNG-2026-10-18.md).

## P2 – Herkunft des Elterngeld-Netto und verständlicherer JSON-Import

Bei Änderung des Schnellstart-Auszahlungsnettos und schon vorhandenen manuellen/importierten Elterngeld-Netto-Fachwerten verlangt die Anwendung nun eine ausdrückliche Wahl: **beibehalten, unverbindlich neu schätzen oder als unbekannt leeren**. Ohne Wahl bleibt der alte Berechnungszustand erhalten. Die Ergebnisübersicht nennt die Herkunft je Elternteil ausdrücklich ohne amtlichen Prüfclaim. Schätzungen, leer/unbekannt und 0 € bleiben unterscheidbar. Das JSON-Schema 1 sowie die rechtlichen Formeln bleiben unverändert. Der Import erklärt vorab, welche temporären Szenarien nicht exportiert werden, zeigt feldbezogene deutsche Fehlermeldungen statt roher Parser-/Datenschlüsseltexte, erhält auf Fehlern den vorherigen Plan und aktiviert nie ungefragt die Browserspeicherung. Die bekannten fachlichen und rechtlichen Release-Gates bleiben offen; die öffentliche GitHub-Pages-Testvorschau ist weiterhin manuell freizugeben und nur für fiktive Eingaben gedacht. [Technischer Nachweis und Testgrenzen](P2-NETTO-HERKUNFT-IMPORT-2026-10-18.md).

## P2-Zielsuche: drei vergleichbare Modellkennzahlen und Laufzeit

Die bestehende Zielsuche zeigt nun je Vorschlag direkt dieselben drei Kennzahlen: Gesamtbudget realistisch, niedrigster Lebensmonat realistisch und Anfangsruecklage vorsichtig. Die vollstaendige Realistisch/Vorsichtig-Tabelle samt Engpassmonaten und Zielkonflikten ist weiterhin in aufklappbaren Details verfuegbar. Die Suchgrenzen und der fehlende globale Optimalitaetsnachweis bleiben sichtbar; angezeigte Betragswerte sind weder Bewilligungen noch Bankbuchungen. Der Suchlauf zeigt den Busy-Status, echten Fortschritt und die nur auf diesem Geraet beobachtete Laufzeit; Abbruch und Eingabeaenderungen uebernehmen nie ungefragt den Monatsplan. Ein separat startbarer, synthetischer file://-Chromium-Benchmark protokolliert getesteten HTML-SHA, Plattform, Browser und Wallzeit ohne Speicherung oder Netzwerk. Quellformeln, JSON-Schema und Release-Sperre bleiben unverändert. Mutterschutz 4/5 Tage, 0/10 externe Referenzen, Nutzer-/Screenreader-/Datenschutz-/Rechts-/Betreiberfreigaben bleiben offen. GitHub Pages bleibt eine nur manuell ausgeloeste synthetische Testvorschau. [Vollstaendiger technischer Bericht](P2-ZIELSUCHE-VERGLEICH-2026-10-18.md).
