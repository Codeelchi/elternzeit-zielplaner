# Budgetrobustheit und Antragsassistent

Prüfdatum: 14.10.2026. Beide Module sind lokal ausführbare, reine CommonJS-Funktionen und enthalten weder Netzwerkzugriff noch Speicherung personenbezogener Daten.

## Budget-API

`projectFamilyBudget({rows, expenses, minimum, assumptions, confirmedGrants})` aus `src/family-budget.cjs` erhält die vorhandenen Berechnungszeilen (`lm`, `fi`, `mi`, `fg`, `mg`, `kind`, `childcare`). Die Ergebniszeilen `income` und `cashAfter` werden bewusst aus den Komponenten neu zusammengesetzt, damit Szenariobänder unabhängig wirken.

`assumptions` akzeptiert `wagePercent` (Standard 15), `elterngeldPercent` (5) und `costPercent` (20). Vorsichtig verringert geschätzte Arbeitseinkommen und Elterngeld und erhöht Kosten. Günstig variiert in Gegenrichtung. Kindergeld, explizite Mutterschaftsleistungen und bestätigte Zusatzleistungen bleiben konstant. Bänder sind keine Konfidenzintervalle. Sie ersetzen weder eine amtliche Nettoermittlung noch Anspruchsprüfung.

`row.maternityBenefits` kann den in `fi + mi` enthaltenen Mutterschaftsanteil explizit aufteilen. Er wird nicht erneut hinzuaddiert. Ohne Aufteilung enthält das kombinierte Einkommen möglicherweise auch Mutterschaftsleistungen und wird vollständig als Schätzung variiert; ein Warnhinweis benennt diese Einschränkung.

`minimum` ist der pro Lebensmonat nach Haushalts- und Betreuungskosten zusätzlich gewünschte verfügbare Betrag. `requiredReserves` berechnet den maximalen kumulierten Fehlbetrag gegenüber diesem Ziel. Zwischenzeitliche Überschüsse stehen für spätere Engpässe zur Verfügung. Das ist weder die Summe negativer Monate noch eine Liquiditätsgarantie bei verzögerter Leistungszahlung.

Manuelle `row.grant`-Werte gehen nicht in das robuste Budget ein. `confirmedGrants` benötigen individuellen bestätigten Anspruch (`confirmed: true`), `sourceUrl`, `verifiedAt`, `validFrom`, `validUntil`, `entitlementDate`, `lm` und `amount`; der Anspruchstag muss im belegten Gültigkeitszeitraum liegen. Die Anwendung darf diese Bestätigung nicht automatisch aus einem Wohnort ableiten. Die API prüft die vorgelegten Metadaten, nicht den tatsächlichen Bescheid.

Rückgabe: drei `scenarios` mit Komponenten je Monat, `totalIncome`, `totalAvailable`, `lowestAvailable`, `bottleneckMonths`, `requiredReserves`, Annahmen und Warnungen. `basis: MODELLIERTER_LEISTUNGSANSPRUCH`, `bankReceiptsPredicted: false` trennt Anspruchsprojektion ausdrücklich von Bankbuchungen. Steuerliche Nachwirkung und individuelle Versicherungsbeiträge bleiben offen.

## Antrags-API

`buildApplicationGuide({birthDate, expectedBirthDate, region, city, leavePeriods, firstBenefitMonth})` aus `src/application-guide.cjs`. Elternzeitabschnitte werden als `leavePeriods.father` / `.mother` mit ISO-`startDate` und `endDate` übergeben. Jeder Abschnitt erhält separat die Sieben- beziehungsweise Dreizehnwochenfrist. Bei Beginn ab Geburt wird für die vorherige Anmeldung der errechnete Geburtstermin verwendet.

Elterngeld sollte unmittelbar nach Geburt beantragt werden. Nach [§ 7 Abs. 1 BEEG](https://www.gesetze-im-internet.de/beeg/__7.html) werden rückwirkend die drei Lebensmonate vor dem Eingangs-Lebensmonat berücksichtigt. Zur Sicherung ab LM 1 ist daher ein Eingang bis Ende LM 4 möglich. Das ist keine allgemeine Ausschlussfrist für jeden späteren Antrag; ältere Monate können verloren gehen. Ein gemeinsamer `firstBenefitMonth` bezeichnet den frühesten geplanten Anspruch beider Eltern. Bei späterem Bezugsbeginn gilt entsprechend LM `firstBenefitMonth + 3`.

[§ 16 BEEG](https://www.gesetze-im-internet.de/beeg/__16.html) nennt sieben Wochen vor Elternzeit bis zum dritten Geburtstag und dreizehn Wochen danach bis zum achten Geburtstag, außerdem den Bindungszeitraum. [§ 28 Abs. 1b BEEG](https://www.gesetze-im-internet.de/beeg/__28.html) regelt die alte Fassung für Geburten vor dem 1.5.2025. Frühgeburten, dringende Ausnahmen und individuelle Arbeitgeberabsprachen benötigen separate Prüfung.

Die Registrierung `REGIONS` erlaubt weitere Länderadapter. Aktuell werden nur NRW-Antragsroute und die Kölner Behörde vertieft bereitgestellt:

- [Familienportal NRW](https://familienportal.nrw/elterngeld)
- [Stadt Köln – Elterngeld](https://www.stadt-koeln.de/service/produkt/elterngeld)
- [Kölner Elterngeldstelle](https://www.stadt-koeln.de/service/adressen/elterngeldstelle)

Die Kölner Seite bestätigt die spezielle Geburtsurkunde, Einkommensnachweise, Mutterschaftsgeldnachweise und den NRW-Onlineweg mit BundID. Sie enthält zugleich historische Nachweisjahre (2021) und eine verkürzte Bonusbeschreibung (vier statt zwei bis vier Monate). Solche Passagen werden nicht als Berechnungsgrundlage übernommen. Digitale Unterschriften- und Originalanforderungen müssen vor Versand aktuell geprüft werden; der Rechner sendet keinen Antrag.

Regeln für zukünftige Geburten werden nicht pauschal bestätigt: `legalCoverage.futureBirthRequiresRecheck` und ein sichtbarer Warnhinweis markieren Geburten nach dem Prüfdatum. Regionale Zusatzleistungen werden aus der Checkliste nicht als Geldanspruch übernommen.

## Prüfung

13 neue synthetische Tests prüfen unabhängige Szenariobänder, kumulierte Rücklagen, Zielbudget, unbestätigte Zusatzleistungen, Mutterschaftszerlegung, Eingabefehler, NRW-/Kölner Zuständigkeit, Sieben-/Dreizehnwochenfristen, Geburtsterminabweichung, rückwirkenden Antrag und unbekannte Regionen. Ausführung: `node --test tests/family-budget.test.mjs tests/application-guide.test.mjs`.
