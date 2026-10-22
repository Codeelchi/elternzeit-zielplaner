# Fachstand 22.10.2026 – Mutterschutz-Tagesgrenze und externe Prüfungen

**Status:** Literatur- und Konsistenzrecherche, **keine unabhängige Rechts-/Leistungsfreigabe**. Der öffentliche Rechner bleibt **NO-GO**. Diese Notiz enthält ausschließlich synthetische Datumsbeispiele.

## Präziser Stand des 4/5-Resttage-Konflikts

Für den synthetischen Fall **Geburt = ET = 20.05.2026**, unauffällige Einzelgeburt, normale nachgeburtliche Achtwochenfrist:

| Betrachtung | Herleitung | Ergebnis |
| --- | --- | --- |
| Ereignis- und Schutzfristkalender | § 3 Abs. 2 MuSchG, §§ 187 Abs. 1, 188 Abs. 2 BGB; gemäß NRW-KomNet 4244 beginnt die nachgeburtliche Frist mit dem **21.05.2026** | Acht Wochen/56 Kalendertage enden am **15.07.2026** |
| Zweiter Lebensmonat | 20.06.2026 bis einschließlich 19.07.2026 | 30 Kalendertage |
| Modellherleitung | Leistungen während der normal berechneten Schutzfrist bis einschließlich 15.07.2026 | **16.–19.07. = vier mögliche Resttage** |
| Beispiel des Bundesfamilienportals | Für Geburt am 20. Mai nennt es Mutterschaftsleistungen bis **14. Juli** | **15.–19.07. = fünf Resttage**, (5/30) des Basisbetrags |

**Zusätzlich recherchierte amtliche Erläuterung:** Die **Knappschaft-Bahn-See (KBS, Mutterschutzrechner)** schreibt, dass der Tag der Geburt nicht zur Berechnung der Schutzfrist gehört und die nachgeburtliche Achtwochenfrist am Folgetag beginnt. Sie weist ausdrücklich darauf hin, dass der Arbeitgeberzuschuss **auch für den Entbindungstag** gezahlt wird. **§ 24i Abs. 3 SGB V** verlangt Mutterschaftsgeld für die Schutzfrist **sowie für den Entbindungstag**. Damit sind Schutzfrist, Mutterschaftsgeldzahlung, Arbeitgeberzuschuss und tatsächliche Anrechnung auf Basiselterngeld rechtlich **nicht ohne weitere Begründung identisch**.

### Überprüfbare Quellen (Abruf 22.10.2026)

1. Bundesfamilienportal, [Elterngeld und Mutterschaftsleistungen / Beispiel 20. Mai mit fünf Tagen](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/kann-ich-elterngeld-und-mutterschaftsleistungen-bekommen--124776) – expliziter amtlicher Veröffentlichungsbefund **5/30**, nicht weggefiltert.
2. [NRW KomNet, Dialog 4244, Stand 15.04.2019](https://www.komnet.nrw.de/_sitetools/dialog/4244) – §§ 187/188 BGB, erster Schutzfristtag nach tatsächlichem Geburtstag, Ende acht Wochen später, für die Standardfrist.
3. [KBS / Arbeitgeberversicherung: Mutterschutzrechner und Erläuterungen](https://www.kbs.de/SiteGlobals/Forms/Rechner/rechner_pwa/Mutterschutzfristen/Mutterschutzfristen_node.html) – Entbindungstag zählt nicht zur nachgeburtlichen Schutzfrist, Zuschuss für Geburt dennoch erstattbar.
4. [§ 3 MuSchG](https://www.gesetze-im-internet.de/muschg_2018/__3.html) – Schutzfristen und Ausnahmen.
5. [§ 24i SGB V](https://www.gesetze-im-internet.de/sgb_5/__24i.html) – Anspruch für Schutzfrist und Entbindungstag.

Die Quellen **stützen eine Fristende-Herleitung**, klären aber den dokumentierten Unterschied zur **taggenauen Elterngeldanrechnung** des Familienportals nicht rechtsverbindlich. Ein angenommener 4-Tages- oder 5-Tages-Wert darf nicht allein aufgrund der Zahl der gefundenen Quellen als bestätigt gelten. Das Modell und die 4/5-Negativ-Release-Gates bleiben absichtlich unverändert.

## Wie der offene Punkt fachlich abgeschlossen werden kann

Der [externe Review-Koffer](../scripts/review-kit-build.mjs) erstellt die **Fachfrage** mit konkreter Tagesgrenze und fünf präzisen Rückfragen. Eine unabhängige prüfberechtigte Fachperson beziehungsweise Elterngeldstelle und – für Zahlungen – eine gesetzliche Krankenkasse müssen **schriftlich und datiert** bestätigen, auf welchen Zeitraum die Leistung zusteht und wie der 2. Lebensmonat nach BEEG anteilig berücksichtigt wird. Vor einer Korrektur der Geldlogik sind mindestens die Tagesgrenzen, Quellenedition, betroffenen Versicherungsvarianten, der Minderungspfad im Elterngeld und Testfallkonsequenzen explizit nachzuweisen.

## Weitere dokumentierte externe Sperren

- **0/10 unabhängig nachgerechnete vollständige Paar-/Familienfälle:** [Anfragen](../data/independent-case-requests-2026-10-17.json) sind nur synthetische Fälle. Amtliche Einzelkomponenten können vollständige unabhängige Familien-Endabrechnungen nicht ersetzen.
- **Rechtsstand 2027:** Gesetze, Kohortenregeln und kommunale Betreuungsdaten müssen vor verbindlichen Aussagen für 2027 erneut anhand aktueller Primärquellen geprüft werden. Keine stille Weitergeltungsfreigabe.
- **0 echte moderierte Nutzertests und 0 manuelle Screenreader-Abnahmen:** [Paket-3C-Testanweisung](PAKET3C-NUTZER-A11Y-ABNAHME-2026-10-22.md) ist vorbereitet, aber nicht ausgeführt.
- **Datenschutz, Betreiber- und Rechtsfreigaben:** Der tatsächliche Betreiber, Deployment-Kontext, Datenschutz- und Impressumspflichten sind durch verantwortliche Personen zu bestätigen.

**Fazit:** Die Quellenlage ist präziser, ein fachlicher Blocker damit **nicht** aufgehoben. Der lokal erzeugte Prüfkoffer ist eine **Handoff-Vorlage**, kein Nachweis für tatsächliche Testpersonen, tatsächliche Verwaltungsentscheidungen oder produktive Releases.
