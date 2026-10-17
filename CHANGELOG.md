# Änderungen

## 3.10.0 – Familienstart, Wissenskarten und centgenaues Budget, 16.10.2026

- **Design-Nachbesserung 17.10.2026:** redaktionelle Typografie, warmer Farbklang, differenzierte Themenkarten, zwölf lokale SVG-Symbole, klarere Rechner-/Beratungsbereiche und mobile Filter. Fünf Portaltests und acht zusätzliche Axe-Scans bei vier Breiten erfolgreich; [Nachweis](docs/DESIGN-2026-10-17.md).

- Neue kleine Infowebseite `start.html`: Schwangerschaft, Vorbereitung und erste Familienzeit, kuratierte offizielle Beratungswege sowie direkter Zugang zum bestehenden Rechner. Gegenseitige Verlinkung, lokal ohne Account, Tracker oder externe Laufzeitassets.
- Acht datierte Wissenskarten ergänzen Lebensmonate, Einkommensarten, Teilzeit, Steuer, Krankenversicherung, Antragsrückwirkung, Arbeitgeber-Elternzeit und Kita-Eingewöhnung. Auswahl nach Planungskontext, konkrete Lebensmonatsdaten und amtliche Quellen; keine zusätzlichen Geldbuchungen.
- Schnellstart mit konkreten nächsten Schritten aus zentralen Validatorbefunden, Haushaltsausgaben und Betreuung. Direkter Sprung samt Eingabefokus, ohne Werte oder Monatspläne umzuschreiben. Nettohilfe erklärt manuelle Schätzungen und den externen amtlichen Rechner.
- Familienbudget bucht Komponenten und kumulierte Rücklagen centgenau. Ausgeglichene Monate erzeugen keine Fließkomma-Phantomengpässe. Exakte Dezimal-Prozentrechnung erhält Halb-Cent-Grenzen; begrenzte numerische Caches halten die Suche schnell. Ungültige Betragstypen und Container werden explizit abgewiesen.
- Basis: tatsächliches main V3.9 (`e8bb586`), PRs #14–#16 bereits gemergt; 246 bestehende Node-Tests grün. Neue Regressionen und Browsernachweise siehe QA-Bericht.
- **QA:** 279 Node-/Modul-/DOM-Tests und 27 echte file://-Browserfälle bestanden; finale Desktop-/Mobil- und Quellenberichte versioniert.
- Ungeklärte Mutterschutzanrechnung und unabhängige Fach-/Rechts-/Datenschutz-/Nutzerabnahmen bleiben offen. Keine Veröffentlichung und keine pauschale 2027-Freigabe.


## 3.9.0 – UX-Datenintegrität und Ergebnisverständlichkeit, 15.10.2026

- **Datenintegrität:** Wiederholte Schnellformular-Eingaben überschreiben weder individuelle Monatspläne noch zuvor manuell ermittelte Elterngeld-Netto-Werte, Steuerangaben oder Standardfall-Klärungen. Nur noch nachvollziehbar vom Kurzassistenten stammende Netto-Näherungen werden aktualisiert.
- **Reset-Schutz:** Der Schnellstart wird ausschließlich nach bestätigtem Zurücksetzen auf Anfang gesetzt. Ein abgebrochener Reset verändert weder Daten noch sichtbaren Modus.
- **Vorlagenklarheit:** Unterschied zwischen ausgewähltem 18-Monats-Modell und persönlichem 14-Monats-Auswertungshorizont wird erklärt; ausdrückliche Synchronisations-Schaltfläche. Individuelle Monatspläne werden nicht durch Vorlagen ohne Bestätigung ersetzt.
- **Haushaltsbudget:** Ohne eingegebene Ausgaben werden keine falschen Anfangsrücklagen oder verfügbaren Stress-Budgets dargestellt. Zielplanvergleich ist zunächst auf Zeitaufteilung beschränkt. Die Monatskopfzeile verwendet bei bekannten Kosten den tatsächlich berechneten Wert nach Kosten.
- **Mobil:** Export- und Fachaktionen über „Weitere Optionen“, Datenschutzhinweise aufklappbar, zentrale Schnellstartvorlage oberhalb der ersten Bildschirmkante selbst bei 320 × 740 px; keine horizontale Überbreite.
- **Zugänglichkeit:** Kein unbeabsichtigtes Präsentations-Blättern beim PageDown einer Vorlagenkarte; konkrete Formularfehler fokussieren und markieren das betroffene Eingabefeld.
- **Transparenz:** Berechnungsannahmen (Nettolöhne, pauschalierte Netto-Näherungen, Kindergeldansatz, fehlende Ausgaben) sind im Schnellstart ausklappbar. Teilweise geänderte Beispieldaten werden als solche gekennzeichnet. Planexport eindeutig als Download benannt.
- **Abnahme:** 246/246 Unit-/DOM-Tests, 22/22 HTTP- und 22/22 direkte file://-Browserfälle, 53 Axe-Prüfungen ohne gemeldete Verstöße; exakte V3.9-Datei durch SHA256 nachgewiesen. Keine unabhängige Rechts-/Steuerfreigabe und keine echte Nutzerstudie; öffentlicher Release bleibt bewusst blockiert.


## 3.8.0 – Schnellstart und vereinfachte Navigation, 15.10.2026

- Fünf Vorlagen aus den bereits bestehenden Monatsplänen auf der Startseite: fiktives Beispiel nach einem Klick, ohne vorher persönliche Werte eingeben zu müssen.
- Geführter Kurzassistent für Geburtstermin, Netto beider Eltern, Betreuungsziel und optionale Haushaltsausgaben; die vorläufige Gleichsetzung des Elterngeld-Netto ist klar als Schätzung gekennzeichnet.
- Betreuungslücken werden bei jeder Vorlage sichtbar erklärt; verlängerte Alternativen für 18/24 LM und explizite Warnung für 30/36 LM ohne passende Vorlage.
- Fehlende Haushaltsausgaben werden strikt von absichtlich eingetragenen 0 Euro unterschieden. Ohne Ausgaben keine Zusage über frei verfügbare Mittel oder sichere Rücklagen.
- Sechs Kern-Navigationsbereiche, weitere Fachansichten per Opt-in; bisherige erweiterte Funktionen und Offline-Berechnung bleiben erreichbar. Im Experten-Modus ist auch die klassische Monatsdetail-Navigation schon vor der ersten Beispielwahl verfügbar.
- Bereits gespeicherte persönliche Pläne werden bei der Auswahl eines fiktiven Beispiels nicht überschrieben. Änderungen in Fachansichten, andere Modellvorlagen und erfolgreiche JSON-Importe aktualisieren die Bezeichnung in der Schnellstart-Übersicht.
- Eigenes synchronisiertes HTML/CSS/JS-Snapshot-System mit Browser-/Negativtests und Dokumentation.
- **Öffentliche Beta bleibt gesperrt**, insbesondere Mutterschutz-Delta, Elterngeld-Netto und unabhängige Nutzer-/Fachreviews sind offen.

## 3.7.0 – Zielbudget, verständlicher Einstieg und geprüfte Cent-Rundung, 15.10.2026

- Persönliche Ehe-/Gehaltsannahmen durch neutrale, anpassbare Elternbezeichnungen und echte Eingabezusammenfassungen ersetzt; rechtliche Mutterschutzrolle bleibt unverändert.
- Unbekannte Nettoangaben bleiben leer und sperren die Standardbewertung/Suche; explizit null Euro werden davon unterschieden.
- Geführter Netto-Einstieg mit Beispiel-, Bekannt- und manueller Übernahmeroute, striktem Import und ausbleibender HTML-Ausführung bei Namen.
- Realistischer/vorsichtiger Planvergleich mit gemeinsamen Annahmen, freien Monaten, Engpässen, Anfangsrücklage und erklärten Deltas.
- Vorschlagsüberschriften nach dem tatsächlich gewählten Vergleichsschwerpunkt und messbaren Kennzahlen benannt, statt nur identische volle Auszeitmonate zu wiederholen. Regressionstest auch für unterschiedliche Budgets bei gleicher Zeitaufteilung. Die Ergebnis-Schnittstelle liefert die Überschrift konsistent für Browser- und API-Vergleiche mit.
- Weitere Vorschläge benötigen materielle Unterschiede; erste Zielpriorität bleibt lexikografisch erhalten.
- Suche in unterbrechbaren Schritten, Fortschritt, Ausschlussgründen und Abbruch bei Eingabeänderung; keine Übernahme unvollständiger Ergebnisse.
- Amtlich belegte Cent-Rundung auch für Zwischen-/Monatsbeträge und Summen ergänzt; ursprüngliche Mutterschutzabweichung bleibt offen und sichtbar.
- 217 Node-Tests, 16 echte Offline-Browserfälle, 52 Axe-Prüfungen und aktuelle QA-/Screenshotnachweise; Nutzertestprotokoll vorbereitet, keine externen Freigaben behauptet.

## Erneute Wettbewerbs- und MVP-Begutachtung – 15.10.2026

- Aktuellen V3.6-main-Stand, Anbieter-Primärseiten, ausgewählte Browseroberflächen und öffentliche Rechenmodule erneut verglichen.
- Formelproben und Abrufmetadaten dokumentiert; Marktüberschneidungen von belegbaren eigenen Funktionen und noch zu testenden Differenzierungshypothesen getrennt.
- MVP-Kriterien, UX-/Netto-Einstieg, Ergebnisvielfalt, Risikovergleich und QA-Versionsdrift bewertet; Produktprioritäten ergänzt. Keine Berechnungs- oder Rechtsregel geändert.

## 3.6.0 – gerichtliche Bescheidfälle und 2027er Rechtsereignisse, 15.10.2026

- Vier veröffentlichte anonymisierte Verwaltungs-/Gerichtsverfahren mit ursprünglichen, geänderten und teilweise nur probeweise berechneten Bescheidbeträgen quellengebunden erfasst. Historische Zahlenbeziehungen gesondert getestet; keine vollständigen 2027er Replays behauptet.
- Der Berliner Provisionsstreitfall überprüft Basis/Plus-Umrechnung und 1.082,85 € Mehrleistungsdifferenz. BW, BSG und Bayern dokumentieren schwankende Einnahmen, Mutterschaftsleistungen, Bemessungsdaten und unvollständige Nachweislage.
- Wahl der Lohnzusammensetzung je Elternteil ergänzt: variable Provisionen/Einmalzahlungen/mischende Einkünfte blockieren positive Standardvalidierung und 2027-Prognosepläne.
- Zentraler datierter Rechtsereignis-Katalog für Steuer-/Kindergeldentwürfe, beschlossene Kindergeld-Verwaltungsvereinfachung, verkündete NRW-KiBiz-Fassung ab August 2027 und unverbindliche Elterngeldreformdiskussion.
- Neuer NRW-Kita-Bedarfsanzeigetermin sechs Kalendermonate vor Start im Antragsassistenten; Kindergeld-Antragsweg wird nur bedingt als automatisch beschrieben.
- §2c BEEG: Arbeitnehmer-Pauschbetrag-Datum des Vorjahres explizit im Antragsassistenten. Kein versehentliches Vorziehen geplanter Steuerwerte.
- Die öffentliche Release-Sperre bleibt unverändert, Mutterschutz-Referenzabweichung weiterhin offen.


## 3.5.0 – zusätzliche Behördenwerte und vorsichtige 2027-Prognose, 15.10.2026

- Zwei zusätzliche monatliche, amtlich veröffentlichte Geldbeträge und acht vollständige 12-/24-Monatssummen unabhängig gegen die bestehende 36-LM-Finanzprojektion überprüft (insgesamt 48 Geldbetragskontrollen).
- Mutterschutzreferenzen des Bundesfamilienportals, des NRW-Arbeitsschutzes, SGB V und MuSchG nebeneinander dokumentiert. Ein-Tages-Widerspruch bleibt ausdrücklich offen und hält die öffentliche Freigabe gesperrt.
- Geburten 2027 können nach vollständiger Eingabe unverbindlich mit einer begrenzten Modellvorlagensuche durchgerechnet werden. Diese Prognosen **bleiben NICHT_UNTERSTUETZT / valid=false** und sind als solche im Ergebnis gekennzeichnet.
- Individuelle Erwerbsnettos und Elterngeld-Netto-Werte je Lebensmonat als manuelle Eingaben; getrennte Berechnung, Importvalidierung und L-Bank-Integrationsfall mit sechs wechselnden Teilzeitgehältern.
- Gesetzesentwurf zur Kindergelderhöhung 2027/28 als geplante, nicht geltende Zukunftsleistung dokumentiert. Ohne externe Prüfungen keine Freigabestatusänderung.
- Sicherungstests für Prognose-Abgrenzung, Zukunftssonderfälle und offizielle Referenzen; Playwright-Port für isolierte Testumgebungen konfigurierbar.

## Dokumentation und Integrationsvorbereitung – 15.10.2026

- Ausführliches Buildlog mit Commit-Historie, reproduzierbaren Befehlen, Prüfnachweisen und Merge-Verfahren.
- Entwickler-Handoff mit Modulkarte, Dateninvarianten, Datenschutz, bekannten Grenzen und nächstem Auftrag.
- Priorisierte Roadmap mit Abhängigkeiten und Abnahmekriterien; Nutzerauftrag zum Merge dokumentiert, öffentliche Freigaben unverändert offen.

## 3.4.0 – fortgesetzter interner Prüfstand, 15.10.2026

- Bewiesene Eingabelücken bei Sonderfallflags, Elternschlüsseln und Quellenzeiträumen geschlossen.
- Importverlust bei Arbeits-/Leistungsmonaten und Bankbuchungen repariert; numerische Eingabegrenzen sowie Speicherentscheidung durchgängig geprüft.
- Einkommensbänder je Elternteil und einheitliche Szenarien für Diagramm, Rücklagen und robuste Zielsuche.
- Mütterliche/väterliche Schwerpunktvarianten mit Erhaltung der Mutterschutzmonate, individuellen Regelprüfungen und kompakteren Suchschlüsseln.
- Gewöhnliche 35-Stunden-Teilzeit ohne Elterngeld und ohne Elternzeit von Teilzeit während Elternzeit getrennt.
- Neue vollständige Browser-Roundtrips und vertiefte amtliche Quellprüfung dokumentiert; öffentliche Freigabe weiterhin gesperrt.

## 3.3.0 – interner Prüfstand, 14.10.2026

- Konsolidierte Feature-Basis aus PR #10/#11 und Dokumentation aus PR #9; `main` bleibt unverändert.
- Eigenständiger Regelvalidator mit vier Statuscodes, Eltern-/Monatsbezug, Quellenmetadaten und Alternativen. Fehlendes zvE, unbestätigter Standardfall und unbestätigte Zukunftskohorten erhalten keine positive Aussage.
- Gemeinsame Datumsrechnung für Kalender, Validierung und Finanzprojektion; Monatsenden und Acht-Wochen-Frist korrigiert. Konkrete Abweichung vom amtlichen Mutterschutzbeispiel bleibt sichtbar und blockiert öffentliche Abnahme.
- Mehrere editierbare Elternzeitabschnitte, unabhängige Arbeits- und Leistungsmonate mit Anschluss an die Finanzprojektion sowie tatsächliche Bankbuchungen.
- Drei erläuterte Suchprofile, Dublettenprüfung, echte Null-Ergebnisse, vollständiger Vergleichszeitraum für Mindestbudget und vorsichtiges Szenario beim Robustheitsziel.
- Drei unabhängige Budget-Stresstests mit Engpassmonaten und erforderlicher Anfangsrücklage; NRW-/Köln-Antragscheckliste mit datierten Fristen und Unterlagen.
- Dreischritt-Einstieg, korrigierte Navigation, mobile Layoutprüfung, Kontrast-/Tastaturverbesserungen, optionale lokale Speicherung, vollständige Löschung und geprüfter JSON-Import.
- Acht Chromium-Browserprüfungen mit 50 Axe-Scans und ausdrücklichem öffentlichen Release-Gate ergänzt. CI-Artefaktupload bleibt bei erschöpfter Quote separat dokumentiert. Alle Haushaltsdaten in Prüfungen synthetisch.

## 3.2.0

Erster getrennt testbarer Zeitachsen-Prototyp in PR #11; 59 Tests.

## 3.1.1

Zentraler versionierter Rechtskatalog und amtliche Betragsfixtures in PR #10; 51 Tests.
