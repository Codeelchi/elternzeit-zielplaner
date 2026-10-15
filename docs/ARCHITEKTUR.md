# Architektur V3.7.0

Die verteilbare Anwendung bleibt eine einzelne `index.html`, ohne Backend, Konto, Laufzeitpakete oder Telemetrie. Node-Abhängigkeiten dienen ausschließlich Entwicklung und Tests. Diese Entscheidung erhält die Offline-Verteilung und vermeidet die Übertragung privater Haushaltsdaten.

## Fachlicher Datenfluss

1. Der datierte JSON-Rechtskatalog ist die Quelle für Rechtsparameter. `rules:sync` erzeugt den HTML-Snapshot; `rules:check` blockiert Drift.
2. `src/time-axes.cjs` erzeugt Lebensmonate, taggenauen Mutterschutz, Kalender-Elternzeit, Arbeits- und Leistungsachsen sowie separat validierte tatsächliche Buchungen.
3. `src/planning-model.cjs` übersetzt unabhängig erfasste Arbeitsstunden und Leistungsarten in Eingaben der bestehenden Finanzformel. Elternzeitintervalle verändern keine Löhne oder Leistungsarten. Die alten Monatscodes bleiben als kompatible Eingabe erhalten.
4. `src/rule-validator.cjs` prüft die Planung gegen den Katalog. Nur `PLAUSIBEL_STANDARD` erlaubt ein positives Standardlabel. Quellenlücken, fehlende Angaben und nicht unterstützte Fälle verhindern es.
5. Die bestehende Finanzformel berechnet geschätzte Ansprüche und Einkommen nach Lebensmonat. `src/family-budget.cjs` erstellt zusätzlich drei Stresstests mit Engpässen und kumulierten Rücklagen. Budgetdiagramm, Rücklagen und robuste Zielsuche verwenden dieselbe Komponentenprojektion; persönliche Erwerbsbänder und konstante Mutterschaftsleistungen werden getrennt behandelt.
6. Die begrenzte Vorlagensuche filtert Regeln, Betreuung und Mindestbudget. `src/candidate-patterns.cjs` ergänzt unabhängig geprüfte Rollenvarianten. `src/goal-ranking.cjs` wählt unterschiedliche Finanz-, Betreuungs- und Robustheitsprofile. Die Auswahl ist lexikografisch; kein globales Optimum wird behauptet.
7. `src/application-guide.cjs` erzeugt datierte Aufgaben und NRW-/Köln-Antragswege. Historische Kommunalbeträge und manuelle Zusatzleistungen ohne geprüften Nachweis werden nicht automatisch addiert.

Die Module bleiben mit CommonJS direkt unabhängig testbar. `axes:sync` und `modules:sync` erzeugen die Inline-Bundles. Die Tests kontrollieren die Übereinstimmung mit dem Modulquelltext.

## Datenhaltung und Import

Standardmäßig bleiben Eingaben im Arbeitsspeicher. Erst ausdrückliches Aktivieren speichert einen Plan im Browser-`localStorage`. Diese Speicherung ist unverschlüsselt; das UI erklärt dies. Ein Ausschalten entfernt alle bekannten Versionsschlüssel. Die Löschaktion entfernt lokale Kopien und behält den derzeit geöffneten Plan bis zum Schließen. Alte ohne Einwilligung gespeicherte Pläne werden nicht automatisch geladen.

JSON-Import begrenzt Dateien auf 1 MB, verwendet bekannte Felder, prüft Datums-/Zahl-/Stunden-/Monatswerte und die unabhängigen Achsen. Ein Export darf die Speicherung nicht aktivieren. Sonderfallangaben dürfen durch Import nicht zu einer positiven Standardbestätigung werden. Manuelle Zusatzbeträge und Zustimmungsschalter stellen keinen amtlichen Anspruchsnachweis dar. CSV enthält Monatsdaten ohne freien Nutzereingabetext.

Bankbuchungen verwenden tatsächliche Kalendertage. Sie werden niemals aus einem Leistungsanspruch erfunden oder als Bewilligungsnachweis verwendet. Geburtsdatum und erwarteter Termin werden getrennt gehalten.

## Fachliche Grenzen

Schätzcharakter und strukturierter Prüfstatus sind in jeder Ansicht direkt unter der Budgetübersicht sichtbar. Die vollständige amtliche Brutto-Netto-Ermittlung fehlt weiterhin; eingegebenes Elterngeld-Netto und Stunden-Netto sind Schätzwerte. Der Mutterschutzvergleich weist eine konkrete amtliche Referenzabweichung auf, siehe Zeitachsen-Dokumentation und Abnahmebericht. Steuerwirkung, Kranken-/Pflegeversicherung, Rückforderungen und Sonderfälle brauchen unabhängige Prüfung. Daher ist V3.7.0 ein interner Prüfstand, kein fachlich freigegebener öffentlicher Release Candidate.

Ab V3.4 verwenden Budgetdiagramm, Rücklagen und vorsichtige Zielsuche dieselbe Komponentenprojektion mit getrennten väterlichen/mütterlichen Einkommensbändern. Die historische Sensitivitätsrechnung auf der Elterngeld-Einkommensbasis wird nicht mehr parallel als gleichnamiger Stresstest angezeigt.

## V3.7: Entscheidungsoberfläche und Suche

`src/money.cjs` rundet Geldbeträge auf Cent nach amtlich dokumentierter Zwischenschrittregel. `src/plan-comparison.cjs` verwendet für alle Vorschläge ausschließlich die gemeinsame FamilyBudget-Projektion. Der Offline-Embed platziert abhängige Module nach ihren Abhängigkeiten.

Eine Generatorfunktion ist die gemeinsame Kandidatenquelle für synchrone Regressionstests und schrittweise Browserauswertung. Alle 64 Rohvarianten wird die Browserbedienung freigegeben; Abbruch und suchrelevante Eingabeänderung veröffentlichen keinen Teilplan. Fortschritt und erste Filtergründe werden getrennt erfasst. Die Rankingauswahl bewahrt die erste Zielpriorität und fordert materielle Unterschiede gegenüber allen vorigen Vorschlägen.

Bezeichnungen und Einkommenseinstieg sind streng validierte Zusatzfelder des JSON-Plans. Textknoten und Beschriftungen zeigen Namen ohne HTML-Interpretation; interne Elternschlüssel bleiben stabil. Die Einkommensherkunft ist nur eine Benutzerangabe. Der manuelle MVP-Pfad berechnet kein amtliches Netto aus Bruttoreferenzen. Details: [Umsetzungsbericht](UMSETZUNG-ZIELBUDGET-V3.7.md).
