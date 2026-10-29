# Offline-Browsernachweis – historischer Lauf und Erneuerung

**Lauf 29.10.2026:** Der Nutzer führte `npm run direct-file:proof:write` nach der Mobilkorrektur auf Windows aus; der [Nachweis](../qa/direct-file-proof-current.json) dokumentiert 4/4 bestandene automatische Fälle, zwei A4-Seiten und keine Netzwerkzugriffe für den `index.html`-Hash `52b672a827ee41d18d2e7fa77deb22c1879b1966231fc85fc9b40f81aeacf413`. Die folgenden Hashangaben beschreiben den historischen Lauf vom 24.10.; keiner der Läufe ersetzt eine externe Fach- oder Nutzerabnahme. Die neuen separaten KI- und Mobilansicht-Browserfälle gehören nicht zu diesen vier Nachweisfällen.

**Einordnung:** Technischer, automatisch erzeugter `file://`-Nachweis für Rechner- und Infoseite. **Keine** unabhängige Accessibility-Begutachtung, keine Fach-/Rechtsprüfung, keine Benutzerstudie und **keine Produktfreigabe**.

## Abgenommene technische Funktion

Der im Repository eingecheckte [strukturierte Nachweis](../qa/direct-file-proof-current.json) dokumentiert vier tatsächlich in Chromium ausgeführte Offlinefälle. Diese Tests laufen ohne HTTP-App-Server über die lokalen `file://`-Dokumente. Jede Browserseite wird explizit offline geschaltet; HTTP(S)- und WebSocket-Anfragen werden blockiert und als unerwünschte Zugriffe gezählt.

1. `start.html` und `index.html` funktionieren direkt als lokale Dateien; mobile Ansicht und zwei automatische WCAG/Axe-Scans ohne angezeigte Verstöße.
2. Einfache Navigation → „Plan prüfen“ → Quellen-/Aufgabenübersicht → ausdrücklich angeforderter Browserdruck; **genau zwei A4-Hochformatseiten**, danach zurück zur normalen Oberfläche.
3. Synthetischer JSON-Export/-Import; Speicher-Opt-in bleibt aus, lokale Daten werden nicht automatisch dauerhaft gespeichert; die 2027-Kohorte wird als nicht unterstützt angezeigt.
4. Beide Offline-Einstiege bleiben unabhängig von alten, separat archivierten Screenshots oder Belegen erreichbar.

**Historischer Softwareinhalt vom 24.10. (nicht der aktuelle Rechner-Hash):**

- `index.html` SHA-256: `501c7360a36736e38fb5112e5366f3e19fc9e15250175f9acc0b6363a8cd99a1`
- `start.html` SHA-256: `fd7890686a1d28ff6d0044545ec12e6433bd737951f1625dc42fb6763320a16d`
- Browsernachweis, Testskript, Browserkonfiguration, Runner, Validator und Lockfile sind jeweils durch SHA-256 in `qa/direct-file-proof-current.json` gebunden.

Dieser Beleg ist **eine maschinell erzeugte Eigenauskunft des ausführbaren Testskripts**. Ein SHA-256-Hash belegt Dateigleichheit bei einer späteren Prüfung, aber **nicht** die Echtheit eines externen Reviewers. Die GitHub-CI führt alle direkten Datei-Browserfälle bei jeder PR zusätzlich neu aus.

## Reproduzierbarer Ablauf

Auf einem Rechner mit Node.js 22 und Chromium:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install --with-deps chromium
npm run direct-file:proof:write
npm run direct-file:proof:check
npm run test:e2e
npm run release:check
```

- `direct-file:proof:write` führt die vier Chromiumtests selbst aus. Nur **alle vier bestandene** Tests erzeugen oder aktualisieren den Nachweis.
- `direct-file:proof:check` ist eine **struktur- und hashbasierte Offlineprüfung**, die nicht selbst Browser testet. Schon ein verändertes HTML, Testskript, Browser-Setup, Runner, Validator oder Lockfile macht den eingecheckten Nachweis ungültig. Nach jeder solchen Änderung den Browserlauf erneut durchführen und die Änderung im PR kontrollieren.
- `release:check` ist trotz der jetzt aktuellen technischen Browserbelege weiterhin **NO-GO**. Die fachliche Tagesanrechnung, unabhängige 10/10-Paarfälle, aktuelle Sonder-/2027-Regeln, echte Nutzer-/Screenreader-Abnahmen sowie Rechts-, Datenschutz- und Betreiberfreigabe sind **nicht** erledigt.

## GitHub Actions und Speicherquote

Der Browserjob führt weiterhin **alle** Playwright-Tests aus, und der erforderliche `test`-Abschlussjob verlangt unverändert `node`, `browser` und `staging` auf `success`.

Wegen der wiederholt ausgeschöpften GitHub-Artefaktquote werden große Browser-Screenshots und Traces künftig **nur bei einem fehlgeschlagenen Lauf** für drei Tage hochzuladen versucht; die obligatorischen Tests werden dabei weder übersprungen noch abgeschwächt. Erfolgreiche Läufe liefern ihre Testergebnisse, die HTML-Fingerprints und den automatisierten Offline-Beleg in der GitHub-Actions-Zusammenfassung und den CI-Logs. Scheitert der optionale Fehlerartefakt-Upload weiterhin an der Quote, ist dieses Infrastrukturproblem separat zu beheben.

**Offene manuelle Prüfungen:** NVDA/Firefox, VoiceOver/Safari, reale Moderatorinnen/Moderatoren und Teilnehmende, Schwarzweiß-Druck auf verschiedenen Druckern sowie rechts-/datenschutz- und betreiberseitige Beschlüsse. Sie werden durch diesen Nachweis **nicht** als bestanden markiert.
