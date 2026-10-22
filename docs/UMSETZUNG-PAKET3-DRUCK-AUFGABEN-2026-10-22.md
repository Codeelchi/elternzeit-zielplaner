# Paket 3 – lokaler A4-Planbericht und quellenbasierte Aufgaben

**Stand:** 22.10.2026 · **Arbeitsbranch:** `feat/paket3-print-aufgaben-abnahme-20261022` · **Produktfreigabe:** **NO-GO**. Dieser Umsetzungsbericht ist ein technischer Entwicklungs-/Reviewstand, keine fachliche, rechtliche oder datenschutzrechtliche Freigabe.

## Überblick

### 3A – Kompakte Planübersicht (technisch umgesetzt)

Im Schritt „Plan prüfen“ führt eine eigene Schaltfläche **„Aufgaben und Druckansicht öffnen“** ohne Expertenumschaltung zur bestehenden Antragscheckliste. Dort befindet sich **„Familienplan kompakt drucken oder als PDF speichern“**. Ein Button zeigt zunächst eine zugängliche HTML-Vorschau, der zweite ruft den **lokalen Browserdruck** auf. Nutzer wählen im Browser selbst den Drucker oder „Als PDF speichern“. Keine Backend-API, kein externer PDF-Dienst, kein automatisches Speichern und kein Versand.

Der opt-in-Druck nutzt ein **ausschließlich für den ausgewählten Bericht aktiviertes Drucklayout**, nicht die historische Printfunktion, die alle Rechnerfolien druckt. Die übrige App wird während des Drucks ausgeblendet. `afterprint` stellt die normale Oberfläche wieder her. Die bestehende HTML-Exportlogik, JSON-Schema **1**, CSV-Spalten, Bankbuchungen und Speicherzustimmung werden weder gelesen als Druckfreigabe noch verändert.

**A4-Seiten:**

1. **Familienplan und Geldannahmen.** Klarer Herkunftsstempel „Fiktives Testbeispiel“ in der öffentlichen synthetischen Testvorschau bzw. „Eigener ungeprüfter Entwurf“ außerhalb davon; Geburtsdatum, betrachtete LM, Planstand (keine Bewilligung), Einnahmen **vor** Kosten, Rest **nach eingegebenen** Kosten, Zuhause-Monate beider Elternteile, erste im Modell nicht zugeordnete Betreuung und Kita-Start als reine Annahme. Verdichtete Sechs-LM-Tabelle – 4 Zeilen bei 24 LM bzw. 6 bei 36 LM. Nicht eingetragene Haushaltsausgaben bleiben **„Nicht berechenbar“**.
2. **Offene Prüf- und Antragsaufgaben.** Bis zu sechs **nicht selbst als erledigt markierte** Aufgaben aus dem vorhandenen `ApplicationGuide`, in dessen ursprünglicher Datums-/Quellenreihenfolge. Dazu eigener Bearbeitungsstatus, der ursprüngliche Titel, Quellenstand sowie **anklickbare HTTPS-Quellenlinks** (auch in gespeicherten PDFs). Zusätzliche Aufgaben werden mit Anzahl und Verweis auf die vollständige lokale Checkliste ausgewiesen. Es gibt **keine eigene Fristenberechnung**, keine automatische Freigabe und keine datierten Rückkehr-zur-Arbeit-Pflichten ohne bestätigte Rechtsgrundlage.

Mit `@page v44Report` ist das A4-Hochformat nur für den speziellen Ausdruck definiert; die bisherige allgemeine Druckformatierung wird **nicht pauschal geändert**.

**Beleg:** Echte Chromium-PDF-Ausgaben sowohl mit 24 Lebensmonaten/unbekannten Kosten als auch mit 36 Lebensmonaten/angegebenen Kosten ergeben **genau 2 Seiten**, beide im A4-Hochformat. Der Text der Tabellen bleibt auch ohne Farbe unterscheidbar; auf dem Bildschirm ist die Berichtsvorschau als semantischer HTML-Text verfügbar. Eine vollständige manuelle Drucker-, Screenreader- und Schwarzweiß-Freigabe bleibt in 3C offen.

### 3B – Lokale Aufgaben-/Quellenübersicht (technisch umgesetzt)

Oberhalb der vorhandenen ausführlichen Antragscheckliste erscheint eine kürzere filterbare Aufgabenansicht:

- **Noch offen / Unterlagen vorbereitet / Selbst erledigt / Alle**; ausschließlich dieselbe, bereits vorhandene **sitzungsgebundene** `v315TaskStates`-Map, kein neuer Speicher oder Cloud-Dienst.
- Aufgaben und Fälligkeiten kommen ausschließlich aus `ApplicationGuide.buildApplicationGuide`. Die reine Hilfsfunktion `PlanReportV44.prepareTasks` kontrolliert Kennungen, doppelte Einträge, Datum, Bearbeitungsstatus und **HTTPS-Quellen**, legt aber **keine** neue Frist fest.
- Gruppierung: **vor der Geburt**, **nach der Geburt und Anträge**, **Betreuung und Kita**. Das sind Ansichtsgruppen, keine zusätzlichen Rechtskategorien.
- Statuswechsel synchronisieren sich bidirektional mit der alten vollständigen Checkliste und dem bestehenden ICS-Export. Der Browserfokus wird nach dem Herausfiltern einer erledigten Aufgabe auf eine verbleibende Aufgabe oder den aktivierten Filter gesetzt.
- Geburtsdaten nach dem geprüften Quellenstand erhalten ausdrückliche Hinweise, Rechtslage und örtliches Verfahren vor einer echten Handlung erneut zu prüfen. Ungültige Daten und unplausible Quellen erzeugen **keine** selbst erfundene Checkliste.
- Abgebrochene Resets und fehlgeschlagene JSON-Importe erhalten die lokalen Markierungen. Bestätigte Resets und erfolgreiche Importe verwerfen sie. Ein Browser-Neuladen löscht alle Markierungen. „Selbst erledigt“ wird **nie** zu „behördlich bestätigt“ umgedeutet.

Die Rückkehr zur Arbeit bleibt als **persönliche Planungsfrage** genannt, ohne aus einer pauschalen Frist eine verbindliche Arbeitgeberpflicht zu machen. Vor weiteren Kalender-/Push-Erinnerungen wäre eine gesonderte Rechts-, Einwilligungs- und Speicherprüfung nötig.

### 3C – Echte Nutzer-, Screenreader- und Fachabnahme

**Noch nicht durchgeführt.** Der [konkrete Studien- und Accessibility-Testplan](PAKET3C-NUTZER-A11Y-ABNAHME-2026-10-22.md) enthält synthetische Testfälle, Aufgaben-Skripte, das Nachweisformular, A4-/Schwarzweiß-Prüfschritte, Fehlerpriorisierung und dokumentierte Freigabevorbehalte. Browser- und axe-Tests allein **ersetzen weder echte Nutzerbeobachtungen noch eine manuelle NVDA-/VoiceOver-Abnahme**.

## Technische Dateien

| Pfad | Inhalt |
| --- | --- |
| `src/v44-plan-report.cjs` | Reine, begrenzte Berichts-/Aufgabenprojektion aus bestehenden `FamilyOverview`-Monaten und `ApplicationGuide`-Tasks |
| `src/v44-panel.html`, `src/v44-entry.html` | Kompakte Aufgabenansicht, Vorschau/Druck und direkter Einstieg aus „Plan prüfen“ |
| `src/v44-panel.css` | Mobile Oberflächen, Fokus sowie isoliertes zweiseitiges A4-Printlayout |
| `src/v44-panel.js` | Bidirektionaler Sitzungsstatus, HTML-Vorschau, expliziter Browserdruck und `afterprint` |
| `scripts/embed-modules.mjs`, `scripts/embed-quickstart.mjs`, `index.html` | Offlinefähige Einbettung ohne Netzwerk-Skripte |
| `tests/v44-plan-report.test.mjs`, `tests/v44-plan-ui.test.mjs` | Grenz-/Datums-/Quellen-/Fokus-/Sitzungsregressionen |
| `tests/e2e/v44-report-tasks.spec.mjs` | Echte PDF-/Chromium-/Mobile-/Keyboard-/axe-/Import-/Reset-Checks |

## Wiederholbare Tests

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run modules:check
npm run quickstart:check
npm run docs:check
npm run privacy:technical-check
node --test tests/v44-plan-report.test.mjs tests/v44-plan-ui.test.mjs
npx playwright test tests/e2e/v44-report-tasks.spec.mjs
npm test
npm run release:check  # NO-GO bleibt beabsichtigt
```

**Ausdrücklich offene externe Sperren:** unabhängige vollständige Familienfälle, 4/5-Tage-Mutterschutzentscheidung, individuelle Elterngeld-Netto-/Sonderfallregeln, 2027-Gesetzeslage, echte Nutzertests, manuelle assistive Technologie, Rechts-/Datenschutzabnahme und Betreiberentscheidung. Kein öffentlicher Pages-Rollout durch diesen PR.
