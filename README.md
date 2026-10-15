# Elternzeit-Zielplaner

**Privater Entwicklungsstand V3.4.0 (Feature-Branch) (15. Oktober 2026)** – offlinefähiger interaktiver Familienbudget- und Elterngeld-Planer für Deutschland.

**Keine öffentliche Beta-Freigabe:** Mutterschutz-Referenzabweichung, vollständige amtliche Nettoermittlung und unabhängiges Fach-/Datenschutzreview bleiben Release-Gates. 2027 erhält keine positive Standardbewertung.

## Start

Das Projekt ist derzeit eine **eigenständige HTML-Datei ohne Backend**. Die Oberfläche kann direkt durch Öffnen von [`index.html`](./index.html) im Browser gestartet werden. Zur Entwicklung:

```bash
git clone https://github.com/Codeelchi/elternzeit-zielplaner.git
cd elternzeit-zielplaner
npm ci
npm test
npx playwright install --with-deps chromium
npm run test:e2e
```

Zum lokalen HTTP-Test genügt zum Beispiel `python3 -m http.server 8080` im Repository-Verzeichnis, dann `http://localhost:8080` öffnen. Die App benötigt zur Laufzeit keinen Build-Schritt und keine Netzwerkverbindung.

## Funktionen (Stand V3.4.0)

- 36 Lebensmonate, Geburtsdatum und Kindesalter samt konkreten Monatsdaten
- Elternzeit und Elternteilzeit getrennt für beide Elternteile konfigurieren
- Basiselterngeld, ElterngeldPlus, Partnerschaftsbonus und unbezahlte Elternzeit
- Unterschiedliche Brutto-, Netto-, Elterngeld-Netto- und Teilzeit-Annahmen
- Zielbasierte Suche über eine *begrenzte Menge erzeugter zulässiger Monatsmuster*
- Drei Stresstests mit getrennten Erwerbsnetto-Bändern beider Eltern, Leistungshöhe und Haushalts-/Betreuungskosten
- Ortsabhängige Modellkosten am Beispiel Köln/NRW mit datierter Tariftabelle
- Rechtsregelkatalog, Plausibilitätsmeldungen, JSON/CSV-Export

## Struktur

| Pfad | Inhalt |
| --- | --- |
| `index.html` | Vollständige ausführbare Offline-App (HTML + CSS + JavaScript) |
| `data/rechtsregeln-de-nrw-2026-10-14.json` | Rechtliche Quellen, Prüfdaten und Gültigkeitsfenster |
| `docs/ANLEITUNG.md` | Bedienungs- und Fachanleitung der V3.1-Basis |
| `docs/ROADMAP.md` | Bekannte Grenzen und nächste Entwicklungsschritte |
| `qa/qa-bericht-v3.1.json` | Historischer QA-Stand aus der Erstellung |
| `tests/*.test.mjs` | Regression, Integration und 34 Referenz-Betragsfälle via jsdom |
| `data/referenzfaelle-bund-2026-10-14.json` | 8 amtliche Beispielwerte, 4 amtliche Grenzen, 22 gesetzlich hergeleitete Werte |
| `docs/REFERENZFAELLE-UND-GRENZEN.md` | Herkunft, Grenzen und offene fachliche Prüfungen |
| `scripts/embed-rules.mjs` | Erzeugt und kontrolliert den Offline-Snapshot der zentralen Rechtsregeln |
| `src/time-axes.cjs` | Reine Kalender-/Zeitachsenlogik für Lebensmonate, Mutterschutz, Elternzeit, Arbeit und Leistungsart |
| `docs/ZEITACHSEN-ARCHITEKTUR.md` | Architektur und aktuell unterstützte Zeitachsen sowie explizite Grenzen |
| `scripts/embed-time-axes.mjs` | Synchronisiert die Offline-App mit dem Zeitachsen-Modul |
| `.github/workflows/ci.yml` | Pull-Request-Prüfung für Rechtsregeln und Tests |
| `package.json` / `package-lock.json` | Node-Testumgebung und reproduzierbare Abhängigkeiten |

## Qualitätssicherung

`npm test` prüft zunächst die Übereinstimmung der eingebetteten Rechtsregeln mit dem JSON-Quellkatalog und anschließend die reale, aus `index.html` geladene Applikationslogik u. a. auf Elterngeld-Äquivalente, Bonusstunden, Bezugsgrenzen, zeitabhängige Kinderdaten, Rechtsquellen und Ergebnisgültigkeit der automatischen Suche. Die zusätzliche Referenztestsuite umfasst veröffentlichte Beträge des Familienportals, daraus abgeleitete Grenzwerte und vereinfachte vollständige Monatsmodelle. Die frühere QA-Auswertung bleibt gesondert archiviert. **Die neue Testsuite ersetzt weder Behördenberechnungen noch eine individuelle rechtliche Prüfung.**

## Rechtliche Quellen aktualisieren

Alle redaktionellen Rechtsregeländerungen erfolgen ausschließlich in `data/rechtsregeln-de-nrw-2026-10-14.json`. Die HTML-App enthält nur den daraus erzeugten Offline-Snapshot. Nach Rechtsregeländerungen `npm run rules:sync`, nach Zeitachsenänderungen `npm run axes:sync` und anschließend immer `npm test` ausführen. **Ein Prüftag 2026 bestätigt noch keine Ansprüche bei Geburt 2027.** Weitere Einzelheiten: [Referenzfälle und Prüflimits](docs/REFERENZFAELLE-UND-GRENZEN.md).

## MVP und Wettbewerbsabgleich

- [MVP-Spezifikation, Release-Gates und Abnahmekriterien](docs/MVP-2026-10-14.md)
- [Wettbewerbs- und Code-Abgleich mit Hypothesen und Evidenzgrenzen](docs/WETTBEWERB-UND-CODE-ABGLEICH.md)
- [Offene Aufgaben in GitHub Issues](https://github.com/Codeelchi/elternzeit-zielplaner/issues)

## Architektur / Weiterentwicklung

Aktuell ist `index.html` aus Gründen der Offline-Nutzung bewusst selbsttragend. Mittelfristig sollten Modell, Rechtsregel-Engine, Optimierer, Rendering und Datenpersistenz unabhängig voneinander testbar werden. Die im HTML angebotene Suchfunktion prüft nur erzeugte Muster und erhebt keinen Anspruch auf vollständige kombinatorische Optimierung. Weitere Schritte: siehe [Roadmap](docs/ROADMAP.md).

## Datenschutz

Es gibt kein Backend und keine nutzerseitige Anmeldung. Berechnete Familienpläne können lokal im Browser gespeichert bzw. als JSON/CSV exportiert werden. Keine echten Steuer- oder Einkommensbelege ins Repository einchecken. GitHub-Repository bleibt **privat**; für eine Veröffentlichung müssen außerdem Datenschutz-, Quellen- und Lizenzfragen geprüft werden.

## Rechtlicher Hinweis

Alle Beträge sind **Modellrechnungen**, keine Bewilligung. Das tatsächliche Elterngeld-Netto kann vom Auszahlungsnetto abweichen; Mutterschutz-Zeiträume, Steuerprogression, Elternzeitrecht, Sonderfälle und zukünftige Gesetzesänderungen erfordern Einzelfallprüfung. Quellen- und Prüfdaten stammen vom **14. Oktober 2026** und müssen vor der Verwendung für eine Geburt 2027 neu verifiziert werden. Keine Zusage über landesrechtliche Leistungen oder kommunale Gebühren.

## Projektstatus

**Importiert und lokal getestet.** Änderungen bitte mit Tests absichern und vorzugsweise per Feature-Branch / Pull Request integrieren. Nicht geprüfte Rechtsänderungen dürfen nicht als geltendes Recht in den Rechner übernommen werden.

## Neuer Stand und Nachweise

- [Architektur](docs/ARCHITEKTUR.md), [Regelvalidator](docs/REGELVALIDATOR.md), [Budget und Antragswege](docs/BUDGET-APPLICATION-GUIDE.md)
- [Abnahme und offene Release-Gates](docs/MVP-ABNAHME-2026-10-15.md), [Changelog](CHANGELOG.md)
- `npm run rules:sync`, `npm run axes:sync`, `npm run modules:sync` aktualisieren die verteilbare HTML-Datei nach Modul-/Katalogänderungen. `npm test` prüft alle drei Snapshots.
- Browser-Tests verwenden Chromium aus `CHROMIUM_PATH`, `/usr/bin/chromium` oder der Playwright-Installation. Die aktuelle Browserprüfung öffnet die HTML-Datei direkt über `file://`; die Anwendung benötigt keinen Server.
- Lokale Speicherung ist standardmäßig ausgeschaltet, optional und unverschlüsselt. Exporte enthalten private Finanzdaten. Im Browser bleibt die Berechnung ohne Konto und ohne Netzwerkaufrufe.

`npm run references:report` schreibt den unabhängigen Delta-Bericht. `npm run release:check` ist derzeit bewusst gesperrt; erfolgreiche Entwickler-Tests ersetzen die ausstehenden öffentlichen Release-Freigaben nicht.

V3.4 ergänzt getrennte Einkommensrisiken beider Eltern, Schwerpunktvarianten mit längerer mütterlicher oder väterlicher Auszeit und vollständige Wiederherstellung der unabhängigen Achsen samt Bankbuchungen. Die Robustheitsgrafik und Zielsuche verwenden dieselben Stresstests.
