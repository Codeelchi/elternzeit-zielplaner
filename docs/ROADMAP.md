# Entwicklungs-Roadmap

Stand: 2026-10-14 · Ausgangspunkt v3.1

**Umsetzungsstand 14.10.2026 / V3.1.1:** Der JSON-Regelkatalog wird als einzige redaktionelle Quelle in die Offline-App eingebettet, der Build prüft Datendrift. 34 reproduzierbare Monatsbetrags-Fälle (8 direkt veröffentlichte Beispiele, 4 amtliche Grenzwerte, 22 abgeleitete Berechnungsfälle) plus ein amtlicher Mutterschutz-Zeitfall sind als Tests erfasst. Das ist keine vollständige amtliche Fachabnahme: unter anderem Elterngeld-Netto-Berechnung, komplexe Zeitachsen und unabhängige Bescheidvergleiche bleiben offen. Siehe [Testnachweis](REFERENZFAELLE-UND-GRENZEN.md).

## P0 · Fachliche Absicherung vor produktiver Nutzung

- Fachliche Testfälle gegen den amtlichen Elterngeldrechner und realistische Musterfälle vergleichen; Unterschiede dokumentieren.
- Berechnung von Elterngeld-Netto statt einfacher Brutto-Netto-Schätzung für abhängige Beschäftigung präzisieren (Sozialversicherung, Pauschalen, Steuerklasse, Bemessungszeitraum).
- Mutterschaftsgeld, Arbeitgeberzuschuss, tatsächlicher Mutterschutz und taggenaue Anrechnungen absichern.
- Regeln für schwankende Teilzeiteinkommen, Bemessungszeiträume und Bezugsgruppen sowie Partnerschaftsbonus separat validieren.
- Sonderfälle (Frühgeburt, Mehrlinge, Geschwisterbonus, Selbständigkeit, Einkommensersatzleistungen, Alleinerziehende, unterschiedliche Erwerbsverläufe) als Eingaben oder explizit nicht unterstützt kennzeichnen.
- Landesregelungen und kommunale Betreuungskosten mit Gültigkeitsdatum und eindeutiger Quelle nachprüfen, insbesondere bei zukünftigen Geburten.

## P1 · Optimierer und Finanzplanung

- Vollständiger, nachvollziehbarer Regelvalidator als reine Funktion mit maschinenlesbaren Fehlercodes.
- Zielsuche mit Coverage-Nachweis (erzeugte Muster versus gesamter Suchraum) und nachvollziehbarer Priorisierung.
- Zielgewichtungen: Mindestbetrag pro Lebensmonat, maximale Betreuung durch Eltern, Aufteilung und gleichzeitige Freistellung, Teilzeitgrenzen.
- Fairness-Berechnung über beide Eltern sowie Liquiditäts- und Rücklagenbedarf (ungedeckte Monate / Mindestbudget).
- Unsicherheitsmodelle für Teilzeit netto, Bonus, Gebühren, Steuerprogression und unsichere Gesetzeslage.
- Eigene Betreuungsereignisse (Kita-Eingewöhnung, Starttermin, private Kosten und flexible Stunden).

## P2 · Technologie und Qualität

- Monolithen `index.html` in `src/model`, `src/rules`, `src/solver`, `src/ui` refaktorieren und dabei eine offline nutzbare Einzeldatei bauen.
- Browser-E2E-Tests für mobile/desktop, Import/Export, Accessibility und Visual Regression.
- Für jede veränderliche Rechtsregel Quelle, geprüftes Datum, Gültigkeitsintervall und Verifikationsstatus bereitstellen.
- Datensparsame lokale Plan-Versionierung; keinen automatischen Transfer sensibler Familienfinanzdaten.
- Testfälle/Provenienz für jede Rechtsregel und Datenquelle als nachvollziehbare Fixtures aufnehmen.

## Qualitätskriterium

Ein Suchergebnis darf erst als **rechtlich plausibel** markiert werden, wenn es den Validator durchläuft. Eine Zahl darf erst als **amtlich vergleichbar** markiert werden, wenn der entsprechende Berechnungsfall gegen eine verbindliche Quelle oder einen bewährten Referenzfall geprüft wurde. Ansonsten sichtbar als Näherung kennzeichnen.

## Fortschritt 14.10.2026 / V3.3.0

Issue #4: strukturierte Engine und UI integriert; Review offen. Issue #3: mehrere Kalenderabschnitte, unabhängige Arbeit/Leistung und tatsächliche Buchungen integriert; amtliche Mutterschutzabweichung bleibt Fachblocker. Issue #5: drei erläuterte Suchprofile und strenge Regel-/Budgetfilter integriert. Issues #6/#7/#8: Budgetreserven, NRW/Köln-Checkliste, lokale Einwilligung und Browser-/Axe-Gates vorhanden. Vollständige Abnahme, noch fehlende unabhängige Referenzrechnungen und echte Nutzertests bleiben offen; siehe MVP-Abnahmebericht. Keine Issues allein durch diese Teilimplementierungen schließen.

## Fortsetzung 15.10.2026 / V3.4.0

Vollständiger Achsen-/Bankbuchungsimport, konservative Typ-/Quellenprüfung, personenbezogene Einkommensbänder und mütterliche/väterliche Schwerpunktvarianten integriert. Fachlicher Tagesbruchvergleich bleibt trotz bestätigtem Kalenderdatum offen; siehe [aktueller Bericht](MVP-ABNAHME-2026-10-15.md). Kein öffentlicher Release.
