# Amtliche BEEG-Richtlinien 07/2026: neuer Teilnachweis, P0-A bleibt ungeklärt

**Stand: 18.10.2026 – vorbereitende Quellenauswertung, keine rechtsverbindliche Auskunft, kein unabhängiges Expertengutachten.**

## Amtlicher Quellenstand

Das Bundesfamilienministerium veröffentlicht **BEEG-Richtlinien, Kennung BMBFSFJ/211, 07/2026**:
https://www.bmbfsfj.bund.de/resource/blob/243236/a81e922c7e43128d76c4299778d83e89/richtlinien-zum-beeg-data.pdf

Darin sind besonders einschlägig:

- **3.1.1.1 (Mutterschaftsleistungen)**: Leistung nach § 24i SGB V und Arbeitgeberzuschuss nach § 20 MuSchG; die Anrechnung betrifft grundsätzlich den Elterngeldanspruch der Mutter, nicht den des anderen Elternteils.
- **3.1.2 (Taggenaue Anrechnung)**: Amtliches Beispiel mit **31 Tagen in einem Lebensmonat**, davon **7 Tagen Anspruch auf Mutterschaftsgeld**; anzurechnen sind **7/31** des betreffenden Lebensmonats. Diese Aussage kann als unabhängiger *Teilregel-Nachweis* für Tagesüberlappung und Proportion dienen.
- Die Richtlinie bestätigt das **Prinzip** der taggenauen Anrechnung, entscheidet in diesem Beispiel aber **nicht**, ob für die besondere Entbindung am 20.05.2026 der 14.07. oder der 15.07. letzter Mutterschaftsleistungs- bzw. Schutzfristtag ist.

Weitere amtliche Rechtsquellen: [MuSchG § 3](https://www.gesetze-im-internet.de/muschg_2018/__3.html), [SGB V § 24i](https://www.gesetze-im-internet.de/sgb_5/__24i.html), [BEEG § 3](https://www.gesetze-im-internet.de/beeg/__3.html), [BGB §§187](https://www.gesetze-im-internet.de/bgb/__187.html) und [188](https://www.gesetze-im-internet.de/bgb/__188.html).

## Präzise Trennung – Fall 20.05.2026

| Gesonderter Gegenstand | Fund / bisherige Herleitung | Beweiskraft |
| --- | --- | --- |
| Taggenaue Kürzung | BEEG-RL 3.1.2: offizielles 7/31-Beispiel | **Amtlich publiziertes Teilprinzip** |
| Ende der nachgeburtlichen Beschäftigungsschutzfrist | MuSchG/BGB-Herleitung im Zeitachsenmodul: 15.07. | **Eigene Fristberechnung, fachlich zu prüfen** |
| Ende der konkreten Mutterschaftsgeld- und Zuschussberechtigung | Bundes-Familienportal: 14.07. und 5/30-Resttage | **Offizielles Portalbeispiel, aber widersprechend** |
| Elterngeldrest für LM 2: 20.06.–19.07. (30 Tage) | Programm: 4/30 (nach 15.07.); Bundesportal: 5/30 (nach 14.07.) | **Nicht unabhängig entscheidbar** |
| Übertragbarkeit auf tatsächlichen individuellen Bescheid | Es liegen keine unabhängigen Sollbescheide für diesen vollständigen Fall vor | **Nicht bestätigt** |

Die Daten liegen getrennt unter `data/amtliche-richtlinien-teilmonate-2026-10-18.json`. Der neue Node-Regressionstest `tests/beeg-richtlinien-teilmonat.test.mjs` kontrolliert ausschließlich die amtlich belegte **7/31-Zeitfensterarithmetik**, die getrennten 4/5-Quellen und die unveränderte Sperre. Es findet **keine Änderung der Mutterschutz-, Einkommen- oder Elterngeld-Berechnungslogik** statt. Der Test ersetzt weder fachliche Interpretation noch eine vollständige Referenzfamilie.

## Konkrete Anfrage an zuständige Fachstelle

Bei **Geburt am 20.05.2026 zum erwarteten Termin**, ohne Sonderfrist, und Lebensmonat 2 vom 20.06. bis 19.07.2026 bitten wir um getrennte, schriftlich belegte Antworten zu:

1. Welcher Tag ist der letzte Tag des nachgeburtlichen Beschäftigungsverbots nach MuSchG § 3 unter Berücksichtigung der Fristenberechnung nach BGB §§ 187–188?
2. Welcher Tag ist der letzte Anspruchstag auf Mutterschaftsgeld nach SGB V § 24i und den Arbeitgeberzuschuss nach MuSchG § 20? Gibt es einen vom Ende des Beschäftigungsverbots abweichenden Leistungszeitraum?
3. Sind nach BEEG § 3 und BEEG-RL Abschnitt 3.1.2 in Lebensmonat 2 **4/30 oder 5/30** Basiselterngeld nicht von Mutterschaftsleistungen erfasst?
4. Wie erklären sich die **14.07./5/30** des Bundes-Familienportals gegenüber der rechnerischen **15.07./4/30**-Frist? Welche aktuell geltende Rechtsfassung / verbindliche Verwaltungsanweisung ist maßgebend?

Gewünscht sind eine schriftliche Begründung, Rechtsstand, Quellenstelle und – wenn möglich – ein anonymisiertes Beispiel mit Anspruchs- und Zahlungstagen. **Die Anfrage wurde nicht versendet.** Eine eingehende Antwort darf nicht ohne echte Fachprüfung als Freigabe markiert werden.

## 2027: eigenständiger Anwendungsbereich

NRW hat eine eigene **KiBiz-Fassung ab 01.08.2027** bereits gesetzlich veröffentlicht: https://recht.nrw.de/lrgv/gesetz/01082027-gesetz-zur-fruehen-bildung-und-foerderung-von-kindern-kinderbildungsgesetz/. Sie betrifft die Kinderbetreuung, **nicht** automatisch die Gültigkeit einer BEEG/Elterngeld-Prognose für 2027. Der technische BEEG-Standardzeitraum bleibt bis zur eigenständigen Fachfreigabe auf **01.04.2025–31.12.2026** begrenzt; 2027er-Bezüge bleiben Prognose/nicht unterstützt.

## Status und Verantwortliche

- Fachprüfung P0-A: **OFFEN**, zuständige Elterngeld-/Mutterschutz-Fachstelle beziehungsweise unabhängige qualifizierte Rechts-/Elterngeld-Fachperson.
- Zehn vollständig unabhängig bestätigte Familien: **0/10**. Amtliche 7/31-Teilregel zählt **nicht** als einer dieser Fälle.
- Rechts-/Datenschutz-/Nutzer-/Betreiberfreigaben: **OFFEN**.
- Release-Gate: `npm run release:check` bleibt **BLOCKED**. `data/release-gates.json` und `data/independent-review-evidence-v317.json` sind unverändert.
