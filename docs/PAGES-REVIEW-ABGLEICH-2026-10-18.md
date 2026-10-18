# Review der öffentlichen Pages-Testvorschau – Gegenprüfung und technische Korrekturen

Stand: 18. Oktober 2026 · Prüfgrundlage: externes lesendes Review der bereits öffentlich bereitgestellten Testseite plus direkter Repository-/Chromium-Nachtest.

**Wichtig:** Dieser Bericht ist weder amtliche Fachprüfung noch DSGVO-/Rechtsabnahme. Es wurden ausschließlich synthetische Testwerte verwendet. Tatsächlich beobachtete Nutzertests mit externen Testpersonen haben nicht stattgefunden.

## Abgleich mit dem externen Review

| Beobachtung | Vorheriger öffentlicher Stand | Maßnahme für nächste Pages-Testvorschau | Ergebnis / verbleibendes Risiko |
| --- | --- | --- | --- |
| Paket-, Fachmodul- und Rechtsstand vermischt | „Version 3.10“, Rechtskatalog 15.10.2026, historische V3.15/V3.16-Bezeichnungen | Sichtbarer Provenienzstreifen auf **beiden** Seiten: Paketversion aus package.json, Quellenstand aus dem tatsächlichen HTML und **40-stelliger Commit-SHA** mit GitHub-Commitlink. Beim GitHub-Actions-Build zusätzlich Link zur **konkreten Workflow-Ausführung**. Erklärtext: V3.15/V3.16 sind historische Funktionsbezeichnungen | Kein stillschweigender Anspruch auf ein freigegebenes Release. SHA-Prüfung bindet Build an genau den Checkout und verweigert widersprechendes GITHUB_SHA. Tatsächliche Auslieferung über Live-HTTP/Seiteninhalt separat prüfen |
| Banner fordert fiktive Werte, andere Texte echte Abrechnungen | Aufforderung, Gehaltsabrechnungen/Bescheide bereitzuhalten; CTA „Mit eigenen Zahlen planen“ | Nur in der **öffentlichen Testvorschau** werden Eingangshinweise, Schnellstart-CTA und Ergebnis-CTA auf ausschließlich **synthetische Testwerte** umgestellt | Originale Offline-Dateien und Fachformeln unverändert. Warnungen auch in Grundlagen, Zeitachsen/Bankbuchungen, Cashflow, Monatsdetail, nächste Schritte und Planprüfung |
| „Lokal & privat“ trotz GitHub Pages | Kalkulation erfolgt lokal, Auslieferung über öffentliches GitHub-Hosting | Öffentliche Vorschau bezeichnet sich als „lokale Berechnung · öffentliche Testseite“. IP-Verarbeitung durch Pages, optionale unverschlüsselte lokale Speicherung und Downloads sind weiterhin sichtbar | Kein Nachweis der vollständigen DSGVO-Konformität; GitHub Pages speichert technische Zugriffe. „noindex“ ist kein Zugriffsschutz |
| Nicht unterstützte Fälle, speziell 2027 | App kennzeichnet 2027 als nicht unterstützt/Prognose | Auch in den neuen Ergebnis- und Kontextnotizen ausdrücklich „2027 und Sonderfälle keine geprüfte Anspruchsberechnung“ | Berechnungsalgorithmus, Geburtskohorten-Validator und Release-Sperre unverändert |
| Export-Warnungen möglicherweise nicht überall vorhanden | Bestehendes JSON-Schema 1 enthält planningDisclosure und dessen limitations; CSV enthält angehängte Statusfelder | Reale Chromium-Downloads mit **fiktiven** Daten: JSON enthält legallyVerified=false, publicReleaseApproved=false, Mutterschutzhinweis; CSV enthält Amtliche_Freigabe, Mutterschutz_Referenz und SCHÄTZUNG_KEINE_AUSZAHLUNGSZUSAGE. Anschließend JSON-Import lokal getestet | Keine Veränderung von Schema 1, CSV-Spalten oder Herkunftsregeln. Exporte enthalten weiterhin sämtliche vom Benutzer eingegebenen Daten; Downloads müssen separat gelöscht werden |
| Datenschutz- und Bedienungsaussagen nur lesend beurteilt | Externer Agent hatte Import/Export/Löschung nicht bedient | Zusätzliche End-to-End-Negativ- und Import-/Export-Checks ergänzen die vorherigen V3.19-Storage-Tests; Anwendung versendet bei deren Ausführung keine Drittressourcen | Kein Ersatz für echte DSB-, Security-, mobile Realgeräte- oder Screenreader-Abnahme |

Die eingebetteten JavaScript-Berechnungsskripte werden beim Erzeugen der Pages-Vorschau **bytegenau unverändert** übernommen; verändert werden ausschließlich veröffentlichte, sichtbare HTML-Hinweise. Die öffentliche Dateiliste bleibt **index.html, start.html, robots.txt, .nojekyll**.

## Amtlicher Gegencheck zum Schutzfrist-Konflikt

Die NRW-Arbeitsschutz-Fachauskunft **KomNet**, „Wie berechnet sich der erste und der letzte Tag meiner Mutterschutzfrist?“, erläutert anhand BGB §§ 187–188, dass die nachgeburtliche Achtwochenfrist nach dem Entbindungstag beginnt und am entsprechenden Wochentag acht Wochen später um 24 Uhr endet:

https://www.komnet.nrw.de/_sitetools/dialog/4244

Für den modellierten Termin 20.05. unter Standardannahmen stützt das die bisherige **Schutzfrist-Herleitung bis 15.07., mit vier nicht abgedeckten Tagen 16.–19.07.** (zweiter Lebensmonat: 20.06.–19.07.). Das Bundesfamilienportal nennt in seinem konkreten **Elterngeld-Anrechnungsbeispiel** jedoch 14.07. als letzten Mutterschaftsleistungstag und **fünf von dreißig Resttagen**:

https://familienportal.de/elterngeld

Weiterer amtlicher Kontext: Bundesfamilienportal „Mutterschaftsleistungen“ – Leistung während der Schutzfrist und am Entbindungstag; Rechtsgrundlagen MuSchG § 3, SGB V § 24i, BEEG § 3, BGB §§ 187–188:

https://familienportal.de/familienportal/familienleistungen/mutterschaftsleistungen

**Fachliche Grenze:** Die konkrete KomNet-Antwort erläutert **Schutzfristen**, nicht abschließend die rechtliche Würdigung der im Familienportal dargestellten BEEG-Anrechnung. Die Veröffentlichungsdaten der Quellen können sich unterscheiden. Eine schriftliche Fachentscheidung zu Leistungsende, Anrechnung und daraus abgeleitetem Elterngeldbetrag fehlt weiterhin. **Keine Änderung von 4/30 auf 5/30 oder umgekehrt; P0-A bleibt offen.**

## Reproduzierbare Prüfungen

- **Preview-Build:** npm run pages:check prüft Whitelist, HTML-/Skriptintegrität, echte source- und Git-SHA, Rechtestriktionen, Warnungen an allen Ein-/Ausgabepunkten sowie fehlerhafte SHA-Umgebung (negativer Test).
- **Chromium:** npm run test:e2e -- tests/e2e/pages-preview.spec.mjs prüft Subpfad der Projekt-URL, 390px-Mobile-Ansicht, Keyboard-/WCAG-Axe-Grundregeln, Startseite, Dateibetrieb offline, Quellenstand/SHA, persistenten Warntext, Ergebniswarnungen, zwei Downloads und JSON-Import.
- **Reguläre Regression:** npm test und bestehende Browsermatrix sind vor Merge zu wiederholen; GitHub PR-CI und Test-Pages-Workflow getrennt prüfen.
- **Release:** npm run release:check muss wegen aller noch fehlenden externen Fach-, Nutzer-, Betreiber- und Datenschutzabnahmen weiterhin **BLOCKED** ausgeben.

## Pages-Rollout und Verantwortlichkeit

Die GitHub-Pages-Testvorschau wird **nur auf manuell bestätigten GitHub-Actions-Lauf von main** aktualisiert. Ein grüner PR-CI-Lauf oder Merge veröffentlicht die Vorschau **nicht automatisch**. Nach dem Merge und Start von „Public GitHub Pages test preview (not a product release)“ muss der tatsächliche öffentliche HTML-Inhalt erneut mit dem Git-Commit, dem erwarteten Warnhinweis und der Workflow-ID abgeglichen werden.

Der Repositorybetreiber ist für die bewusste **öffentliche Repository-Sichtbarkeit** sowie für eventuelle später zugelassene echte Nutzerdaten verantwortlich. Solange sämtliche fachlichen Gate-Freigaben fehlen: **Ausschließlich fiktive Testdaten, kein offizieller Familienfinanzplaner.**

## Tatsächlich ausgeführter Nachtest dieser Änderung

- npm test: **511/511 Node-/DOM-Tests PASS**. Alte Fach- und Freigabegates bleiben unverändert.
- npm run pages:check: **4/4 PASS**, darunter eigene Negativtests für gefälschte Git-Commit-Provenienz und aus Versehen aktiviertes Auto-Deployment.
- npm run test:e2e -- tests/e2e/pages-preview.spec.mjs: **4/4 reale Chromium-Fälle PASS**, einschließlich 390px-Mobilansicht und Axe-WCAG-Grundregeln, Datei-Offlinetest, Warnungen in Fachansichten sowie synthetischem JSON- und CSV-Export, Import, Speicher-Opt-in und bestätigter Browserkopie-Löschung.
- Zusätzlich wurde die **bislang öffentliche Version** unter https://codeelchi.github.io/elternzeit-zielplaner/ mit einem isolierten Chromium-Profil anhand rein synthetischer Daten auf JSON-/CSV-Export, JSON-Import, lokale Speicherung und erfolgreiche Löschung geprüft: HTTP 200, gültiges JSON-Schema 1, legallyVerified=false, publicReleaseApproved=false, Mutterschutzhinweis und CSV-Nichtfreigabe-Felder vorhanden; keine Browser-JavaScript-Fehler.
- Mobile Menübedienung im realen Pages-Build geprüft: Die mobile Aktionsnavigation klappt nach jedem Export wieder zu; zum folgenden Export muss sie erneut geöffnet werden. Beide Downloads funktionieren.

Der neue GitHub-Actions-Job verify soll nach einem **manuell bestätigten** Deploy die echten öffentlichen Seiten durch wiederholte HTTP-Abfragen lesen und Commit, Workflow-Run-ID und Warntexte vergleichen. Ein erfolgreicher PR-CI-Lauf ersetzt diesen öffentlichen Readback **nicht**. Der erweiterte Build ist bis zum nächsten bestätigten Pages-Workflow auf der aktuellen öffentlichen URL **noch nicht** automatisch verfügbar.
