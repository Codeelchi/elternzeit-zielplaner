# Änderungen

## 3.3.0 – interner Prüfstand, 14.10.2026

- Konsolidierte Feature-Basis aus PR #10/#11 und Dokumentation aus PR #9; `main` bleibt unverändert.
- Eigenständiger Regelvalidator mit vier Statuscodes, Eltern-/Monatsbezug, Quellenmetadaten und Alternativen. Fehlendes zvE, unbestätigter Standardfall und unbestätigte Zukunftskohorten erhalten keine positive Aussage.
- Gemeinsame Datumsrechnung für Kalender, Validierung und Finanzprojektion; Monatsenden und Acht-Wochen-Frist korrigiert. Konkrete Abweichung vom amtlichen Mutterschutzbeispiel bleibt sichtbar und blockiert öffentliche Abnahme.
- Mehrere editierbare Elternzeitabschnitte, unabhängige Arbeits- und Leistungsmonate mit Anschluss an die Finanzprojektion sowie tatsächliche Bankbuchungen.
- Drei erläuterte Suchprofile, Dublettenprüfung, echte Null-Ergebnisse, vollständiger Vergleichszeitraum für Mindestbudget und vorsichtiges Szenario beim Robustheitsziel.
- Drei unabhängige Budget-Stresstests mit Engpassmonaten und erforderlicher Anfangsrücklage; NRW-/Köln-Antragscheckliste mit datierten Fristen und Unterlagen.
- Dreischritt-Einstieg, korrigierte Navigation, mobile Layoutprüfung, Kontrast-/Tastaturverbesserungen, optionale lokale Speicherung, vollständige Löschung und geprüfter JSON-Import.
- Chromium-/Axe-Browserprüfungen und CI-Artefakte ergänzt. Alle Haushaltsdaten in Prüfungen synthetisch.

## 3.2.0

Erster getrennt testbarer Zeitachsen-Prototyp in PR #11; 59 Tests.

## 3.1.1

Zentraler versionierter Rechtskatalog und amtliche Betragsfixtures in PR #10; 51 Tests.
