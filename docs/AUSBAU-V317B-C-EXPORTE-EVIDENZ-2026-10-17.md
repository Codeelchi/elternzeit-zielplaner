# V3.17-B/C – Ergebnis-/Exporthinweise und getrennte externe Prüfevidenz

**Stand: 17.10.2026; interner Entwicklungsbranch.** Basis: V3.17-A auf dem nach PR #20 erzeugten Feature-Branch. Die technische Paket-/Embedded-/Exportversion **3.10.0** und JSON-Importschema **1** bleiben bestehen. **Kein öffentlicher Release oder amtlich bestätigter Leistungsbetrag.**

## B – Exporthinweise, die sich nicht als Bewilligung ausgeben

Bisher trugen die visuellen Ergebnisse bereits Unsicherheiten; heruntergeladene JSON-/CSV-Dateien enthielten aber keine ebenso ausdrückliche und maschinenlesbare Einordnung. `src/export-disclosure.cjs` erzeugt nun eine reine, auf den bestehenden `src/model-scope.cjs`-Status bezogene Kennzeichnung. Sie enthält **keine** kopierten Finanzbeträge, Namen, Geburtstage, Monatspläne oder extern authentifizierte Signaturen.

### JSON

`Elternzeit_Plan_V3.json` behält `fileType: "elternzeit-offline-v3"`, `schemaVersion: 1`, `version: "3.10.0"`, `legalReviewedAt`, `exportedAt` und **unverändertes `data`-Hauptmodell**. Zusätzlich ist nur am äußeren Dokumentkörper ein Feld `planningDisclosure` enthalten:

- `advisoryVersion: 1`, `basedOn: "current_validator_not_independent_review"`
- `modelClassification`: `PLAUSIBLE_MODEL`, `INPUTS_INCOMPLETE`, `OUTSIDE_SCOPE`, `RULE_CONFLICT` oder `FORECAST_ONLY`, ausschließlich aus dem Validator abgeleitet
- `technicalStandardBirthWindow`: die vom Katalog dokumentierte Standardkohorte und deren **technische**, nicht amtlich freigegebene Einordnung
- `sourceCheckedAt` direkt aus demselben datierten Katalog
- `inputProvenance`: nur die Herkunftsart (`beispiel_oder_schaetzung`, `eigene_nettowerte_nicht_fachgeprueft` oder `extern_eingetragen_herkunft_nicht_geprueft`)
- `expensesProvided` und `budgetAfterExpensesReliable`: insbesondere **unbekannte** Kosten bleiben nicht mit null Euro verwechselt
- `legallyVerified: false`, `independentlyReviewed: false`, `publicReleaseApproved: false`, `applicableFutureLawVerified: false`
- `warnings` zu Schätzcharakter, differenziertem Netto, Zahlungs-/Bankzeitachsen, unvollständiger Suche, Mutterschutz-4/5-Tageskonflikt und temporären Kita-/Wochenannahmen

Der alte Schema-1-Importer bleibt unverändert: **Er ignoriert `planningDisclosure`** und validiert `data` neu. Er akzeptiert auch alte Dateien ohne dieses Feld. Ein manipuliertes importiertes `planningDisclosure` mit etwa `legallyVerified: true` kann damit weder den Prüfstatus aufwerten noch die Release-Gates umgehen. Exporte mit fehlerhafter Modellstatus-Einordnung werden **gestoppt statt ohne Kennzeichnung heruntergeladen**. Die Metadaten sind nicht kryptografisch signiert und für Dritte **kein authentifizierbarer Nachweis**; ihnen darf nicht als Freigabe geglaubt werden.

### CSV

`Elternzeit_Plan_V3_Kindesalter_Kosten.csv` behält die **bisherigen 17 Spalten** vollständig und in unveränderter Reihenfolge; rechts werden sieben zusätzliche Felder angehängt:

| Neuer Spaltenname | Aussage |
| --- | --- |
| `Modell_Einordnung` | Begrenzt gültiger aktueller Modellstatus, bei 2027 allenfalls `FORECAST_ONLY` |
| `Quellen_geprueft_am` | Rechtskatalog-Stichtag, nicht behördliches Freigabedatum |
| `Einkommen_Herkunft` | Herkunftsart, **keine** amtliche Authentifizierung |
| `Haushaltsausgaben_vorhanden` | `ja_ungeprueft` oder `nein_unbekannt` |
| `Amtliche_Freigabe` | Immer `NEIN` |
| `Mutterschutz_Referenz` | `4_oder_5_Resttage_offen` |
| `Monatswerte` | Immer `SCHAETZUNG_KEINE_AUSZAHLUNGSZUSAGE` |

Die Metadaten werden bei jedem der **36 Lebensmonate** wiederholt, damit die Warnung bei Weiterverarbeitung einzelner Zeilen nicht verloren geht. Die CSV-BOM und der Semikolontrenner bleiben erhalten. **Ein Konsument, der starr genau 17 CSV-Spalten voraussetzt, muss neue Felder tolerieren oder vor dem Import auf die ersten 17 projizieren**; die CSV ist insofern rückwärtskompatibel für Spaltennamen/-reihenfolge, aber nicht für unveränderliche Gesamtspaltenzahl.

**Korrektur:** Wenn Ausgaben unbekannt sind (`expenses === ''`), bleibt die bestehende Spalte `Frei_nach_Kosten` **leer**, statt Einkünfte irreführend als Rest nach Kosten zu präsentieren. Null Euro bleibt dagegen eine bewusst mögliche Eingabe. Die berechneten internen Zahlen, Rechtsregeln und JSON-Daten werden dadurch **nicht verändert**.

Die neue aufklappbare Hilfskarte bei **„Plan prüfen“** zeigt die zu exportierenden Warnungen. Die UI nutzt `textContent`, nicht HTML aus unbereinigten Angaben.

### Sicherheits-/Privatsphäregrenzen

- JSON-/CSV-Dateien enthalten weiterhin sensible Finanz-/Familienwerte **aus dem ursprünglichen Plan**. Die Hinweis-Metadaten enthalten selbst keine Namen, Finanzsummen oder die Rohdaten einer externen Bewertung.
- Der Browserexport erfolgt lokal per `Blob`; keine neue Serverübertragung oder Telemetrie.
- Die Eingewöhnungs-/Elternwochenvarianten V3.15–V3.16 werden nicht heimlich hinzugefügt und bleiben **session-only**.
- `planningDisclosure` dient der Erklärung, **nicht** einem verifizierten Zertifikat. Speichermodell/Importvalidierung bleiben dieselben wie zuvor.

## C – Technische Vorlage für externe Referenznachweise

Die ursprünglich zehn fiktiven Fallanfragen stehen weiterhin in `data/independent-case-requests-2026-10-17.json`, ohne unabhängige Monats-Sollwerte oder authentifizierte Prüfer.

Neu: `data/independent-review-evidence-v317.json` enthält pro Fall genau eine **unbestätigte** Review-Position. Sie verweist über einen SHA-256-Fingerprint auf die unveränderte Ausgangsliste und übernimmt die Fall-ID und den Scope, **ohne** fremde Originalergebnisse zu erfinden. Jedes neue Feld `independentReference` steht bewusst auf `null`, `reviewDecision` auf `pending` und `approved`/`releaseReady` auf `false`.

Reine Validierung in `src/independent-review-evidence.cjs` und `scripts/independent-evidence-check.mjs`:

1. Vorlagen-SHA-256, genaue Fallzahl, IDs ohne Duplikate und Scope-Gleichheit zum Original prüfen.
2. Nicht eingegangene Fälle müssen **leere** Referenz-, Prüfer- und Monatsfelder behalten.
3. Falls künftig Nachweise eingetragen werden, sind die erlaubten Zustände `not_received` und `submitted_unverified`. Für letzteren müssen Quelle, Prüferrolle, überprüftes Datum, Rechtsfassung, nachvollziehbare unabhängige Herleitung und mindestens zwei lückenlose Lebensmonate mit **expliziten** Cent-Beträgen je Elternteil vorhanden sein. Doppelte LM, fehlende Quellen, unzulässige Beträge oder ungesicherte Quell-URLs werden abgelehnt.
4. Die automatische Prüfung akzeptiert **keine** behaupteten Entscheidungen `approved`, `releaseReady`, `publicReleaseApproved` oder `independentReviewApproved`. Selbst formal vollständige Einträge sind **nur eingereicht, nicht authentifiziert und nicht freigegeben**.
5. `npm run independent-evidence:check` ist neu, und `npm test` ruft diesen strukturellen Vorabcheck auf. Die amtlichen/externen Release-Gates bleiben separat und unverändert.

**Stand dieser Prüfung: 10 vorbereitete Fälle, 10 ohne externe Belege, 0 eingereicht, 0 unabhängig freigegeben.** Die Referenzstruktur kann keine Echtheit einer Prüferidentität, rechtliche Gültigkeit, Unabhängigkeit einer Berechnung oder korrekte Einzelfallleistung beweisen. Dafür bleibt eine reale zuständige Fachperson und späterer separater Freigabeprozess nötig.

Die [neutrale Referenzfallvorlage](FACHABNAHME-V317-REFERENZFALL-VORLAGE.md) gibt an, welche Originaleingaben, Lebensmonats-Zwischenwerte, Mutterschutzzeiten und Entscheidungen durch Dritte beizulegen wären. Der ungelöste **4/5-Resttagefall** bleibt ungeändert.

## Technische Tests und Abnahmegrenzen

- `tests/export-disclosure.test.mjs`: Beschränkung auf erklärende Metadaten, alle Modellstatusarten, CSV-Spaltenerweiterung, fremde „Freigabe“-Manipulation.
- `tests/v317-export.test.mjs`: UI-Quellenstand/Status, extern behauptete Nettoherkunft, Textknoten-Sicherheit.
- `tests/independent-review-evidence.test.mjs`: SHA-Pin, eindeutige Fall-IDs, noch leere Daten, gefälschte Freigaben, fehlende Nachweise, formal eingereichtes Beispiel **bleibt unbestätigt**.
- `tests/e2e/browser.spec.mjs`: Tatsächlich heruntergeladene JSON-/CSV-Dateien, Bearbeitung einer gefälschten JSON-Bewilligung, Altdatei-Import, 36 zusätzliche CSV-Statuszeilen, 2027-Vorschau und fehlende Haushaltskosten.
- `npm run release:check` muss unabhängig von diesen Tests wegen fehlenden Fach-, Rechts-, Datenschutz- und Nutzerreviews **BLOCKED** bleiben.

**Vollständige technische Abnahme auf dem V3.17-B/C-Arbeitsstand (17.10.2026):** `npm test` **481/481** Node-/DOM-Tests, **60/60** vollständige Chromium-Browser-Regressionen über HTTP und **4/4** zusätzliche V3.17-B-Browserfälle direkt über `file://` bestanden. Die vollständige Suite schließt manuelle Exportdownloads, manipulierbare JSON-Top-Level-Hinweise, Altdatei-Import, CSV-Metadaten bei sämtlichen 36 Lebensmonaten, 2027-Prognosen, mobile Ansicht und die korrekte Leere bei unbekannten Haushaltsausgaben ein. Die strukturelle `npm run independent-evidence:check` bestätigt **zehn vorbereitete, null extern bestätigte** Familienreferenzen. Technische Datenschutz-, Quellen-, Offline-Bundle- und Legacy-Checks erfolgreich; `npm run release:check` bleibt **absichtlich gesperrt**. Ein grüner Axe-Test ist **keine** manuelle Accessibility-Abnahme. Weitere Arbeit nach Roadmap: V3.17-D echte Verständlichkeits-/Accessibility-Review mit synthetischen Daten, sowie nachgewiesene externe P0-Fachabnahmen – keines davon ist hier fälschlich als „bestanden“ markiert.

[Roadmap](ROADMAP.md) · [V3.17-A](AUSBAU-V317-PRODUKTREIFE-EINORDNUNG.md) · [Release-Gates](../data/release-gates.json).
