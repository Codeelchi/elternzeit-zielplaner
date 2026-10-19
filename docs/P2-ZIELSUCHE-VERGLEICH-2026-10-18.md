# P2-Zielsuche: kompakter Modellvergleich und reproduzierbare Laufzeitmessung

**Stand:** 18. Oktober 2026. **Status:** rein technische UI-/Browserprüfung. Keine amtliche, steuerliche, unabhängige fachliche oder öffentliche Produktfreigabe.

## Anlass

Der unabhängige Nutzungsbericht vom 18.10.2026 fand die dreifache Zielsuche grundsätzlich funktional, aber informationsdicht: Vergleichszahlen, Szenariodetails, Einschränkungen und Zielkonflikte standen gleichzeitig in langen Karten. Die beobachtete Suchzeit war bislang nicht unter reproduzierbaren Bedingungen erhoben worden.

## Umsetzung ohne Änderung der Fachlogik

- Jede vorgeschlagene Variante zeigt direkt drei gleich definierte Kennzahlen: (1) Gesamt nach eingetragenen Kosten **realistisch**, (2) niedrigster Lebensmonat **realistisch**, (3) benötigte Anfangsrücklage **vorsichtig**. Vollständige Tabelle einschließlich beider Szenarien, Engpassmonate und Zielkonflikte bleibt aufklappbar zugänglich.
- Suchumfang, Filterzählungen und Grenzen sind separat aufklappbar. Die Grenze „**begrenzte Vorlagensuche, kein globales Optimum**“ bleibt auch im geschlossenen Zustand sichtbar.
- Die drei Kennzahlen sind **Modellbudget-Werte**, keine tatsächlichen Kontoauszahlungen, keine amtlich geprüften Leistungsbeträge und keine individuell belastbare Empfehlung. Der 4-/5-Tage-Mutterschutzkonflikt wird nicht entschieden.
- Der Ergebnisbereich signalisiert den Busy-Status während der schrittweisen Suche und meldet geprüfte Muster, passende Kandidaten und die lokale Laufzeit dieses Versuchs. Fehlbedienung und Abbruch übernehmen nie ungefragt einen Plan. Die gemessene Laufzeit wird **nicht** als geräteübergreifende Garantie ausgewiesen.
- Responsive Vergleichsansichten ohne globale horizontale Überläufe in den geprüften Fällen von 320 bis 1440 CSS-Pixeln.
- Keine Änderungen an Planerformeln, Referenzfallstatus, JSON-Schema 1, Speicherzustimmung oder GitHub-Pages-Releasegrenzen.

## Reproduzierbarer Benchmark (synthetisch, lokal, nicht repräsentativ)

CLI-Befehl: CHROMIUM_PATH=/opt/ms-playwright/chromium-1234/chrome-linux64/chrome node scripts/benchmark-goal-search.mjs 2

Der Benchmark startet ein frisches Chromium-Profil pro Durchlauf, verwendet direkt file:// ohne HTTP(S)-Zugriffe oder lokale Speicherung und berechnet für einen fiktiven Fall (Geburt 28.05.2026, Standardfall bestätigt, angenommene Ausgaben 1.800 €, zvE 95.000 €, 12 Lebensmonate, Elternteil 1 mindestens zwei freie Monate, keine Teilzeitbedingung) drei Vorschläge. Protokolliert werden der SHA-256-Wert des tatsächlich getesteten HTML, Working-Tree-Status, Browser-/Hardwareangaben sowie CLI-Wallzeit und im UI sichtbare Suchdauer. Dies ist ein manueller Diagnosebefehl, **kein CI-Performance-Gate**.

**Beobachtete Workbench-Ausführung vor Commit, HTML-SHA256 a3555bd59c2f213bc4634e21d53ed7c5f0d72751addab53890a4ba29796d9a34:**
- Umgebung: Linux x64, Intel Xeon E5-2680 v3, 6 logische CPUs, Node 22.23.3, Chromium 151.0.7922.34, 390 x 844 CSS-Pixel.
- Zwei Wiederholungen: **4555 ms** und **4485 ms** gemessene Wallzeit. Das UI selbst berichtete jeweils 4,2 Sekunden für den Suchlauf; beide Werte beruhen auf leicht unterschiedlichen Startpunkten.
- Jeweils drei Vorschläge, 0 beobachtete HTTP(S)-Requests und 0 Browser-Speicherschlüssel. Diese Zeitwerte sind weder smartphone-repräsentativ noch eine Leistungszusage.

## Technische Abnahme und Grenzen

Neue Assertions erweitern den bestehenden Chromium-Test für die Zielsuche: gleichartige KPI-Bezeichnungen pro Vorschlag, aufklappbare Details, identische Realistisch/Vorsichtig-Tabellen und Werte, keine automatische Planübernahme, Busy-Status und Dauer nach Suche/Abbruch, Axe-Scans und Überlaufprüfung bei 320/390/430/1440 CSS-Pixeln. Gezielter Lauf: **2/2 Chromium-Fälle PASS**.

Zusätzlich erforderlich auf dem exakten PR-SHA: komplette npm test, npm run test:e2e, alle Source-/Privacy-/Evidenz-/Staging-/Pages-Checks, erwartete **BLOCKED**-Release-Prüfung und GitHub-CI. Ein Merge nach main veröffentlicht die Pages-Vorschau **nicht automatisch**; dazu bleibt der explizite manuelle Pages-Workflow notwendig.

**Offene P0-Freigaben unverändert:** Mutterschutz 4/30 gegen 5/30, 0/10 qualifizierte unabhängige Referenzfamilien, keine echten moderierten Nutzer-/Screenreaderprüfungen, keine externen Rechts-/Datenschutz-/Betreiberfreigaben. Nicht unterstützt bleiben Sonderkonstellationen sowie die rechtlich nicht bestätigte Kohorte 2027. Kein öffentlicher Produktrelease.
