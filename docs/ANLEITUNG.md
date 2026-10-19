# Anleitung – Familien-Szenario- und Budgetplaner

**Aktueller Stand (19.10.2026):** [Technische Produktgrenzen, Release-Gates und aktuelle Testumgebung](STATUS-TECHNISCH-2026-10-19.md). Dieser Rechner ist **kein amtlicher Elterngeldrechner**; die bestehende öffentliche GitHub-Pages-Version dient **ausschließlich fiktiven Eingaben** und kann gegenüber \`main\` veraltet sein. Für den Offlinebetrieb liegen alle Dateien lokal; reale Familien-/Finanzdaten keinesfalls in der öffentlichen Testvorschau eingeben. Die nachfolgenden historischen Versionskapitel sind keine aktuelle Fachfreigabe.

**Datenschutz auf gemeinsam genutzten Geräten:** Bei blockiertem Speichern bleibt die Option ausgeschaltet; bei nicht bestätigter Löschung zeigt die App eine dauerhafte Warnung. „Browserkopie löschen“ entfernt **nicht** den noch offenen Plan; dafür zusätzlich „Zurücksetzen“ nutzen. Heruntergeladene JSON-/CSV-/ICS-Dateien separat löschen. [Details zur Browser-Speicherprüfung](PRIVACY-ROBUSTNESS-V319-2026-10-18.md).

**Interner technischer Stand V3.19 (18.10.2026).** Frühere V3.17-Funktionen sind bereits auf main integriert; V3.19 stärkt den Umgang mit blockiertem Browser-Speicher. Paket-/Exportversion 3.10.0, JSON-Importschema 1. **Keine öffentliche Freigabe, keine amtliche Leistungsberechnung.**

## Starten und Beispiel verstehen

`index.html` direkt aus dem Projektordner in einem modernen Browser öffnen (`file://`); ein Webserver, Konto oder Online-Verbindung ist dafür nicht nötig. `start.html` bietet zusätzlich allgemeine Familienstart- und Beratungsinformationen. Der Schnellstart bietet fünf **vollständig fiktive** Beispielpläne. Die fiktiven Einkommensbeträge sind weder individuelle Lohnwerte noch nachgewiesene Elterngeld-Netto-Werte.

Wichtig: Für einen persönlichen Entwurf müsst ihr eure Konstellation und die verwendeten Zahlen unabhängig bestätigen. Eine visuelle Berechnung auf dem Bildschirm ist noch **keine** bestätigte Anspruchsprüfung.

**Bereits integrierte V3.17-Funktion:** Die Übersichtskarte „Passt euer Fall zu den technisch geprüften Annahmen?“ erklärt Standardfall, Quellenstand, Schätzwerte und offene Freigaben. Sie ersetzt den vorhandenen Validator nicht.

## 1. Unterstützten Fall und Einkommenswerte prüfen

Im Abschnitt **Grundlagen** steht die ausdrücklich zu bestätigende Standardfallannahme: zwei abhängig beschäftigte Eltern in Deutschland, gemeinsamer Haushalt, eigene Betreuung und reguläre Einzelgeburt **ohne** Sonderkonstellation. Beispiele für nicht geprüfte Sonderfälle sind Frühgeburt, Mehrlinge, Alleinerziehende, Adoption, Selbstständigkeit, variable Provisionen und gemischte Einkünfte. Liegt eine Abweichung vor, keine grüne Standardbeurteilung erwarten.

Geburtsdaten im Zeitraum **01.04.2025–31.12.2026** sind vom aktuellen Katalog für die technische Standardmodellierung vorgesehen; darüber hinausgehende Geburtstermine, besonders 2027, dürfen allenfalls als **unverbindliche Vorschau** interpretiert werden. Aktuelle Rechtsfassung vor einer Entscheidung erneut amtlich prüfen.

Gebt **Auszahlungsnetto** (gewöhnlicher Gehaltszufluss) und **Elterngeld-Netto** (elterngeldrechtlicher Bemessungswert) ausdrücklich getrennt ein. Der Planer berechnet diesen Bemessungswert **nicht** zuverlässig automatisch aus einem Bruttolohn. Wenn ihr „aus amtlicher Berechnung oder Bescheid“ wählt, prüft das Programm den externen Beleg **nicht**. Tragt nicht einen ausgezahlten monatlichen Elterngeldbetrag als „Elterngeld-Netto“ ein.

Haushaltskosten und tatsächliche Einnahmen möglichst konkret erfassen. **Unbekannte Kosten sind kein Nullbetrag**; ohne Ausgaben ist ein seriöser verbleibender Monatsrest nicht bestimmbar.

## 2. Familienzeit und Ziele gestalten

- **Modelle / Dauer & Aufteilung / Zeitplan:** Vorlagen wählen, Basiselterngeld, ElterngeldPlus, Teilzeit, unbezahlte Auszeit oder weitere modellierte Status je Elternteil und Kindes-Lebensmonat vergleichen.
- **Zeitachsen:** arbeitsrechtliche Elternzeit, tatsächliche Erwerbsarbeit und Leistungsbezug sind **verschiedene** Angaben. Das reine Verschieben einer Elternzeitmarkierung ist keine automatische Lohn- oder Elterngeldanpassung.
- **Zielsuche:** begrenzte Vorlagen nach gewünschter Betreuung, niedrigstem Monatsbudget, Rücklagen und Zeitaufteilung bewerten. Es wird **nicht** jeder gesetzlich zulässige Plan durchsucht und kein globales Optimum versprochen. Vorgeschlagene Varianten werden nicht automatisch übernommen.
- **Plan prüfen / Nächste Schritte:** offene Eingaben, Regelkonflikte, Quellenstatus und praktische Schritte ansehen. „Plausibel“ heißt **nicht** „bewilligt“.

## 3. Budget, Zeit und reale Zahlung trennen

- **Monatsbudget und Robustheit:** Schätzwerte für Einkommen, Elterngeldannahmen, Kindergeld und selbst eingegebene Haushalts-/Betreuungskosten im **Lebensmonat** des Kindes vergleichen. Risiko-Bandbreiten sind manuelle Annahmen, **keine Wahrscheinlichkeiten**.
- **Cashflow:** Eigene **erwartete** Zahlungen nach konkretem Kalendertag eintragen, Verzögerung und angenommene Anfangsrücklage durchspielen. Das ist keine Prognose tatsächlicher Behördenauszahlungen.
- **Erfasste Bankbuchungen:** Tatsächlich manuell dokumentierte Buchungen sind ein weiterer, vom erwarteten Cashflow getrennter Bereich. Fehlende Monate sind **nicht** bestätigte Monate ohne Zahlung.
- **Steuer/Versicherung:** Progressionsvorbehalt und mögliche Sozialversicherungskosten werden nicht automatisch individuell korrekt berechnet. Verwendete Zusatzrücklagen sind **eigene Szenarioannahmen**.

Der bekannte **Mutterschutz-Beispielfall (20. Mai)** ist fachlich ungeklärt: Das amtliche Beispiel nennt fünf Resttage, die verwendete Frist-Herleitung vier. Vor allem Ergebnisse zu Mutterschaftsleistung und Teilbeträgen **nicht ungeprüft** für eine Finanz- oder Antragsentscheidung verwenden.

## 4. Kita und Wiedereinstieg (V3.15–V3.16)

Im Abschnitt **Leistungen vor Ort** befinden sich getrennte Hilfen:

- Historische **Kölner Kita-Gebühren** mit Alters- und Stundenklassen; keine verbindlichen Preise für künftige Jahre. Je nach Betreuungsdatum unterschiedliche NRW-KiBiz-Rechtsfassungen; lokale Verfahren und Fristen selbst prüfen.
- Wochenweise **Eingewöhnung und möglicher Kita-Verzug**, selbst angenommene Ersatzbetreuung, Arbeitsrückkehr und hypothetische Kosten. Zusätzliche Wartewochen separat vergleichen; nicht mit echten Bankbuchungen oder Ansprüchen gleichsetzen.
- **Gemeinsamer Eltern-Wochenplan** (zunächst geschlossene Detailansicht): Beispielhafte Mo–Fr-Arbeit in Viertelstunden, Betreuungsüberschneidungen, begleitende Person A/B/wechselnd und angenommene Freistellung. Keine echten Schichten, Pendelzeiten, Feiertage, Arbeitgeberfreigaben oder geprüfte Partnerschaftsbonus-Berechtigung.
- Die gemeinsame Wochenplanung ist eine **Alternative** zum Ein-Eltern-Eingewöhnungskostenmodell; ihre Eurobeträge **nicht addieren**.
- Offizielle Orientierung zu Kinderzuschlag/Wohngeld und unverbindliche Antrags-/Terminhilfen, keine automatische amtliche Anspruchsbestätigung.

**Wichtig zu flüchtigen Eingaben:** Die Wochen- und Begleitungsannahmen der neueren Kita-Planer werden **auch bei eingeschaltetem lokalem Speichern nicht exportiert oder wiederhergestellt**. Ein Neustart oder Import setzt sie zurück. Längerfristige Entscheidungen deshalb unabhängig dokumentieren, bis ein gesondert geprüftes Exportkonzept bereitsteht.

## Optionaler Verständlichkeits-Check (V3.17-D-Entwicklungsstand)

Im Bereich **„Plan prüfen“** lässt sich eine Gruppe aus acht **fiktiven Übungen** öffnen. Sie erklären Standardfall/Kohorte, Elterngeld-Netto, Lebensmonat versus Geldzufluss, echte Bankbuchungen, unbekannte Ausgaben, den ungeklärten Mutterschutzfall, begrenzte Zielsuche und lokale Datenhaltung. Nach einer Auswahl auf **„Einordnung prüfen“** klicken, die Erklärung lesen und mit der nächsten Aufgabe fortfahren. Es gibt keinen echten Wissenstest, keine Bewertung durch Menschen, keine Rechtsfreigabe und keine Speicherung oder Übertragung dieser Übungsantworten.

Beim Import, bestätigten Zurücksetzen oder Seitenreload beginnt der Lernteil neu. Er ist unabhängig von euren eigenen Angaben und ändert keine Planberechnungen. Hinweise für eine spätere tatsächliche Nutzerprüfung stehen im [separaten Moderationsprotokoll](PRODUKTREIFE-V317D-NUTZERPRUEFUNG.md). Technische Tests bestätigen die Bedienbarkeit in Chromium und lokalem Offlinebetrieb, ersetzen aber **keine** reale Moderation oder Screenreader-Abnahme.

## 5. Daten auf diesem Gerät

Ohne ausdrückliche Zustimmung wird kein Familienplan persistent im Browser gespeichert. Nach Aktivierung von **„Automatisch auf diesem Gerät speichern“** liegt der Hauptplan lokal, aber **nicht verschlüsselt**, im Browser. Auf gemeinsam verwendeten Geräten nicht aktivieren.

Mit **„Plan herunterladen“** wird der Hauptplan als JSON exportiert; mit **„Plan importieren“** wird er wieder eingelesen. CSV enthält Monatsdaten. In der internen V3.17-B-Ausbaustufe ergänzt JSON ein **rein erklärendes** `planningDisclosure` mit technischem Regelstatus, Quellenstichtag, Nettoherkunft und fehlenden Fachfreigaben. Ein Import **ignoriert** dieses Metadatenfeld und prüft den Fall neu; auch ältere JSON-Dateien ohne dieses Feld bleiben kompatibel. CSV behält die bisherigen 17 Spalten und erhält sieben Statusspalten rechts. CSV-Programme, die exakt 17 Spalten erwarten, müssen die neuen Spalten bewusst ausblenden. Bei unbekannten Haushaltsausgaben bleibt der CSV-Monatsrest **leer statt 0 oder einem erfundenen Restbetrag**. Die Hinweise sind keine behördlichen Prüfzeichen. [Technische Details](AUSBAU-V317B-C-EXPORTE-EVIDENZ-2026-10-17.md). **Achtung:** Exporte können sensible Einkommens-/Familienangaben enthalten; sie bleiben außerhalb der Kontrolle der Anwendung. Die lokalen Daten lassen sich über **„Lokale Daten löschen“** entfernen; heruntergeladene Dateien werden dadurch **nicht** automatisch gelöscht. Lokale Testprüfungen ersetzen keinen unabhängigen Datenschutzreview.

## 6. Wo externe Unterstützung nötig ist

Offizielle Übersicht: [Familienportal](https://familienportal.de/familienportal/), [Bundes-Elterngeldrechner](https://familienportal.de/familienportal/meta/egr). Für konkrete Ansprüche zuständige Elterngeldstelle und bei Erwerbs-/Elternzeitfragen Arbeitgeber bzw. fachkundige Beratung hinzuziehen. Die [aktuelle Roadmap](ROADMAP.md) listet die vor öffentlicher Freigabe **noch offenen** Nachweise.

**Stand und Versionshinweis:** V3.16 bezeichnet hier den **intern implementierten Funktionsumfang**, nicht die Paketversion oder eine Freigabe für eine Geburtskohorte. Für Rechtslage und Berechnungsannahmen ist die jeweilige datierte Quelle ausschlaggebend; eine neue Nummer allein belegt nichts.

## V3.18 (18.10.2026) – interne Sicherheits- und Staging-Vorbereitung

Importstatus-Codes sind auf eigene erlaubte Einträge begrenzt; privater, nur loopback-gebundener Staging-Build mit gehashtem Skript-CSP und reproduzierbarer Header-Vorlage ist vorbereitet. **Keine öffentliche Bereitstellung und keine neue externe Freigabe.** [Prüf- und Betriebsdokument](STAGING-UND-FREIGABE-V318-2026-10-18.md).

## V3.20 – Nachweisgebundene Release-Sperre (18.10.2026)

Der Release-Direktbefehl prüft neben Administrations-Flags jetzt die unabhängig validierten Familien-/Nutzer-Evidenzen, Mutterschutz-Fachentscheid, aktuelle SHA-256-Hashes der Offline-HTML-Seiten und einen echten extern kontrollierten Betreiberentscheid. Manipulierte Freigabe-Flags allein lösen **keine** Produktfreigabe mehr aus. Bestehende Referenzfamilien: **0/10**, reale Nutzertests: **0**, 4/30-gegen-5/30-Differenz und externe Rechts-/Datenschutz-/Betreiberfreigaben offen. **Keine Änderung an Berechnung, Paketversion, JSON-Schema oder den echten Freigabedateien.** [Tests und Nachweise](RELEASE-EVIDENZ-SPERRE-V320-2026-10-18.md).

## P1 UX: synthetische Vorschau, Feldfehler und letzte gültige Ergebnisse

Die öffentliche GitHub-Pages-Testvorschau verwendet nun in zusätzlichen statischen und dynamischen Bereichen ausschließlich synthetische Finanz- und Familienangaben; auch die Infoseite erklärt das explizit. Die Vorschau startet mit einem fiktiven Datum 28.05.2026, während die lokale Offline-Fassung ihre bisherige Voreinstellung behält. Negative/ungültige Einnahmen, Datumsangaben sowie Wochenstunden über 40 werden vor Übernahme in die Modellberechnung abgewiesen (feldnahe zugängliche Fehler). Ein noch nicht berechneter oder ungültiger Schnellstart kennzeichnet das bisherige Ergebnis als letzten gültigen Entwurf. Bewusst eingetragene 0 bleibt verschieden von unbekanntem/leerem Betrag. Rechenformeln und JSON-Schema 1 bleiben bestehen.

Fachprüfungen 4/30 gegen 5/30, unabhängige Referenzfälle (0/10), manuelle Screenreader-/Nutzertests und Rechts-/DSGVO-/Betreiberfreigaben bleiben **offen**. Ein Merge aktualisiert die GitHub-Pages-Testvorschau nicht automatisch; der betreiberseitig bestätigte manuelle Pages-Workflow ist weiterhin erforderlich. [Implementierung und Testgrenzen](P1-UX-VALIDIERUNG-2026-10-18.md).

## P2 – Herkunft des Elterngeld-Netto und verständlicherer JSON-Import

Bei Änderung des Schnellstart-Auszahlungsnettos und schon vorhandenen manuellen/importierten Elterngeld-Netto-Fachwerten verlangt die Anwendung nun eine ausdrückliche Wahl: **beibehalten, unverbindlich neu schätzen oder als unbekannt leeren**. Ohne Wahl bleibt der alte Berechnungszustand erhalten. Die Ergebnisübersicht nennt die Herkunft je Elternteil ausdrücklich ohne amtlichen Prüfclaim. Schätzungen, leer/unbekannt und 0 € bleiben unterscheidbar. Das JSON-Schema 1 sowie die rechtlichen Formeln bleiben unverändert. Der Import erklärt vorab, welche temporären Szenarien nicht exportiert werden, zeigt feldbezogene deutsche Fehlermeldungen statt roher Parser-/Datenschlüsseltexte, erhält auf Fehlern den vorherigen Plan und aktiviert nie ungefragt die Browserspeicherung. Die bekannten fachlichen und rechtlichen Release-Gates bleiben offen; die öffentliche GitHub-Pages-Testvorschau ist weiterhin manuell freizugeben und nur für fiktive Eingaben gedacht. [Technischer Nachweis und Testgrenzen](P2-NETTO-HERKUNFT-IMPORT-2026-10-18.md).

## P2-Zielsuche: drei vergleichbare Modellkennzahlen und Laufzeit

Die bestehende Zielsuche zeigt nun je Vorschlag direkt dieselben drei Kennzahlen: Gesamtbudget realistisch, niedrigster Lebensmonat realistisch und Anfangsruecklage vorsichtig. Die vollstaendige Realistisch/Vorsichtig-Tabelle samt Engpassmonaten und Zielkonflikten ist weiterhin in aufklappbaren Details verfuegbar. Die Suchgrenzen und der fehlende globale Optimalitaetsnachweis bleiben sichtbar; angezeigte Betragswerte sind weder Bewilligungen noch Bankbuchungen. Der Suchlauf zeigt den Busy-Status, echten Fortschritt und die nur auf diesem Geraet beobachtete Laufzeit; Abbruch und Eingabeaenderungen uebernehmen nie ungefragt den Monatsplan. Ein separat startbarer, synthetischer file://-Chromium-Benchmark protokolliert getesteten HTML-SHA, Plattform, Browser und Wallzeit ohne Speicherung oder Netzwerk. Quellformeln, JSON-Schema und Release-Sperre bleiben unveraendert. Mutterschutz 4/5 Tage, 0/10 externe Referenzen, Nutzer-/Screenreader-/Datenschutz-/Rechts-/Betreiberfreigaben bleiben offen. GitHub Pages bleibt eine nur manuell ausgeloeste synthetische Testvorschau. [Vollstaendiger technischer Bericht](P2-ZIELSUCHE-VERGLEICH-2026-10-18.md).
