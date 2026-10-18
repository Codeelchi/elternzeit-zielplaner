# Externe Fachabnahme: neutrale Referenzfall-Vorlage

**Stand 17. Oktober 2026 – UNBEARBEITETE VORLAGE, KEINE BESTÄTIGUNG.** Sie enthält absichtlich **keinen** vom Elternzeit-Zielplaner erzeugten Sollwert. Die Reviewer sollen zuerst die anwendbaren Regeln und erwarteten Werte **unabhängig** herleiten und dokumentieren. Dieses Dokument ersetzt keine tatsächliche Beratung, Behördenauskunft oder rechtliche Freigabe.

## A. Zuordnung und Eingrenzung

- Kennung aus `data/independent-case-requests-2026-10-17.json`: **noch einzutragen**
- Fachreviewer / Rolle / unabhängige Stelle: **offen**
- Prüfdatum, für die Prüfung genutzte Dokument- und Rechtsfassungen: **offen**
- Familienfall: unterstützter Standardfall? **noch nicht entschieden**
- Geburtsdatum / ggf. errechneter Geburtstermin: **offen**
- Sonderfälle und ausdrückliche Nichtabdeckung: **offen**
- Rechts-/Quellenbelege je Regel mit genauer Fundstelle, Fassung, Wirksamkeitsdatum und Abrufdatum: **offen**

## B. Originaleingaben (keine automatisch abgeleiteten Sollwerte)

| Prüfung | Wert / Beleg |
| --- | --- |
| Elternteil 1: Einkommensart, Bemessungsmonate, Brutto-Bestandteile | offen |
| Elternteil 1: Auszahlungsnetto vs. **Elterngeld-Netto** mit Herkunft | offen |
| Elternteil 2: Einkommensart, Bemessungsmonate, Brutto-Bestandteile | offen |
| Elternteil 2: Auszahlungsnetto vs. **Elterngeld-Netto** mit Herkunft | offen |
| Vor-/nachgeburtliche Mutterschutzfrist; tatsächliche Leistungen und Entbindungstag | offen |
| Geburtsdatum, Familienstand-/Haushaltskonstellation und Einkommensgrenze | offen |
| Arbeitsstunden, Bezugskombinationen und zugehörige Lebensmonate | offen |
| Ausgaben, Rücklagen und getrennte Zahlungsannahmen | offen |
| Sonder-/Ausschlussmerkmale | offen |

## C. Unabhängig hergeleiteter Sollverlauf

Vor Ausführung des zu prüfenden Codes je Lebensmonat (mindestens alle beanspruchten Leistungsmonate) ausfüllen:

| LM | von–bis | Bezug A/B | Mutterschutztage / anrechenbare Leistung | unabhängiger Elterngeld-Sollbetrag A | unabhängiger Elterngeld-Sollbetrag B | Rundungs-/Quellenfundstelle |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | offen | offen | offen | **offen** | **offen** | offen |
| 2 | offen | offen | offen | **offen** | **offen** | offen |
| weitere | entsprechend ergänzen | | | | | |

**Zwingend separat:** modellierter Anspruch nach **Lebensmonat**, erwartete Geldzuflüsse nach **Kalendertag** und tatsächlich manuell erfasste **Bankbuchungen**. Es darf kein tatsächlicher Zahlungstermin allein aus einem berechneten Anspruch erfunden werden.

Für den **20.-Mai-Mutterschutzfall** zusätzlich schriftlich prüfen: Geburt/errechneter Termin, Auslöser/Startpunkt, Ende der Nachgeburtsfrist, Entbindungstag, letzter tatsächlicher Tag des Mutterschaftsgelds, BEEG-Anrechnung, Resttage und Nenner/Teilbetragsrundung. **Bestehender Widerspruch: 4/30 gegen 5/30; keine Variante vorab als richtig festlegen.**

## D. Unabhängige Abnahme und Abweichungsbericht

1. **Externer Sollwert angefertigt vor Codeabgleich:** ja / nein / offen
2. **Art des Belegs:** veröffentlichter amtlicher Zahlenfall / behördliche schriftliche Auskunft / qualifizierte unabhängige Rechnung / andere: offen
3. **Fachliche Geltung und Einschränkungen:** offen
4. **Bei Abweichung:** betroffener LM, Eingabe, Zwischenwert, Ursache und ggf. unterschiedliche Rechtsauslegung: offen
5. **Betrags-Toleranz/Rundungsregel einschließlich Quellenbeleg:** offen
6. **Entscheidung:** bestätigt / abweichend / nicht prüfbar / zurückgewiesen – derzeit **OFFEN**
7. **Freigabe durch befugte verantwortliche Rolle:** Name/Rolle, Datum und Nachweis – **NICHT VORHANDEN**
8. **Exakte Programm-/Regelkatalog-SHA des nachträglichen Abgleichs:** erst nach unabhängigem Sollwert ausfüllen

Eine bloße Übereinstimmung mit einem anderen **unverbindlichen** Online-Rechner ist kein vollständiger Behördennachweis. Persönliche Bescheide nur mit rechtskonformem Umgang und möglichst durch synthetische, datensparsame Fälle ersetzen.

## E. Bereits vorbereitete Fallkennungen

| ID | Was muss unabhängig geprüft werden? | Externe Entscheidung |
| --- | --- | --- |
| `basis12` | 12 Basis-Monate und Mutterschutz | **ausstehend** |
| `plus24` | 24 ElterngeldPlus-Monate | **ausstehend** |
| `parttime500` | Teilzeit mit 500 EUR nachgeburtlichem Elterngeld-Netto | **ausstehend** |
| `parttime1200` | Teilzeit mit 1.200 EUR nachgeburtlichem Elterngeld-Netto | **ausstehend** |
| `low-income` | Geringverdienst/Ersatzrate | **ausstehend** |
| `maximum` | Höchstbetrag/Deckelung | **ausstehend** |
| `bonus` | Partnerschaftsbonus und Monatsdurchschnitt | **ausstehend** |
| `month-end` | Geburt am Monatsende/Lebensmonatswechsel | **ausstehend** |
| `siblings` | Geschwisterbonus mit anwendbarer Kohorte | **ausstehend** |
| `maternity-conflict` | 20. Mai / Mutterschutzdelta 4 gegen 5 Tage | **ausstehend** |

Die Datei `data/independent-case-requests-2026-10-17.json` hält für alle diese Fälle `independentlyVerified: false` und **leere externe Sollwerte**. Ein Prüfformular zu haben, macht daraus **keinen** abgenommenen Fall. Der bestehende `npm run independent-cases:check` kontrolliert den historischen Nullstand; sobald echte externe Nachweise vorliegen, muss sein Freigabeprozess gesondert und nachvollziehbar erweitert werden.

Siehe [P0-Roadmap](ROADMAP.md), [vorheriger fachlicher Klärungsauftrag](ROADMAP-FACHABNAHME-V314-2026-10-17.md) und [öffentliche Freigabegates](../data/release-gates.json).
