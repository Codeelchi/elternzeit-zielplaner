# Umsetzung der veröffentlichten Komponentenbeispiele A02–A04 und A06

**Stand: 21.10.2026 · technische Regressionsevidenz · keine fachliche Produktfreigabe**

## Herkunft und Geltungsbereich

Grundlage ist der unverändert erhaltene Quellenbericht
[TESTDATEN-QUELLEN-2026-10-21.md](TESTDATEN-QUELLEN-2026-10-21.md)
(SHA-256 `32e505d9685a6c490d52f60afb146340347a9d0de9fa024ad8f1fdfebc8bfc74`).
Die veröffentlichten Originalbeispiele stammen aus dem
[Familienportal: Höhe des Elterngelds](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-viel-elterngeld-kann-ich-bekommen--124616)
sowie dem
[Familienportal: Lebensmonate](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-lange-kann-ich-elterngeld-bekommen--124728).
Die Seiten wurden im Quellenbericht am 21.10.2026 als abgerufen dokumentiert. Ein eigenständig archivierter, vollständiger und lizenzrechtlich geprüfter Quellen-Snapshot liegt weiterhin **nicht** vor; der Exzerpthash ist deshalb `null`.

### Was implementiert ist

| Quellen-ID | Bereits vorhandene Referenztests | Neu präzisierte Prüfungen |
| --- | --- | --- |
| A02 · 2.000 € vor / 500 € nach Geburt | `ref-03` / `ref-04` | Basis 975 €, theoretische Basis 1.300 €, Plus-Deckel 650 €, Plus 650 € (**Deckel greift**); amtliche Beispielvergleichssummen 11.700 / 15.600 € |
| A03 · 2.000 € vor / 1.200 € nach Geburt | `ref-05` / `ref-06` | Basis 520 €, theoretische Basis 1.300 €, Plus-Deckel 650 €, Plus 520 € (**Deckel greift nicht**); Vergleichssummen 6.240 / 12.480 € |
| A04 · 3.200 € vor / 1.570 € nach Geburt | `ref-07` / `ref-08` | **Anrechenbare** Obergrenze 2.770 €, somit Differenz 1.200 € statt 1.630 €; Basis 780 €, theoretische Basis 1.800 €, Plus-Deckel 900 €, Plus 780 €; Vergleichssummen 9.360 / 18.720 € |
| A06 · Geburt am 15. Februar | Bestehende allgemeine Zeitachsentests | Die veröffentlichten *jahrlosen* ersten drei Lebensmonate 15.02.–14.03., 15.03.–14.04. und 15.04.–14.05. werden gegen die reine Zeitachsenfunktion und die sichtbare Offline-Ansicht geprüft. **2025 und 2026 sind ausdrücklich synthetische Testjahre**, keine veröffentlichten Geburtsjahre. |

Die Vergleichssummen sind ausschließlich **arithmetische Beispiele der amtlichen Quelle**. Aus diesen Zahlen wird weder die Bezugsberechtigung noch ein konkreter 12-/24-monatiger Familienplan abgeleitet.

### Tatsächlich geprüfte Anwendungsschnittstellen

- `index.html` / `window.__elternzeitTest.basis(pre, post)` und `plus(pre, post)`: `pre` und `post` sind die **bereits ermittelten Elterngeld-Netto-Werte**, nicht Bruttogehälter oder das normale Auszahlungsnetto einer Lohnabrechnung. Die Funktion für den Elterngeld-Netto-Abzug nach BEEG §§ 2c–2f ist damit ausdrücklich **nicht** validiert.
- `src/time-axes.cjs` / `lifeMonths(geburtsdatum)` sowie `window.__elternzeitTest.dateFor(lm)`: Komponentenprüfung der veröffentlichten Lebensmonatsgrenzen. Testjahre stehen getrennt von den jahrfreien Quelldaten.
- Der ältere Datensatz `data/referenzfaelle-bund-2026-10-14.json` und `tests/reference.test.mjs` bleiben bestehen. Die zusätzlichen Tests schützen **Zwischenwerte, Deckelungsentscheidung, Quellenzuordnung und Datumsdarstellung**, statt Endbeträge als neue unabhängige Belege doppelt zu zählen.

### Dateien und Wiederholung

- Maschinenlesbare veröffentlichte Sollwerte und Grenzen: `tests/fixtures/amtliche-komponenten-2026-10-21.json`
- Node-/DOM-Komponententests: `tests/amtliche-komponenten-2026-10-21.test.mjs`
- Offline-Chromium-Tests: `tests/e2e/amtliche-komponenten.spec.mjs`

```bash
npm ci
node --test tests/amtliche-komponenten-2026-10-21.test.mjs tests/reference.test.mjs tests/time-axes.test.mjs
npx playwright test tests/e2e/amtliche-komponenten.spec.mjs
npm test
npm run release:check
```

Für eine revisionsfeste Abnahme sind später die **exakte ausgeführte Code-/Commit-SHA, Testlauf-ID und der Reviewerentscheid** zu dokumentieren; eine generische CI-Grünmeldung ersetzt dies nicht. Kein Produktcode, Rechtskatalog oder Export-/Importschema wurde für diese Regression erweitert.

## Offene Fachentscheidung / keine stillschweigende Freigabe

**Status der neuen Testreferenzen: `awaiting_external_review`.** Eine unabhängige Elterngeld-Fachperson muss besonders die Zuordnung des in den amtlichen Beispielen genannten „Netto“ zur tatsächlich erwarteten Schnittstelle, die Rundungsstufen (A04: veröffentlichte volle Euro) sowie die Abgrenzung von Mutter­schaftsanrechnung und Leistungsmonatszulässigkeit bestätigen. Es ist **keine** externe Freigabe eingeholt worden.

Die amtlichen Beispiele liefern weiterhin **0 von 10** benötigten vollständigen, unabhängig überprüften Paar-/Familien-End-to-End-Fällen. Der Streit um vier bzw. fünf verbleibende Mutterschutz-Tage ist weiterhin **ungeklärt**; kein A05-/A07-Teilszenario hebt diesen Blocker auf. Rechtsstand 2027, echte Nutzertests, Screenreader, Rechts-, Datenschutz- und Betreiberfreigaben bleiben offen. `npm run release:check` muss deshalb weiterhin **NO-GO** ergeben.
