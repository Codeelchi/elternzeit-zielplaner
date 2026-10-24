# Historische Elterngeldbescheide und Rechtsänderungen 2027

**Prüfdatum:** 15.10.2026 · **Entwicklungsfassung:** V3.6.0 · **MVP-Status:** interner Prüfstand, öffentliche Freigabe gesperrt.

**Quellen-Nachtrag vom 24.10.2026:** [BEEG 2027: verkündete §-2f-Verweisänderung gegenüber nicht beschlossener Elterngeldreform](RECHTSSTAND-BEEG-2027-2026-10-24.md). Das ergänzende Dossier trennt den gesetzlich vorgesehenen Verweiswechsel zum 01.01.2027 von diskutierten Betrags- und Bezugsmonatsänderungen. **Keine** fachliche Freigabe der 2027-Geburtskohorte oder automatische Anpassung des Rechners.

## Was aus echten Bescheiden ableitbar ist

Die amtlich veröffentlichte Rechtsprechung enthält **echte Bewilligungsbescheide**, Änderungsbescheide und teilweise gerichtliche Probeberechnungen. Es liegen **keine vollständigen Original-Lohnabrechnungen, Steuerdaten, Sozialversicherungsberechnungen oder anonymisierten Bescheid-PDFs** vor. Deshalb sind diese Fälle historisches *Beweismaterial zur fachlichen Fehlererkennung*, aber **keine vollständigen End-to-End-Referenzen** für unsere 2026-/2027-Rechenengine.

Quelle in strukturierter Form: `data/historische-gerichtsbescheide-2026-10-15.json`; **keine** identifizierenden persönlichen Angaben im Repository. Alle Quellen bleiben verlinkt und jahrgangsgebunden.

| Aktenzeichen / Datum | Dokumentierte Geldbeträge | Besonderheit | Prüfstatus |
| --- | --- | --- | --- |
| [SG Berlin S 2 EG 5/24, 05.03.2025](https://gesetze.berlin.de/bsbe/document/NJRE001607308) | Original 1.348,92 € Basis / 674,46 € Plus / 150 € Plus; behördliche Probeberechnung 1.782,06 € / 891,03 € / 150 € | Monatlich vereinbarte Provisionen wurden im Original als Sonderbezüge nicht berücksichtigt. Gegen das Urteil war Berufung L 4 EG 1/25 eingelegt | Rechnerisch nachvollziehbare 1.082,85 € Differenz; **Probebeträge nicht als finalen Bescheid ausgeben** |
| [LSG Baden-Württemberg L 11 EG 1334/21, 11.10.2022](https://www.landesrecht-bw.de/bsbw/?query=DOKNR%3ANJRE001521064&source=PermaLink) | Ursprünglich 1.724,52 €/1.980 €; endgültige Neufestsetzung 599,72 €/688,57 €; ausgewiesener Ø-Nettobetrag nach Geburt 1.826,05 € | Nachträgliche Teilzeiterwerbstätigkeit, Sachbezüge, Rückforderungen und unterschiedliche Verfahrensstufen | Verhältnis der Bescheidstufen dokumentiert; der Text enthält außerdem einmal **688,72 €**, was nicht als verlässlicher Referenzwert behandelt wird |
| [BSG B 10 EG 1/20 R, 24.03.2022](https://www.sozialgerichtsbarkeit.de/node/171789) | Geänderter Bescheid: LM1 0 €, LM2 74,08 €, LM3–12 574,27 € | Entwicklungsdienst und besondere Einkommens-/Versicherungskonstellation | **Nur historisches Sonderfallbeispiel**, keine Standard-Mutterschaftsgeldnachrechnung |
| [Bayerisches LSG L 9 EG 36/18, 26.02.2019](https://www.sozialgerichtsbarkeit.de/legacy/205659) | Behördlich angenommene Bemessungswerte 2.576,17 € brutto und 1.858,10 € Elterngeld-Netto | Regelmäßig gezahlte Provisionen und deren rechtliche Behandlung | Bemessungsdaten dokumentiert; **kein vollständiger bewilligter Leistungsbetrag nach Urteil** belegbar |

Beim Berliner Fall ergibt die ursprüngliche Plus-Halbierung **1.348,92 € / 2 = 674,46 €**, bei der Probeberechnung **1.782,06 € / 2 = 891,03 €**. Die Mehrleistung für LM13–15 ergibt **2 × 433,14 € + 216,57 € = 1.082,85 €**. Die Testmatrix prüft genau diese veröffentlichte Rechenbeziehung, **nicht** die unbekannte Ausgangsbasis des pauschalierten Elterngeld-Netto.

Die Korrektur des BSG-Entscheidungsdatums auf **24. März 2022** erfolgt anhand der BSG-Urteilsveröffentlichung. Der Fall wurde zuvor in einer Arbeitsnotiz irrtümlich auf 2021 datiert.

### Tatsächliche Konsequenz für unsere Berechnungsengine

Die Gerichtsverfahren belegen, warum die Einstufung von Provisionen und sonstigen Bezügen nicht einfach anhand des auf einer Lohnabrechnung verwendeten Kürzels erfolgen darf. Entsprechend erlaubt die UI unter **Grundlagen → Lohnbestandteile** nun die Unterscheidung zwischen reinem Regelgehalt, wiederkehrenden Provisionen, Einmalzahlungen, gemischten Einkünften und noch unbekannter Lohnart.

Der Validator gibt für die letzten vier Fälle **kein positiv valides Standardfallurteil** ab. Das gilt ausdrücklich auch dann, wenn der Nutzer zuvor „Standardfall bestätigt“ auswählt, und ebenso für unverbindliche 2027-Prognosen. Solange die Einkommenslogik nicht vollständig nach § 2c BEEG fachlich geprüft ist, erfolgt keine automatische Zuordnung von Provisionen zum Elterngeld-Netto.

`src/historical-evidence.cjs` und `scripts/historical-report.mjs` prüfen Rechtskohorte, Dokumentstufe, Geldbetragsbeziehungen, Datenlücken und den Verzicht auf einen unzulässigen 2027-Replay-Claim. **Vier erfolgreiche Dokumentprüfungen bedeuten null vollständige historische Reproduktionen.**

## Gesetzes-/Planungsstand für 2027, Stand 15.10.2026

Versioniert in `data/rechtsentwicklungen-2027-2026-10-15.json`. Die Daten werden durch `npm run legislation:sync` aus der einzigen redaktionellen Quelle in die Offline-Datei eingebettet; `npm run legislation:check` überwacht Status-/Quellenkonsistenz.

| Thema | Stand am 15.10.2026 | Relevanz für den Rechner |
| --- | --- | --- |
| [2027er Kindergeld/Steuerreform, BT 21/8235](https://www.bundestag.de/dokumente/textarchiv/2026/kw41-de-einkommensteuerreform-1217520) | **Entwurf nach erster Lesung am 08.10.2026 an Ausschuss überwiesen** | 267 € Kindergeld 2027, 272 € ab 2028 und 1.430 € Arbeitnehmer-Pauschbetrag im Jahr 2027 bleiben **geplante Werte** – nicht automatisch gebuchte Ansprüche |
| [Antragsloses Kindergeld](https://www.bundesregierung.de/breg-de/aktuelles/kindergeld-ohne-antrag-2412916) | Parlamentarisch verabschiedet, schrittweise technische Einführung erst 2027 | Im Antragspfad nur der Hinweis „Zahlungsweg überprüfen“. Eine erste Geburt im Mai 2027 garantiert **keine antragslose Zahlung** |
| [KiBiz NRW, Fassung 01.08.2027](https://recht.nrw.de/lrgv/gesetz/01082027-gesetz-zur-fruehen-bildung-und-foerderung-von-kindern-kinderbildungsgesetz/) | **Verkündete gesetzliche Fassung** für NRW ab 01.08.2027 | § 5 KiBiz: grundsätzlich Bedarfsanzeige in Textform **sechs Kalendermonate vor Beginn**. Nicht mit Kölner Gebühren oder Platzgarantie verwechseln |
| [Elterngeldreform – politische Diskussion](https://www.bundesregierung.de/breg-de/suche/regierungspressekonferenz-vom-26-juni-2026-2445352) | Noch keine konkrete verabschiedete Neufassung der Bezugs- und Betragsregel | Keine willkürliche Änderung der Basis/Plus-Ansprüche oder Einführung einer „7+7-Monate“-Pflicht |

**Wichtige Jahresregel:** Nach [§ 2c Abs. 1 BEEG](https://www.gesetze-im-internet.de/beeg/__2c.html) gilt für den Arbeitnehmer-Pauschbetrag bei einer Geburt 2027 die Fassung, die am **01.01.2026** galt. Deshalb übernimmt unser Berechnungsmodell einen *vorgeschlagenen* Pauschbetrag für 2027 ausdrücklich **nicht** in eine 2027er Elterngeld-Nettoermittlung.

### Konkrete Terminrechnung für NRW

Die eigentliche KiBiz-Bedarfsanzeige wird nun aus dem Geburtsdatum und dem **gewählten Beginn der Betreuung in Lebensmonaten** berechnet:

- Geburt **28.05.2027**, Kita ab **LM 19**: Betreuungsbeginn **28.11.2028**, Anzeigefrist grundsätzlich **28.05.2028**.
- Kita ab **LM 18**: Betreuungsbeginn **28.10.2028**, Anzeigefrist grundsätzlich **28.04.2028**.
- Der Code subtrahiert sechs **Kalendermonate** und prüft auch Monatsenden und Schaltjahre; er verwendet keine pauschalen 180 Tage.
- Es wird **keine** automatisch bestätigte 2028er Kölner Gebühr und **kein** Anspruch auf den konkreten Betreuungsplatz angenommen.

## Prüf- und Releasegrenzen

Die technische Qualität wird über `npm test`, die Quellenkonsistenz über `npm run legislation:check`, die historischen Bescheidbeziehungen über `npm run historical:report` und der unverändert gesperrte Release über `npm run release:check` geprüft.

Weiter offen bleiben:
- echte, unabhängig rekonstruierbare komplette *anonymisierte Berechnungsbögen/Bewilligungsbescheide* aus passenden aktuellen Kohorten;
- eine vollständige Elterngeld-Nettoermittlung aus § 2b–§ 2f BEEG samt Steuer- und SV-Abzügen;
- die Differenz zwischen Familienportal und NRW-Auskunft bei Mutterschutz-Tagen;
- verbindliche neue Bundestagsbeschlüsse sowie kommunale 2027/28er Gebührentabellen;
- unabhängige fachliche Rechts-, Datenschutz- und Nutzertests.

Der öffentliche Release bleibt gesperrt; **keine** dieser fehlenden Bestätigungen darf durch einen erfolgreichen Softwaretest oder einen geänderten Versionswert ersetzt werden.
