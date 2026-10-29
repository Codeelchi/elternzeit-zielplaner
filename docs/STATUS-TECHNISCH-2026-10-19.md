# Verifizierter Projektstatus – 19. Oktober 2026

**Arbeitsstand 29.10.2026:** KI-gestützter Schnellstart durch kopierbaren Prompt und validierte, ausdrücklich bestätigte Formularübernahme; Monatsnavigation und Variantenkarten für schmale Bildschirme. Aktueller Arbeitsstand `index.html` SHA-256 `52b672a827ee41d18d2e7fa77deb22c1879b1966231fc85fc9b40f81aeacf413`. Der direkte Chromium-Nachweis wurde nach der Mobilkorrektur für diesen Stand erneuert: **4/4 automatisierte Fälle**, zwei A4-Seiten und keine HTTP(S)-Browseranfragen. Der unten dokumentierte Beleg vom 24.10. gehört zu einem älteren Hash. Keine Änderung an unabhängigen Fach-, Nutzer-, Datenschutz- oder Betreiberfreigaben; Release **NO-GO**. Details: [KI-Einstieg](KI-EINSTIEG.md).

**Produktstatus: TECHNISCH PRÜFBAR · ÖFFENTLICHER PRODUKTRELEASE: NO-GO.**

Diese Seite ist der **aktuelle Einstieg** für Entwicklung, Fachreview und Betreiberentscheid. Frühere V3.17-, V3.18-, V3.19- und V3.20-Berichte dokumentieren **historische Ausbaustufen**, nicht den gegenwärtigen Branch- oder Freigabestatus. Ein erfolgreiches GitHub Pages **Test-Deployment** darf nicht mit einer Produktfreigabe verwechselt werden.

## 1. Identität und verbindlicher technischer Bezug

| Gegenstand | Nachweis / Einordnung |
| --- | --- |
| Repository | Privates `Codeelchi/elternzeit-zielplaner`, Branch `main` |
| Letzter integrierter Funktionsstand **vor diesem Dokumentationsabgleich** | `3c837cbf47fe818a94157202a2b5699d7e697212` (Merge PR #30, 18.10.2026) |
| Softwarebasis zu Beginn der PR-32-Review | bec8bf0a9ce73d86b165694fa6150dd290d4c5da (Merge PR #31, [Main-CI erfolgreich](https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/39197956216)). Der aktuelle PR-32-Index-SHA unterscheidet sich; historische Benchmarks behalten ihren historischen Hash. |
| Merge-Kette zum Beginn des PR-32-Reviews | PR #21 bis [PR #31](https://github.com/Codeelchi/elternzeit-zielplaner/pull/31) waren integriert; PR #32 baut auf dem folgenden Main-Stand auf. Ein Merge ist keine Produktfreigabe. |
| Bestätigte technische CI auf Funktions-Main | [GitHub Actions 39162208549](https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/39162208549): Node, Chromium, Staging, Abschlussjob erfolgreich |
| PR #33: zvE-Formularfix (historischer Einzelstand) | Branch `fix/zve-annual-form-limit`, Ausgangscommit `068351b9edec453cac50e57edb4472bf6a39e604`: `index.html` SHA-256 `bb943abbc8abb75578e7db8c086709340931e9a598f47133e242fcb7a5762991`; kein separater Live-Rollout, keine Fach-/Produktfreigabe. |
| PR #34: bereits auf `main` integriert, historischer Einzelstand | [PR #34](https://github.com/Codeelchi/elternzeit-zielplaner/pull/34) via `fbadc96c6da0c12ed5c2b37de5d6777873e613bf`; HTML-SHA-256 des damaligen Einzelstands `ca887e702aea57a0615128fcb46f09fe27c940425d76c4473bab8ac9d25f9df3`. UI- und Exportbezeichnungen, keine Rechtsfreigabe; keine Übertragung historischer CI-Nachweise. |
| PR #33 + PR #34: integrierter technischer Prüfkandidat (21.10.2026) | `index.html` SHA-256 `fa36cf32e8003250f12c249b46617932e192c0c5d4b422aee23c0e7966b650ae`; vereint zvE-Jahreseingabegrenze und Finanzbegriffe. Dieser Hash dokumentiert den **noch nicht ausgerollten Arbeitsstand nach Konfliktauflösung**. Er ersetzt keine commitgebundene CI, Browser-/Fachprüfung oder Produktfreigabe; öffentlicher Produktrelease weiterhin **NO-GO**. |
| Orientierung „Nach der Geburt“: separater technischer Prüfkandidat | Basis `7279d48a152553c20899f16107841718dbf1fa49`, Branch `feat/nach-der-geburt-orientierung`; `index.html` SHA-256 `8806bd0bb78176d2bcfdba35a1119091200295afd790afb3543b43dc3358075c`. Vier feste offizielle Links ohne neue Eingabe-, Frist-, Anspruchs-, Medizin- oder Speicherlogik. Nicht gemergt oder ausgerollt; keine Produkt-/Rechts-/Datenschutz-/Accessibility-Freigabe, historische Prüfnachweise gelten nicht automatisch für diesen Kandidaten. |
| Manuell reproduzierter lokaler Volltest dieses Funktionsstands | **512/512 Node-/DOM-Tests** und **93/93 Chromium-Fälle**, 18.10.2026; **keine** unabhängige Fach-/Rechts-/Nutzerabnahme |
| Neuer aktueller Direktdatei-Prüfbeleg (24.10.2026) | [Automatisierter \`file://\`-Chromium-Nachweis](DIREKTDATEI-CHROMIUM-NACHWEIS-2026-10-24.md), [JSON-Rechnung und Quellhashes](../qa/direct-file-proof-current.json): 4/4 direkte Offline-Browserfälle, zwei automatische Axe-Scans, zwei A4-Seiten und keine HTTP(S)-Browseranfragen. \`index.html\` SHA-256 \`b6dbe2e7ba6ce85849aa85aaaffc51433e337a96454489262c8defebcbe8f29b\`; \`start.html\` SHA-256 \`d78367896ea4560cd74ed7052f2b239cbf78be510bfdcb50d65bb8f495016207\`. Die bisherige technische SHA-Abweichung im Release-Check ist damit aktuell nachgewiesen. **0 echte moderierte Sitzungen, 0 manuelle Screenreader-/Rechts-/Datenschutzfreigaben, 0/10 externe Familienprüfungen, öffentlicher Release NO-GO.** |
| Offline-Seiten, Funktionsstand | `index.html` SHA-256 `b6dbe2e7ba6ce85849aa85aaaffc51433e337a96454489262c8defebcbe8f29b`; `start.html` SHA-256 `d78367896ea4560cd74ed7052f2b239cbf78be510bfdcb50d65bb8f495016207` |
| Paket 3A/3B, technischer Reviewstand 22.10.2026 | Zwei A4-Hochformatseiten auf ausdrücklich angeforderten Browser-Druck; lokale Quellencheckliste mit gemeinsamem Sitzungstatus, direkter Einstieg aus einfacher Ergebnis-Navigation. `index.html` SHA-256 `b6dbe2e7ba6ce85849aa85aaaffc51433e337a96454489262c8defebcbe8f29b`. Ein bestätigter Plan/amtliche Bewilligung wird **nicht** vorgetäuscht, die Rechts-/Leistungsrechenlogik blieb unverändert, **keine** Änderung am JSON-/CSV-Schema, kein Netzwerk-Druckdienst und keine Speichererweiterung. Quellen: [Paket-3-Bericht](UMSETZUNG-PAKET3-DRUCK-AUFGABEN-2026-10-22.md), [3C-Testplan – nicht durchgeführt](PAKET3C-NUTZER-A11Y-ABNAHME-2026-10-22.md). Öffentlicher Produktrelease weiterhin **NO-GO**. |
| Paket 2C, technischer Reviewstand 22.10.2026 | Was-wäre-wenn-Kita-Verschiebung 0–6 LM, nur in bestehenden Teilzeitmonaten manuelle Stunden/Nettoänderungen, Haushaltskosten- und Erwerbsnetto-Risikoband. `index.html` SHA-256 `5b76444e0ffe1577a0fc38c7a2755df9fbbc9dbcba4f34de007b609b21f81e4e`. Keine neue Leistungshöhe, kein automatisches Übernehmen, keine Speicherung, keine Pages-Auslieferung, keine öffentliche oder amtliche Freigabe. Umsetzung: [Paket 2C](UMSETZUNG-PAKET2C-WAS-WAERE-WENN-2026-10-22.md). |
| Paket 2A/2B, technischer Reviewstand 22.10.2026 | Gemeinsame Eltern-/Betreuungs-/Finanz-Lebensmonate mit maximal drei nur im laufenden Tab gemerkten Vergleichsständen. `index.html` SHA-256 `4b505bff562a57b24c3aa31227f45f9ed77a27de8907bb672ac5fd8ae769b2f1`. Kein neuer Rechts- oder Finanzberechnungsalgorithmus, kein Snapshot im Import/Export/Browser-Speicher, kein Pages-Deployment und keine amtliche Produktfreigabe. Dokumentation: [Umsetzung Paket 2](UMSETZUNG-PAKET2-FAMILIENZEIT-2026-10-22.md). |
| Designpaket 1 (PR #38) | Schnellstart-Navigation 01-06, nicht bestätigter 2027-Beispielstatus, vier zentrale Ergebniskarten und lokale Herkunftslabels; `index.html` SHA-256 `c43ec453563363ebeb03ae91dd62df84d616308ff552dc76b1a7d505db7c447d`. Fachberechnung, Quellen, Import-/Speicherschema und Release-Gates unverändert. Dieser Stand ist kein GitHub-Pages-Rollout und keine Produktfreigabe. |
| Paketmetadaten und Austauschformat | `package.json` Version **3.10.0**; JSON-Import-/Exportschema **1**. Interne Phasennamen V3.17–V3.20/P1/P2 sind **keine** neue Paketversion |
| GitHub-Pages-Testvorschau beim erneuten Live-Abruf am 19.10.2026 | https://codeelchi.github.io/elternzeit-zielplaner/ lieferte bec8bf0a9ce73d86b165694fa6150dd290d4c5da ([Deployment 39208423971](https://github.com/Codeelchi/elternzeit-zielplaner/actions/runs/39208423971)). Der PR-32-Kandidat ist **nicht automatisch deployed**. |

**Erneuter MCP-Workbench-Test nach diesem Dokumentationsabgleich, 19.10.2026:** Frische Installation aus dem bestehenden Lockfile erfolgreich (npm ci: 44 Pakete). Vollständiges npm test auf dem Dokumentationsbranch: **518/518 Node-/DOM-Tests bestanden**, keine Fehler oder ausgelassenen Tests. Davon sind **sechs** neue positive und negative Dokumentations-Konsistenztests. Die zusätzlich benötigte vollständige Chromium-/GitHub-CI-Prüfung ist gegen den jeweils exakten Commit separat zu belegen; dadurch entsteht weder eine externe Fachfreigabe noch automatisch ein Pages-Deployment.

Ein **neuer reiner Dokumentations-Merge** ändert den Git-SHA von `main`, aber nicht automatisch die hier protokollierten Prüfergebnisse der unveränderten HTML-Dateien. Der exakt aktuelle Git-Main-SHA ist beim Abschluss aus `git rev-parse origin/main` und dem zugehörigen CI-Lauf abzulesen; diese Zeile benennt den fachlich geprüften *Softwarebasisstand*, nicht eine unveränderliche Zukunfts-SHA.

## 2. Was technisch vorhanden ist

- Familien-Szenario- und Budgetplaner mit fiktiven Schnellstart-Vorlagen, 36 Lebensmonaten, getrennten Arbeits-, Mutterschutz-, Leistungs-, Betreuungs-, Zahlungs- und Bankbuchungsachsen; begrenzte abbrechbare Zielsuche **ohne globales Optimum**.
- Der Standardfall ist für Geburten **01.04.2025–31.12.2026** eingegrenzt (zwei abhängig Beschäftigte, reguläre Einzelgeburt, gemeinsamer deutscher Haushalt und passende Eingabeannahmen). Das Label `PLAUSIBEL_STANDARD` ist **keine Bewilligung**.
- **P1:** Öffentliche Preview-Textführung nur für synthetische Angaben, feldnahe Validierung, Kennzeichnung noch nicht übernommener Entwürfe; Vorschau startet mit fiktivem 2026-Fall.
- **P2:** Bei Änderung von Schnellstart-Netto werden erhaltene Fach-/Importwerte nur nach ausdrücklicher Entscheidung **beibehalten / geschätzt ersetzt / als unbekannt geleert**; Herkunft und fehlende Werte werden sichtbar. Robuster JSON-Import mit verständlicher Fehlermeldung und transparenter Liste *nicht* übernommener temporärer Szenarien.
- **P2-Zielsuche:** Je Variante drei direkt vergleichbare Modellkennzahlen und aufklappbare Tabellen; Suchfortschritt, Abbruch, Browser-Busy-Zustand und lokal gemessene Laufzeit. Fachformeln und JSON-Schema unverändert.
- Kein Benutzerkonto, kein Rechen-Backend, keine appseitige Telemetrie. Lokale Speicherung nur nach Opt-in und **unverschlüsselt**; keine positive Datenschutzbewertung. JSON/CSV-Exporte und Downloads liegen außerhalb der Browserkopie. Die GitHub-Pages-Plattform hat eigene Zugriffsprotokollierung.
- Für ein privates, loopback-gebundenes Staging existieren reproduzierbarer Build und Sicherheitskonfiguration. **Ein tatsächlich externer HTTPS-Produktivbetrieb samt Betreiberabnahme ist nicht bestätigt.**

Details: [Architektur](ARCHITEKTUR.md), [Anleitung](ANLEITUNG.md), [P1](P1-UX-VALIDIERUNG-2026-10-18.md), [P2-Netto/Import](P2-NETTO-HERKUNFT-IMPORT-2026-10-18.md), [P2-Zielsuche](P2-ZIELSUCHE-VERGLEICH-2026-10-18.md).

## 3. P0-Gates und wirkliche Zuständigkeiten

| Gate | Technisch nachgewiesen | Offene **externe** Maßnahme / Rolle | Veröffentlichungsrisiko |
| --- | --- | --- | --- |
| **P0-A Mutterschutz** | Unterschied dokumentiert: Modell letzter Leistungstag 15.07., 4/30 Rest; Familienportal-Beispiel 14.07., 5/30. Amtliche 7/31-Teilmonatsregel separat belegt. | Schriftliche verbindliche Einordnung von fachkundiger Elterngeldstelle oder unabhängig qualifizierter BEEG-/MuSchG-Fachperson; 28-/30-/31-Tage-Gegenbeispiele und Kontingentverbrauch bestätigen. | Falsche anteilige Leistungen und Restmonatsbeträge |
| **P0-B Referenzfamilien** | Zehn unabhängige Prüfanfragen und maschinenprüfbare Null-Evidenz vorbereitet; **0/10** qualifiziert extern bestätigt. | Unabhängige Sollwerte, Qualifikation, Quellen und signierter Review je Familie; Fachreviewer. | Beträge trotz grüner Softwaretests nicht sachlich validiert |
| **P0-C Standardfall/2027** | Regelvalidator grenzt Kohorten/Sonderfälle ein; 2027 ausdrücklich Prognose/nicht unterstützt. | Nachweis jedes amtlich verkündeten Inkrafttretens und Zuordnung nach gesetzlichem Stichtag; Rechts-/Fachverantwortung. Ein geplanter 2027-Kindergeldwert ist **kein** bestätigter geltender Parameter. | Falsche Kohortenfreigabe / Fehleinschätzung |
| **P0-D Datenschutz/Betreiber** | Offline-Browser- und Storage-Negativtests, CSP-Vorbereitung, statischer Netzwerkaudit, Import/Export. | Verantwortlicher Betreiber, Impressum/Kontakt, Rechts- und Datenschutzprüfung der **tatsächlichen** Hostingform, realer Betrieb/Protokollierung; Betreiber und Datenschutzfachperson. | Rechtlicher Betrieb nicht freigegeben |
| **P0-E Nutzer/Barrierefreiheit** | Acht **synthetische** Verständnisaufgaben, automatisierte Tastatur-, Axe- und Responsive-Tests; **0 echte Sitzungen**. | Moderierte tatsächliche Familien-Nutzertests, manuelle Screenreader-/Mobilgeräte-Prüfung und dokumentierter Review; UX-/Accessibility-Reviewer. | Nutzer könnten Ergebnisse missverstehen oder Bedienung nicht nutzen |

Alle Gates bleiben **offen**. Die maschinenlesbaren maßgeblichen Quellen sind `data/release-gates.json`, `data/independent-review-evidence-v317.json` und `data/usability-review-v317d.json`. Agententests oder intern abgeleitete Sollwerte dürfen diese Evidenz nicht ersetzen.

Nicht unterstützt sind insbesondere Selbstständigkeit/Mischeinkünfte, Mehrlinge, Frühgeburten, Alleinerziehung und atypische Mutterschutz-/Auslandskonstellationen. Ein vereinfachtes Elterngeld-Netto ist **keine** amtliche Brutto-zu-Elterngeld-Netto-Ermittlung. Kindergeld-Planungsannahmen für 2027 sind gesondert als nicht verbindlich zu behandeln.

## 4. Abnahmekommandos und Auswertung

Im MCP-Workbench im Repo-Stamm, mit Node 22 und installiertem Chromium:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm test
CHROMIUM_PATH=/opt/ms-playwright/chromium-1234/chrome-linux64/chrome PLAYWRIGHT_PORT=8950 npm run test:e2e
npm run sources:check
npm run docs:check
npm run roadmap:check
npm run independent-evidence:check
npm run usability:check
npm run privacy:technical-check
npm run staging:check
npm run pages:check
npm run release:check
git diff --check
```

**Erwartung:** Bis unabhängige Evidenzen und Betreiberfreigaben tatsächlich hinterlegt sind, endet **`release:check` mit Exit 1 / BLOCKED**. Das ist ein beabsichtigter Sicherheitserfolg, kein zu umgehender CI-Fehler. `npm test` und Browser-Regressionen sind hiervon unabhängig und ersetzen keine reale Nutzersitzung oder Rechtsprüfung. Browser-Snapshots in `qa/browser-results.json` bzw. `qa/browser-accessibility-comparison.json` sind nach Testlauf auf Repo-Stand zurückzusetzen, sofern sie nur automatisch veränderte Testartefakte sind.

**Wichtig:** Der technische Datenschutzcheck prüft vorrangig statische Schutzgeländer, nicht den vollständigen Datenschutz beim GitHub-Hosting oder an Privatgeräten. `staging:check` ersetzt keine erfolgreiche externe TLS-/Proxy- und Betriebskonfiguration.

## 5. GitHub Pages und nächster Betreiberauftrag

- **Bestehende öffentlich abrufbare Testseite:** https://codeelchi.github.io/elternzeit-zielplaner/ – **nur fiktive Daten**, keine echte Familien-/Finanzberatung.
- Ein normaler Merge deployed **nicht** nach GitHub Pages. Der separate Workflow `.github/workflows/pages-test-preview.yml` muss auf `main` manuell mit `confirm_public_preview=true` gestartet werden. Die CI liest danach **Commit-SHA und Deployment-Lauf-ID** aus beiden live ausgelieferten HTML-Seiten zurück. Diese explizite Test-Autorisierung ersetzt **keine** Produktfreigabe.
- Beim zuletzt dokumentierten Dispatch-Versuch am 18.10.2026 scheiterte der Trigger mit dem verbundenen Personal-Access-Token: **HTTP 403 – Resource not accessible by personal access token**. Der Operator kann den manuellen Workflow in der GitHub-Actions-Oberfläche auslösen. **Kein heimlicher automatischer Deploy**, kein Abschwächen von Freigabesperren.
- Externer Betreiber muss vor einem **Produktstart** echte rechtliche Inhalte, verantwortliche Kontaktstelle, Datenschutzprüfung und Releaseentscheidung dokumentieren. GitHub Pages hat keine private Zugangskontrolle für diese Seite; `noindex` ist kein Schutz vor öffentlichem Abruf.

Siehe [Pages-Arbeitsanleitung](GITHUB-PAGES-TESTVORSCHAU-2026-10-18.md), [Roadmap](ROADMAP.md) und [Staging-Betriebsdokument](STAGING-UND-FREIGABE-V318-2026-10-18.md).

## 6. Nächster Abschluss

Reihenfolge: (1) Dokumentation und Regressionen auf `main` prüfen und den genauen CI-SHA festhalten; (2) **unabhängige** Mutterschutzklärung, zehn Referenzfamilien und echte Nutzer-/Screenreaderprüfungen; (3) verantwortliche Betreiber- und Datenschutz-/Rechtsentscheidung; (4) formales Go/No-Go; (5) erst danach ausdrücklich autorisierter Produktrollout. Der Testseiten-Pages-Workflow bleibt davon getrennt.
