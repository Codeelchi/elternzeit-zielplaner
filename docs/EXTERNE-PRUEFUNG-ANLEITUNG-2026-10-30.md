# Anleitung für die externen Prüfungen (Referenzfamilien, Nutzertest, Screenreader)

**Stand 30.10.2026 – reines Vorbereitungsmaterial.** Dieses Dokument enthält **keine Prüfergebnisse**. Es befüllt keine Evidenzdatei und ändert kein Gate. `data/independent-review-evidence-v317.json` (0 Fälle empfangen, `independentReviewApproved: false`) und `data/usability-review-v317d.json` (0 Sitzungen, `userReviewApproved: false`) bleiben unverändert. Nichts hier darf als „unabhängig geprüft“, „bestanden“ oder „freigegeben“ zitiert werden. Ergänzt [TESTDATEN-QUELLEN-2026-10-21](TESTDATEN-QUELLEN-2026-10-21.md) und [PAKET3C-NUTZER-A11Y-ABNAHME-2026-10-22](PAKET3C-NUTZER-A11Y-ABNAHME-2026-10-22.md).

**Recherchegrenze:** Die Websuche (30.10.2026) lieferte die unten genannten Treffer samt Zusammenfassungen. Ein Volltextabruf der Seiten scheiterte, weil `familienportal.de` und `www.bmbfsfj.bund.de` in dieser Sitzung nicht auflösbar waren (Netzwerk-Allowlist). Die Zahlen in Abschnitt (a) stammen deshalb aus den Suchzusammenfassungen und aus der am 21.10.2026 im Volltext geprüften Matrix A01–A04 der Testdaten-Quellen. Prüfer müssen jede Zahl vor Verwendung **an der Originalseite verifizieren**; die Spalte „Recherche“ nennt das Recherchedatum, nicht eine Volltextprüfung.

## (a) Geeignete Quellen für Referenzfamilien

| Nr. | Quelle (Link) | Recherche | Was konkret nachgerechnet werden kann | Grenzen |
|---|---|---|---|---|
| Q1 | Familienportal, [Wie viel Elterngeld kann ich bekommen?](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-viel-elterngeld-kann-ich-bekommen--124616) | 30.10.2026 (Suche); Volltext 21.10.2026 laut Matrix A01–A04 | Vergleich Basis/Plus bei 2.000 € Netto vorher. Danach 0 €: Basis 1.300, Plus 650 (12×1.300 = 24×650 = 15.600). Danach 500 €: Basis 975, Plus 650 (11.700 vs. 15.600). Danach 1.200 €: 520 € beide (6.240 vs. 12.480). Kappung 2.770 € bei 3.200 € Netto vorher (Matrix A04). | Nur „Elterngeld-Netto“ als Eingabe. Keine Brutto-Netto-Herleitung, keine Familienpläne. |
| Q2 | BMBFSFJ, [Berechnung des ElterngeldPlus in drei Schritten](https://www.bmbfsfj.bund.de/resource/blob/76428/e5f663143d1cac51dcfd6386a9e1566f/rechenbeispiel-eg-plus-data.pdf) | 30.10.2026 (nur Suchzusammenfassung) | Dreischritt-Verfahren (Betrag ohne Einkommen, Betrag mit Einkommen, Halbierung für Plus). Laut Zusammenfassung 1.400 € vorher, 550 € danach, ca. 550 € Basis (1 Monat) und 455 € Plus (2 Monate). **Unbestätigt**: Prüfer stellen Datum der Broschüre und alle Zwischenwerte selbst fest. | Möglicherweise älterer Rechtsstand; vor Nutzung klären. |
| Q3 | Familienportal, [Kann ich Elterngeld und Mutterschaftsleistungen bekommen?](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/kann-ich-elterngeld-und-mutterschaftsleistungen-bekommen--124776) | 30.10.2026 (nur Treffer); Beispiel 5/30 laut TESTDATEN-QUELLEN | Anrechnung von Mutterschaftsleistungen auf Elterngeld und Anteilsbildung. Das Beispiel mit 5 verbleibenden Tagen und 5/30 nur als Einzelschritt prüfen. | Entscheidet **nicht** die offene 4-vs.-5-Resttage-Frage des Teams. Keine allgemeine Regel ableiten. |
| Q4 | Familienportal, [Wie lange kann ich Elterngeld bekommen?](https://familienportal.de/familienportal/familienleistungen/elterngeld/faq/wie-lange-kann-ich-elterngeld-bekommen--124728) und [Arbeit und Einkommen mit Elterngeld](https://familienportal.de/familienportal/familienleistungen/elterngeld/arbeitssituation) | 30.10.2026 (nur Treffer) | Bezugsdauer, Lebensmonate, Kombination Basis/Plus, Teilzeitkorridor und Partnerschaftsbonus als Regelprüfung. Prüfer lesen enthaltene Beispiele selbst aus. | Ob konkrete Zahlenbeispiele enthalten sind, ist nicht bestätigt. |
| Q5 | BMBFSFJ, [Elterngeld](https://www.bmbfsfj.bund.de/bmbfsfj/themen/familie/familienleistungen/elterngeld) und Broschüre [Elterngeld und Elternzeit](https://www.bmbfsfj.bund.de/resource/blob/185424/5b90c242725e545669b2e7536503c75b/elterngeld-und-elternzeit-data.pdf) | 30.10.2026 (nur Treffer) | Normgrenzen als Prüfgrundlage: 65 % Ersatzrate, Mindest 300 €, Höchst 1.800 €, Plus 150–900 €, Einkommensgrenze 175.000 € laut Zusammenfassung. Rechtsstand und Geburtsjahrgang bestätigen. | Normtext statt Musterfall; Sollwerte entstehen erst durch die Prüfer. |
| Q6 | Länderportale und Elterngeldstellen, z. B. [service.bremen.de](https://www.service.bremen.de/dienstleistungen/elterngeld-berechnung-181071?reg=kosten) | 30.10.2026 (nur Treffer) | Geschwisterbonus: 10 %, mindestens 75 € (Basis) bzw. 37,50 € (Plus), Altersgrenzen der Geschwister. Passt zum Fall `siblings`. | Verwaltungsportal ohne vollständigen Musterfall. Zu Mischeinkommen wurden keine Rechenbeispiele gefunden. |
| Q7 | Amtlicher Elterngeldrechner (Familienportal/BMBFSFJ, über Q1 erreichbar) | nicht abgerufen | Als unabhängiges Werkzeug: Prüfer geben Eingaben selbst ein und notieren Ergebnis, Datum und Rechenstand. | Rechner ist kein Bescheid. |
| Q8 | Private Rechner/Ratgeber (smart-rechner.de, kita.de, computerwoche.de) | 30.10.2026 (nur Treffer) | **Nicht als Referenz geeignet**, nur zur Plausibilisierung. Ein Treffer nutzt laut Zusammenfassung die frühere Brutto-Logik. | Nicht amtlich, teils veraltet. |

**Zuordnung zu den zehn angeforderten Fällen** (`data/independent-case-requests-2026-10-17.json`): `plus24`, `parttime500`, `parttime1200`, `low-income`, `maximum` lassen sich teilweise über Q1/Q2/Q5 auf Komponentenebene prüfen, `siblings` über Q6, `maternity-conflict` über Q3 nur als Einzelschritt. Für `basis12`, `bonus`, `month-end` und vollständige Familienpläne fehlt ein amtliches Musterbeispiel; dort braucht es eine Fachperson oder einen Elterngeldstellen-Auszug. Kein Fall gilt dadurch als erledigt.

## (b) Prüfanleitung für unabhängige Prüfer (ohne unsere Sollwerte)

1. **Blindprinzip.** Prüfer erhalten nur Fallbeschreibung (Geburtsdatum, Eltern, Variante, Eingaben) und die Frage nach dem Ergebnis je Lebensmonat. **Nicht** ausgehändigt: Programmergebnisse, Testsollwerte, Tests im Quellcode, die Ergebnisspalten der Matrix A01–A04.
2. **Rechtsstand festlegen.** Geltende BEEG-Fassung für das Geburtsdatum notieren (Ausgabe, Datum). Geburten ab 01.04.2025 und Rechtsänderungen ab 2027 getrennt behandeln (siehe [RECHTSSTAND-BEEG-2027](RECHTSSTAND-BEEG-2027-2026-10-24.md)).
3. **Unabhängige Herleitung.** Nach Gesetz, amtlichem Rechner oder Beispiel (Q1–Q7) rechnen und jeden Schritt dokumentieren: berücksichtigtes Netto, Ersatzrate, Kappung, Mindest-/Höchstbetrag, Plus-Halbierung, Anrechnung von Mutterschaftsleistungen, Boni, Rundung.
4. **Erst danach vergleichen.** Das Programm mit denselben Eingaben ausführen (Commit und `index.html`-SHA-256 notieren) und Abweichungen je Lebensmonat festhalten. Abweichungen werden gemeldet, nicht angepasst.
5. **Rückmeldung je Fall** (von den Prüfern auszufüllen, nicht von uns): Rolle/Qualifikation, Prüfdatum, Quelle (URL), Rechtsstand, Herleitung, Eingabevertrag, erwartete Beträge je Lebensmonat, Vergleichsstatus, Entscheidung (bestätigt / abweichend / nicht prüfbar).
6. **Ausschlüsse:** keine echten Bescheide, Namen oder Lohndaten. Nicht unterstützte Konstellationen (Selbstständigkeit, Mehrlinge, Frühgeburt, Alleinerziehung) als „außerhalb des Umfangs“ markieren statt zu raten.
7. **Eintragung** in Evidenzdateien erfolgt erst nach Eingang der Rückmeldungen durch das Team mit eigenem Review. Dieses Dokument tut das nicht.

## (c) Moderierter Nutzertest und Screenreader-Prüfpfad

### Rahmen
Sechs bis acht Testpersonen ohne Fachwissen, dazu eine separate technische Runde mit mindestens zwei erfahrenen Nutzenden assistiver Technik. 45 bis 60 Minuten. Nur synthetische Daten. Keine Aufnahme ohne dokumentierte Einwilligung. Der Moderator liest keine Lösung vor und erklärt nichts.

### Skript (Think-aloud)
1. **Begrüßung (3 Min.):** „Wir testen das Werkzeug, nicht Sie. Es gibt keine falschen Antworten. Sie können jederzeit abbrechen.“ Einwilligung zu Notizen/Aufnahme erfragen.
2. **Warm-up (2 Min.):** Kurze Fragen zur Erfahrung mit Elterngeld und Planungswerkzeugen.
3. **Aufgaben:** Fälle A–G aus PAKET3C. Aufgaben-IDs der Studie (`data/usability-review-v317d.json`): `cohort-2027`, `net-types`, `life-calendar`, `expected-recorded`, `unknown-expenses`, `maternity-dispute`, `limited-search`, `local-and-export`. Je Aufgabe neutral fragen: „Was sehen Sie hier? Was würden Sie als Nächstes tun? Was ist nach Ihrem Verständnis sicher, was nur eine Annahme?“
4. **Nachfragen** nur neutral („Woran erkennen Sie das?“). Hilfe erst nach 3 Minuten Stillstand und als „Moderator-Hilfe“ notieren.
5. **Abschluss (5 Min.):** Was war unklar? Was würden Sie einer Elterngeldstelle zeigen? Vertrauen in die Zahlen (1–5, Freitext).
6. **Debrief:** Datenlöschung bestätigen, synthetische PDF-Testdatei entfernen.

### Screenreader-Prüfpfad
Umgebungen: **NVDA + Firefox (Windows)** und **VoiceOver + Safari (iOS)**; optional VoiceOver macOS, TalkBack. Pfad pro Umgebung:
1. Seite laden: Titel und Landmarks (Hauptbereich, Navigation) werden angesagt?
2. Zum Einstieg navigieren (Fall A). Formularfelder: Label, Pflichtangabe, Fehlermeldung hörbar?
3. Planansicht/Lebensmonate-Kalender: Struktur, Tabellen-/Listenzeilen und Status ohne Farbe verständlich?
4. Hinweise zu Annahmen, „nicht berechenbar“ und Unsicherheit werden vorgelesen?
5. Aufgabenstatus markieren (Fall E): Statusänderung angesagt? „selbst erledigt“ nicht als amtlich bestätigt verstanden?
6. Dialoge (Reset, Import-Fehler): Fokus in den Dialog, Escape, Rückkehr des Fokus?
7. Druckvorschau/PDF (Fall F): ohne Maus bedienbar?
8. Zusätzlich: 200 % Zoom, 320 px Breite, nur Tastatur, Reflow ohne horizontales Scrollen.

### Protokollvorlage (leer, pro Sitzung auszufüllen)

```
Sitzungs-ID: ____   Datum: ____   Moderator/Beobachter: ____
Commit / index.html-SHA-256: ____
Gerät / Browser / Assistive Technik (+Version): ____
Einwilligung (Notizen/Aufnahme): ja / nein   Testperson-Code (kein Name): ____
Vorerfahrung Elterngeld (0-3): ____

Aufgabe-ID | Beobachtete Antwort (wörtlich) | Verstanden (ja/teils/nein) | Hilfe nötig | Zeit | Fundcode | Schwere (0-4) | Notiz
______________________________________________________________________

Screenreader-Schritt (1-8) | Angesagt (wörtlich) | Erwartung erreicht (ja/nein) | Blocker | Notiz
______________________________________________________________________

Abschlussfragen / Vertrauen 1-5: ____
Daten gelöscht (ja/nein, durch wen): ____
```

Ausgefüllte Protokolle gehören **nicht** automatisch in `usability-review-v317d.json`. Übernahme erst nach Prüfung durch das Team.

## (d) Anwerbetext für Testpersonen

> **Testpersonen für einen Elterngeld-Planer gesucht**
> Wir entwickeln ein kostenloses Werkzeug, mit dem Familien Elternzeit und Elterngeld planen können. Wir suchen Eltern, werdende Eltern oder Menschen mit Erfahrung in der Familienplanung. Sie brauchen kein Fachwissen.
> **Ablauf:** ein Gespräch von etwa 45 bis 60 Minuten (vor Ort oder per Videocall), in dem Sie einige Aufgaben im Planer ausprobieren und dabei laut denken. Wir testen das Werkzeug, nicht Sie.
> **Daten:** Sie nutzen ausschließlich erfundene Beispielwerte. Bitte bringen Sie keine echten Bescheide, Lohnzettel oder Gesundheitsdaten mit. Aufnahmen gibt es nur mit Ihrer ausdrücklichen Einwilligung. Sie können jederzeit abbrechen.
> **Besonders willkommen:** Nutzerinnen und Nutzer von Screenreadern (NVDA, VoiceOver) für eine separate Runde.
> **Aufwandsentschädigung:** [vom Projektträger festzulegen] · **Kontakt:** [vom Projektträger einzutragen]
> Der Planer ersetzt keine Beratung und keinen Bescheid der Elterngeldstelle.

## Abgrenzung
Es wurden keine Prüfungen durchgeführt, keine Personen getestet und keine Sollwerte als unabhängig bestätigt. Alle Release-Gates bleiben offen.
