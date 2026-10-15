# V3.4.0 – fortgesetzte MVP-Prüfung

Die GitHub-CI des V3.4-Funktionsstandes `b5c82e3` ist erfolgreich ([Run 38680019062](https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/38680019062)). Dieser Ausbauschritt schließt zusätzlich gefundene Eingabelücken und erweitert die Familienplanung. Eine öffentliche Freigabe bleibt ausstehend.

## Neue Implementierungen

- Sonderfallangaben mit unerwartetem Datentyp, unbekannte Elternschlüssel und fehlerhafte Quellen-Gültigkeitszeiträume verhindern jetzt zuverlässig eine positive Standardbewertung. Die Prüfung unterscheidet 35 Stunden Erwerbsarbeit ohne Elterngeld und ohne Elternzeit von Erwerbsarbeit während tatsächlicher oder abgeleiteter Elternzeit.
- JSON-Import erhält getrennte Erwerbs-/Leistungsmonate und Bankbuchungen einschließlich der daraus berechneten Finanzwerte. Datei-/Zahl-/Datums-/Stundenprüfung und ausdrückliche Speicherentscheidung gelten auch für die aktive Importfunktion. Ein erfolgreich geladener Plan entfernt die bisher lokal gespeicherte Kopie und aktiviert Speicherung nicht stillschweigend.
- Getrennte Einkommensbänder für beide Eltern; Null bedeutet keine Schwankung, leere Felder übernehmen das gemeinsame Band. Mutterschaftsleistungen bleiben separat und konstant. Bandgrafik, Engpass-/Rücklagenanalyse und Robustheitsziel verwenden dieselben Szenarien.
- Die Vorlagensuche kann längere Auszeit beim Vater, bei der Mutter oder beide Aufteilungen vergleichen. Spiegelung verschiebt Mutterschutz niemals zum Vater. Jede Variante wird unabhängig auf Recht, Betreuung und Budget geprüft; unzulässige mütterliche Kontingentüberschreitungen werden nicht übernommen.
- Kompakte Fingerprints reduzieren die gespeicherten Suchschlüssel. Regelkonflikte werden vor teuren Finanzprojektionen ausgesondert. Änderungen an Elternzeit und persönlichen Risikobändern machen vorherige Empfehlungen ungültig; vor Übernahme erfolgt eine erneute Prüfung.

Die Suchmethode bleibt begrenzt: keine vollständige Erfassung aller Monatsfolgen, nur ausgewählte Teilzeitstarts und Bonusabschnitte, keine Planung tatsächlicher Betreuungsstunden. Ein Suchlauf kann bei restriktiven Anforderungen keine Vorschläge liefern. Das Ziel wird nicht heimlich abgeschwächt.

## Amtlicher Rechner: vertiefte unabhängige Quellprüfung

Am **15.10.2026** wurden der [Bundesrechner](https://familienportal.de/familienportal/meta/egr) und dessen [öffentliches Anwendungsskript](https://egr-assets-production.object.storage.eu01.onstackit.cloud/index.js) abgerufen. Skript-SHA256: `29621047a3485b03526966aacb74594ff6a3777908d506f5b728a1fabfa77b4c`.

Die unveränderte isolierte Original-Kalenderfunktion wurde mit synthetischen Daten ausgeführt:

| Geburt | Errechneter Termin | Amtliche Funktion: Fristende |
| --- | --- | --- |
| 20.05.2027 | 20.05.2027 | 15.07.2027 |
| 28.05.2027 | 28.05.2027 | 23.07.2027 |
| 20.05.2027 | 28.05.2027 | 23.07.2027 |

Die Aufruferkette bestätigt: Der zweite Parameter der internen Funktion `iz` ist der vorgeburtliche Schutzfristbeginn. Berechnet wird das spätere Datum aus Geburt plus acht Wochen und vorgeburtlichem Beginn plus vierzehn Wochen. Das stützt unsere Kalenderableitung; es bestätigt keine Rechtslage für zukünftige Geburten.

Für die Geldbeträge ist die amtliche SPA **kein taggenauer Referenzvergleich**: `Uz` bestimmt den letzten berührten Lebensmonat, `AB → pB → dB` kennzeichnet Schutzmonate mit leerem Leistungsbetrag, `fB` überspringt deren Betragsaktualisierung. Die Oberfläche zeigt dort „Mutterschutz“. Damit kann diese Darstellung den Unterschied zwischen **4/30 und 5/30** verbleibendem Bezug nicht aufklären.

Keine privaten Daten übermittelt. Kein vollständiger identischer Geldbetragsvergleich behauptet. Die Originalreferenz des Familienportals bleibt erhalten und die Abweichung im Delta-Bericht sichtbar.

## Technische Nachweise und verbleibende Gates

154 automatisierte Node-/Modul-/DOM-Tests bestehen nach der Integration. Elf Browsertests direkt über `file://` und 50 Axe-Prüfungen bestehen ohne Verstöße oder Laufzeitfehler. Browsernachweise und aktueller Dateiprotokollstatus liegen unter `qa/`; der ergänzte Browserumfang prüft insbesondere vollständigen Export/Import, personenbezogene Risikobänder, mütterliche Schwerpunktvarianten und veraltete Empfehlungen. Es werden ausschließlich synthetische Daten verwendet.

`npm run references:report` schreibt einen versionierten Bericht und `qa/reference-deltas-current.json`. `npm run release:check` bleibt gesperrt, solange die konkrete Referenzabweichung sowie unabhängige Fach-/Rechts-/Datenschutzreviews und Nutzertests offen sind. Ein grüner technischer CI-Lauf ersetzt diese Freigaben nicht. Quellenstand und 2027-Sperre wurden durch die Softwareprüfung nicht pauschal aktualisiert.

## Übergabe und Integration

Der Nutzer hat am 15.10.2026 den Merge und eine ausführliche Dokumentation davor beauftragt. [Buildlog](BUILDLOG.md), [Handoff](HANDOFF.md) und [Roadmap](ROADMAP.md) dokumentieren Nachweise, Übergabe und nächste Pakete. Der Merge-Auftrag ist keine öffentliche Beta-Freigabe. Historische Angaben zu zuvor offenen PRs bleiben als damaliger Stand erhalten; aktueller Status steht auf GitHub.

## Nachprüfung und Fortsetzung V3.5.0 – 15.10.2026

Die öffentliche Recherche bestätigte neben den 34 ursprünglichen monetären Fällen zwei weitere einzeln veröffentlichte Euro-Beträge und acht amtlich veröffentlichte Gesamtsummen über 12/24 Monate sowie vier Werte aus dem L-Bank-Familienfall mit variierenden Teilzeitgehältern. Die resultierenden 48 Geldbetragskontrollen stimmen mit der laufenden Modellrechnung überein; es handelt sich **nicht** um real anonymisierte vollständige Elterngeldbescheide. Die amtliche Datumsabweichung bei Mutterschaftsleistungen wurde durch zwei gegensätzliche Behördenauskünfte konkretisiert, nicht durch Veränderung des Referenzwerts beseitigt. Bei Geburten 2027 sind vorläufige Variantenvergleiche in der UI möglich, **ohne** dass der Validator einen Anspruch oder eine Gültigkeit bestätigt.

[Ausführliche Quellen-, Fall- und Risikodokumentation](AMTLICHE-REFERENZPRUEFUNG-2026-10-15.md). Die unabhängige Fach-, Rechts-, Datenschutz- und Anwenderabnahme ist weiter offen; `data/release-gates.json` bleibt gesperrt.

## Ergänzung V3.6.0 – dokumentarische Gerichtsreferenzen und NRW-KiBiz

- **Vier** historisch anonymisierte echte Bescheid-/Gerichtsverfahren quellengebunden erfasst; **zehn** intern verifizierbare Zahlenbeziehungen durch `npm run historical:report` bestanden. **Null vollständige aktuelle Bescheid-Nachrechnungen** und daher keine unabhängige Berechnungsabnahme.
- **22** datierte Rechtsregelobjekte (mit dem §2c-Einkommensbaustein) und **fünf** rechtliche Entwicklungseinträge für 2027 mit den Statusangaben *Entwurf*, *beschlossen mit stufenweiser Umsetzung*, *verkündet/künftig wirksam* oder *bloße Diskussion*.
- Ungesicherte wiederkehrende Provisionen und Einmalzahlungen werden in der Standardfallprüfung **nicht** positiv bewertet. Bestehende Elternzeit-/Elterngeld-Modelle für reine Angestellten-Standardfälle bleiben unverändert.
- NRW-KiBiz-Bedarfsanzeige nach §5: sechs Kalendermonate vor dem gewünschten Kita-Beginn. Erste-Kind-Kindergeldautomatik wird nicht als garantierte Auszahlung dargestellt.
- **186/186** lokale automatisierte Unit-/Integrations-/DOM-Tests grün, separate Browser-Smoketests auf 1440×900 und 390×844 ohne JavaScript-Konsolenfehler. Ein zusätzlicher neuer Playwright-E2E-Fall liegt im Repository, wurde in dieser Arbeitsumgebung mangels lokalem Playwright-Chromium-Binary noch nicht voll ausgeführt.
- **Öffentlicher Release weiterhin absichtlich gesperrt:** offene Mutterschutz-Referenzabweichung, Bemessungsnetto-Review, Rechts-/Datenschutzfreigabe und reale Nutzerprüfung.

Die einzelnen historischen Belege, ihre Grenzen und die aktuellen Quellen sind in [Historische Bescheide und Rechtsstand 2027](HISTORISCHE-BESCHEIDE-UND-RECHTSSTAND-2027.md) dokumentiert.

## V3.8.0 – Technischer Schnellstart-Funktionstest, 15.10.2026

- **230 von 230** lokalen automatisierten Node-/DOM-/Integrations-Tests bestanden, einschließlich elf neuer Schnellstart-Tests.
- Fünf fiktive Vorlagen, nachvollziehbare Betreuungslücken, schnelle Alternativwahl für 18/24 LM, fünf Eingabefelder im Assistenten, Eingabefehler und unterschiedlicher Umgang mit unbekannten bzw. 0 Euro Ausgaben getestet.
- Freiwillige lokale Speicherung bleibt getrennt: Eine zuvor gespeicherte echte Planung wird durch die Auswahl eines Beispiels nicht stillschweigend überschrieben.
- V3.8-Snapshot-Metadaten und bestehende 22 Rechtsregeln, fünf Rechtsentwicklungen, Zeitachsen und Logikmodule synchron.
- **48 von 48** veröffentlichte bzw. abgeleitete monetäre Vergleiche weiterhin PASS; historisch dokumentierte Gerichtsfall-Beziehungen weiterhin PASS.
- Chromium-Smoke für Desktop 1440×900 und Mobil 390×844: App startet, Schnellstart vorhanden, keine gemeldeten JavaScript-Konsolenfehler. Real-Browser-Interaktions-/Accessibility-Läufe werden zusätzlich in GitHub-CI ausgeführt (Playwright-Binary in der lokalen Workbench nicht installiert).
- Öffentliches Release bleibt bewusst BLOCKED wegen der unverändert bestehenden Mutterschutz-Abweichung und unabhängiger Berechnungs-, Rechts-, Datenschutz- und Nutzertest-Abnahmen.

**Keine Nutzerstudie:** Eine einfache Bedienung wurde programmatisch überprüft, aber noch nicht durch externe werdende Eltern ohne Vorwissen bestätigt. Detaillierter Ablauf und Grenzen: [Schnellstart V3.8](SCHNELLSTART-V3.8.md).
