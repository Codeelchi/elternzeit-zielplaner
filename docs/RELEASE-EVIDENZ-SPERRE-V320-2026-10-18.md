# V3.20 – Release-Evidenz statt bloßer Freigabe-Flags

**Stand: 18.10.2026.** Interner Security-/Release-Guard-Ausbau. **Keine öffentliche Bereitstellung, keine unabhängige rechtliche, rechnerische, datenschutzrechtliche oder Nutzerfreigabe.**

## Gefundene Lücke

Die ursprüngliche Skriptprüfung scripts/release-check.mjs bewertete im Wesentlichen freigabeähnliche Felder in data/release-gates.json und qa/reference-deltas-current.json. Werden diese Statusfelder durch einen Fehler oder unerlaubten Commit auf approved/true gesetzt, konnte der direkte Befehl einen grünen Exitcode liefern, obwohl unabhängige Prüfungen, echte Nutzertests und Betreiberentscheidung nachweislich weiterhin fehlten. Die anderen bestehenden Qualitätschecks waren unabhängig; sie stellten nicht sicher, dass ein **allein ausgeführter** Release-Check robust gegen diesen Fehler ist.

## Technische Abhilfe

Die neue reine Bewertungsfunktion src/release-readiness.cjs und das Skript scripts/release-check.mjs behandeln jetzt die folgenden Nachweisgruppen **getrennt**:

| Nachweis | Datenquelle / tatsächlicher aktueller Befund | Wirkung |
| --- | --- | --- |
| Administrativer Status | data/release-gates.json; weiterhin ausstehende Fach-/Rechts-/Datenschutz-/Nutzer-/Betreiberfreigabe | Keine Statusflag-Freigabe |
| Amtlicher Referenzabgleich | qa/reference-deltas-current.json, Paketversion 3.10.0 | Kein falsches öffentliches PASS |
| Browser-Freigabe | Tatsächliche SHA-256 von index.html und start.html gegen datierte directFileEvidence in den Gates | Historische HTML-Nachweise können eine veränderte Anwendung nicht pauschal freigeben |
| Externe Familienberechnung | SHA-256-gebundene zehn Familienanfragen plus V3.17-Prüfmanifest, validiert über independent-review-evidence | **0/10 bestätigt**, strukturelle Vorlage allein nicht ausreichend |
| Reale Nutzer und Screenreader | SHA-256-gebundene acht Lernaufgaben und Nutzerevidenzmanifest, geprüft über usability-evidence | **0 beobachtete Personen**, **keine** manuelle Screenreader-Abnahme |
| Mutterschutz/Mutterschaftsgeld | data/maternity-delta-evidence-2026-10-17.json | Amtliche Differenz 4/30 gegen 5/30 **ungeklärt** |
| Betreiberautorisierung | **Noch kein vertrauenswürdiges, extern überprüftes Freigabe-/Signaturverfahren eingerichtet** | Sperre bleibt unabhängig von bloß gesetzten JSON-Flags bestehen |

**Wichtig:** Eine formale JSON-Konsistenzprüfung kann Identität, Fachqualifikation, Echtheit einer Unterschrift oder juristische Richtigkeit nicht beweisen. Die zukünftige Betreiberautorisierung darf nicht allein durch einen neuen booleschen Wert implementiert werden. Sie benötigt einen nachvollziehbar kontrollierten, von verantwortlichen Personen freigegebenen Prozess (inklusive Review-Dokumente, Commitbindung, Dokumentintegrität und Kontrolle eines eventuell eingeführten Signatur-Schlüssels).

Das aktuelle Skript übergibt deshalb **absichtlich keinen extern verifizierten Betreiberbeleg** an die Bewertungsfunktion. Selbst eine Manipulation von Gates, Referenzsummen und Nutzerzählern reicht nicht aus, um die direkte Veröffentlichungssperre zu öffnen. Die Aktivierung eines späteren autorisierten Releasepfades ist eine **eigene, externe Abnahmestufe** mit tatsächlichen fachlichen und Betreiberbelegen und wird erst dann entwickelt.

## Reproduzierbare Negativtests

tests/release-readiness.test.mjs prüft:

1. Aktuelle echte Manifestdaten geben **NO-GO** mit getrennten Blockergründen.
2. Fiktiv auf approved/true gesetzte Gate- und amtliche Referenzfelder geben weiterhin **NO-GO**.
3. Selbst manipulierte Zahlenwerte für externe Familien- und UX-Reviews genügen ohne Betreiberprozess und aktuelle Browser-Nachweise nicht.
4. Versionsabweichungen, fehlende Eingaben und veraltete HTML-Belege werden abgewiesen.
5. Der tatsächlich ausgeführte Befehl **npm run release:check** endet in diesem Projektstand mit Exitcode 1.

Die Testmanipulationen bleiben **im Prozessspeicher** und verändern keine der echten Freigabedateien. Sie sind ausdrücklich keine realen Prüfpersonen, Unterschriften oder Nachweise.

## Was vor einer realen Freigabe noch erforderlich ist

- Schriftlicher, fachlich bestätigter Entscheid zur Schutzfrist **und** Mutterschaftsleistungsdauer des 20.-Mai-Falls, einschließlich geltender BEEG-Anrechnung.
- Zehn vollständig und unabhängig kontrollierte Referenzfamilien mit nachweisbaren Sollwerten und tatsächlicher Prüferentscheidung.
- Rechts- und Datenschutzbewertung für die dann festgelegte Betriebsform; Betreiberidentität, Impressum und Datenschutzhinweise.
- Tatsächlich beobachtete Nutzertests und manuelle Tastatur-/Screenreaderprüfungen, nicht nur synthetische Übungen.
- Nachgewiesene, commit- und artefaktgebundene Betreiberautorisierung in einem gesonderten, echten Freigabeprozess.
- Neuer vollständiger CI-/Browser-/Offline-/Staging-Lauf auf dem exakt freigegebenen Commit, danach separate autorisierte Rollout-Entscheidung.

Bis dahin muss **npm run release:check weiterhin scheitern**. Paketversion 3.10.0, JSON-Schema 1, Rechnungsformeln und data/release-gates.json bleiben unverändert.

**Verantwortliche Rollen:** Technische Durchsetzung: Repo-Maintainer. Externe Recht-/Elterngeld-Prüfung: qualifizierte unabhängige Fachperson. Datenschutz: zu bestimmende verantwortliche Stelle/DSB. Finale Veröffentlichung: ausdrücklich zu bestimmender Betreiber.
