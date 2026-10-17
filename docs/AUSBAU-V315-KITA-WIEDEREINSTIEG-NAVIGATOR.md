# V3.15 – Kita-Eingewöhnung, Wiedereinstieg und verständliche Antragswege

**Datum:** 17. Oktober 2026 (interner Entwicklungsstand, kein öffentlicher Release).
**Basis:** Code aus dem in GitHub gemergten main nach PR #19, zusätzliches Folge-Feature in eigenem Branch.
**Fachstatus:** Zukunfts-KiBiz-Quellen wurden amtlich nachgelesen, aber weder Elterngeldansprüche noch kommunale Kita-Beiträge noch individuelle Beitragsfreiheit unabhängig freigegeben.

## Neue Funktionen

### A. NRW-KiBiz nach maßgeblichem Betreuungsdatum

Quellmodul: src/kibiz-cohorts.cjs, mit gültigen Stichtagen und ISO-Datumsprüfung. Die Oberfläche zeigt aus dem vorhandenen Geburtstermin und dem ausdrücklich ausgewählten Kita-Lebensmonat:

- **2026er Fassung** KiBiz, gültig 01.08.2026 bis 31.07.2027: Bedarfsanzeige grundsätzlich sechs Kalendermonate vor Beginn, schriftlich oder elektronisch; keine Platzgarantie.
- **Verkündete 2027er Fassung** ab 01.08.2027 (GV. NRW. 2026 S. 525): § 5 nennt grundsätzlich sechs Kalendermonate Vorlauf in Textform. § 5 Abs. 5 erlaubt zusätzlich unter Voraussetzungen ein örtliches Neunmonatsverfahren; die obligatorische Sechsmonatsfrist bleibt bestehen.
- Den **voraussichtlichen Beginn der Beitragspflicht-Befreiung nach § 50** aufgrund des vierjährigen Geburtstags und des 30.-September-Stichtags als **Hinweis**, nicht als bewilligten Anspruch. Einschulung, tatsächliche Betreuung, Beitragsfreiheit, Geschwister und Essensgeld müssen amtlich vor Ort geprüft werden. Die 2025er Kölner Beitragstabelle bleibt ein historischer **separater** Referenzwert und wird nicht automatisch in das Familienbudget übernommen.
- Der Quellenkatalog data/official-source-review-2026-10-17.json enthält jetzt beide amtlichen KiBiz-Fassungen (16 Einträge). src/source-audit.cjs kennt ausdrücklich den Status promulgated_future_effective, verweigert aber eine Berechnungs- oder öffentliche Fachfreigabe.
- NRW-Kita-Checklistenfristen aus src/application-guide.cjs werden bereits für Kita-Starts in **2026** abgedeckt, nicht erst für 2027. Ein neuer dokumentenbezogener Prüfpunkt verlangt die individuelle kommunale Gebührenentscheidung.

Amtliche Quellen (geprüft 17.10.2026): [NRW-KiBiz 2026](https://recht.nrw.de/lrgv/gesetz/01082026-gesetz-zur-fruehen-bildung-und-foerderung-von-kindern-kinderbildungsgesetz/), [NRW-KiBiz ab 2027](https://recht.nrw.de/lrgv/gesetz/01082027-gesetz-zur-fruehen-bildung-und-foerderung-von-kindern-kinderbildungsgesetz/) und [Köln LITTLE BIRD FAQ](https://www.stadt-koeln.de/leben-in-koeln/familie/betreuung/haeufig-gestellte-fragen-zum-vormerk-anmeldeverfahren-little-bird).

### B. Wochenweiser Kita-Einstieg mit finanzieller Auswirkung

Quellmodul: src/settling-in.cjs, UI in „Leistungen vor Ort“. Die Eltern wählen ein schnelles Szenario oder eigene Annahmen:

- geplantes Kita-Lebensmonat aus dem bestehenden Plan, Verzögerung **0–12 Wochen** und Eingewöhnungszeit **0–12 Wochen**;
- gewünschte Wochen-Arbeitszeit, erste Woche tatsächliche Kita-Stunden und angestrebte Wochen-Betreuungsstunden (aus dem vorhandenen 25/35/45-Selektor);
- ersatzweise Betreuungsstunden pro Woche; optional geschätzte Euro pro Betreuungsstunde und geschätztes Wochen-Netto bei vollständigem Erwerbsausfall;
- wochenweiser Tabelle mit realen Kalendertagsgrenzen, Kita-Stunden, Ersatzbetreuung, unbetreuten Arbeitsstunden und ausschließlich **hypothetischem** proportionalem Nettoausfall.

Bei unvollständigen Euroangaben wird **keine** volle Gesamtsumme errechnet; fehlende Werte dürfen nicht wie echte Nulleinnahmen/-ausgaben behandelt werden. Reine Kalenderdeltas ändern **keine** gespeicherten Arbeitszeit-, Elterngeld-, Bank-, Rechts- oder Kostenmodelle. Die zusätzlich angenommene Ersatzbetreuung könnte bereits im manuellen Haushaltsbudget enthalten sein – mögliche Doppelzählung wird ausdrücklich angemahnt.

Die Wochenmodellierung arbeitet mit konstanten Siebentageabschnitten und einer vereinfachten, linearen Stundenrampe. Sie ersetzt weder pädagogische Eingewöhnungsbegleitung noch tatsächliche Lohn-/Versicherungs-/Elterngeld-Folgeänderungen.

**Einfacher Einstieg:** Die Eingewöhnung lässt sich direkt vom Schnellstart aus öffnen; ein eigener Zurück-Button führt ohne eingeschaltete Fachnavigation wieder zum Anfang.

**Datenhaltung:** Alle Eingewöhnungs-, Betreuungs- und Risikoeingaben in dieser neuen Ansicht sind nur in der laufenden Sitzung vorhanden und werden weder im lokalen Familienplan gespeichert noch als JSON/CSV exportiert. Reset und Import leeren sie. Bereits vorhandene Familienplan-Felder bleiben unverändert.

### C. Antragsnavigator und offizielle finanzielle Hilfe

Die vorhandene Antragscheckliste erhält einen interaktiven Status pro Aufgabe: „Noch offen“, „Unterlagen vorhanden“, „selbst als erledigt markiert“. Das ist **keine Behördenquittung** und wird nicht hochgeladen. Der ICS-Export enthält nur Aufgaben, die nicht ausdrücklich als erledigt markiert sind. Die Marker sind ebenfalls bewusst session-only.

Im optionalen Leistungsnavigator hilft ein frei eingegebener Antragsmonat dabei, die **sechs Kalendermonate vor dem KiZ-Erstantrag** für Einkommensnachweise zu identifizieren. Für **Folgeanträge** wird der pauschale Vormonats-Zeitraum ausdrücklich ausgeblendet und vor abweichenden Anforderungen der Familienkasse gewarnt. Hinzu kommen Links zu Wohngeld-Plus sowie Bildung und Teilhabe (auch mögliche Kita-Mittagessen-Hilfen). **0 € zusätzliche Leistungen** werden automatisch ins Haushaltsbudget addiert. Alle Hilfen bleiben individuelle offizielle Prüfwege.

Amtliche Quellen: [Kinderzuschlag, BA](https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-verstehen/kinderzuschlag-anspruch-hoehe-dauer), [KiZ-Folgeanträge, BA](https://web.arbeitsagentur.de/kiz/ui/folgeantrag), [Bildung und Teilhabe, BA](https://www.arbeitsagentur.de/familie-und-kinder/informationen-zum-bildungspaket), [Bundes-Wohngeldrechner](https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeldrechner/wohngeldrechner-2025_artikel.html) und [ElterngeldDigital, Bundesportal](https://familienportal.de/familienportal/rechner-antraege/elterngeld-digital).

### D. Verständlicheres Suchergebnis

Auf Basis der bereits angezeigten, geprüften Suchvorlagen werden drei leicht verständliche Perspektiven hervorgehoben: mehr volle Elternmonate, mehr Gesamtbudget nach Kosten und geringster angenommener Rücklagenbedarf im vorsichtigen Szenario. Die Auswahl trifft **keine neue Rechtsentscheidung** und bezeichnet keinen der Kandidaten als global bestmöglich. Ohne eingegebene Haushaltskosten bleibt der alte Warnpfad erhalten: keine verlässliche monetäre Rangfolge.

## Entwicklungsqualität und Rückwärtskompatibilität

- Neue reine Module: src/kibiz-cohorts.cjs, src/settling-in.cjs, src/benefits-navigator.cjs (offline eingebettet über scripts/embed-modules.mjs).
- Antragscheckliste in src/application-guide.cjs um 2026er und 2027er Kita-Fristen samt kommunalem Beitrags-Check ergänzt.
- Eingebettete App weiterhin ohne Tracking, externe Laufzeit-Abhängigkeit, Konto und Backend; keine personenbezogenen Testfälle.
- Bestehender JSON-Import/-Export bleibt **schemaVersion 1**; keine stillen Zusatzfelder, keine ungetestete Migration. Session-only Eingaben nach Reset/Import gelöscht.
- Neue Fach-/Negativtests: Rechtsfassungen an 31.07./01.08.2027, Stichtag 30.09./01.10., Monatsende-/Schaltjahrs-Frist, fehlende Einkommensangaben, Wochen-/Stundengrenzen, Finanzbeträge, doppelte Familienkosten, URL- und Rechtsstatus.
- Neue Browserfälle prüfen Mobilansicht 320/390 px, Axe-Teile, Status/ICS, Einträge unverändert im Elternzeitplan, sechs Monate KiZ-Unterlagen, historischen Kita-Kostenbezug und Konsolenfehler.

**Offene Punkte:** Eine sichere Ende-zu-Ende-Verschlüsselung oder die kollaborative Freigabe privater Familiendaten erfordert ein eigenes Sicherheits- und Recovery-Konzept sowie unabhängigen Review. Ein solches Feature wurde **bewusst nicht** als vermeintlich getesteter Sicherheitspfad hinzugefügt. Echte Nutzertests, Datenschutz-/Rechtsprüfung und unabhängige Elterngeldreferenzen fehlen ebenso weiterhin.

**Öffentliche Freigabe:** data/release-gates.json bleibt absichtlich BLOCKED. Ein grüner technischer Build oder ein Merge ist **keine** unabhängige Behörden-/Datenschutz-Abnahme.

## Verifizierter technischer QA-Abschluss – 17.10.2026

- Ausgangsbasis auf main: **375/375 Node-/DOM-Tests** erfolgreich.
- Vollständige aktuelle fachliche Node-/DOM-Regression inklusive aller neuen V3.15-Tests: **403/403 bestanden**. Die beiden zuvor auf alte KiBiz-Geltung eingeschränkten Tests wurden auf die nachgewiesene 2026er Fassung korrigiert und in diese Gesamtsuite aufgenommen. Die API verwendet weiter die bestehende kleingeschriebene Kennung promulgated_future_effective.
- Vollständige HTTP-Chromium-Regression mit sämtlichen bisherigen V3.8–V3.14- und neuen V3.15-Szenarien: **45/45 bestanden**, Desktop-/Mobil-Accessibility und Schutzregeln eingeschlossen (vor dem letzten rein visuellen Rückweg/Fokus-Fix).
- **Nach dem letzten Bedien-Fix** zusätzlich **6/6 V3.15 HTTP-Browserfälle** und **6/6 direkte V3.15 file://-Browserfälle** bestanden, einschließlich 320/390 px, ohne Rückgabe persönlicher Daten, mit Tastaturfokus nach Aufgabenstatus-Änderung und direktem Zurück zum Schnellstart.
- Embed-/Gesetzes-/Quellen-/Legacy-/Roadmap-/statische Datenschutzchecks bleiben eigenständige, grüne technische Kontrollen. **Keine** unabhängige fachliche, juristische, steuerliche oder Datenschutz-Abnahme; Nutzertest mit echten Familien weiterhin ausstehend.
- Der öffentliche Release-Gate-Check muss weiterhin die fehlenden unabhängigen Freigaben und den ungelösten amtlichen Mutterschutzdelta-Fall melden; ein Merge, CI-Grün oder Git-Commit hebt die Sperre nicht auf.

**Nicht in V3.15 umgesetzt:** Verschlüsselter privater Mehrgeräte-Austausch ohne unabhängig geprüftes Schlüssel-/Recovery-/Bedrohungsmodell; keine automatische Behördenanmeldung oder neue amtlich validierte Elterngeld-Netto-Engine.
