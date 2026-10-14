# Entwicklungs-Roadmap

Stand: 2026-10-14 · Ausgangspunkt v3.1

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
