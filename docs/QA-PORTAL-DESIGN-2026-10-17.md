# Gezielte Design-QA der Infoseite · 17. Oktober 2026

Die optische Überarbeitung von `start.html` wurde separat geprüft. **Alle acht Prüfkontexte bestanden:** vier interaktive Bildschirmgrößen, zwei Kontexte ohne JavaScript und zwei mit reduzierter Bewegung. **Acht Axe-Scans meldeten keine Verstöße.** Der Rechner und die Berechnungslogik wurden bei dieser Änderung nicht verändert.

| Geprüfte Datei | SHA-256 |
| --- | --- |
| `start.html` | `27256783f1bd6d763ced91470a2fc00dad5b995435b7b0a7477ce9631330dbe1` |
| Unveränderte `index.html` | `72b87039d14494ffee88622ecf5729944d2513fe7be88083b5f2d08ba4663e60` |

Der isolierte Playwright-Lauf verwendete Chrome Headless Shell **156.0.8078.4**, direkte lokale `file://`-Navigation und deaktiviertes Browsernetzwerk. Die strukturierte Evidenz steht in [portal-design-2026-10-17.json](../qa/portal-design-2026-10-17.json).

## Geprüfte Bedienung und Darstellung

Bei **320, 390, 768 und 1440 Pixeln** wurden die Anfangsansicht und die Ansicht mit allen fünf FAQ geöffnet auf grundlegende WCAG-2-A/AA- und WCAG-2.1-A/AA-Verstöße gescannt. Alle Ansichten bestanden die Prüfung auf horizontalen Seitenüberlauf.

Je Bildschirmgröße wurden der Tastatur-Sprunglink, alle vier Phasenfilter einschließlich ihrer `aria-pressed`-Rückmeldungen, die sichtbaren Themenkarten, native FAQ und der tatsächliche Link zum lokalen Rechner bedient. Die externen Informationslinks verwenden HTTPS, erhalten keine Daten über URL-Parameter und behalten `noopener noreferrer`. Es wurden keine HTTP(S)-Anfragen, JavaScript-Laufzeitfehler, Browserkonsolenfehler oder lokalen Speichereinträge festgestellt.

Ohne JavaScript bleiben bei 320 und 1440 Pixeln alle sechs Informationskarten sichtbar, die funktionslosen Filter sind verborgen und die nativen FAQ bleiben bedienbar. Mit `prefers-reduced-motion: reduce` ist bei 390 und 1440 Pixeln weiches Seitenscrollen deaktiviert; es laufen keine CSS-Animationen.

Desktop-Hero, schmaler Navigationsumbruch und mobile Karten wurden zusätzlich anhand echter Browserbilder angesehen. Die Navigation bei 320 Pixeln ordnet die Rechner-Schaltfläche in einer zusätzlichen Zeile an, ohne Links abzuschneiden. Überschriften, Handlungslinks und die neuen dekorativen Symbole sind lesbar und überschneiden sich nicht.

## Frische Bilder und historische Nachweise

Zwölf neue Bilder mit dem Präfix `portal-design-` liegen in [qa/screenshots](../qa/screenshots/). Besonders geeignet für die Sichtprüfung sind:

- [Desktop: erste Bildschirmfläche](../qa/screenshots/portal-design-1440-viewport.png)
- [320 Pixel: Navigation und Einstieg](../qa/screenshots/portal-design-320-viewport.png)
- [390 Pixel: mobile Themenkarten](../qa/screenshots/portal-design-390-cards.png)

Die vollständigen Anfangs- und FAQ-Aufnahmen aller vier Breiten liegen daneben. „Anfangsaufnahme“ bedeutet unveränderte Filter und geschlossene FAQ; eine vollständige Seitenaufnahme ist länger als die anfängliche Bildschirmfläche.

Die vorherigen Rechner- und Portalbilder sowie [QA-V3.10.md](QA-V3.10.md), `qa/browser-results.json` und `qa/browser-environment.json` wurden **nicht überschrieben**. Sie belegen weiterhin den früheren V3.10-Gesamtlauf mit dem dort genannten alten Portal-Hash. Dieser gezielte Bericht bestätigt ausschließlich das neue Portaldesign; er behauptet keinen erneut ausgeführten lokalen Gesamtlauf der 27 Browserfälle oder 279 Node-Tests. Die vollständigen CI-Prüfungen erfolgen getrennt.

Diese interne technische Prüfung ersetzt weder einen Nutzertest mit Familien noch eine vollständige Screenreader-Prüfung oder eine unabhängige rechtliche beziehungsweise datenschutzrechtliche Abnahme. Die bestehenden Veröffentlichungs-Gates bleiben davon unberührt.
