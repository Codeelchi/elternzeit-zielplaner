# Fachrecherche V3.10: Cent-Buchungen und belastbare Budgeteingaben

Prüfdatum: **16.10.2026**. Status: technische und quellenbasierte Eigenprüfung; **keine unabhängige fachliche oder rechtliche Freigabe**.

## Tatsächlich abgerufene amtliche Quellen

Alle vier Quellen wurden am Prüfdatum über HTTPS erfolgreich mit HTTP 200 abgerufen. Bei der Familienportal-Quelle wurde die endgültige Zieladresse nach Weiterleitung verwendet.

| Quelle | Nachgeprüfter Inhalt | Zeitliche Einordnung |
|---|---|---|
| [§ 2 BEEG](https://www.gesetze-im-internet.de/beeg/__2.html) | Elterngeld-Netto folgt §§ 2c–2f; Erwerbseinkommen nach Geburt beeinflusst den Unterschiedsbetrag; Basis- und Plus-Einkommensgruppen sind getrennt zu berechnen. | Beim Abruf veröffentlichter Gesetzestext. Kein selbstständiger Nachweis einer künftigen Geburtskohorte. |
| [§ 3 BEEG](https://www.gesetze-im-internet.de/beeg/__3.html) | Mutterschaftsleistungen werden angerechnet; bei Teil-Lebensmonaten erfolgt eine entsprechende anteilige Anrechnung. | Beim Abruf veröffentlichter Gesetzestext. Die konkrete offene Tageszählung wird damit nicht entschieden. |
| [Wie viel Elterngeld kann ich bekommen? – Familienportal](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-viel-elterngeld-kann-ich-bekommen--124616) | Plus ist bei Teilzeit nicht grundsätzlich halb so hoch wie Basis; Einkommen ist ein maßgeblicher Faktor. Elterngeld ist steuerfrei, unterliegt aber dem Progressionsvorbehalt. | Informationsstand der tatsächlich abgerufenen Seite am 16.10.2026, ohne gesonderte Zukunftszusage. |
| [BEEG-Richtlinien, Stand 07/2026](https://www.bmbfsfj.bund.de/resource/blob/243236/8a26d08d56511511e2fb7c9d5236b4de/richtlinien-zum-beeg-data.pdf) | Abschnitt 2.0.3.3.1, gedruckte Seite 56 / PDF-Seite 90: Eurobeträge einschließlich Zwischenergebnissen auf volle Cent runden; erste wegfallende Ziffer ab 5 aufrunden. | Veröffentlichter Richtlinienstand Juli 2026, Abruf 16.10.2026. Keine automatische Bestätigung des Rechts für alle Geburten 2027. |

Der erneut abgerufene Richtlinien-PDF hat SHA-256 `bccc545d3fc9aabcf18f1ca338557d39cec8856db727e2372f7c61535912ca46`. Er stimmt mit dem bereits dokumentierten Prüfstand vom 15.10.2026 überein. Der Rechtsregel-Katalog wird durch diese Prüfung nicht auf eine zukünftige Kohorte erweitert.

## Konkreter Fehler und Umsetzung

Die Familienbudget-Projektion summierte bislang rohe JavaScript-Fließkommazahlen. Ein rechnerisch ausgeglichener Monat konnte dadurch einen minimal negativen Saldo erhalten: **0,30 € Einkommen − 0,10 € Betreuung − 0,20 € Haushalt**. Die Folge waren ein falscher Engpassmonat und ein positiver Rücklagenbedarf; bei auf ganze Euro aufgerundeten Anzeigen konnte daraus ein sichtbarer Euro werden.

`src/family-budget.cjs` bucht jetzt zunächst jede Szenariokomponente auf volle Cent. Summen, Mindestbetragsdifferenzen und kumulierte Präfixsalden werden anschließend in ganzzahligen Cent gebildet. Erst die API-Ausgabe wird zurück in Euro umgerechnet. Damit lassen sich angezeigte Einzelposten und Monatssalden nachvollziehbar abstimmen. Der Rücklagenbedarf bleibt weiterhin der maximale kumulierte Fehlbetrag über den Zeitraum, nicht die Summe sämtlicher Engpassmonate.

Die Richtlinie ist eine Grundlage für die **Elterngeld-Rundung**. Die Anwendung derselben Cent-Buchung auf geschätzte Löhne und Kosten ist eine ausdrücklich technische Budgetkonvention. Sie macht die Budgetprojektion weder zu einer amtlichen Berechnung noch zu einer Prognose tatsächlicher Bankeingänge. Die Komponenten der beiden Eltern werden getrennt gerundet. Bestätigte Zusatzleistungen werden pro Buchung centgenau erfasst und unverändert in allen drei Szenarien berücksichtigt.

Zusätzlich verwirft die Direkt-API keine Fehler mehr durch automatische JavaScript-Typumwandlung: `true`, Arrays, Objekte und ausschließlich aus Leerzeichen bestehende Strings sind keine Eurobeträge. Nichtnegative Zahlen und numerische Strings bleiben möglich; die bestehenden optionalen `null`-/Leerwert-Defaults bleiben erhalten. Die technische Eingabegrenze entspricht dem vorhandenen Money-Modul: eine Milliarde Euro pro eingegebenem Betrag. Sie ist keine gesetzliche Anspruchsgrenze. Nicht endliche Eingaben werden ebenfalls explizit abgewiesen; aus zulässigen Eingaben prozentual abgeleitete Szenariowerte können höher als der technische Eingabehöchstbetrag sein.

Ungültige Monats-/Annahmen-/Listencontainer führen zu verständlichen Fehlern. Nicht bestätigte oder strukturell fehlerhafte Zusatzleistungs-Einträge bleiben mit Ablehnungsgrund außerhalb des Budgets. Eine HTTPS-Adresse allein bestätigt weiterhin **keinen Anspruch**: die Schnittstelle setzt die vorgelagerte individuelle Bestätigung samt gültigen Quelldaten voraus.

## Gezielte Regressionen

`tests/v310-calculation.test.mjs` ergänzt synthetische Fälle für:

- exakt ausgeglichene Cent-Monate ohne Phantomrücklagen;
- 96 Monate ohne Drift bei Gesamtsumme und Präfixsaldo;
- separat gerundete Einkommens-, Leistungs- und Kostenkomponenten;
- unzulässige Typumwandlungen in der direkten Budget-API;
- ungültige Container und sicher ausgeschlossene fehlerhafte Zusatzleistungen;
- individuelle Cent-Buchungen bestätigter Zusatzleistungen;
- gleiche, exakte Engpasszahlen im direkten Planvergleich;
- getrennte Cent-Rundung der Elterngeldbeträge beider Eltern.

Zusätzlich prüfen drei Regressionen die exakte Prozentmultiplikation, 7.000 unabhängig mit Integer-Arithmetik berechnete Vergleichsfälle und ungültige Prozentangaben. Der gezielte Lauf umfasst elf neue Regressionen, die 21 bestehenden Budget-/Vergleichstests sowie sieben bestehende Money-Tests: **39/39 erfolgreich**. Die vollständige Repository- und Browserprüfung erfolgt nach der Aktualisierung der eingebetteten Module.

## Offene fachliche Grenzen und sinnvolle nächste Schritte

1. **Mutterschutz-Teilmonat bleibt offen.** Es wurde weder die Tageszählung geändert noch eine fachliche Abnahme suggeriert. Die veröffentlichte Abweichung muss unabhängig geklärt werden.
2. **Steuern und Krankenversicherung:** Der Progressionsvorbehalt ist amtlich belegt. Ein pauschaler Steuernachzahlungsbetrag wäre ohne persönliche Jahresdaten unzuverlässig. Weiterhin als mögliche Nachwirkung erläutern und eigene Rücklage ermöglichen; keine beliebige zusätzliche Leistung anrechnen.
3. **Elterngeld-Netto und Auszahlungs-Netto:** Diese Angaben bleiben fachlich verschieden. Die bestehende getrennte Datenerfassung und die Trennung von Basis-/Plus-Einkommensgruppen sind beizubehalten. Keine versteckte Gleichsetzung über eine bessere Oberfläche einführen.
4. **Szenariobänder sind Annahmen.** Der vorsichtige Verlauf besitzt keine amtlich validierte Eintrittswahrscheinlichkeit. Auch ein positiver modellierter Anspruch beseitigt keine Liquiditätslücke bei verzögertem Bescheid oder Zahlungseingang.
5. **Kein globales Suchoptimum:** Centgenauigkeit macht den Budgetvergleich stabiler, beweist aber weder Vollständigkeit der Plansuche noch die fachliche Eignung jedes Sonderfalls.

## Nachprüfung: Prozentmultiplikation und Suchgeschwindigkeit

Eine unabhängige Integer-Gegenrechnung zeigte einen weiteren Centfehler: `1,70 × 0,85` liegt mathematisch bei `1,445`, kann in binärer JavaScript-Arithmetik jedoch bereits vor der Rundung darunter liegen. Der bisherige Aufruf `roundEuro(value * factor)` konnte die verlorene Präzision nicht wiederherstellen. `roundEuroByPercent(value, deltaPercent)` im Money-Modul bildet deshalb die Prozentmultiplikation selbst als exakten dezimalen BigInt-Bruch und rundet erst den Betrag. Die Budget-Prozentangaben bleiben dabei originale Prozentwerte, ohne Division-danach-Multiplikation-Rundreise. Pflichtregressionen: 1,70 € minus 15 % = **1,45 €**, 2,30 € → **1,96 €**, 3,30 € → **2,81 €**, 4,10 € → **3,49 €**.

Die wiederholte BigInt-Konversion bei jedem Suchkandidaten war zu langsam. Zwei private, auf jeweils **4.096 numerische Einträge** begrenzte Memos speichern Cent-Konversionen und Prozentresultate. Sie speichern weder Namen noch Monatszeilen oder Planobjekte und werden nicht persistiert oder übertragen. Bei Erreichen des Limits werden sie geleert; die Rundungsregeln bleiben unverändert.

Reproduzierbarer synthetischer Node-Mikrobenchmark: 5.000 Budgetaufrufe mit je 36 Lebensmonaten und drei Szenarien, 20 Warm-up-Aufrufe, typische wiederkehrende Lohn-/Leistungs-/Kostenwerte. Vor Memoisierung **7.799 ms**, mit Memoisierung zunächst **309 ms** (gleiche Prüfsumme 34.950.000). Mit zusätzlich exakter Prozentrechnung **549 ms**, unveränderte Prüfsumme (rund 14-fache Beschleunigung gegenüber dem ungememoisierten Lauf). Diese Messung belegt die lokale Rechenverbesserung, keine garantierte Browser-Laufzeit.
