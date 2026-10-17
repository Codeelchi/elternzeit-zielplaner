# QA-Nachweis V3.10 · 16. Oktober 2026

## Ergebnis und geprüfter Stand

**27 von 27 Browserfällen bestanden**, keine übersprungenen Fälle, keine Wiederholungs-Erfolge (`flaky: 0`). Der vollständige abschließende Lauf dauerte **451,9 Sekunden**. Alle Fälle luden den Rechner direkt als lokale `file://`-Datei. Zusätzlich wurden die neue Infoseite und der tatsächliche Wechsel zum Rechner geprüft.

| Datei | SHA-256 des geprüften Inhalts |
| --- | --- |
| `index.html` | `72b87039d14494ffee88622ecf5729944d2513fe7be88083b5f2d08ba4663e60` |
| `start.html` | `ad5fed5837cab165ca1b2f6d1c992a02ccd52f23a42667178894bd768d8f6a2d` |

Browser: Playwright Chrome Headless Shell **156.0.8078.4**. Standardausführung, keine Umgehung verwalteter Browserrichtlinien. Die bestehenden Fall-Zeitlimits von **120 Sekunden** blieben unverändert. Das CI-Jobbudget wurde separat auf 15 Minuten erweitert, um Node-Prüfungen, Browserinstallation und die gewachsene Browsermatrix abzubilden; daraus folgt keine Laufzeitgarantie.

Reproduktion nach `npm ci --ignore-scripts` und Installation des Playwright-Browsers:

```sh
BROWSER_APP_URL="file://$PWD/index.html" CHROMIUM_PATH="/pfad/zum/chrome-headless-shell" npm run test:e2e
```

Die Standard-CI führt dieselben Tests über einen lokalen HTTP-Server aus. Der hier dokumentierte lokale Lauf ist der zusätzliche Nachweis für das direkt verteilbare HTML-Paar. Eine erfolgreiche lokale Prüfung behauptet keinen noch nicht abgeschlossenen CI-Lauf.

## Fachliche und technische Abdeckung

Die bestehenden 22 Browserfälle wurden erhalten. Sie prüfen unter anderem unabhängige Zeitachsen und tatsächliche Bankeinträge, Suchvorschläge und Suchabbruch, veraltete Annahmen, per Elternteil getrennte Szenarien, Import/Export, lokale Speicherung mit Einwilligung und Löschung, XSS-Eingaben als Klartext sowie die fehlende fachliche Bestätigung von Geburten 2027.

Fünf neue Fälle ergänzen:

1. „Nächste Schritte“ führt zum passenden Feld und setzt den Tastaturfokus. Bestätigter Standardfall, eingegebenes zvE und bewusst erfasste null Euro Ausgaben entfernen die jeweiligen offenen Punkte. Der Monatsplan bleibt erhalten.
2. Die aufgeklappte Nettohilfe unterscheidet Auszahlungsnetto und Elterngeld-Netto. Der amtliche Link erhält keine Formulardaten und hat sichere Attribute für einen neuen Tab.
3. Kontextbezogene Wissenskarten haben aktuelle Quellen und Aktionen, bewahren ihren geöffneten Zustand nach Eingabeänderungen und bleiben auf Desktop und Mobilgerät bedienbar. Geburten 2027 bleiben ungeprüft. Der echte Klick zur Familienstart-Beratung öffnet einen neuen Tab; vollständiger Rechnerzustand und Rechner-URL bleiben erhalten.
4. und 5. Die Infoseite wird mit 1440 und 390 Pixel Breite geprüft: echte Phasenfilter, Tastaturbedienung, fünf native FAQ, externe Quellenlinks, keine lokale Speicherung und tatsächlicher Wechsel zum Rechner. Für beide Infoseitenfälle ist das Browsernetzwerk zusätzlich deaktiviert; unerwünschte HTTP(S)-Anfragen bleiben aus.

Der allgemeine `afterEach` prüft JavaScript-Laufzeitfehler und Fehlermeldungen in der Browserkonsole. Alle Desktop-/Mobilansichten und die zusätzlichen Vergleichs-, Wissens- und Portalszenen bestanden die horizontalen Überlaufprüfungen.

## Accessibility und sichtbare Nachweise

**58 Axe-Scans ohne gemeldete Verstöße** gegen die verwendeten WCAG-2-A/AA- und WCAG-2.1-A/AA-Regelgruppen:

| Bereich | Scans |
| --- | ---: |
| 16 Fachansichten, Desktop und Mobilgerät | 32 |
| Dynamische 36-Lebensmonats-Zeitachsen | 18 |
| Planvergleich, Desktop und Mobilgerät | 2 |
| Bestehender mobiler Schnellstart | 1 |
| Aufgeklappte Nettohilfe | 1 |
| Aufgeklappte Wissenskarten, Desktop und Mobilgerät | 2 |
| Infoseite mit geöffneten FAQ, Desktop und Mobilgerät | 2 |

57 Scans sind in den `qa/browser-accessibility-*.json`-Dateien dokumentiert; der bestehende mobile Schnellstart prüft seinen zusätzlichen Scan direkt als Assertion im Browserfall. Die Gesamtauswertung und Laufstatistik stehen in [browser-environment.json](../qa/browser-environment.json) und [browser-results.json](../qa/browser-results.json).

Alle zwölf ausgewählten Bilder in [qa/screenshots](../qa/screenshots/) wurden aus dem abschließenden Lauf neu kopiert: acht Rechnerbilder (Überblick, Einkommen, Zeitachsen und Vergleich, jeweils Desktop/Mobilgerät), zwei Wissensansichten und zwei Infoseitenansichten. Die bisher dort vorhandenen historischen Rechnerbilder wurden ersetzt. Desktop-/Mobilüberblick und beide Infoseitenbilder wurden zusätzlich visuell angesehen. Die lange Infoseitenaufnahme zeigt alle FAQ geöffnet; sie ist kein Bild der anfänglich vollständig sichtbaren Bildschirmfläche.

## Vorläufe und Korrekturen

Die Vorläufe werden nicht als Freigabenachweis gezählt. Ein erster vollständiger Versuch überschritt beim Desktopscan das unveränderte Fall-Zeitlimit; gleichzeitig lief ein separater Node-Gesamtlauf. Dieser Versuch wurde abgebrochen. Eine alleinige Ursache wird daraus nicht abgeleitet. Anschließend wurden die Cent-Prozentrechnung und begrenzte Zwischenspeicher verbessert und automatisch nachgeprüft. Ein zweiter Browserlauf wurde für den zwischenzeitlich gefundenen Zustandsverlust beim Öffnen der Infoseite unterbrochen. Die Rechnerlinks öffnen die Infoseite nun in einem separaten Tab.

Erst nach den Korrekturen und Abschluss der parallelen Node-Prüfungen startete die hier gewertete vollständige Matrix. Alle 27 Fälle bestanden ohne Anhebung der Fall-Zeitlimits und ohne Abschwächung bestehender Assertions.

## Grenzen

Automatisierte Axe-Scans und synthetische Tastaturfälle ersetzen weder echte Nutzertests noch einen vollständigen Screenreader- oder Assistenztechnologie-Test. Die Bildschirmgrößen sind Browseransichten, keine Zertifizierung physischer Smartphones. Es wurden ausschließlich synthetische Haushaltsangaben verwendet. Externe Beratungsangebote wurden nicht automatisiert mit persönlichen Angaben aufgerufen.

Dieser Bericht ist eine interne technische QA. Er behauptet keine unabhängige finanzielle, rechtliche oder datenschutzrechtliche Abnahme. Die bekannte Mutterschutz-Referenzabweichung und die öffentlichen Release-Gates werden dadurch nicht aufgehoben. Inhaltliche Quellenprüfung und ihre Grenzen stehen in [FACHRECHERCHE-V3.10.md](FACHRECHERCHE-V3.10.md), [ZUSATZINFORMATIONEN-V3.10.md](ZUSATZINFORMATIONEN-V3.10.md) und der Portal-Dokumentation.


## Design-Nachbesserung 17.10.2026

Die aktuelle Portalgestaltung und ihre gezielten Nachweise stehen in [DESIGN-2026-10-17.md](DESIGN-2026-10-17.md). Der Rechner bleibt unverändert. Frühere vollständige Browserberichte und deren Portalhash beziehen sich auf den 16.10.; die neue Portaldatei hat einen eigenen Hash und einen getrennten Bericht. PR #17 wird damit aktualisiert.
