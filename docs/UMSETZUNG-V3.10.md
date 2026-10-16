# V3.10: Familienstart und verständlichere Planung

Stand: **16.10.2026**. Implementiert auf tatsächlichem main `e8bb586` (V3.9, PRs #14–#16 gemergt). Die vorherige isolierte Baseline besteht mit 246/246 Node-Tests; Main-CI [38773827065](https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/38773827065) war erfolgreich. Neuer Feature-Branch: `feat/v3-10-evidence-guidance`.

## Ergebnis und Nutzerweg

Die kleine Infowebseite [`start.html`](../start.html) bietet werdenden Eltern einen ruhigen Einstieg: praktische erste Schritte, Schwangerschafts- und Familieninformationen, offizielle Beratungswege, regionale Einstiege für NRW/Köln und einen klaren Zugang zum Rechner. Themenfilter und native FAQ funktionieren lokal; ohne JavaScript bleiben sämtliche Tipps sichtbar. Die Illustration ist inline, keine externen Fonts oder Stockdienste werden nachgeladen. Die Seite erfasst keine Gesundheitsdaten und speichert keine Phasenauswahl.

Der bestehende Rechner [`index.html`](../index.html) bleibt eine eigenständig verteilbare Datei. Er verlinkt zurück zu Familienstart und Beratung. Werden beide Dateien gemeinsam verteilt, ist der gesamte lokale Einstieg offline verfügbar; externe Fachangebote benötigen Internet. Es wurde weder ein neues Repository noch eine parallele Rechenengine erstellt.

Im Schnellstart führen konkrete nächste Schritte aus den vorhandenen Validatorbefunden und Planungsannahmen zur passenden Eingabe: Standardfall bestätigen, Vorjahreseinkommen klären, Nettoarten unterscheiden, Haushaltsausgaben ergänzen und Betreuungslücken bearbeiten. Navigation und Fokus ändern die Daten nicht. Unbekannte Kosten bleiben von ausdrücklich null Euro unterschieden. Die geschützten individuellen Pläne und manuell verbesserten Nettoangaben aus V3.9 bleiben erhalten.

Aufklappbare Hinweise im Überblick ergänzen acht Themen: Lebensmonate, drei Nettoarten, Teilzeit, Steuerrücklage, Krankenversicherung, Antragsrückwirkung, Arbeitgeber-Elternzeit und Kita-Eingewöhnung. Die Auswahl berücksichtigt die aktuelle Planung; ein Lebensmonatsbeispiel nutzt die gemeinsame Kalenderengine. Alle Inhalte zeigen amtliche Links, Prüfdatum und begrenzte Gültigkeit. Die Hinweise buchen kein Geld und treffen keine zusätzliche Anspruchsentscheidung.

## Fachlicher Fehler und Korrektur

Die bisherige Budgetrechnung konnte aus `0,30 − 0,10 − 0,20` einen winzigen negativen Saldo und damit einen falschen Engpass samt Rücklage erzeugen. Szenariokomponenten werden jetzt einzeln centgenau gebucht; Summen, Mindestbudgetdifferenzen und kumulierte Reserven werden als Integer-Cent berechnet. Die Prozentmultiplikation erfolgt vor der Cent-Rundung als exakter Dezimalbruch; 1,70 Euro nach 15 Prozent Abschlag ergeben damit 1,45 Euro. Begrenzte numerische Zwischenspeicher vermeiden wiederholte BigInt-Konversionen bei der Plansuche. Ungültige Betragstypen und Eingabecontainer werden explizit abgewiesen. Fehlerhafte/unbestätigte Zusatzleistungen bleiben ausgeschlossen.

Das ist eine technische Buchungskonvention für geschätzte Familienbudgets. Die amtlich belegte Elterngeld-Centrundung wird dadurch nicht zur amtlichen Netto-/Steuer-/Bankberechnung erklärt. Die ungeklärte Mutterschutzformel wurde nicht geändert.

## Automatisierte Regressionen

Der vollständige Lauf besteht mit **279/279 Node-/Modul-/DOM-Tests** (167,4 Sekunden). Die ergänzte Prüfung für die Links zur Infoseite besteht zusätzlich mit 2/2 Fällen; die vollständige CI prüft den finalen Dateistand nochmals. Die finale Browsermatrix besteht mit **27/27 file://-Fällen** und **58 Axe-Scans ohne Verstöße**; zwölf aktuelle Screenshots und beide Dateihashes sind versioniert. 103 lokale Dokumentationslinks wurden auf vorhandene Ziele geprüft. Die Prozentrechnung ist mit 7.000 unabhängig per Integer-Arithmetik berechneten Sollwerten geprüft. Dies sind technische synthetische Grenzfälle, keine zusätzlichen amtlichen Familienbescheide.

Die Links aus dem Rechner zur Infoseite öffnen einen neuen Tab. Dadurch bleibt der im RAM bearbeitete Plan erhalten. Die Informationsseite überträgt keine Eingaben; ihr Rechnerzugang ist ein lokaler Dateilink.

## Recherche und Nachweise

- [Fachrecherche](FACHRECHERCHE-V3.10.md): vier neu abgerufene amtliche Quellen, Rundungsgrundlage, konkreter Fehler und Regressionen.
- [UX-Recherche](UX-RECHERCHE-V3.10.md): amtlicher Rechner, gestufte Nutzerführung und direkte Korrekturschritte.
- [Wissensinhalte](ZUSATZINFORMATIONEN-V3.10.md): zehn amtliche Quellen mit Kontext-/Kohortengrenzen.
- [Familienstart](FAMILIENSTART-V3.10.md): redaktionelle Portalquellen und Informationsarchitektur.
- [QA](QA-V3.10.md): tatsächliche finale Node-/Browserergebnisse, Dateihashes, Desktop-/Mobilbilder und Einschränkungen. Axe ist kein Ersatz für Assistenztechnik- oder Nutzertests.

Die Subagents arbeiteten in getrennten Dateien; Quellmodule und HTML-Snapshots wurden anschließend integriert. Für sichtbare Infos wurden keine persönlichen Haushalts- oder Gesundheitsdaten an externe Angebote übertragen. Externe Links enthalten keine Nutzereingaben.

## Offen vor einer öffentlichen Freigabe

Die Mutterschutz-Tages-/Euroabweichung bleibt ebenso offen wie vollständige unabhängige Referenzfamilien und Fach-/Rechts-/Datenschutzreviews. Echte Nutzertests des gesamten Weges Infoseite → Rechner → Beratung stehen aus. Betreiberangaben und erforderliches Impressum für einen künftigen öffentlichen Dienst müssen verbindlich geklärt werden; sie wurden nicht erfunden.

2027 erhält keine pauschale Standardfreigabe. Schwangerschaftsinformationen ersetzen keine individuelle medizinische Beratung. Beratungsstellenverfügbarkeit und Leistungsansprüche müssen vor Ort bestätigt werden. `npm run release:check` bleibt entsprechend gesperrt. Kein öffentlicher Deploy und kein automatischer Merge dieser Fortsetzung.
