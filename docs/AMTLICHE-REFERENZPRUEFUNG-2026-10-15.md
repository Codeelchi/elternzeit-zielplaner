# Amtliche Rechenbeispiele und Rechtsstand 2027 – Prüflauf vom 15.10.2026

**Entwicklungsstand:** V3.5.0 (Feature-Branch; keine öffentliche Freigabe)
**Quellen:** öffentlich zugängliche amtliche Erläuterungen, Gesetzesnormen und ein widersprüchliches Behördenbeispiel.
**Abgrenzung:** Es handelt sich **nicht** um reale, anonymisierte und individuell bewilligte Elterngeldbescheide. Die Behörden selbst veröffentlichen meist *illustrative Zahlenbeispiele*. Solche Beispiele sind unabhängig vom Projekt und gut für reproduzierbare Kontrollwerte, ersetzen aber keine Prüfung der vollständigen Elterngeld-Nettoermittlung.

## Nachweis der zusätzlichen Fälle

Die Ausgangssuite enthält 34 Betragsprüfungen. Neu hinzugekommen sind **2 zusätzliche amtlich veröffentlichte Monatsbeträge**, **8 veröffentlichte 12-/24-Monats-Gesamtsummen** und **4 veröffentlichte Monatswerte aus dem zweielterlichen L-Bank-Beispiel**. Die Summen werden nicht nur durch Multiplikation unserer Betragsfunktion, sondern zusätzlich anhand einer **36-Lebensmonate-Simulation** der laufenden Anwendung geprüft.

| Amtliche Eingaben (Elterngeld-Netto) | Modell | Öffentlicher Kontrollwert |
|---|---|---:|
| Vor Geburt 650 €, nach Geburt 0 € | Basis (84,5 %) | 549,25 € je LM |
| Vor Geburt 250 €, nach Geburt 0 € | Basis (Mindestbetrag) | 300 € je LM |
| Vor Geburt 2.000 €, danach 0 € | 12 LM Basis | 15.600 € |
| Vor Geburt 2.000 €, danach 0 € | 24 LM Plus | 15.600 € |
| Vor Geburt 2.000 €, danach 500 € | 12 LM Basis | 11.700 € |
| Vor Geburt 2.000 €, danach 500 € | 24 LM Plus | 15.600 € |
| Vor Geburt 2.000 €, danach 1.200 € | 12 LM Basis | 6.240 € |
| Vor Geburt 2.000 €, danach 1.200 € | 24 LM Plus | 12.480 € |
| Vor Geburt 3.200 €, danach 1.570 € | 12 LM Basis, vorgeburtlich 2.770 € gedeckelt | 9.360 € |
| Vor Geburt 3.200 €, danach 1.570 € | 24 LM Plus, vorgeburtlich 2.770 € gedeckelt | 18.720 € |

Quelle: [Bundesfamilienportal: Höhe des Elterngelds – mit tabellarischen Beispielen](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-viel-elterngeld-kann-ich-bekommen--124616); [Bundesfamilienportal: Arbeit und Einkommen, Beispiele 650/250 Euro](https://familienportal.de/familienportal/familienleistungen/elterngeld/arbeitssituation).

**Ergebnis:** 34 bisherige Einzelbetragsprüfungen und 14 neue Vergleichswerte (insgesamt **48 monetäre Kontrollen**) stimmen im ausdrücklich eingegrenzten Standardmodell mit den veröffentlichten Beträgen überein. Die acht Dauerwerte setzen zwei Elternteile im Plan an, rechnen aber nur den Leistungsanteil des betrachteten Elternteils zusammen. Das ist ein Test der **Betrags- und Bezugsdauerlogik bei vorgegebenem maßgeblichem Netto**, kein vollständiger Vergleich von echten Bescheiden.

### Zusätzlich: vollständiger veröffentlichten L-Bank-Einkommensverlauf

Das **amtliche Hinweisblatt der L-Bank Baden-Württemberg** (Seite 3, Fassung 2023; die Zahlen sind auch im Hinweisblatt für Geburten ab Mai 2025 dokumentiert) enthält einen real veröffentlichten **zweielterlichen Musterfall** mit veränderlichem Erwerbseinkommen:

| Elternteil | EG-Netto vor Geburt | Nettoeinkommen nach Geburt | Durchschnitt Plus-/Bonusgruppe | Basisbetrag | Plus-/Bonusbetrag |
| --- | ---: | --- | ---: | ---: | ---: |
| Mutter | 2.800 € | 4 × 1.200 € und 4 × 1.780 € | 1.490 € | **1.800 €** | **832 €** |
| Vater | 3.000 € | 1.500 €, 2.000 € und 4 × 2.200 € | 2.050 € | **1.800 €** | **468 €** |

[Originalquelle: L-Bank, Beispiel auf S. 3](https://www.l-bank.de/download/version/bfbe9e62-90cd-446b-b2a0-a8dab7290cb8/elterngeld-hinweisblatt-zum-antrag-fuer-geburten-adoptionen-ab-01.09.2021_25-07-2023.pdf). Mit der neuen **monatlich getrennten Eingabe von Erwerbsnetto und Elterngeld-Netto** reproduziert die laufende 36-Monatsberechnung die genannten vier Beträge einschließlich der Mittelung über die abweichenden Teilzeitmonate. Das Beispiel selbst setzt Mutterschaftsgeld in drei Lebensmonaten voraus; **dieser Mutterschutz-Sonderfall wird im derzeitigen Standardmodell nicht nachgebildet und bleibt nicht fachlich validiert**. Getestet sind die Erwerbsgruppen und Beträge, nicht der gesamte historische Antragsfall.

Als Verbesserung sind in der Ansicht „Zeitplan“ vier **optionale Einzelmonatswerte** hinzugekommen. Leer bedeutet bisherige Stundenschätzung. Eingegebene Monatsnettos werden als Zahlen validiert, mit JSON gespeichert und dürfen nicht in Monaten ohne die entsprechende Erwerbstätigkeit/Leistungsart stillschweigend als Anspruch gelten. Ebenso wichtig: Diese Werte werden **manuell angegeben** und bleiben Schätzungen; es findet keine amtlich zertifizierte automatische Elterngeld-Nettoermittlung aus Bruttolohn statt.

Maschinenlesbare Prüfdaten: `data/amtliche-beispielrechnungen-2026-10-15.json`. Reproduzierbarer Bericht: `npm run references:report`; Output: `qa/reference-deltas-current.json`.

## Mutterschutz: Zwei amtliche Quellen weichen um einen Tag ab

**Beispiel: Geburt am 20. Mai, Schutzfrist 8 Wochen, Lebensmonat 2 vom 20. Juni bis 19. Juli (30 Tage).**

| Quelle | Ende geschützter Tag | Unbedeckte Tage in LM2 | Evidenz |
|---|---|---:|---|
| [Bundesfamilienportal: Mutterschaftsleistungen und Elterngeld](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/kann-ich-elterngeld-und-mutterschaftsleistungen-bekommen--124776) | 14. Juli | **5/30** | Ausdrücklich veröffentlichtes Rechenbeispiel |
| [NRW-KomNet Arbeitsschutz](https://www.komnet.nrw.de/_sitetools/dialog/4244) | 15. Juli | **4/30** | Amtliche Erläuterung der Frist gemäß BGB §§ 187, 188 |
| [§ 3 Abs. 2 MuSchG](https://www.gesetze-im-internet.de/muschg_2018/__3.html), [§ 24i Abs. 3 SGB V](https://www.gesetze-im-internet.de/sgb_5/__24i.html) | 15. Juli nach angewandter Kalenderlogik | **4/30** | Schutzfrist acht Wochen **nach** Geburt; Mutterschaftsgeld zusätzlich für den Entbindungstag |
| [Bundesgesundheitsministerium, Stand 03.09.2026](https://www.bundesgesundheitsministerium.de/schwangerschaft-krankenversicherung/seite) | kein konkretes Beispiel | – | Geburt und anschließende acht Wochen werden getrennt beschrieben |

Das interne Zeitachsen-Modul berechnet aktuell **26 geschützte und 4 unbedeckte Tage** in Lebensmonat 2, die FAQ **25 geschützte und 5 unbedeckte Tage**. Die unvereinbaren Behördenangaben sind weiterhin offen. **Kein stiller Ein-Tages-Fix, keine Änderung der amtlichen Erwartungswerte, kein positives Referenz-Gate.** Eine nachvollziehbar dokumentierte Klärung mit der zuständigen Elterngeldstelle beziehungsweise zuständigen Behörde ist für eine rechtsverbindliche Korrektur erforderlich.

### Konkrete amtliche Klärungsanfrage (noch nicht versendet)

Für eine fachliche Rückmeldung der zuständigen Elterngeldstelle bzw. Mutterschaftsgeldstelle ist folgende Frage mit **synthetischen Daten** vorbereitet:

> Bei regulärer Einzelgeburt am **20.05.2026**, errechnetem Termin ebenfalls 20.05.2026, Mutterschaftsgeld/Arbeitgeberzuschuss und acht Wochen gesetzlicher Nachgeburtsfrist: Welches konkrete **Enddatum einschließlich** gilt für den Anspruch auf Mutterschaftsleistungen, der mit Basiselterngeld verrechnet wird? Der zweite Lebensmonat läuft vom **20.06. bis 19.07.2026 (30 Tage)**. Im veröffentlichten Familienportal-Beispiel werden **fünf** verbleibende Elterngeldtage genannt; die berechnete achtwöchige Schutzfrist nach BGB §§ 187/188 und die NRW-KomNet-Auskunft ergeben **vier**. Welcher Datums- und Anrechnungsweg wird in einem realen Bewilligungsverfahren angewendet, und auf welche Rechtsnorm, Richtlinie oder Berechnungsanweisung stützt er sich?

Bis zur schriftlich nachvollziehbaren Klärung bleibt die Differenz als **fachlich ungeklärt** dokumentiert. Diese Anfrage wurde nicht an eine Behörde versendet; es wurde keine Antwort simuliert.

## 2027: Prognose und bestätigter Rechtsstand strikt trennen

BEEG §§ 1–4b sind am 15.10.2026 abrufbar; daraus folgt **nicht**, dass zukünftige Geburten 2027 bereits abschließend fachlich geprüft sind. Der Rechner unterstützt für 2027 jetzt **nur unverbindliche Szenariosuche**:

- Die endgültige Validierung bleibt `NICHT_UNTERSTUETZT` und `valid=false`.
- Bei bestätigt eingegrenztem Standardfall, vorhandenem Vorjahres-zvE und fehlerfreien sonstigen Regelprüfungen darf `provisionalPlanningEligible=true` werden. Das gilt nur vom 01.01. bis 31.12.2027 und nur für das ausdrücklich als *unverified_forecast_only* markierte Zeitfenster.
- Vorschläge werden mit einer deutlich sichtbaren Prognosewarnung dargestellt. Sie dürfen niemals als rechtsgeprüft oder bewilligungsfähig bezeichnet werden.
- Sonderfälle, fehlende Angaben, unzulässige Modelle und Geburten ab 2028 dürfen diese Vorschau-Schranke nicht passieren.

**Kindergeld 2027:** 267 €/Monat und 272 €/Monat ab 2028 stammen aus dem [Regierungsentwurf vom 02.09.2026](https://www.bundesfinanzministerium.de/Content/DE/Pressemitteilungen/Finanzpolitik/2026/09/2026-09-02-einkommensteuerreform.html). Laut [DIP-Bundestag, Vorgang 338787](https://dip.bundestag.de/vorgang/einkommensteuerreformgesetz-2027/338787) befindet sich der Gesetzentwurf zum Prüfzeitpunkt im parlamentarischen Verfahren. Diese Zahlen sind **geplant, nicht als geltende Leistung eingetragen**. Der 2026-Wert 259 € ist weiterhin der bestätigte Standard; Nutzer können einen geplanten Wert als Szenario manuell wählen, der Rechtsstatus bleibt ungeprüft.

## Nicht durch die Referenzbeispiele abgedeckte Fachfragen

1. **Brutto → pauschaliertes Elterngeld-Netto** aus §2b–§2f BEEG (Bemessungszeitraum, Arbeitgeberabrechnung, Werbungskosten, Steuerklassen, Sozialversicherungsbeiträge, Sonderzahlungen) ist weder unabhängig berechnet noch fachlich abgenommen.
2. Mutterschaftsgeld und Arbeitgeberzuschuss als **tatsächliche Einzelzahlungen** sind nicht durch einen veröffentlichten Gesamtbewilligungsfall bestätigt.
3. Steuern/Progressionsvorbehalt, Versicherung, Rückforderungen, Sonderfälle und landesrechtliche Anspruchsvoraussetzungen sind nur als Schätzgrenzen / nicht unterstützte Fälle behandelt.
4. Echte anonymisierte Leistungsbescheide mit Einwilligung oder amtlich bestätigte vollständige Referenzfälle wären ein nächster zulässiger Vergleich. Keine privaten Dokumente ohne Einwilligung sammeln oder veröffentlichen.
5. Fachliche Prüfung durch eine unabhängige zuständige Stelle, Datenschutzreview und Nutzertests sind **ausstehende externe Freigaben** und können nicht durch den Codestand allein ersetzt werden.

Die automatische Release-Sperre in `data/release-gates.json` bleibt aktiv. Änderungen am Genehmigungsstatus sind **nur nach echtem externem Review** zulässig.
