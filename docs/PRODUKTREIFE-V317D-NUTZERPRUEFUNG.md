# V3.17-D – Geführte Verständlichkeitsübungen und Vorbereitung echter Nutzertests

**Stand: 18. Oktober 2026 · interner Entwicklungsstand, kein öffentlicher Release, keine fachliche Freigabe.**
Der Branch baut auf `main` nach PR #20 (`19f047d`) sowie V3.17-A/B/C auf. Die Paketversion bleibt `3.10.0` und das JSON-Schema bleibt `1`.

## Ziel und Ergebnisgrenze

Bisher waren Regelstatus, Geldherkunft, Anspruch und Kontobuchungen fachlich getrennt, aber das Verständnis durch *echte Nutzer* war nicht belegt. V3.17-D ergänzt eine **rein didaktische** Acht-Aufgaben-Übung im Abschnitt **„Plan prüfen“**. Sie verwendet nur synthetische Sachverhalte, verarbeitet keine eingegebenen Familiendaten, verändert keine Budget- oder Leistungsberechnung, speichert keine Antworten und sendet keine Daten.

Die Übung ist **keine Nutzerstudie**, keine persönliche Leistungsauskunft und kein Beweis, dass Eltern die Anwendung verstehen. Bei einer falschen Antwort wird eine passende fachliche Einordnung gezeigt. Ein echtes Review muss durch Menschen geplant, moderiert, mit Einwilligung durchgeführt und unabhängig ausgewertet werden.

## Was in der Anwendung existiert

`src/understanding-guide.cjs` stellt acht stabile, eigenständige Übungen bereit. In `index.html` ist unter **„Plan prüfen“** eine zunächst geschlossene, native, zugängliche Detailansicht. Pro Aufgabe stehen drei Radio-Antworten zur Verfügung. Nach **„Einordnung prüfen“** folgt eine kurze Erklärung, danach geht es weiter. Es gibt **keinen Punkte-Score, keine Zertifikate und keine Freigabebehauptung**.

| Aufgaben-ID | Fiktiver Prüffall | Was nicht missverstanden werden sollte |
| --- | --- | --- |
| `cohort-2027` | Geburt Mai 2027 | Prognose statt geprüfter Kohorte |
| `net-types` | Auszahlungsnetto versus Elterngeld-Netto | getrennte Einkommensbegriffe |
| `life-calendar` | Betrag für einen Lebensmonat | kein konkreter Kalendertag der Zahlung |
| `expected-recorded` | Zahlung erwartet, Bankbereich leer | Erwartung ist keine bestätigte Kontobuchung |
| `unknown-expenses` | 4.200 € Einnahmen, Ausgaben unbekannt | kein seriös bekannter Rest nach Kosten |
| `maternity-dispute` | Widerspruch vier/fünf Resttage | keine rechtliche Entscheidung ohne unabhängige Klärung |
| `limited-search` | eine beste gefundene Variante | kein globales Optimum |
| `local-and-export` | lokaler Speicher und JSON-Download | keine Verschlüsselung, Export enthält sensible Daten; temporäre Kita-Wochen fehlen |

**Sitzungs- und Datentrennung:** Der aktuelle Übungsschritt und die ausgewählte Antwort existieren ausschließlich in flüchtigen JS-Variablen. Bei Seitenreload, bestätigtem Reset oder erfolgreichem JSON-Import beginnen die Aufgaben von vorne. Sie gelangen nie in den Familienzustand, den Speicher-Opt-in, den JSON-/CSV-Export, den Bankbereich oder die Elterngeldberechnung.

## Echte moderierte Nutzertests: Durchführungsprotokoll (noch nicht durchgeführt)

### 1. Vorbereitungen und Freiwilligkeit

- Moderatorrolle/Verantwortliche und Fachbegleitung benennen; keine Teilnehmenden ohne Zustimmung anwerben. **Stand: nicht benannt.**
- Für jede Sitzung **ausschließlich synthetische Daten** nutzen; keine realen Gehaltsabrechnungen, Bescheide, Geburtsdaten, Kontoinformationen oder Diagnoseangaben abfragen.
- Ziele, ungefähre Abfolge, freiwillige Teilnahme, jederzeitigen Abbruch und Datenverarbeitung *vorher* verständlich erklären. Ohne abgestimmtes Datenschutzkonzept **keine Ton-/Videoaufnahmen** anfertigen.
- Eine anonyme, nicht zurückverfolgbare Fallkennung verwenden; weder Namen, Kontaktangaben noch freie wörtliche personenbezogene Aussagen in das Repository übernehmen.
- Keine persönliche Rechts-/Steuer- oder individuelle Familienleistungsberatung im Test geben.
- Den *genauen* getesteten Git-Commit, Browser, Plattform, Bildschirmbreite und ggf. eingesetzte assistive Technik protokollieren. Die aktuell vorbereitete Vorlage ist **kein** Beleg durchgeführter Testpersonen.

### 2. Aufgabenreihenfolge und Beobachtung

**Vor der Übung:** Die moderierende Person lässt Teilnehmende dieselben Sachverhalte **in eigenen Worten erklären**, ohne die eingeblendete Musterantwort preiszugeben. Erst danach darf die UI-Karte „Einordnung prüfen“ genutzt werden. Sonst würde eine Erklärung, die die App gerade vorgibt, fälschlich als eigenes Verständnis gelten.

1. **Standardfall/Kohorte:** „Ist die 2027-Zahl schon für einen Antrag verwendbar? Warum?“
2. **Netto:** „Welchen Wert aus der Abrechnung dürft ihr nicht automatisch als Elterngeld-Netto einsetzen?“
3. **Lebensmonat:** „Wenn hier für LM 2 ein Anspruch steht, wann ist das Geld sicher auf dem Konto?“
4. **Bank:** „Wo erkennst du eine echte gebuchte Zahlung, und wo nur eine Erwartung?“
5. **Ausgaben:** „Wie viel bleibt übrig, wenn Haushaltskosten fehlen?“
6. **Mutterschutz:** „Welche der widersprüchlichen Resttagevarianten ist fachlich bestätigt?“
7. **Zielsuche:** „Was darf man über die angezeigte ‚beste‘ Variante tatsächlich sagen?“
8. **Speichern:** „Was passiert mit lokal gespeichertem Plan, Downloads und Kita-Wochenannahmen?“

Pro Fall (ohne Wertung durch den Code) dokumentieren: Verstanden ohne Hilfe / nach Hilfe / nicht verstanden / nicht abgeschlossen; ob der Moderator eingreifen musste; beobachtetes Missverständnis; sichtbare UI-Stelle; erforderliche Korrektur; Wiederholungstest nach einem Fix. **Keine Prozentwerte oder künstlichen Erfolgsquoten bei null Teilnehmenden.**

### 3. Freier Kernablauf und manuelle Zugänglichkeit

Zusätzlich zu den acht kurzen Aufgaben muss eine echte Testperson eine eigene *synthetische* Planung durchlaufen: Beispiel auswählen, Standardfall überprüfen, unbekannte Kosten erkennen, einen Bezugszeitraum betrachten, erwartete Zahlung von tatsächlicher Buchung abgrenzen, Plan exportieren und Speicher-/Löschfolgen erklären. Die Moderation hält fest, **wo** ein kritisches Fehlverständnis entsteht, nicht nur, ob ein Button anklickbar war.

**Manuelle Accessibility-Checkliste (noch offen):**

- Vollständige Tastaturbedienung ohne Maus: Tab-Reihenfolge, sichtbarer Fokus, Enter/Leertaste auf `summary`, Radioauswahl mit Pfeiltasten, Fokus nach Fortschritt/Reset.
- Mit tatsächlich verwendetem Screenreader (z. B. VoiceOver auf iOS oder NVDA auf Windows): Aufgabe, Gruppe/Legende, Optionen, Feedback und Fortschritt werden logisch angesagt.
- Bei 320 und 390 px, Hochkontrast, 200 % Zoom: keine abgeschnittenen Optionen, keine horizontale Seitenscrollleiste, kein Verdecken durch fixierte UI.
- Bei Fehlbedienung oder ungültigen Feldern: Auswirkung, Korrekturmöglichkeit und Begrenzung verständlich; kein allein farbabhängiges Feedback.
- Datenschutz-/Speicherdialog: Trennung zwischen löschbaren Browserwerten und bereits heruntergeladenen Dateien verständlich.

**Der automatisierte Axe-Check gilt nicht als erfüllte manuelle Screenreader-Abnahme.**

### 4. Kritische Abbruch- und Reparaturregeln

Als **kritische Missverständnisse** gelten insbesondere die Aussage „technisch plausibel = amtlich bewilligt“, „verfügbare Mittel ohne Ausgaben = sicherer Rest“, „erwartete Zahlung = real eingegangen“, „2027 ist bestätigtes Recht“, „Elterngeld-Netto = gewöhnliches Auszahlungsnetto“ sowie „Daten werden automatisch verschlüsselt/alle Exporte bei Reset gelöscht“.

Bei einem solchen Fund: konkrete UI-Stelle notieren, den betroffenen Produktanspruch/Vertrauenshinweis vor Pilotfreigabe korrigieren, denselben Ablauf erneut unabhängig mit Menschen prüfen. Bei Datenschutzvorfall oder unerwartetem Datenabfluss: Test stoppen, Verantwortliche informieren und keine sensiblen Rohdaten sichern.

### 5. Datensparsame Ergebnisnotiz (noch leer)

| Feld | Status / Eintrag |
| --- | --- |
| Verantwortung für Moderation | **offen** |
| Freiwillige Teilnahme und Datenschutzkonzept | **offen** |
| Exakte Code-SHA bei Durchführung | **offen** |
| Tatsächliche Teilnehmendenanzahl | **0 (nicht durchgeführt)** |
| Beobachtungen für die acht Aufgaben | **nicht erhoben** |
| Kritische Nutzbarkeitsprobleme | **unbekannt, nicht „keine“** |
| Screenreader-/Tastaturtest mit Personen | **nicht durchgeführt** |
| Fach- und UX-Freigabeentscheidung | **nicht erteilt** |
| Öffentliche Produktfreigabe | **GESPERRT** |

## Technische Nachweisdatei

`data/usability-review-v317d.json` enthält acht Aufgaben-IDs, deren Herkunft als SHA-256 des tatsächlichen `src/understanding-guide.cjs`-Quelltexts und ausschließlich `status: not_conducted`, `participantCount: 0`, `approved: false`, leere Feedbackfelder und eine leere Sitzungs-Liste.

`npm run usability:check` ruft `scripts/usability-check.mjs` auf und bestätigt **nur die vollständige, weiterhin leere Vorbereitung**. Unzulässige Meldungen über Teilnehmer, Beobachtungen oder Freigaben führen zu einem Fehler, nicht zu einem grünen Bericht. **Dieses Git-tracked Manifest ist kein Sammelbecken für echte personenbezogene Testdaten.** Für eine spätere echte Studie ist ein separater, datenschutzgeprüfter Evidenz- und Freigabeprozess nötig.

## Umsetzungsstand und offene Freigaben

Die technische V3.17-D-Umsetzung umfasst die Aufgabenansicht, reine fachlich begrenzte Antworterklärungen, Vermeidung von Persistenz/Export, Tests gegen manipulierbare Freigabebehauptungen und die dokumentierte manuelle Testvorlage. **Vollständige technische Abnahme am 18.10.2026:** `npm test` mit **495/495** Node-/DOM-Tests, `npm run test:e2e` mit **63/63** Chromium-Gesamtregressionen sowie **3/3** neuen V3.17-D-Browserfällen direkt über `file://` bestanden. Mobile 320-px-Bedienung, Tastatur-`summary`, automatische Axe-Zugänglichkeitsprüfung, acht synthetische Fälle, fehlerhafte Antworten, Reload, JSON-Import/Export und bestätigter Reset sind enthalten. GitHub-PR-CI und Merge gegen den finalen Commit sind separat zu belegen. Automatische Axe-Prüfung bedeutet **keine** echte Screenreader- oder Nutzertestabnahme.

Weiterhin ungelöst: der behördlich zu prüfende **Mutterschutz-4/5-Tage-Widerspruch**, **0/10** unabhängig bestätigte vollständige Elterngeldreferenzfälle, unabhängige Rechts-/Datenschutzprüfung und **0** tatsächlich durchgeführte Nutzertests.

[Operative Roadmap](ROADMAP.md) · [Referenzabnahme](FACHABNAHME-V317-REFERENZFALL-VORLAGE.md) · [Release-Gates](../data/release-gates.json).
